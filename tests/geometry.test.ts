import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import * as THREE from 'three'
import { Kit } from '../src/scene/kit'
import { addBuilding, FAMILIES, type Family } from '../src/scene/buildings'
import { LANDMARKS, type LandmarkId } from '../src/scene/geography'
import {
  baiyoke,
  giantSwing,
  goldenMount,
  grandPalace,
  mahanakhon,
  ramaVIII,
  watArun,
  watPho,
} from '../src/scene/landmarks'

const builders: Record<LandmarkId, (kit: Kit, x: number, z: number, yaw?: number) => void> = {
  'grand-palace': grandPalace,
  'wat-arun': watArun,
  'wat-pho': watPho,
  'giant-swing': giantSwing,
  'golden-mount': goldenMount,
  baiyoke,
  mahanakhon,
  'rama-viii': ramaVIII,
}

function rng(seed = 7) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function boundsOf(scene: THREE.Scene) {
  const bounds = new THREE.Box3()
  const matrix = new THREE.Matrix4()
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    object.geometry.computeBoundingBox()
    const local = object.geometry.boundingBox
    if (!local) return
    if (object instanceof THREE.InstancedMesh) {
      for (let i = 0; i < object.count; i++) {
        object.getMatrixAt(i, matrix)
        bounds.union(local.clone().applyMatrix4(matrix))
      }
    } else {
      bounds.union(local.clone().applyMatrix4(object.matrixWorld))
    }
  })
  return bounds
}

function signature(scene: THREE.Scene) {
  const hash = createHash('sha256')
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const positions = object.geometry.getAttribute('position')
    hash.update(Buffer.from(positions.array.buffer, positions.array.byteOffset, positions.array.byteLength))
    if (object instanceof THREE.InstancedMesh) hash.update(Buffer.from(object.instanceMatrix.array.buffer))
  })
  return hash.digest('hex')
}

function inspectLandmark(id: LandmarkId) {
  const scene = new THREE.Scene()
  const kit = new Kit(scene)
  const landmark = LANDMARKS.find((item) => item.id === id)!
  builders[id](kit, landmark.x, landmark.z, landmark.yaw)
  kit.finish()
  const bounds = boundsOf(scene)
  let instances = 0
  let vertices = 0
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    vertices += object.geometry.getAttribute('position').count
    if (object instanceof THREE.InstancedMesh) {
      instances += object.count
      const matrix = new THREE.Matrix4()
      for (let i = 0; i < object.count; i++) {
        object.getMatrixAt(i, matrix)
        assert.ok(matrix.elements.every(Number.isFinite), `${id}: finite instance matrix`)
        assert.ok(Math.abs(matrix.determinant()) > 1e-12, `${id}: non-singular instance matrix`)
      }
    }
    for (const value of object.geometry.getAttribute('position').array) assert.ok(Number.isFinite(value), `${id}: finite geometry`)
  })
  assert.ok(bounds.min.toArray().concat(bounds.max.toArray()).every(Number.isFinite), `${id}: finite bounds`)
  return { bounds, instances, vertices, hash: signature(scene) }
}

const envelopes: Record<LandmarkId, { w: number; d: number; minY: number }> = {
  'grand-palace': { w: 2.0, d: 2.0, minY: 2.2 },
  'wat-arun': { w: 1.9, d: 1.9, minY: 3.8 },
  'wat-pho': { w: 2.0, d: 1.9, minY: 1.6 },
  'giant-swing': { w: 1.6, d: 1.4, minY: 3.4 },
  'golden-mount': { w: 1.9, d: 1.9, minY: 2.8 },
  baiyoke: { w: 1.6, d: 1.6, minY: 7.8 },
  mahanakhon: { w: 1.7, d: 1.7, minY: 7.0 },
  'rama-viii': { w: 4.8, d: 1.8, minY: 4.5 },
}

const signatures = new Set<string>()
for (const landmark of LANDMARKS) {
  const result = inspectLandmark(landmark.id)
  const envelope = envelopes[landmark.id]
  const width = result.bounds.max.x - result.bounds.min.x
  const depth = result.bounds.max.z - result.bounds.min.z
  assert.ok(width <= envelope.w, `${landmark.id}: width ${width.toFixed(2)} <= ${envelope.w}`)
  assert.ok(depth <= envelope.d, `${landmark.id}: depth ${depth.toFixed(2)} <= ${envelope.d}`)
  assert.ok(result.bounds.max.y > envelope.minY, `${landmark.id}: height ${result.bounds.max.y.toFixed(2)} > ${envelope.minY}`)
  assert.ok(result.instances > 20, `${landmark.id}: ${result.instances} instances`)
  signatures.add(result.hash)
}
assert.equal(signatures.size, LANDMARKS.length, 'every landmark has its own geometry')

// Ordinary buildings: nine distinct families, each producing finite, non-empty geometry.
const familySignatures = new Set<string>()
for (const [index, family] of FAMILIES.entries()) {
  const scene = new THREE.Scene()
  const kit = new Kit(scene)
  addBuilding(
    kit,
    {
      x: index * 2,
      z: 0,
      w: 0.4,
      d: 0.42,
      rot: 0,
      height: 1.4,
      family: family as Family,
      district: 'Siam',
      frontage: false,
    },
    rng(100 + index),
  )
  kit.finish()
  assert.equal(kit.counts[family], 1, `${family}: counted once`)
  const bounds = boundsOf(scene)
  assert.ok(!bounds.isEmpty(), `${family}: non-empty bounds`)
  assert.ok(bounds.max.y > 0.7, `${family}: has height`)
  familySignatures.add(signature(scene))
}
assert.equal(familySignatures.size, FAMILIES.length, 'every building family has distinct geometry')

console.log(
  JSON.stringify({
    status: 'pass',
    landmarks: LANDMARKS.length,
    families: FAMILIES.length,
    uniqueLandmarkGeometry: signatures.size,
    uniqueFamilyGeometry: familySignatures.size,
  }),
)
