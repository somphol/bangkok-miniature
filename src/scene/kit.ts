import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

export type Mat = 'wall' | 'glass' | 'window' | 'windowCool' | 'metal' | 'accent' | 'roof' | 'green' | 'dark' | 'neon'

interface Entry {
  matrix: THREE.Matrix4
  color: THREE.Color
}

interface Batch {
  mat: Mat
  geometry: THREE.BufferGeometry
  entries: Entry[]
}

const UP = new THREE.Vector3(0, 1, 0)
const WHITE = new THREE.Color('#ffffff')

/**
 * A small authoring kit for the city: every part is a box, a cylinder/frustum, a sphere or a beam,
 * collected per material and emitted as one InstancedMesh. Per-instance colours keep the whole
 * scene to a handful of draw calls.
 */
export class Kit {
  private batches = new Map<string, Batch>()
  private custom: { mat: Mat; geometry: THREE.BufferGeometry }[] = []
  private materialCopies: THREE.MeshStandardMaterial[] = []
  private dummy = new THREE.Object3D()
  private origin = new THREE.Vector3()
  private yaw = 0
  readonly counts: Record<string, number> = {}
  readonly materials: Record<Mat, THREE.MeshStandardMaterial> = {
    wall: new THREE.MeshStandardMaterial({ color: WHITE, roughness: 0.82, metalness: 0.02 }),
    glass: new THREE.MeshStandardMaterial({ color: WHITE, roughness: 0.16, metalness: 0.52, envMapIntensity: 1.25 }),
    window: new THREE.MeshStandardMaterial({
      color: WHITE,
      emissive: '#ffd39a',
      emissiveIntensity: 0,
      roughness: 0.24,
      metalness: 0.28,
    }),
    windowCool: new THREE.MeshStandardMaterial({
      color: WHITE,
      emissive: '#9fd8e8',
      emissiveIntensity: 0,
      roughness: 0.18,
      metalness: 0.38,
    }),
    metal: new THREE.MeshStandardMaterial({ color: WHITE, roughness: 0.32, metalness: 0.72 }),
    accent: new THREE.MeshStandardMaterial({
      color: WHITE,
      emissive: '#ffc75e',
      emissiveIntensity: 0,
      roughness: 0.34,
      metalness: 0.68,
    }),
    roof: new THREE.MeshStandardMaterial({ color: WHITE, roughness: 0.68, metalness: 0.16 }),
    green: new THREE.MeshStandardMaterial({ color: WHITE, roughness: 0.94, metalness: 0 }),
    dark: new THREE.MeshStandardMaterial({ color: WHITE, roughness: 0.56, metalness: 0.24 }),
    neon: new THREE.MeshStandardMaterial({
      color: WHITE,
      emissive: '#ff4f8b',
      emissiveIntensity: 0,
      roughness: 0.4,
      metalness: 0.3,
    }),
  }

  constructor(private scene: THREE.Scene) {}

  /** Sets the local frame for everything authored until the next at(). */
  at(x: number, z: number, y = 0.69, yaw = 0) {
    this.origin.set(x, y, z)
    this.yaw = yaw
    return this
  }

  count(name: string) {
    this.counts[name] = (this.counts[name] ?? 0) + 1
  }

  private transform(x: number, y: number, z: number, sx: number, sy: number, sz: number, yaw = 0) {
    this.dummy.position.set(x, y, z).applyAxisAngle(UP, this.yaw).add(this.origin)
    this.dummy.rotation.set(0, this.yaw + yaw, 0)
    this.dummy.scale.set(sx, sy, sz)
    this.dummy.updateMatrix()
    return this.dummy.matrix.clone()
  }

  private add(key: string, mat: Mat, geometry: THREE.BufferGeometry, matrix: THREE.Matrix4, color: THREE.Color) {
    let batch = this.batches.get(key)
    if (!batch) {
      batch = { mat, geometry, entries: [] }
      this.batches.set(key, batch)
    }
    batch.entries.push({ matrix, color })
  }

  box(x: number, y: number, z: number, w: number, h: number, d: number, color: THREE.ColorRepresentation, mat: Mat = 'wall', yaw = 0) {
    if (w <= 0 || h <= 0 || d <= 0) return
    this.add('box', mat, CUBE, this.transform(x, y, z, w, h, d, yaw), new THREE.Color(color))
  }

  /** Vertical cylinder or frustum, centred on y. `top` is the top radius. */
  cylinder(
    x: number,
    y: number,
    z: number,
    r: number,
    h: number,
    color: THREE.ColorRepresentation,
    mat: Mat = 'wall',
    top = r,
    sides = 12,
  ) {
    if (r <= 0 || h <= 0) return
    const ratio = THREE.MathUtils.clamp(top / r, 0.001, 1)
    const key = `cyl:${sides}:${ratio.toFixed(3)}`
    this.add(key, mat, cylinderGeometry(sides, ratio), this.transform(x, y, z, r, h, r), new THREE.Color(color))
  }

  /** Square/rectangular prism, optionally tapered. Widths are the actual footprint sides. */
  prism(
    x: number,
    y: number,
    z: number,
    w: number,
    d: number,
    h: number,
    color: THREE.ColorRepresentation,
    mat: Mat = 'wall',
    topRatio = 1,
    yaw = 0,
  ) {
    if (w <= 0 || h <= 0 || d <= 0) return
    const ratio = THREE.MathUtils.clamp(topRatio, 0.001, 1)
    const key = `prism:${ratio.toFixed(3)}`
    this.add(key, mat, prismGeometry(ratio), this.transform(x, y, z, w / Math.SQRT2, h, d / Math.SQRT2, yaw), new THREE.Color(color))
  }

  sphere(
    x: number,
    y: number,
    z: number,
    r: number,
    color: THREE.ColorRepresentation,
    mat: Mat = 'wall',
    sy = 1,
    sx = 1,
    sz = 1,
  ) {
    if (r <= 0) return
    this.add('sphere', mat, SPHERE, this.transform(x, y, z, r * sx, r * sy, r * sz), new THREE.Color(color))
  }

  /** A round beam between two local points. */
  beam(a: THREE.Vector3, b: THREE.Vector3, r: number, color: THREE.ColorRepresentation, mat: Mat = 'metal') {
    const delta = b.clone().sub(a)
    const length = delta.length()
    if (length < 1e-6) return
    const quaternion = new THREE.Quaternion().setFromUnitVectors(UP, delta.normalize())
    const position = a.clone().add(b).multiplyScalar(0.5).applyAxisAngle(UP, this.yaw).add(this.origin)
    const matrix = new THREE.Matrix4().compose(position, quaternion, new THREE.Vector3(r, length, r))
    this.add('beam', mat, CYLINDER_8, matrix, new THREE.Color(color))
  }

  /** Arbitrary geometry with vertex colours, merged per material at finish(). */
  geometry(geometry: THREE.BufferGeometry, color: THREE.ColorRepresentation, mat: Mat = 'wall', x = 0, y = 0, z = 0) {
    let g = geometry.clone()
    g.applyMatrix4(this.transform(x, y, z, 1, 1, 1))
    if (g.index) {
      const flat = g.toNonIndexed()
      g.dispose()
      g = flat
    }
    const c = new THREE.Color(color)
    const count = g.getAttribute('position').count
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    if (!g.getAttribute('uv')) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2))
    this.custom.push({ mat, geometry: g })
  }

  finish() {
    for (const [key, batch] of this.batches) {
      const mesh = new THREE.InstancedMesh(batch.geometry, this.materials[batch.mat], batch.entries.length)
      batch.entries.forEach((entry, i) => {
        mesh.setMatrixAt(i, entry.matrix)
        mesh.setColorAt(i, entry.color)
      })
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      mesh.castShadow = batch.mat === 'wall' || batch.mat === 'roof' || batch.mat === 'metal' || batch.mat === 'accent' || batch.mat === 'dark'
      mesh.receiveShadow = batch.mat !== 'window' && batch.mat !== 'windowCool'
      mesh.computeBoundingSphere()
      mesh.userData.kitKey = key
      this.scene.add(mesh)
    }
    const groups = new Map<Mat, THREE.BufferGeometry[]>()
    for (const item of this.custom) {
      const list = groups.get(item.mat) ?? []
      list.push(item.geometry)
      groups.set(item.mat, list)
    }
    for (const [mat, geometries] of groups) {
      const merged = mergeGeometries(geometries, false)
      geometries.forEach((g) => g.dispose())
      if (!merged) continue
      const material = this.materials[mat].clone()
      material.vertexColors = true
      const mesh = new THREE.Mesh(merged, material)
      mesh.castShadow = mat !== 'window' && mat !== 'windowCool' && mat !== 'glass'
      mesh.receiveShadow = true
      this.scene.add(mesh)
      material.userData.kitMat = mat
      this.materialCopies.push(material)
    }
  }

  update(night: number) {
    this.materials.window.emissiveIntensity = night * 1.35
    this.materials.windowCool.emissiveIntensity = night * 0.9
    this.materials.accent.emissiveIntensity = night * 1.15
    this.materials.neon.emissiveIntensity = night * 2.2
    for (const material of this.materialCopies) {
      const mat = material.userData.kitMat as Mat | undefined
      if (mat === 'window') material.emissiveIntensity = night * 1.35
      if (mat === 'windowCool') material.emissiveIntensity = night * 0.9
      if (mat === 'accent') material.emissiveIntensity = night * 1.15
      if (mat === 'neon') material.emissiveIntensity = night * 2.2
    }
  }
}

const CUBE = new THREE.BoxGeometry(1, 1, 1)
const SPHERE = new THREE.SphereGeometry(1, 12, 8)
const CYLINDER_8 = new THREE.CylinderGeometry(1, 1, 1, 8)
const cylinderCache = new Map<string, THREE.BufferGeometry>()
const prismCache = new Map<string, THREE.BufferGeometry>()

function cylinderGeometry(sides: number, ratio: number) {
  const key = `${sides}:${ratio}`
  let geometry = cylinderCache.get(key)
  if (!geometry) {
    geometry = new THREE.CylinderGeometry(ratio, 1, 1, sides)
    cylinderCache.set(key, geometry)
  }
  return geometry
}

function prismGeometry(ratio: number) {
  const key = ratio.toFixed(3)
  let geometry = prismCache.get(key)
  if (!geometry) {
    geometry = new THREE.CylinderGeometry(ratio, 1, 1, 4)
    geometry.rotateY(Math.PI / 4)
    prismCache.set(key, geometry)
  }
  return geometry
}
