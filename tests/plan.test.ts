import assert from 'node:assert/strict'
import { planCity, type Parcel } from '../src/scene/plan'
import {
  BRIDGES,
  LANDMARKS,
  PARK_SITES,
  insideLand,
  inPolygon,
  riverLeft,
  riverRight,
  type Point,
} from '../src/scene/geography'

const plan = planCity(1946)
const { parcels, network, roads } = plan

assert.ok(parcels.length >= 100, `expected a dense city, got ${parcels.length} parcels`)
assert.ok(network.edges.length > 500, `expected a real street graph, got ${network.edges.length} edges`)
assert.ok(roads.length > 40, `expected many streets, got ${roads.length}`)

const corners = (p: { x: number; z: number; w: number; d: number; rot: number }): Point[] => {
  const c = Math.cos(p.rot)
  const s = Math.sin(p.rot)
  return [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([sx, sz]) => {
    const lx = (sx * p.w) / 2
    const lz = (sz * p.d) / 2
    return [p.x + lx * c + lz * s, p.z - lx * s + lz * c] as Point
  })
}

const overlaps = (a: Parcel, b: Parcel) => {
  const axes: Point[] = [
    [Math.cos(a.rot), -Math.sin(a.rot)],
    [Math.sin(a.rot), Math.cos(a.rot)],
    [Math.cos(b.rot), -Math.sin(b.rot)],
    [Math.sin(b.rot), Math.cos(b.rot)],
  ]
  const dx = b.x - a.x
  const dz = b.z - a.z
  for (const [ax, az] of axes) {
    const distance = Math.abs(dx * ax + dz * az)
    const ra =
      Math.abs((a.w / 2) * (Math.cos(a.rot) * ax - Math.sin(a.rot) * az)) +
      Math.abs((a.d / 2) * (Math.sin(a.rot) * ax + Math.cos(a.rot) * az))
    const rb =
      Math.abs((b.w / 2) * (Math.cos(b.rot) * ax - Math.sin(b.rot) * az)) +
      Math.abs((b.d / 2) * (Math.sin(b.rot) * ax + Math.cos(b.rot) * az))
    if (distance >= ra + rb - 1e-6) return false
  }
  return true
}

for (const parcel of parcels) {
  for (const [x, z] of corners(parcel)) assert.ok(insideLand(x, z), `parcel ${parcel.x},${parcel.z} stays on land`)
  for (const site of [...LANDMARKS, ...PARK_SITES]) {
    for (const [x, z] of [[parcel.x, parcel.z] as Point, ...corners(parcel)]) {
      assert.ok(
        Math.abs(x - site.x) >= site.w / 2 + 0.02 || Math.abs(z - site.z) >= site.d / 2 + 0.02,
        `parcel ${parcel.x},${parcel.z} clears ${site.id}`,
      )
    }
  }
  for (const road of roads) {
    for (let i = 1; i < road.points.length; i++) {
      const a = road.points[i - 1]
      const b = road.points[i]
      const dx = b[0] - a[0]
      const dz = b[1] - a[1]
      const len2 = dx * dx + dz * dz
      if (len2 < 1e-9) continue
      const t = Math.max(0, Math.min(1, ((parcel.x - a[0]) * dx + (parcel.z - a[1]) * dz) / len2))
      const distance = Math.hypot(parcel.x - a[0] - t * dx, parcel.z - a[1] - t * dz)
      assert.ok(distance >= road.width / 2 + 0.02, `parcel ${parcel.x},${parcel.z} clears ${road.name}`)
    }
  }
}

for (let i = 0; i < parcels.length; i++)
  for (let j = i + 1; j < parcels.length; j++)
    assert.ok(!overlaps(parcels[i], parcels[j]), `parcels ${i} and ${j} do not overlap`)

// The graph must be one connected city, not two banks with no crossings.
const seen = new Set<number>([0])
const queue = [0]
while (queue.length) {
  for (const next of network.nodes[queue.shift()!].neighbors) {
    if (!seen.has(next)) {
      seen.add(next)
      queue.push(next)
    }
  }
}
assert.equal(seen.size, network.nodes.length, `all ${network.nodes.length} road nodes reachable (got ${seen.size})`)

// Every bridge really crosses the water and lands on both banks.
const bridgeEdges = network.edges.filter((edge) => edge.bridge)
assert.ok(bridgeEdges.length >= BRIDGES.length, `expected at least ${BRIDGES.length} bridge spans, got ${bridgeEdges.length}`)
for (const edge of bridgeEdges) {
  const a = network.nodes[edge.a]
  const b = network.nodes[edge.b]
  assert.ok(insideLand(a.x, a.z), `bridge ${edge.name} starts on land`)
  assert.ok(insideLand(b.x, b.z), `bridge ${edge.name} ends on land`)
  assert.ok(!insideLand((a.x + b.x) / 2, (a.z + b.z) / 2), `bridge ${edge.name} crosses water`)
}

// Landmark anchors sit on the bank they describe; the bridge is the exception over the river.
for (const landmark of LANDMARKS) {
  if (landmark.id === 'rama-viii') continue
  assert.ok(insideLand(landmark.x, landmark.z), `${landmark.id} is on land`)
}
assert.ok(inPolygon(2.35, -7.4, [[1.4, -8.3], [3.3, -8.3], [3.3, -6.5], [1.4, -6.5]]), 'Grand Palace anchor is inside its block')

// The river is a real gap between the banks.
assert.ok(riverRight(-6.8) - riverLeft(-6.8) > 2.4, 'river is wide enough to read')
assert.ok(!insideLand(0, -6.8), 'the centre of the river is water')

console.log(
  JSON.stringify({
    status: 'pass',
    parcels: parcels.length,
    roads: roads.length,
    edges: network.edges.length,
    bridges: bridgeEdges.length,
    landmarks: LANDMARKS.length,
  }),
)
