import {
  BRIDGES,
  LANDMARKS,
  PARK_SITES,
  districtAt,
  insideLand,
  insideReserved,
  riverLeft,
  riverRight,
  type Point,
} from './geography'
import type { Family } from './buildings'

export interface Road {
  points: Point[]
  width: number
  name: string
  bridge?: boolean
  frontage?: boolean
}

export interface RoadNode {
  x: number
  z: number
  neighbors: number[]
  signal: number
}

export interface RoadEdge {
  a: number
  b: number
  name: string
  width: number
  bridge?: boolean
}

export interface RoadNetwork {
  nodes: RoadNode[]
  edges: RoadEdge[]
}

export interface Parcel {
  x: number
  z: number
  w: number
  d: number
  rot: number
  height: number
  family: Family
  district: string
  frontage: boolean
}

export interface CityPlan {
  roads: Road[]
  network: RoadNetwork
  parcels: Parcel[]
}

/** Deterministic RNG, so the plan is identical in the browser, the tests and a capture. */
export function makeRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const ANGLE = -0.28
const COS = Math.cos(ANGLE)
const SIN = Math.sin(ANGLE)

function world(u: number, v: number): Point {
  return [u * COS - v * SIN, u * SIN + v * COS]
}

function resample(points: Point[], step = 0.3): Point[] {
  if (points.length < 2) return points
  const out: Point[] = [points[0]]
  for (let i = 1; i < points.length; i++) {
    const a = out[out.length - 1]
    const b = points[i]
    const distance = Math.hypot(b[0] - a[0], b[1] - a[1])
    const n = Math.max(1, Math.ceil(distance / step))
    for (let k = 1; k <= n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n])
  }
  return out
}

const CROSS_NAMES = [
  'Maha Rat Road',
  'Charoen Krung Road',
  'Yaowarat Road',
  'Rama I Road',
  'Sukhumvit Road',
  'Silom Road',
  'Sathon Road',
  'Phetchaburi Road',
  'Ratchadamnoen Avenue',
  'Bamrung Muang Road',
  'Dinso Road',
  'Tanao Road',
  'Fueng Nakhon Road',
  'Lan Luang Road',
  'Nakhon Sawan Road',
  'Krung Kasem Road',
  'Phra Ram 4 Road',
  'Wireless Road',
  'Narathiwat Road',
  'Song Wat Road',
]
const AVENUE_NAMES = [
  'Ratchadamri Road',
  'Ploenchit Road',
  'Asok Road',
  'Thong Lo Road',
  'Ekkamai Road',
  'Phahonyothin Road',
  'Vibhavadi Road',
  'Krung Thon Buri Road',
  'Arun Amarin Road',
  'Wang Doem Road',
  'Itsaraphap Road',
  'Chakkrawat Road',
]

/** Major roads are drawn as named polylines; the rest of the plan is a clipped local grid. */
function majorRoads(): Road[] {
  const roads: Road[] = []
  const add = (name: string, points: Point[], width: number, frontage = true) => {
    roads.push({ name, points: resample(points), width, frontage })
  }

  // East bank, north to south.
  add(
    'Ratchadamnoen Avenue',
    [
      [3.6, -9.6],
      [3.5, -7.2],
      [3.4, -4.6],
      [3.3, -2.1],
    ],
    0.28,
  )
  add(
    'Charoen Krung Road',
    [
      [3.4, -10.6],
      [3.38, -8.2],
      [3.33, -6.0],
      [3.2, -3.8],
      [3.5, -2.1],
      [2.5, -0.5],
      [1.8, 0.6],
      [1.5, 2.1],
      [1.65, 4.6],
      [1.95, 7.8],
      [2.2, 10.2],
    ],
    0.3,
  )
  add(
    'Yaowarat Road',
    [
      [1.35, -2.7],
      [1.85, -2.1],
      [2.35, -1.5],
      [2.9, -1.0],
    ],
    0.2,
  )
  add(
    'Rama I Road',
    [
      [1.55, 1.05],
      [2.1, 1.2],
      [3.0, 1.35],
      [4.15, 1.5],
    ],
    0.24,
  )
  add(
    'Sukhumvit Road',
    [
      [2.95, 2.0],
      [3.2, 3.3],
      [4.15, 3.4],
      [4.15, 5.7],
      [3.9, 6.2],
    ],
    0.24,
  )
  add(
    'Silom Road',
    [
      [1.75, 5.0],
      [2.2, 6.5],
      [4.0, 6.5],
      [4.1, 8.6],
    ],
    0.24,
  )
  add(
    'Rama IV Road',
    [
      [1.8, 7.8],
      [2.4, 8.2],
      [3.4, 8.2],
      [4.1, 8.3],
    ],
    0.2,
  )
  add('Sukhumvit Link', [[2.95, 2.0], [2.4, 1.4]], 0.2, false)

  // West bank, north to south.
  add(
    'Arun Amarin Road',
    [
      [-2.9, -12.4],
      [-3.0, -9.0],
      [-3.0, -6.0],
      [-3.0, -3.0],
      [-3.1, 0.0],
      [-3.2, 4.0],
      [-3.3, 8.0],
      [-3.1, 11.5],
    ],
    0.24,
  )
  add(
    'Wang Doem Road',
    [
      [-1.45, -9.2],
      [-1.45, -6.0],
      [-1.5, -3.0],
      [-1.6, 0.0],
      [-1.75, 3.2],
    ],
    0.2,
  )
  add(
    'Itsaraphap Road',
    [
      [-3.5, -9.2],
      [-2.8, -8.3],
      [-2.2, -7.6],
      [-1.55, -7.3],
    ],
    0.2,
  )
  add(
    'Krung Thon Buri Road',
    [
      [-3.35, 2.0],
      [-2.6, 2.8],
      [-2.0, 3.6],
      [-1.8, 4.4],
    ],
    0.2,
  )

  // Short connectors keep the narrow ends of both banks attached to the main grid.
  add(
    'East Bank Connector',
    [
      [3.1, -15.0],
      [3.5, -13.0],
      [3.75, -11.0],
      [3.7, -9.5],
      [3.6, -7.5],
      [3.55, -6.0],
    ],
    0.2,
    false,
  )
  add(
    'West Bank Connector',
    [
      [-3.3, -14.5],
      [-3.6, -12.0],
      [-3.7, -9.5],
      [-3.5, -7.5],
    ],
    0.2,
    false,
  )

  return roads
}

function gridRoads(): Road[] {
  const roads: Road[] = []
  const runs: { points: Point[]; name: string; width: number }[] = []

  const sampleRun = (fixed: number, alongU: boolean) => {
    let current: Point[] = []
    const flush = () => {
      if (current.length > 2) runs.push({ points: current, name: alongU ? CROSS_NAMES[runIndex % CROSS_NAMES.length] : AVENUE_NAMES[runIndex % AVENUE_NAMES.length], width: alongU ? 0.19 : 0.21 })
      current = []
      runIndex++
    }
    let runIndex = 0
    for (let t = -22; t <= 22; t += 0.28) {
      const p = alongU ? world(t, fixed) : world(fixed, t)
      if (insideLand(p[0], p[1]) && !insideReserved(p[0], p[1], 0.1)) current.push(p)
      else flush()
    }
    flush()
  }

  for (let i = 0, v = -20; v <= 20; v += 1.72, i++) sampleRun(v, true)
  for (let i = 0, u = -10; u <= 10; u += 1.56, i++) sampleRun(u, false)

  for (const run of runs) roads.push({ ...run, points: resample(run.points, 0.3) })
  return roads
}

function bridgeRoads(): Road[] {
  const roads: Road[] = []
  for (const bridge of BRIDGES) {
    const z = bridge.z
    const left = riverLeft(z) - 0.05
    const right = riverRight(z) + 0.05
    const west = Math.max(-4.15, riverLeft(z) - 3.2)
    const east = Math.min(4.15, riverRight(z) + 3.2)
    roads.push({ name: bridge.name, points: [[west, z], [left, z]], width: bridge.width, frontage: true })
    roads.push({ name: bridge.name, points: [[left, z], [right, z]], width: bridge.width, bridge: true })
    roads.push({ name: bridge.name, points: [[right, z], [east, z]], width: bridge.width, frontage: true })
  }
  return roads
}

export function buildRoads(): Road[] {
  return [...majorRoads(), ...gridRoads(), ...bridgeRoads()]
}

function splitAtIntersections(roads: Road[]): RoadNetwork {
  const segments: { a: Point; b: Point; name: string; width: number; bridge?: boolean }[] = []
  for (const road of roads) {
    for (let i = 1; i < road.points.length; i++) {
      segments.push({ a: road.points[i - 1], b: road.points[i], name: road.name, width: road.width, bridge: road.bridge })
    }
  }

  const nodes: RoadNode[] = []
  const nodeIds = new Map<string, number>()
  const node = (p: Point) => {
    const key = `${p[0].toFixed(4)},${p[1].toFixed(4)}`
    const existing = nodeIds.get(key)
    if (existing !== undefined) return existing
    const id = nodes.length
    nodeIds.set(key, id)
    nodes.push({ x: p[0], z: p[1], neighbors: [], signal: id % 2 })
    return id
  }

  const cross = (a: Point, b: Point) => a[0] * b[1] - a[1] * b[0]
  const edges: RoadEdge[] = []
  const used = new Set<string>()

  for (const s of segments) {
    const dx = s.b[0] - s.a[0]
    const dz = s.b[1] - s.a[1]
    const len2 = dx * dx + dz * dz
    if (len2 < 1e-9) continue
    const ts = [0, 1]
    for (const o of segments) {
      const q: Point = [o.a[0] - s.a[0], o.a[1] - s.a[1]]
      const v: Point = [o.b[0] - o.a[0], o.b[1] - o.a[1]]
      const r: Point = [dx, dz]
      const den = cross(r, v)
      if (Math.abs(den) > 1e-9) {
        const t = cross(q, v) / den
        const u = cross(q, r) / den
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) ts.push(t)
      } else {
        for (const p of [o.a, o.b]) {
          const t = ((p[0] - s.a[0]) * dx + (p[1] - s.a[1]) * dz) / len2
          const px = s.a[0] + dx * t
          const pz = s.a[1] + dz * t
          if (t > 0 && t < 1 && Math.hypot(px - p[0], pz - p[1]) < 1e-5) ts.push(t)
        }
      }
    }
    ts.sort((a, b) => a - b)
    for (let i = 1; i < ts.length; i++) {
      if (ts[i] - ts[i - 1] < 1e-4) continue
      const a = node([s.a[0] + dx * ts[i - 1], s.a[1] + dz * ts[i - 1]])
      const b = node([s.a[0] + dx * ts[i], s.a[1] + dz * ts[i]])
      const key = a < b ? `${a},${b}` : `${b},${a}`
      if (used.has(key)) continue
      used.add(key)
      edges.push({ a, b, name: s.name, width: s.width, bridge: s.bridge })
      nodes[a].neighbors.push(b)
      nodes[b].neighbors.push(a)
    }
  }

  // Keep every substantial component (both banks), drop isolated stubs.
  const adjacency: number[][] = nodes.map(() => [])
  edges.forEach((e) => {
    adjacency[e.a].push(e.b)
    adjacency[e.b].push(e.a)
  })
  const seen = new Set<number>()
  const components: number[][] = []
  for (let start = 0; start < nodes.length; start++) {
    if (seen.has(start)) continue
    const component = [start]
    seen.add(start)
    for (let i = 0; i < component.length; i++) {
      for (const next of adjacency[component[i]]) {
        if (!seen.has(next)) {
          seen.add(next)
          component.push(next)
        }
      }
    }
    components.push(component)
  }
  const keep = components.filter((c) => c.length >= 8)
  if (!keep.length && components.length) keep.push(components.sort((a, b) => b.length - a.length)[0])
  const keepIds = new Set(keep.flat())
  const order = [...keepIds].sort((a, b) => a - b)
  const remap = new Map<number, number>()
  order.forEach((id, i) => remap.set(id, i))
  const newNodes = order.map((id) => ({ ...nodes[id], neighbors: [] as number[] }))
  const newEdges = edges
    .filter((e) => keepIds.has(e.a) && keepIds.has(e.b))
    .map((e) => ({ ...e, a: remap.get(e.a)!, b: remap.get(e.b)! }))
  newEdges.forEach((e) => {
    newNodes[e.a].neighbors.push(e.b)
    newNodes[e.b].neighbors.push(e.a)
  })
  return { nodes: newNodes, edges: newEdges }
}

function parcelCorners(p: { x: number; z: number; w: number; d: number; rot: number }): Point[] {
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

function clearOfRoads(p: { x: number; z: number; w: number; d: number }, roads: Road[], extra = 0) {
  const radius = Math.hypot(p.w, p.d) / 2
  for (const road of roads) {
    for (let i = 1; i < road.points.length; i++) {
      const a = road.points[i - 1]
      const b = road.points[i]
      const dx = b[0] - a[0]
      const dz = b[1] - a[1]
      const len2 = dx * dx + dz * dz
      if (len2 < 1e-9) continue
      const t = Math.max(0, Math.min(1, ((p.x - a[0]) * dx + (p.z - a[1]) * dz) / len2))
      const distance = Math.hypot(p.x - a[0] - t * dx, p.z - a[1] - t * dz)
      if (distance < road.width / 2 + radius + 0.015 + extra) return false
    }
  }
  return true
}

function clearOfReserved(p: { x: number; z: number; w: number; d: number; rot: number }) {
  const corners = parcelCorners(p)
  for (const site of [...LANDMARKS, ...PARK_SITES]) {
    for (const [x, z] of [[p.x, p.z] as Point, ...corners]) {
      if (Math.abs(x - site.x) < site.w / 2 + 0.13 && Math.abs(z - site.z) < site.d / 2 + 0.13) return false
    }
  }
  return true
}

function rectsOverlap(
  a: { x: number; z: number; w: number; d: number; rot: number },
  b: { x: number; z: number; w: number; d: number; rot: number },
) {
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

function familyFor(district: string, rng: () => number): Family {
  const pick = (weights: [Family, number][]) => {
    let r = rng()
    for (const [family, weight] of weights) {
      r -= weight
      if (r <= 0) return family
    }
    return weights[0][0]
  }
  if (district === 'Thonburi' || district === 'Khlong San')
    return pick([
      ['shophouse', 0.4],
      ['lowrise', 0.26],
      ['heritage', 0.16],
      ['market', 0.1],
      ['mixed', 0.08],
    ])
  if (district === 'Rattanakosin' || district === 'Phra Nakhon')
    return pick([
      ['shophouse', 0.34],
      ['heritage', 0.24],
      ['lowrise', 0.2],
      ['market', 0.12],
      ['mixed', 0.1],
    ])
  if (district === 'Chinatown')
    return pick([
      ['shophouse', 0.48],
      ['market', 0.2],
      ['mixed', 0.16],
      ['heritage', 0.1],
      ['lowrise', 0.06],
    ])
  if (district === 'Siam')
    return pick([
      ['condo', 0.34],
      ['office', 0.24],
      ['hotel', 0.2],
      ['mixed', 0.16],
      ['pixel', 0.06],
    ])
  if (district === 'Silom')
    return pick([
      ['office', 0.34],
      ['condo', 0.24],
      ['hotel', 0.2],
      ['pixel', 0.12],
      ['mixed', 0.1],
    ])
  return pick([
    ['mixed', 0.3],
    ['condo', 0.24],
    ['office', 0.2],
    ['shophouse', 0.16],
    ['hotel', 0.1],
  ])
}

function heightFor(family: Family, district: string, rng: () => number) {
  const base: Record<Family, [number, number]> = {
    shophouse: [0.55, 1.25],
    heritage: [0.7, 1.45],
    lowrise: [0.5, 1.1],
    market: [0.35, 0.62],
    mixed: [1.0, 2.3],
    condo: [1.7, 3.5],
    office: [1.8, 3.9],
    hotel: [1.5, 3.2],
    pixel: [2.2, 3.7],
  }
  const [low, high] = base[family]
  let h = low + rng() * (high - low)
  if (district === 'Rattanakosin' || district === 'Phra Nakhon' || district === 'Thonburi') h = Math.min(h, 1.2)
  if (district === 'Chinatown') h = Math.min(h, 1.55)
  if ((district === 'Siam' || district === 'Silom') && rng() < 0.12) h += 0.8
  return h
}

function addParcel(
  parcels: Parcel[],
  grid: Map<string, Parcel[]>,
  candidate: Omit<Parcel, 'height' | 'family' | 'district'> & { district: string },
  roads: Road[],
  rng: () => number,
) {
  if (!clearOfReserved(candidate)) return false
  if (!parcelCorners(candidate).every(([x, z]) => insideLand(x, z))) return false
  if (!clearOfRoads(candidate, roads)) return false
  const cell = `${Math.floor(candidate.x / 0.6)},${Math.floor(candidate.z / 0.6)}`
  for (let ix = -1; ix <= 1; ix++)
    for (let iz = -1; iz <= 1; iz++) {
      const list = grid.get(`${Math.floor(candidate.x / 0.6) + ix},${Math.floor(candidate.z / 0.6) + iz}`)
      if (list?.some((other) => rectsOverlap(candidate, other))) return false
    }
  const family = familyFor(candidate.district, rng)
  const parcel: Parcel = {
    ...candidate,
    family,
    height: heightFor(family, candidate.district, rng),
  }
  parcels.push(parcel)
  const list = grid.get(cell) ?? []
  list.push(parcel)
  grid.set(cell, list)
  return true
}

function streetFrontParcels(roads: Road[], rng: () => number): Parcel[] {
  const parcels: Parcel[] = []
  const grid = new Map<string, Parcel[]>()
  const frontage = roads.filter((r) => r.frontage && !r.bridge)
  for (const road of frontage) {
    for (let i = 1; i < road.points.length; i++) {
      const a = road.points[i - 1]
      const b = road.points[i]
      const dx = b[0] - a[0]
      const dz = b[1] - a[1]
      const length = Math.hypot(dx, dz)
      if (length < 0.1) continue
      const ux = dx / length
      const uz = dz / length
      const nx = uz
      const nz = -ux
      const rot = -Math.atan2(dz, dx)
      for (const side of [-1, 1]) {
        for (let t = 0.18; t < length - 0.12; t += 0.34) {
          const x = a[0] + ux * t + nx * side * (road.width / 2 + 0.37)
          const z = a[1] + uz * t + nz * side * (road.width / 2 + 0.37)
          if (!insideLand(x, z)) continue
          const district = districtAt(x, z)
          addParcel(
            parcels,
            grid,
            { x, z, w: 0.26, d: 0.5, rot, district, frontage: true },
            roads,
            rng,
          )
        }
      }
    }
  }
  return parcels
}

function parcelGrid(parcels: Parcel[]) {
  const grid = new Map<string, Parcel[]>()
  for (const parcel of parcels) {
    const key = `${Math.floor(parcel.x / 0.6)},${Math.floor(parcel.z / 0.6)}`
    const list = grid.get(key) ?? []
    list.push(parcel)
    grid.set(key, list)
  }
  return grid
}

function latticeParcels(roads: Road[], rng: () => number, parcels: Parcel[], grid: Map<string, Parcel[]>): Parcel[] {
  const rot = -ANGLE
  for (let v = -20; v <= 20; v += 0.44) {
    for (let u = -10; u <= 10; u += 0.46) {
      const [x, z] = world(u, v)
      if (!insideLand(x, z)) continue
      const district = districtAt(x, z)
      const sizes: [number, number][] =
        district === 'Siam' || district === 'Silom'
          ? [
              [0.52, 0.5],
              [0.44, 0.42],
              [0.36, 0.34],
            ]
          : [
              [0.4, 0.38],
              [0.34, 0.32],
              [0.28, 0.26],
            ]
      for (const [w, d] of sizes) {
        if (
          addParcel(
            parcels,
            grid,
            { x, z, w, d, rot, district, frontage: false },
            roads,
            rng,
          )
        )
          break
      }
    }
  }
  return parcels
}

export function planCity(seed = 1946): CityPlan {
  const roads = buildRoads()
  const network = splitAtIntersections(roads)
  const rng = makeRng(seed)
  const parcels = streetFrontParcels(roads, rng)
  latticeParcels(roads, rng, parcels, parcelGrid(parcels))
  return { roads, network, parcels }
}
