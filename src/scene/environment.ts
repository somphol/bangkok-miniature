import * as THREE from 'three'
import { Kit } from './kit'
import type { CityPlan, Parcel, Road } from './plan'
import {
  EAST_BANK,
  LANDMARKS,
  PARK_SITES,
  TRAY,
  WEST_BANK,
  insideLand,
  riverLeft,
  riverRight,
  type Point,
} from './geography'

export interface WalkPath {
  curve: THREE.Curve<THREE.Vector3>
  speed: number
}

export interface Environment {
  walks: WalkPath[]
  update: (time: number, night: number) => void
  lampPositions: THREE.Vector3[]
}

interface Tree {
  x: number
  y: number
  z: number
  s: number
  type: 0 | 1
  phase: number
}

function roundedShape(w: number, d: number, r: number) {
  const s = new THREE.Shape()
  s.moveTo(-w / 2 + r, -d / 2)
  s.lineTo(w / 2 - r, -d / 2)
  s.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r)
  s.lineTo(w / 2, d / 2 - r)
  s.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2)
  s.lineTo(-w / 2 + r, d / 2)
  s.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r)
  s.lineTo(-w / 2, -d / 2 + r)
  s.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2)
  s.closePath()
  return s
}

function palmCrownGeometry() {
  const positions: number[] = []
  const normals: number[] = []
  const fronds = 9
  for (let i = 0; i < fronds; i++) {
    const a = (i / fronds) * Math.PI * 2
    const ca = Math.cos(a)
    const sa = Math.sin(a)
    const midA = a + 0.18
    const tipA = a + 0.34
    const mid = [Math.cos(midA) * 0.42, -0.08, Math.sin(midA) * 0.42]
    const tip = [Math.cos(tipA) * 0.62, -0.2, Math.sin(tipA) * 0.62]
    const left = [ca * 0.12 - sa * 0.07, 0.02, sa * 0.12 + ca * 0.07]
    const right = [ca * 0.12 + sa * 0.07, 0.02, sa * 0.12 - ca * 0.07]
    positions.push(...left, ...mid, ...right)
    positions.push(...right, ...mid, ...tip)
    for (let k = 0; k < 6; k++) normals.push(0, 1, 0)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  return g
}

function buildLand(scene: THREE.Scene) {
  const material = new THREE.MeshStandardMaterial({ color: '#cfc8ad', roughness: 0.96, metalness: 0.01, dithering: true })
  for (const polygon of [WEST_BANK, EAST_BANK]) {
    const shape = new THREE.Shape()
    polygon.forEach(([x, z], i) => (i ? shape.lineTo(x, z) : shape.moveTo(x, z)))
    shape.closePath()
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.42,
      bevelEnabled: true,
      bevelSize: 0.08,
      bevelThickness: 0.06,
      bevelSegments: 2,
      curveSegments: 2,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.x = Math.PI / 2
    mesh.position.y = TRAY.landY
    mesh.receiveShadow = true
    mesh.castShadow = true
    scene.add(mesh)
  }
}

function buildTray(scene: THREE.Scene) {
  const base = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundedShape(TRAY.w, TRAY.d, 1.5), {
      depth: 0.62,
      bevelEnabled: true,
      bevelSize: 0.1,
      bevelThickness: 0.08,
      bevelSegments: 2,
      curveSegments: 14,
    }),
    new THREE.MeshStandardMaterial({ color: '#b9b09a', roughness: 0.9, dithering: true }),
  )
  base.rotation.x = Math.PI / 2
  base.position.y = -0.66
  base.receiveShadow = true
  scene.add(base)

  const rim = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundedShape(TRAY.w + 0.08, TRAY.d + 0.08, 1.52), {
      depth: 0.12,
      bevelEnabled: true,
      bevelSize: 0.04,
      bevelThickness: 0.03,
      bevelSegments: 2,
      curveSegments: 14,
    }),
    new THREE.MeshStandardMaterial({ color: '#e8dcc0', roughness: 0.78, metalness: 0.05, dithering: true }),
  )
  rim.rotation.x = Math.PI / 2
  rim.position.y = 0.18
  rim.receiveShadow = true
  scene.add(rim)
}

function buildWater(scene: THREE.Scene) {
  const time = { value: 0 }
  const night = { value: 0 }
  const material = new THREE.MeshStandardMaterial({ color: '#2f6b5e', roughness: 0.2, metalness: 0.42, envMapIntensity: 0.9, dithering: true })
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time
    shader.uniforms.uNight = night
    shader.vertexShader = 'uniform float uTime; varying vec3 vWater;\n' + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      transformed.y += .008*sin(transformed.x*1.6+uTime*.65)+.006*sin(transformed.z*1.15-uTime*.48);
      vWater = transformed;`,
    )
    shader.fragmentShader = 'uniform float uTime;uniform float uNight;varying vec3 vWater;\n' + shader.fragmentShader
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <normal_fragment_begin>',
      `#include <normal_fragment_begin>
      normal.x += .055*sin(vWater.x*3.2+vWater.z*1.4+uTime*.5);
      normal.z += .045*cos(vWater.z*4.1-uTime*.4);
      normal.x += .02*sin(vWater.x*8.5+vWater.z*6.2+uTime*1.1);
      normal = normalize(normal);`,
    )
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
      float streak = pow(max(0.,sin(vWater.z*18.+sin(vWater.x*4.+uTime)*1.6)),12.);
      totalEmissiveRadiance += vec3(.5,.3,.12)*uNight*streak*.07;`,
    )
  }
  const surface = new THREE.Mesh(new THREE.PlaneGeometry(TRAY.w, TRAY.d, 80, 160).rotateX(-Math.PI / 2), material)
  surface.position.y = TRAY.waterY
  surface.receiveShadow = true
  scene.add(surface)
  return { time, night, material }
}

function buildRoads(kit: Kit, roads: Road[], occupied: (x: number, z: number, margin: number) => boolean, walks: WalkPath[], lamps: THREE.Vector3[], rng: () => number) {
  let index = 0
  for (const road of roads) {
    for (let i = 1; i < road.points.length; i++) {
      const a = road.points[i - 1]
      const b = road.points[i]
      const dx = b[0] - a[0]
      const dz = b[1] - a[1]
      const len = Math.hypot(dx, dz)
      if (len < 0.02) continue
      const yaw = -Math.atan2(dz, dx)
      const nx = dz / len
      const nz = -dx / len
      const mx = (a[0] + b[0]) / 2
      const mz = (a[1] + b[1]) / 2
      const width = road.width
      kit.at(0, 0, 0)
      kit.box(mx, TRAY.roadY, mz, len + 0.02, 0.035, width, road.bridge ? '#59605c' : '#4f5a5c', 'wall', yaw)
      for (const s of [-1, 1]) {
        const off = (width / 2 + 0.045) * s
        kit.box(mx + nx * off, 0.682, mz + nz * off, Math.max(0.01, len - 0.16), 0.045, 0.06, '#bdb6a0', 'wall', yaw)
        kit.box(mx + nx * (width / 2 + 0.012) * s, 0.69, mz + nz * (width / 2 + 0.012) * s, Math.max(0.01, len - 0.16), 0.018, 0.015, '#d8d0b8', 'wall', yaw)
      }
      if (road.width >= 0.2) {
        for (let t = 0.16; t < len - 0.1; t += 0.42)
          kit.box(a[0] + (dx * t) / len, 0.672, a[1] + (dz * t) / len, 0.07, 0.005, 0.007, '#c9b77a', 'wall', yaw)
      }
      if (road.bridge) {
        kit.box(mx, 0.625, mz, len + 0.04, 0.06, width + 0.16, '#9a9a8a', 'wall', yaw)
        for (const s of [-1, 1]) {
          kit.box(mx + nx * (width / 2 + 0.1) * s, 0.7, mz + nz * (width / 2 + 0.1) * s, len, 0.08, 0.02, '#d8d2c0', 'metal', yaw)
          for (let t = 0.1; t < len; t += 0.45)
            kit.box(a[0] + (dx * t) / len + nx * (width / 2 + 0.1) * s, 0.74, a[1] + (dz * t) / len + nz * (width / 2 + 0.1) * s, 0.01, 0.06, 0.01, '#c9c3b2', 'metal', yaw)
        }
        for (const t of [0.28, 0.72]) {
          const px = a[0] + dx * t
          const pz = a[1] + dz * t
          kit.cylinder(px, 0.44, pz, 0.05, 0.38, '#a8a596', 'wall', 0.04, 8)
        }
        for (const t of [0.05, 0.95]) {
          const px = a[0] + dx * t + nx * (width / 2 + 0.12)
          const pz = a[1] + dz * t + nz * (width / 2 + 0.12)
          kit.cylinder(px, 0.82, pz, 0.012, 0.28, '#b8b2a2', 'metal')
          kit.box(px, 0.97, pz, 0.05, 0.025, 0.04, '#ffd9a0', 'window')
          lamps.push(new THREE.Vector3(px, 0.69, pz))
        }
      }
      if (!road.bridge) {
        if (index % 3 === 0) {
          const off = width / 2 + 0.15
          const side = index % 2 === 0 ? 1 : -1
          const x = mx + nx * off * side
          const z = mz + nz * off * side
          if (!occupied(x, z, 0.08)) {
            kit.cylinder(x, 0.82, z, 0.011, 0.34, '#5f7a72', 'metal')
            kit.box(x, 1.0, z, 0.06, 0.025, 0.05, '#ffd9a0', 'window')
            lamps.push(new THREE.Vector3(x, 0.69, z))
          }
        }
        if (index % 5 === 1) {
          const off = width / 2 + 0.1
          const x = mx + nx * off
          const z = mz + nz * off
          if (!occupied(x, z, 0.1)) {
            const curve = new THREE.LineCurve3(new THREE.Vector3(x, 0.72, z), new THREE.Vector3(x + dx * 0.22, 0.72, z + dz * 0.22))
            walks.push({ curve, speed: 0.045 + rng() * 0.02 })
          }
        }
        if (index % 11 === 4) {
          const off = width / 2 + 0.2
          const side = index % 2 === 0 ? -1 : 1
          const x = mx + nx * off * side
          const z = mz + nz * off * side
          if (!occupied(x, z, 0.12)) {
            const colors = ['#e2604a', '#e6b04a', '#3f8f7a', '#4a7fb5']
            const color = colors[Math.floor(rng() * colors.length)]
            kit.at(x, z, 0.7, yaw)
            kit.box(0, 0.12, 0, 0.22, 0.22, 0.12, '#b46a3c', 'wall')
            kit.box(0, 0.24, 0, 0.26, 0.03, 0.16, '#d8c7a4', 'wall')
            kit.cylinder(0, 0.5, 0, 0.01, 0.45, '#7a5a3a', 'metal')
            kit.cylinder(0, 0.72, 0, 0.21, 0.05, color, 'roof', 0.02, 8)
            kit.cylinder(-0.05, 0.3, 0.02, 0.04, 0.08, '#b98548', 'metal', 0.04, 8)
            kit.box(0.08, 0.28, 0.02, 0.06, 0.04, 0.06, '#ffe066', 'neon')
            kit.at(0, 0, 0)
          }
        }
      }
      index++
    }
  }
}

function buildPromenade(kit: Kit) {
  for (const side of ['west', 'east'] as const) {
    for (let z = -15.4; z <= 15.4; z += 0.4) {
      const edge = side === 'west' ? riverLeft(z) : riverRight(z)
      const x = edge + (side === 'west' ? 0.05 : -0.05)
      kit.at(0, 0, 0)
      kit.box(x, 0.55, z, 0.08, 0.12, 0.42, '#c9c2ad', 'wall')
      if (Math.round(z * 10) % 12 === 0) kit.cylinder(x, 0.64, z, 0.016, 0.08, '#74857b', 'metal')
    }
  }
  // Piers and landing steps.
  const piers: { side: 'west' | 'east'; z: number; len: number; name: string }[] = [
    { side: 'east', z: -7.0, len: 0.34, name: 'Tha Chang' },
    { side: 'east', z: -4.2, len: 0.3, name: 'Tha Tien' },
    { side: 'west', z: -6.8, len: 0.3, name: 'Wat Arun' },
    { side: 'west', z: 2.5, len: 0.36, name: 'ICONSIAM' },
    { side: 'east', z: 7.5, len: 0.32, name: 'Sathorn' },
  ]
  for (const pier of piers) {
    const edge = pier.side === 'west' ? riverLeft(pier.z) : riverRight(pier.z)
    const dir = pier.side === 'west' ? 1 : -1
    const x = edge + dir * (pier.len / 2)
    kit.at(0, 0, 0)
    kit.box(x, 0.53, pier.z, pier.len, 0.1, 0.34, '#b7a889', 'wall')
    kit.box(x, 0.59, pier.z, pier.len * 0.92, 0.02, 0.28, '#c8b89a', 'wall')
    for (const s of [-1, 1])
      kit.box(x + dir * (pier.len / 2 - 0.03), 0.62, pier.z + s * 0.14, 0.02, 0.12, 0.02, '#d8d2c0', 'metal')
    // A small canopy at the river end.
    const ex = edge + dir * (pier.len - 0.02)
    kit.box(ex, 0.78, pier.z, 0.12, 0.03, 0.3, '#b65a3a', 'roof')
    for (const s of [-1, 1]) kit.cylinder(ex, 0.7, pier.z + s * 0.12, 0.008, 0.18, '#8a7a62', 'metal')
    // Steps down to the water.
    for (let i = 0; i < 3; i++)
      kit.box(edge + dir * (0.08 + i * 0.06), 0.4 - i * 0.05, pier.z, 0.07, 0.03, 0.28, '#cbbfa6', 'wall')
  }
}

function buildParks(kit: Kit, walks: WalkPath[], lamps: THREE.Vector3[], trees: Tree[], occupied: (x: number, z: number, margin: number) => boolean, rng: () => number) {
  for (const park of PARK_SITES) {
    kit.at(0, 0, 0)
    kit.box(park.x, 0.605, park.z, park.w, 0.11, park.d, park.kind === 'lawn' ? '#7e9c58' : '#6f8f55', 'green')
    kit.box(park.x, 0.665, park.z, park.w * 0.94, 0.012, park.d * 0.94, park.kind === 'lawn' ? '#8fa867' : '#7d9a61', 'green')
    // A lake in Lumphini and a pond in the riverside park.
    if (park.kind === 'park') {
      const lake = new THREE.Shape()
      const curve = new THREE.EllipseCurve(park.x - 0.1, park.z + 0.18, 0.4, 0.55, 0, Math.PI * 2)
      lake.setFromPoints(curve.getPoints(48))
      const g = new THREE.ShapeGeometry(lake).rotateX(Math.PI / 2).translate(0, 0.675, 0)
      // The shape was built in world coordinates, so keep the mesh at the origin.
      kit.geometry(g, '#3f7f7a', 'glass')
    }
    // Paths.
    const pathCount = park.kind === 'lawn' ? 1 : 2
    for (let p = 0; p < pathCount; p++) {
      const z0 = park.z - park.d * 0.42
      const z1 = park.z + park.d * 0.42
      const x0 = park.x + (p === 0 ? -park.w * 0.22 : park.w * 0.22)
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x0, 0.69, z0),
        new THREE.Vector3(x0 + park.w * 0.08, 0.69, park.z - park.d * 0.1),
        new THREE.Vector3(x0 - park.w * 0.06, 0.69, park.z + park.d * 0.1),
        new THREE.Vector3(x0 + park.w * 0.04, 0.69, z1),
      ])
      kit.geometry(
        new THREE.TubeGeometry(curve, 50, 0.045, 5, false)
          .translate(0, -0.69, 0)
          .scale(1, 0.1, 1)
          .translate(0, 0.685, 0),
        '#d8c8a0',
        'wall',
      )
      walks.push({ curve, speed: 0.04 })
      for (let i = 0; i < 3; i++) {
        const point = curve.getPoint((i + 0.5) / 3)
        if (!occupied(point.x + 0.12, point.z, 0.05)) {
          kit.at(point.x + 0.12, point.z, 0.69, Math.PI / 2)
          kit.box(0, 0.06, 0, 0.18, 0.02, 0.06, '#ac8d62', 'wall')
          kit.box(0, 0.1, -0.03, 0.18, 0.06, 0.015, '#b29b72', 'wall')
          kit.at(0, 0, 0)
        }
      }
    }
    // Trees.
    const count = park.kind === 'park' ? 70 : park.kind === 'lawn' ? 18 : 26
    for (let i = 0; i < count; i++) {
      const x = park.x + (rng() - 0.5) * (park.w - 0.2)
      const z = park.z + (rng() - 0.5) * (park.d - 0.2)
      if (park.kind === 'park' && Math.hypot((x - park.x + 0.1) / 0.5, (z - park.z - 0.18) / 0.66) < 1.1) continue
      if (occupied(x, z, 0.08)) continue
      const type: 0 | 1 = rng() < 0.78 ? 0 : 1
      const s = type === 0 ? 0.11 + rng() * 0.09 : 0.14 + rng() * 0.07
      trees.push({ x, y: type === 0 ? 0.86 + s * 0.7 : 1.2, z, s, type, phase: rng() * 6.28 })
    }
    // A small pavilion.
    if (park.kind !== 'riverside') {
      const px = park.x - park.w * 0.28
      const pz = park.z + park.d * 0.3
      if (!occupied(px, pz, 0.2)) {
        kit.at(px, pz, 0.7, 0.2)
        kit.box(0, 0.16, 0, 0.3, 0.32, 0.26, '#efe7d2', 'wall')
        kit.prism(0, 0.44, 0, 0.42, 0.36, 0.14, '#b65a3a', 'roof', 0.1)
        for (const s of [-1, 1]) kit.cylinder(s * 0.12, 0.2, 0.14, 0.012, 0.28, '#d8d2c0', 'metal')
        kit.at(0, 0, 0)
        lamps.push(new THREE.Vector3(px, 0.69, pz))
      }
    }
  }
}

function buildTrees(scene: THREE.Scene, trees: Tree[], rng: () => number) {
  const canopyGeometry = new THREE.SphereGeometry(1, 7, 5)
  const palmGeometry = palmCrownGeometry()
  const trunkGeometry = new THREE.CylinderGeometry(0.012, 0.018, 1, 6)
  const rain = trees.filter((t) => t.type === 0)
  const palms = trees.filter((t) => t.type === 1)
  const canopy = new THREE.InstancedMesh(canopyGeometry, new THREE.MeshStandardMaterial({ roughness: 0.92 }), rain.length)
  const palm = new THREE.InstancedMesh(palmGeometry, new THREE.MeshStandardMaterial({ roughness: 0.9, side: THREE.DoubleSide }), palms.length)
  const trunks = new THREE.InstancedMesh(trunkGeometry, new THREE.MeshStandardMaterial({ color: '#7b6a4c', roughness: 0.95 }), trees.length)
  rain.forEach((t, i) => canopy.setColorAt(i, new THREE.Color(['#6f9557', '#7fa565', '#5c8756'][i % 3]).multiplyScalar(0.9 + rng() * 0.2)))
  palms.forEach((t, i) => palm.setColorAt(i, new THREE.Color(['#5f8f4e', '#6f9c5e', '#547f46'][i % 3])))
  for (const m of [canopy, palm, trunks]) {
    m.castShadow = true
    m.receiveShadow = true
    m.frustumCulled = false
    scene.add(m)
  }
  const dummy = new THREE.Object3D()
  function place(time: number) {
    let ti = 0
    for (const t of trees) {
      const sway = Math.sin(time * 0.5 + t.phase) * 0.02
      dummy.position.set(t.x, t.y + (t.type === 0 ? 0 : 0.16), t.z)
      dummy.rotation.set(sway, t.phase, sway * 0.6)
      dummy.scale.set(t.s, t.s * (t.type === 0 ? 1.25 : 0.6), t.s)
      dummy.updateMatrix()
      if (t.type === 0) canopy.setMatrixAt(rain.indexOf(t), dummy.matrix)
      else palm.setMatrixAt(palms.indexOf(t), dummy.matrix)
      dummy.position.set(t.x, 0.82 + (t.type === 1 ? 0.3 : 0.18), t.z)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(1, t.type === 1 ? 1.3 : 0.6, 1)
      dummy.updateMatrix()
      trunks.setMatrixAt(ti++, dummy.matrix)
    }
    canopy.instanceMatrix.needsUpdate = true
    palm.instanceMatrix.needsUpdate = true
    trunks.instanceMatrix.needsUpdate = true
  }
  place(0)
  return { place }
}

export function buildEnvironment(scene: THREE.Scene, kit: Kit, plan: CityPlan, seed = 72): Environment {
  let s = seed >>> 0
  const rng = () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
  const walks: WalkPath[] = []
  const lamps: THREE.Vector3[] = []
  const trees: Tree[] = []
  const parcels = plan.parcels
  const cells = new Map<string, Parcel[]>()
  for (const p of parcels) {
    const key = `${Math.floor(p.x / 0.6)},${Math.floor(p.z / 0.6)}`
    const list = cells.get(key) ?? []
    list.push(p)
    cells.set(key, list)
  }
  const occupiedByParcels = (x: number, z: number, margin: number) => {
    for (let ix = -1; ix <= 1; ix++)
      for (let iz = -1; iz <= 1; iz++) {
        const list = cells.get(`${Math.floor(x / 0.6) + ix},${Math.floor(z / 0.6) + iz}`)
        if (list?.some((p) => Math.hypot(x - p.x, z - p.z) < Math.hypot(p.w, p.d) / 2 + margin)) return true
      }
    return false
  }
  const occupied = (x: number, z: number, margin: number) => {
    if (occupiedByParcels(x, z, margin)) return true
    for (const site of [...LANDMARKS, ...PARK_SITES])
      if (Math.abs(x - site.x) < site.w / 2 + margin && Math.abs(z - site.z) < site.d / 2 + margin) return true
    return false
  }

  buildTray(scene)
  buildLand(scene)
  const water = buildWater(scene)
  buildRoads(kit, plan.roads, occupied, walks, lamps, rng)
  buildPromenade(kit)
  buildParks(kit, walks, lamps, trees, occupiedByParcels, rng)

  // Street trees and palms along the river.
  for (let z = -14.8; z <= 14.8; z += 0.9) {
    for (const side of ['west', 'east'] as const) {
      const edge = side === 'west' ? riverLeft(z) : riverRight(z)
      const x = edge + (side === 'west' ? 0.3 : -0.3)
      if (!occupied(x, z, 0.1) && rng() < 0.55) {
        const type: 0 | 1 = rng() < 0.55 ? 1 : 0
        trees.push({ x, y: type === 0 ? 0.86 + 0.13 : 1.28, z, s: 0.13 + rng() * 0.05, type, phase: rng() * 6.28 })
      }
    }
  }
  // A few trees in the gaps between the frontage rows.
  for (let i = 0; i < 60; i++) {
    const road = plan.roads[Math.floor(rng() * plan.roads.length)]
    const p = road.points[Math.floor(rng() * road.points.length)]
    const x = p[0] + (rng() - 0.5) * 0.5
    const z = p[1] + (rng() - 0.5) * 0.5
    if (insideLand(x, z) && !occupied(x, z, 0.12)) {
      trees.push({ x, y: 0.86 + 0.12, z, s: 0.1 + rng() * 0.06, type: 0, phase: rng() * 6.28 })
    }
  }

  const treeMeshes = buildTrees(scene, trees, rng)

  // Contact shadows under every parcel.
  const shadowMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}',
    fragmentShader: 'varying vec2 vUv;void main(){vec2 p=(vUv-.5)*2.;gl_FragColor=vec4(.2,.22,.16,exp(-dot(p,p)*4.)*.2);}',
  })
  const shadows = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), shadowMaterial, parcels.length)
  const dummy = new THREE.Object3D()
  parcels.forEach((p, i) => {
    dummy.position.set(p.x, 0.675, p.z)
    dummy.scale.set(p.w * 1.7, 1, p.d * 1.7)
    dummy.rotation.set(0, p.rot, 0)
    dummy.updateMatrix()
    shadows.setMatrixAt(i, dummy.matrix)
  })
  scene.add(shadows)

  // Warm pools under the lamps.
  const glowMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { night: { value: 0 } },
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}',
    fragmentShader: 'varying vec2 vUv;uniform float night;void main(){float d=length(vUv-.5)*2.;gl_FragColor=vec4(1.,.68,.27,exp(-d*d*5.)*.22*night);}',
  })
  const pools = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.62, 0.7).rotateX(-Math.PI / 2), glowMaterial, lamps.length)
  lamps.forEach((p, i) => {
    dummy.position.set(p.x, 0.675, p.z)
    dummy.scale.set(1, 1, 1)
    dummy.rotation.set(0, 0, 0)
    dummy.updateMatrix()
    pools.setMatrixAt(i, dummy.matrix)
  })
  scene.add(pools)

  // A couple of spirit houses at street corners.
  const corners = plan.network.nodes.filter((n) => n.neighbors.length >= 3)
  for (let i = 0; i < corners.length; i += 7) {
    const n = corners[i]
    if (occupied(n.x + 0.18, n.z + 0.18, 0.08)) continue
    kit.at(n.x + 0.18, n.z + 0.18, 0.7, rng() * 0.4)
    kit.box(0, 0.06, 0, 0.14, 0.12, 0.14, '#e6dcc4', 'wall')
    kit.box(0, 0.18, 0, 0.1, 0.1, 0.1, '#f0e6d2', 'wall')
    kit.prism(0, 0.26, 0, 0.16, 0.16, 0.06, '#d9b45a', 'accent', 0.1)
    kit.cylinder(0, 0.32, 0, 0.008, 0.08, '#d9b45a', 'accent', 0.002, 6)
    kit.box(0, 0.19, 0.052, 0.08, 0.02, 0.006, '#c23b32', 'neon')
    kit.at(0, 0, 0)
  }

  return {
    walks,
    lampPositions: lamps,
    update(time, night) {
      water.time.value = time
      water.night.value = night
      water.material.color.set('#2f6b5e').lerp(new THREE.Color('#0e242c'), night)
      glowMaterial.uniforms.night.value = night
      treeMeshes.place(time)
    },
  }
}
