import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { RoadNetwork } from './plan'
import type { WalkPath } from './environment'
import { TRAY, riverCenter } from './geography'

export type VehicleKind = 'car' | 'taxi' | 'tuktuk' | 'bus' | 'truck'

class Model {
  parts: Record<string, THREE.BufferGeometry[]> = {}
  add(geometry: THREE.BufferGeometry, color: string, x: number, y: number, z: number, part = 'body') {
    const g = geometry.index ? geometry.toNonIndexed() : geometry.clone()
    geometry.dispose()
    g.translate(x, y, z)
    if (!g.getAttribute('uv')) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.getAttribute('position').count * 2), 2))
    const c = new THREE.Color(color)
    const count = g.getAttribute('position').count
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    ;(this.parts[part] ??= []).push(g)
  }
  box(x: number, y: number, z: number, w: number, h: number, d: number, color: string, part = 'body') {
    this.add(new THREE.BoxGeometry(w, h, d), color, x, y, z, part)
  }
  cylinder(x: number, y: number, z: number, r: number, h: number, color: string, part = 'body', rotation = 0) {
    const g = new THREE.CylinderGeometry(r, r, h, 10)
    g.rotateZ(rotation)
    this.add(g, color, x, y, z, part)
  }
  finish() {
    return Object.fromEntries(
      Object.entries(this.parts).map(([name, geos]) => {
        const merged = mergeGeometries(geos, false)!
        geos.forEach((g) => g.dispose())
        return [name, merged]
      }),
    )
  }
}

function wheels(m: Model, width: number, length: number, y = 0.032) {
  for (const x of [-width * 0.56, width * 0.56])
    for (const z of [-length * 0.3, length * 0.3]) {
      m.cylinder(x, y, z, 0.022, 0.014, '#303838', 'body', Math.PI / 2)
      m.cylinder(x * 1.02, y, z, 0.011, 0.015, '#b8c0b8', 'body', Math.PI / 2)
    }
}

export function vehicleModel(kind: VehicleKind) {
  const m = new Model()
  const bus = kind === 'bus'
  const truck = kind === 'truck'
  const tuk = kind === 'tuktuk'
  const length = bus ? 0.42 : truck ? 0.32 : tuk ? 0.2 : 0.22
  const width = bus ? 0.12 : truck ? 0.11 : tuk ? 0.1 : 0.098
  if (tuk) {
    const body = '#e2604a'
    m.box(0, 0.06, 0, width, 0.06, length * 0.78, body)
    m.box(0, 0.11, 0.02, width * 0.82, 0.06, length * 0.5, '#f0e7d2')
    m.box(0, 0.155, -0.01, width * 0.9, 0.02, length * 0.62, '#e6b04a')
    for (const x of [-width * 0.42, width * 0.42])
      for (const z of [-length * 0.28, length * 0.25]) m.box(x, 0.13, z, 0.008, 0.1, 0.008, '#6d6a5c')
    m.box(0, 0.1, -length * 0.44, width * 0.7, 0.05, 0.03, body)
    m.box(0, 0.135, -length * 0.47, 0.055, 0.012, 0.01, '#fff0cc', 'head')
    m.box(0, 0.1, length * 0.4, 0.04, 0.02, 0.008, '#e14b3f', 'tail')
    // Three wheels: one at the front, two at the back.
    m.cylinder(0, 0.032, -length * 0.38, 0.024, 0.014, '#303838', 'body', Math.PI / 2)
    for (const x of [-width * 0.58, width * 0.58])
      m.cylinder(x, 0.032, length * 0.25, 0.024, 0.014, '#303838', 'body', Math.PI / 2)
    m.box(0, 0.19, -0.02, 0.04, 0.012, 0.04, '#f1db92')
    m.box(0, 0.075, 0.0, 0.03, 0.04, 0.03, '#caa882')
    return m.finish()
  }
  const color =
    kind === 'taxi'
      ? '#e84a8a'
      : bus
        ? '#e07a2e'
        : truck
          ? '#e9dfc8'
          : '#d8d4c6'
  m.box(0, 0.045, 0, width, 0.056, length, color)
  if (bus) {
    m.box(0, 0.115, 0, width, 0.1, length * 0.95, '#efe9d6')
    m.box(0, 0.09, 0, width * 1.01, 0.022, length * 0.97, '#2f6f8f')
    for (const s of [-1, 1])
      for (let i = 0; i < 6; i++) m.box(s * (width / 2 + 0.001), 0.13, -0.16 + i * 0.06, 0.005, 0.048, 0.042, '#33525e')
    m.box(0, 0.13, -length * 0.48, 0.095, 0.065, 0.008, '#33525e')
    m.box(0, 0.175, 0.04, 0.06, 0.012, 0.12, '#aab6b3')
    m.box(0, 0.12, length * 0.46, 0.06, 0.05, 0.008, '#e14b3f', 'tail')
  } else if (truck) {
    m.box(0, 0.1, 0.04, 0.112, 0.14, 0.2, '#d8d4c4')
    m.box(0, 0.095, -0.108, 0.105, 0.064, 0.09, '#c98b4a')
    m.box(0, 0.12, -0.154, 0.085, 0.04, 0.006, '#33525e')
    m.box(0, 0.1, 0.15, 0.1, 0.12, 0.008, '#b3bbb3')
  } else {
    m.box(0, 0.09, 0.006, 0.078, 0.04, 0.12, color)
    m.box(0, 0.105, -0.052, 0.072, 0.026, 0.008, '#436a77')
    m.box(0, 0.104, 0.068, 0.072, 0.024, 0.007, '#436a77')
    for (const s of [-1, 1]) {
      m.box(s * 0.04, 0.104, 0, 0.006, 0.024, 0.093, '#436a77')
      m.box(s * 0.043, 0.101, 0.008, 0.008, 0.033, 0.007, color)
      m.box(s * 0.054, 0.08, -0.042, 0.015, 0.01, 0.018, color)
    }
    if (kind === 'taxi') {
      m.box(0, 0.119, 0, 0.04, 0.018, 0.026, '#f1db92')
      m.box(0, 0.132, 0, 0.024, 0.008, 0.016, '#e2604a')
    }
  }
  wheels(m, width, length)
  for (const x of [-width * 0.32, width * 0.32]) {
    m.box(x, 0.062, -length / 2 - 0.003, 0.019, 0.014, 0.009, '#fff0cc', 'head')
    m.box(x, 0.06, length / 2 + 0.003, 0.018, 0.012, 0.008, '#e14b3f', 'tail')
  }
  m.box(0, 0.05, -length / 2 - 0.005, width * 0.85, 0.012, 0.008, '#abb9b4')
  m.box(0, 0.047, length / 2 + 0.005, 0.035, 0.015, 0.008, '#e7d9b4')
  return m.finish()
}

export function boatModel(type: 'river ferry' | 'longtail' | 'barge') {
  const m = new Model()
  const length = type === 'river ferry' ? 0.72 : type === 'longtail' ? 0.48 : 0.62
  const width = type === 'river ferry' ? 0.22 : type === 'longtail' ? 0.12 : 0.26
  const shape = new THREE.Shape()
  shape.moveTo(-width / 2, -length * 0.36)
  shape.lineTo(-width * 0.42, length * 0.28)
  shape.quadraticCurveTo(0, length * 0.66, width * 0.42, length * 0.28)
  shape.lineTo(width / 2, -length * 0.36)
  shape.closePath()
  const hull = new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.016, bevelThickness: 0.012, bevelSegments: 2 })
  hull.rotateX(-Math.PI / 2)
  m.add(hull, type === 'longtail' ? '#c98b4a' : type === 'barge' ? '#6f6a58' : '#efe7d3', 0, 0.005, 0)
  if (type === 'river ferry') {
    m.box(0, 0.135, 0.02, width * 0.78, 0.12, length * 0.62, '#efe7d3')
    m.box(0, 0.21, 0.02, width * 0.86, 0.025, length * 0.64, '#e6b04a')
    for (const s of [-1, 1])
      for (let i = 0; i < 5; i++) m.box(s * width * 0.4, 0.16, -length * 0.2 + i * length * 0.1, 0.008, 0.055, length * 0.07, '#3e697b')
    m.box(0, 0.24, 0.02, 0.03, 0.06, 0.04, '#e2604a')
    m.box(0, 0.255, 0.02, 0.012, 0.05, 0.02, '#e2604a')
  } else if (type === 'longtail') {
    m.box(0, 0.09, 0.02, width * 0.8, 0.05, length * 0.42, '#d8c8a8')
    m.box(0, 0.16, 0.02, width * 0.9, 0.02, length * 0.48, '#e6b04a')
    for (const s of [-1, 1]) m.box(s * width * 0.42, 0.125, 0.02, 0.008, 0.08, 0.008, '#6d6a5c')
    // The long propeller shaft.
    m.box(0, 0.045, length * 0.42, 0.012, 0.012, 0.28, '#6d6a5c')
    m.box(0, 0.06, length * 0.56, 0.02, 0.03, 0.03, '#3f4c55')
    m.box(0, 0.22, 0.02, 0.02, 0.12, 0.02, '#e2604a')
  } else {
    m.box(0, 0.11, 0, width * 0.72, 0.14, length * 0.62, '#8a7a5c')
    m.box(0, 0.19, 0, width * 0.7, 0.03, length * 0.58, '#6f6a58')
    m.box(0, 0.16, -length * 0.18, width * 0.3, 0.08, length * 0.18, '#c98b4a')
  }
  for (const s of [-1, 1]) {
    m.box(s * width * 0.44, 0.105, 0, 0.008, 0.035, length * 0.66, '#c9c9b1')
    for (let i = 0; i < 4; i++) m.box(s * width * 0.44, 0.1, -length * 0.28 + i * length * 0.17, 0.008, 0.08, 0.008, '#e1d9c0')
  }
  return m.finish().body
}

export function waveHeight(x: number, z: number, time: number) {
  return 0.006 * Math.sin(0.35 * x + 0.22 * z - 0.6 * time) + 0.006 * Math.sin(-0.18 * x + 0.42 * z + 0.45 * time)
}

function greenFor(node: { signal: number }, vertical: boolean, time: number) {
  const phase = (time + node.signal * 1.3) % 12
  return vertical ? phase < 5.2 : phase >= 6 && phase < 11.2
}

interface Vehicle {
  from: number
  to: number
  distance: number
  speed: number
  maxSpeed: number
  position: THREE.Vector3
  yaw: number
  kind: VehicleKind
  slot: number
  length: number
}

export function addTraffic(scene: THREE.Scene, network: RoadNetwork, walks: WalkPath[], seed = 93) {
  let s = seed >>> 0
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
  const bodyMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.56, metalness: 0.18, side: THREE.DoubleSide })
  const headMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, emissive: '#fff0c2', emissiveIntensity: 0 })
  const tailMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, emissive: '#f15639', emissiveIntensity: 0 })
  const kinds: VehicleKind[] = ['taxi', 'car', 'tuktuk', 'bus', 'truck']
  const counts: Record<VehicleKind, number> = { taxi: 10, car: 10, tuktuk: 9, bus: 3, truck: 4 }
  const fleets = new Map<VehicleKind, THREE.InstancedMesh[]>()
  const vehicles: Vehicle[] = []
  const dummy = new THREE.Object3D()
  for (const kind of kinds) {
    const count = counts[kind]
    const parts = vehicleModel(kind)
    const meshes = Object.entries(parts).map(([part, geometry]) => {
      const mesh = new THREE.InstancedMesh(geometry, part === 'head' ? headMaterial : part === 'tail' ? tailMaterial : bodyMaterial, count)
      mesh.castShadow = part === 'body'
      mesh.receiveShadow = true
      mesh.frustumCulled = false
      scene.add(mesh)
      return mesh
    })
    fleets.set(kind, meshes)
    for (let i = 0; i < count; i++) {
      const edge = network.edges[(Math.floor(rand() * network.edges.length) + i) % network.edges.length]
      if (!edge) continue
      const reverse = i % 2 === 0
      const from = reverse ? edge.b : edge.a
      const to = reverse ? edge.a : edge.b
      const a = network.nodes[from]
      const b = network.nodes[to]
      vehicles.push({
        from,
        to,
        distance: rand() * Math.hypot(b.x - a.x, b.z - a.z),
        speed: 0,
        maxSpeed: (kind === 'bus' ? 0.16 : kind === 'tuktuk' ? 0.2 : 0.2) + rand() * 0.07,
        position: new THREE.Vector3(a.x, 0.665, a.z),
        yaw: Math.atan2(-(b.x - a.x), -(b.z - a.z)),
        kind,
        slot: i,
        length: kind === 'bus' ? 0.42 : kind === 'truck' ? 0.32 : kind === 'tuktuk' ? 0.2 : 0.22,
      })
    }
  }

  // Four cars on the Rama VIII deck.
  const bridgeParts = vehicleModel('taxi')
  const bridgeCars = Object.entries(bridgeParts).map(([part, geometry]) => {
    const mesh = new THREE.InstancedMesh(geometry, part === 'head' ? headMaterial : part === 'tail' ? tailMaterial : bodyMaterial, 4)
    mesh.frustumCulled = false
    scene.add(mesh)
    return mesh
  })

  const beamGeometry = new THREE.PlaneGeometry(0.16, 0.6).rotateX(-Math.PI / 2)
  const beamMaterial = new THREE.MeshBasicMaterial({ color: '#ffdfa2', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })
  const beams = new THREE.InstancedMesh(beamGeometry, beamMaterial, vehicles.length + 4)
  beams.frustumCulled = false
  scene.add(beams)

  const personCount = Math.min(60, Math.max(0, walks.length * 2))
  const torso = new THREE.InstancedMesh(new THREE.BoxGeometry(0.04, 0.043, 0.024), new THREE.MeshStandardMaterial({ roughness: 1 }), personCount)
  const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.016, 7, 5), new THREE.MeshStandardMaterial({ color: '#caa882', roughness: 1 }), personCount)
  const legs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.011, 0.042, 0.012), new THREE.MeshStandardMaterial({ color: '#455f68', roughness: 1 }), personCount * 2)
  const arms = new THREE.InstancedMesh(new THREE.BoxGeometry(0.009, 0.04, 0.01), new THREE.MeshStandardMaterial({ roughness: 1 }), personCount * 2)
  const people = Array.from({ length: personCount }, (_, i) => ({
    route: walks[i % walks.length],
    progress: rand(),
    offset: rand() * 0.04 - 0.02,
    phase: rand() * 6.28,
    color: new THREE.Color(['#bc7759', '#5f99a0', '#d6ae62', '#68836e', '#d3c9b2', '#a27b92'][i % 6]),
  }))
  people.forEach((p, i) => {
    torso.setColorAt(i, p.color)
    arms.setColorAt(i * 2, p.color)
    arms.setColorAt(i * 2 + 1, p.color)
  })
  for (const m of [torso, heads, legs, arms]) {
    m.frustumCulled = false
    scene.add(m)
  }

  const boatTypes = ['river ferry', 'longtail', 'barge'] as const
  const boats = boatTypes.map((type) => {
    const mesh = new THREE.Mesh(boatModel(type), bodyMaterial)
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)
    return mesh
  })
  const wakeGeometry = new THREE.BufferGeometry()
  wakeGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([-0.02, 0, 0.18, -0.16, 0, 0.65, -0.11, 0, 0.61, 0.02, 0, 0.18, 0.11, 0, 0.61, 0.16, 0, 0.65], 3),
  )
  wakeGeometry.computeVertexNormals()
  const wakeMaterial = new THREE.MeshBasicMaterial({ color: '#d7e9d5', transparent: true, opacity: 0.38, depthWrite: false, side: THREE.DoubleSide })
  const wakes = boats.map(() => {
    const mesh = new THREE.Mesh(wakeGeometry, wakeMaterial)
    scene.add(mesh)
    return mesh
  })
  const boatState = boats.map((_, i) => ({
    z: -13 + i * 9 + rand() * 3,
    dir: i % 2 === 0 ? 1 : -1,
    speed: 0.032 + i * 0.006,
    lane: i === 0 ? -0.18 : i === 1 ? 0.12 : 0.24,
  }))

  function setModel(meshes: THREE.InstancedMesh[], slot: number, position: THREE.Vector3, yaw: number, scale = 1) {
    dummy.position.copy(position)
    dummy.rotation.set(0, yaw, 0)
    dummy.scale.set(scale, scale, scale)
    dummy.updateMatrix()
    for (const mesh of meshes) mesh.setMatrixAt(slot, dummy.matrix)
  }
  function headBeam(slot: number, p: THREE.Vector3, yaw: number, length: number) {
    dummy.position.copy(p).add(new THREE.Vector3(0, 0, -length / 2 - 0.24).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw))
    dummy.position.y = p.y + 0.012
    dummy.rotation.set(0, yaw, 0)
    dummy.scale.set(1, 1, 1)
    dummy.updateMatrix()
    beams.setMatrixAt(slot, dummy.matrix)
  }

  return {
    vehicles,
    boats,
    people,
    update(dt: number, time: number, night: number) {
      headMaterial.emissiveIntensity = night * 2.8
      tailMaterial.emissiveIntensity = 0.1 + night * 2
      beamMaterial.opacity = night * 0.11
      wakeMaterial.opacity = 0.32 - night * 0.16
      vehicles.forEach((v, index) => {
        const A = network.nodes[v.from]
        const B = network.nodes[v.to]
        const dx = B.x - A.x
        const dz = B.z - A.z
        const length = Math.hypot(dx, dz)
        const remaining = length - v.distance
        const stopDistance = Math.min(0.15, length * 0.35)
        const vertical = Math.abs(dz) > Math.abs(dx)
        const green = B.neighbors.length < 3 || greenFor(B, vertical, time)
        let target = v.maxSpeed
        if (!green && remaining < 0.42) target = Math.min(target, Math.max(0, (remaining - stopDistance) * 1.6))
        for (const other of vehicles)
          if (
            other !== v &&
            other.from === v.from &&
            other.to === v.to &&
            other.distance > v.distance &&
            other.distance - v.distance < (v.length + other.length) / 2 + 0.13
          )
            target = 0
        v.speed = THREE.MathUtils.damp(v.speed, target, 5, dt)
        v.distance += v.speed * dt
        if (!green) v.distance = Math.min(v.distance, length - stopDistance)
        if (v.distance >= length - 0.002) {
          const options = B.neighbors.filter((n) => n !== v.from)
          const next = (options.length ? options : B.neighbors)[Math.floor(rand() * (options.length || B.neighbors.length))]
          if (next !== undefined) {
            v.from = v.to
            v.to = next
            v.distance = 0
          }
        }
        const C = network.nodes[v.from]
        const D = network.nodes[v.to]
        const vx = D.x - C.x
        const vz = D.z - C.z
        const len = Math.hypot(vx, vz)
        const lane = 0.045
        const t = Math.min(1, v.distance / len)
        const desired = new THREE.Vector3(C.x + vx * t - (vz / len) * lane, 0.665, C.z + vz * t + (vx / len) * lane)
        const yaw = Math.atan2(-vx, -vz)
        if (time < 0.1) v.position.copy(desired)
        else v.position.lerp(desired, 1 - Math.exp(-dt * 12))
        const diff = Math.atan2(Math.sin(yaw - v.yaw), Math.cos(yaw - v.yaw))
        v.yaw += diff * (1 - Math.exp(-dt * 9))
        setModel(fleets.get(v.kind)!, v.slot, v.position, v.yaw)
        headBeam(index, v.position, v.yaw, v.length)
      })
      for (const meshes of fleets.values()) for (const mesh of meshes) mesh.instanceMatrix.needsUpdate = true
      // Rama VIII bridge cars: local x lane, derived from the anchor's yaw.
      const bridge = { x: -0.35, z: -13.6, yaw: 0, deck: 0.66, half: 2.0 }
      const bx = Math.cos(bridge.yaw)
      const bz = -Math.sin(bridge.yaw)
      const nx = Math.sin(bridge.yaw)
      const nz = Math.cos(bridge.yaw)
      for (let i = 0; i < 4; i++) {
        const u = (time * 0.04 + i * 0.25) % 1
        const forward = u < 0.5
        const t = forward ? u * 2 : 2 - u * 2
        const lx = -bridge.half + t * bridge.half * 2
        const lz = forward ? -0.12 : 0.12
        const p = new THREE.Vector3(bridge.x + bx * lx + nx * lz, bridge.deck, bridge.z + bz * lx + nz * lz)
        const dx = forward ? bx : -bx
        const dz = forward ? bz : -bz
        const yaw = Math.atan2(dx, dz)
        setModel(bridgeCars, i, p, yaw)
        headBeam(vehicles.length + i, p, yaw, 0.22)
      }
      for (const mesh of bridgeCars) mesh.instanceMatrix.needsUpdate = true
      beams.instanceMatrix.needsUpdate = true
      people.forEach((p, i) => {
        const len = p.route.curve.getLength()
        const u = (p.progress + (time * p.route.speed) / len) % 2
        const t = u < 1 ? u : 2 - u
        const sign = u < 1 ? 1 : -1
        const pos = p.route.curve.getPoint(t)
        const tangent = p.route.curve.getTangent(t).multiplyScalar(sign)
        const yaw = Math.atan2(tangent.x, tangent.z)
        const stride = Math.sin(time * 5 + p.phase) * 0.3
        dummy.position.copy(pos).add(new THREE.Vector3(p.offset, 0.072, 0))
        dummy.rotation.set(0, yaw, 0)
        dummy.scale.set(1, 1, 1)
        dummy.updateMatrix()
        torso.setMatrixAt(i, dummy.matrix)
        dummy.position.y = pos.y + 0.111
        dummy.updateMatrix()
        heads.setMatrixAt(i, dummy.matrix)
        for (const s of [-1, 1]) {
          dummy.position.copy(pos).add(new THREE.Vector3(s * 0.01 + p.offset, 0.027, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw))
          dummy.rotation.set(stride * s, yaw, 0)
          dummy.updateMatrix()
          legs.setMatrixAt(i * 2 + (s === 1 ? 1 : 0), dummy.matrix)
          dummy.position.copy(pos).add(new THREE.Vector3(s * 0.025 + p.offset, 0.072, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw))
          dummy.rotation.set(-stride * s, yaw, 0)
          dummy.updateMatrix()
          arms.setMatrixAt(i * 2 + (s === 1 ? 1 : 0), dummy.matrix)
        }
      })
      for (const m of [torso, heads, legs, arms]) m.instanceMatrix.needsUpdate = true
      boats.forEach((boat, i) => {
        const state = boatState[i]
        state.z += state.dir * state.speed * dt
        if (state.z > 14.4) {
          state.z = 14.4
          state.dir = -1
        } else if (state.z < -14.4) {
          state.z = -14.4
          state.dir = 1
        }
        const x = riverCenter(state.z) + state.lane
        const dx = riverCenter(state.z + 0.02) - riverCenter(state.z - 0.02)
        const dz = 0.04 * state.dir
        boat.position.set(x, TRAY.waterY + waveHeight(x, state.z, time), state.z)
        boat.rotation.set(Math.sin(time * 0.7 + i) * 0.015, Math.atan2(-dx, -dz), Math.cos(time * 0.6 + i) * 0.012)
        wakes[i].position.copy(boat.position)
        wakes[i].position.y = TRAY.waterY + 0.012
        wakes[i].rotation.set(0, boat.rotation.y, 0)
        wakes[i].scale.set(1 + Math.sin(time + i) * 0.06, 1, 1 + Math.sin(time * 0.8 + i) * 0.08)
      })
    },
  }
}
