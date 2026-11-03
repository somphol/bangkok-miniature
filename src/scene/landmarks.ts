import * as THREE from 'three'
import type { Kit } from './kit'

/** A tiered Thai hip roof with gold trim and a small spire. */
function thaiRoof(
  kit: Kit,
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  h: number,
  color: string,
  trim = '#e3bd63',
  tiers = 2,
) {
  for (let i = 0; i < tiers; i++) {
    const t = i / tiers
    const ww = w * (1 - 0.16 * i)
    const dd = d * (1 - 0.16 * i)
    const hh = h / tiers
    kit.prism(x, y + hh * (i + 0.5), z, ww, dd, hh, color, 'roof', 0.12)
    kit.box(x, y + hh * i + 0.018, z, ww * 1.05, 0.025, dd * 1.05, trim, 'accent')
  }
  kit.cylinder(x, y + h + 0.13, z, 0.022, 0.26, trim, 'accent', 0.002, 6)
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ]) {
    kit.beam(
      new THREE.Vector3(x + (sx * w) / 2.15, y + 0.03, z + (sz * d) / 2.15),
      new THREE.Vector3(x + (sx * w) / 2.6, y + 0.2, z + (sz * d) / 2.6),
      0.012,
      trim,
      'accent',
    )
  }
}

/** A gilded bell-shaped chedi. `base` is the bottom of the whole stupa. */
function chedi(kit: Kit, x: number, z: number, r: number, h: number, base = 0, color = '#e6c264', trim = '#f4df9a') {
  kit.prism(x, base + 0.08, z, r * 2.15, r * 2.15, 0.16, color, 'wall', 0.9)
  kit.prism(x, base + 0.2, z, r * 1.8, r * 1.8, 0.1, color, 'wall', 0.94)
  kit.cylinder(x, base + 0.4 * h, z, r, h * 0.32, color, 'wall', r * 0.62, 16)
  kit.sphere(x, base + 0.58 * h, z, r * 0.72, color, 'wall', 0.92)
  kit.cylinder(x, base + 0.7 * h, z, r * 0.5, 0.025, trim, 'accent', r * 0.5, 16)
  kit.cylinder(x, base + 0.82 * h, z, r * 0.34, h * 0.26, color, 'accent', r * 0.02, 12)
  kit.cylinder(x, base + 0.96 * h, z, r * 0.025, h * 0.14, trim, 'accent', 0.001, 6)
}

/** A Khmer-style prang: tiered base, tapering shaft, spire. */
function prang(kit: Kit, x: number, z: number, base: number, h: number, color: string, trim: string) {
  kit.prism(x, base + h * 0.1, z, base * 1.9, base * 1.9, h * 0.2, color, 'wall', 0.88)
  kit.prism(x, base + h * 0.29, z, base * 1.55, base * 1.55, h * 0.18, color, 'wall', 0.86)
  kit.prism(x, base + h * 0.46, z, base * 1.24, base * 1.24, h * 0.16, color, 'wall', 0.82)
  kit.prism(x, base + h * 0.67, z, base * 0.92, base * 0.92, h * 0.26, color, 'wall', 0.42)
  kit.prism(x, base + h * 0.88, z, base * 0.48, base * 0.48, h * 0.16, trim, 'accent', 0.02)
  kit.cylinder(x, base + h * 0.99, z, base * 0.05, h * 0.12, trim, 'accent', 0.001, 6)
  for (const y of [0.2, 0.38, 0.55, 0.75]) {
    kit.box(x, base + h * y, z, base * 1.98 * (1 - y * 0.5), 0.018, base * 1.98 * (1 - y * 0.5), trim, 'accent')
  }
  const mosaic = ['#d9b45a', '#5f8f7a', '#b65a4a', '#e3d3a4']
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ]) {
    kit.box(x + sx * base * 0.78, base + h * 0.18, z + sz * base * 0.78, 0.08, 0.12, 0.08, trim, 'accent')
    for (let i = 0; i < 4; i++)
      kit.box(x + sx * base * 0.62, base + h * (0.3 + i * 0.12), z + sz * base * 0.62, 0.045, 0.06, 0.045, mosaic[(i + (sx > 0 ? 1 : 0)) % 4], 'accent')
  }
}

function templeHall(
  kit: Kit,
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  h: number,
  wall: string,
  roof: string,
  trim: string,
) {
  kit.box(x, y + h / 2, z, w, h, d, wall, 'wall')
  for (let i = 0; i < 4; i++) {
    const xx = x - w * 0.36 + i * w * 0.24
    kit.box(xx, y + h * 0.55, z + d / 2 + 0.012, w * 0.1, h * 0.28, 0.016, '#4d6f75', 'glass')
  }
  kit.box(x, y + h - 0.03, z, w * 1.04, 0.06, d * 1.04, trim, 'wall')
  thaiRoof(kit, x, y + h, z, w * 1.22, d * 1.22, 0.26, roof, trim, 2)
}

/** Grand Palace: the walled royal compound, the golden chedi and the Chakri Maha Prasat. */
export function grandPalace(kit: Kit, x: number, z: number, yaw = 0) {
  kit.at(x, z, 0.69, yaw)
  const stone = '#efe7d4'
  const gold = '#e3bd63'
  const roof = '#2f5d4f'
  kit.box(0, 0.04, 0, 1.76, 0.08, 1.62, '#ded4bd', 'wall')
  // Perimeter wall with a gate on the south side.
  for (const [w, d, xx, zz] of [
    [1.76, 0.06, 0, -0.81],
    [0.6, 0.06, -0.58, 0.81],
    [0.6, 0.06, 0.58, 0.81],
    [0.06, 1.62, -0.88, 0],
    [0.06, 1.62, 0.88, 0],
  ] as const) {
    kit.box(xx, 0.13, zz, w, 0.26, d, stone, 'wall')
    kit.box(xx, 0.27, zz, w * 1.02, 0.04, d * 1.08, gold, 'accent')
  }
  // Gate pavilion.
  kit.box(0, 0.3, 0.82, 0.34, 0.6, 0.12, stone, 'wall')
  thaiRoof(kit, 0, 0.6, 0.82, 0.5, 0.3, 0.22, '#a8563c', gold, 1)
  // Chakri Maha Prasat: the central European-Thai palace.
  kit.box(0, 0.52, -0.08, 0.72, 1.04, 0.5, stone, 'wall')
  for (let f = 0; f < 3; f++) {
    const y = 0.18 + f * 0.3
    for (let i = 0; i < 4; i++)
      kit.box(-0.24 + i * 0.16, y, 0.18, 0.075, 0.13, 0.014, '#5b7d80', 'glass')
    kit.box(0, y + 0.09, 0.19, 0.64, 0.018, 0.02, gold, 'accent')
  }
  kit.box(0, 1.07, -0.08, 0.78, 0.06, 0.56, gold, 'accent')
  thaiRoof(kit, 0, 1.1, -0.08, 0.84, 0.62, 0.32, roof, gold, 2)
  kit.cylinder(0, 1.62, -0.08, 0.032, 0.48, gold, 'accent', 0.002, 6)
  kit.sphere(0, 1.88, -0.08, 0.035, '#f7e6ad', 'accent')
  // Phra Si Rattana Chedi, the golden stupa.
  chedi(kit, -0.56, 0.2, 0.21, 1.72, 0, gold, '#f7e6ad')
  // Phra Mondop, the library with its golden spire.
  kit.box(0.55, 0.36, 0.18, 0.32, 0.72, 0.32, stone, 'wall')
  thaiRoof(kit, 0.55, 0.72, 0.18, 0.44, 0.44, 0.26, roof, gold, 2)
  // Dusit Maha Prasat and the Emerald Buddha hall.
  templeHall(kit, 0.55, 0.08, -0.38, 0.46, 0.32, 0.52, stone, '#2f5d4f', gold)
  templeHall(kit, -0.56, 0.08, -0.38, 0.5, 0.34, 0.46, stone, '#a8563c', gold)
  // Two small guardian figures at the gate.
  for (const s of [-1, 1]) {
    kit.box(s * 0.24, 0.12, 0.66, 0.06, 0.18, 0.06, gold, 'accent')
    kit.sphere(s * 0.24, 0.24, 0.66, 0.04, gold, 'accent')
  }
  kit.count('Grand Palace landmark')
}

/** Wat Arun: the porcelain prang on the west bank, with four small prangs and a river landing. */
export function watArun(kit: Kit, x: number, z: number, yaw = 0) {
  kit.at(x, z, 0.69, yaw)
  const stone = '#efe8d6'
  const gold = '#d9b45a'
  kit.box(0, 0.08, 0, 1.42, 0.16, 1.22, '#e3dac4', 'wall')
  kit.box(0, 0.17, 0, 1.2, 0.04, 1.0, '#d6cbb2', 'wall')
  // Central prang.
  prang(kit, 0, 0.18, 0.5, 3.2, stone, gold)
  // Four smaller prangs at the corners.
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ])
    prang(kit, sx * 0.42, sz * 0.32, 0.17, 1.3, stone, gold)
  // Cloister wall with small niches.
  for (const [w, d, xx, zz] of [
    [1.42, 0.04, 0, -0.61],
    [1.42, 0.04, 0, 0.61],
    [0.04, 1.22, -0.71, 0],
    [0.04, 1.22, 0.71, 0],
  ] as const) {
    kit.box(xx, 0.12, zz, w, 0.2, d, stone, 'wall')
    kit.box(xx, 0.23, zz, w * 1.02, 0.03, d * 1.04, gold, 'accent')
  }
  // River landing and two guardians.
  kit.box(0.78, 0.06, 0, 0.32, 0.1, 0.5, '#cbbfa6', 'wall')
  for (const s of [-1, 1]) {
    kit.box(0.86, 0.14, s * 0.16, 0.05, 0.18, 0.05, stone, 'wall')
    kit.sphere(0.86, 0.26, s * 0.16, 0.035, gold, 'accent')
  }
  // A few gold finials on the terrace.
  for (const s of [-1, 1]) kit.cylinder(s * 0.6, 0.3, 0.52, 0.012, 0.2, gold, 'accent', 0.002, 6)
  kit.count('Wat Arun landmark')
}

/** Wat Pho: the reclining Buddha hall, the four tiled chedis and the cloister. */
export function watPho(kit: Kit, x: number, z: number, yaw = 0) {
  kit.at(x, z, 0.69, yaw)
  const stone = '#efe7d2'
  const gold = '#d9b45a'
  kit.box(0, 0.05, 0, 1.7, 0.1, 1.24, '#ddd3ba', 'wall')
  // The long hall.
  templeHall(kit, 0, 0.1, 0.02, 1.16, 0.42, 0.58, stone, '#2f6b55', gold)
  // A gilded reclining Buddha in the courtyard, the temple's namesake.
  kit.box(0, 0.14, 0.4, 0.62, 0.08, 0.2, '#c9b89a', 'wall')
  kit.box(0, 0.21, 0.4, 0.56, 0.08, 0.14, '#e3bd63', 'accent')
  kit.sphere(0.3, 0.24, 0.4, 0.055, '#f0d78a', 'accent', 0.8)
  // Four chedis on the courtyard corners.
  const colors = ['#d9b45a', '#7fa8a0', '#b65a4a', '#e3d3a4']
  let i = 0
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ]) {
    chedi(kit, sx * 0.58, sz * 0.34, 0.14, 0.95, 0.1, colors[i], '#f1e2b4')
    i++
  }
  // Cloister.
  for (const [w, d, xx, zz] of [
    [1.7, 0.035, 0, -0.6],
    [1.7, 0.035, 0, 0.6],
    [0.035, 1.2, -0.83, 0],
    [0.035, 1.2, 0.83, 0],
  ] as const) {
    kit.box(xx, 0.14, zz, w, 0.22, d, stone, 'wall')
    kit.box(xx, 0.26, zz, w * 1.01, 0.03, d * 1.1, '#a8563c', 'roof')
  }
  // A small ordination hall at the north.
  templeHall(kit, 0, 0.1, -0.42, 0.5, 0.22, 0.34, stone, '#a8563c', gold)
  kit.count('Wat Pho landmark')
}

/** Giant Swing: the red teak columns beside Wat Suthat. */
export function giantSwing(kit: Kit, x: number, z: number, yaw = 0) {
  kit.at(x, z, 0.69, yaw)
  const red = '#a8322a'
  const gold = '#d9b45a'
  const stone = '#efe7d2'
  kit.box(0, 0.06, 0, 0.78, 0.12, 0.5, '#ddd3ba', 'wall')
  kit.box(0, 0.13, 0, 0.6, 0.02, 0.36, '#c9bda2', 'wall')
  // Two tapered teak columns.
  for (const s of [-1, 1]) {
    kit.cylinder(s * 0.22, 1.55, 0, 0.038, 3.0, red, 'wall', 0.024, 8)
    kit.box(s * 0.22, 0.25, 0, 0.12, 0.22, 0.12, stone, 'wall')
    for (const y of [0.7, 1.5, 2.3, 2.85]) kit.cylinder(s * 0.22, y, 0, 0.044, 0.025, gold, 'accent', 0.044, 8)
  }
  // Crossbeam and its gold caps.
  kit.box(0, 3.06, 0, 0.56, 0.05, 0.05, red, 'wall')
  for (const s of [-1, 1]) kit.box(s * 0.29, 3.06, 0, 0.04, 0.07, 0.07, gold, 'accent')
  // Curved brackets.
  for (const s of [-1, 1])
    for (const sz of [-1, 1])
      kit.beam(
        new THREE.Vector3(s * 0.22, 2.65, sz * 0.03),
        new THREE.Vector3(s * 0.06, 3.02, sz * 0.03),
        0.012,
        red,
        'wall',
      )
  // Wat Suthat behind the swing.
  kit.box(0, 0.32, -0.27, 0.5, 0.5, 0.26, stone, 'wall')
  thaiRoof(kit, 0, 0.57, -0.27, 0.62, 0.4, 0.24, '#2f5d4f', gold, 2)
  // Low fence.
  for (const s of [-1, 1]) kit.box(s * 0.36, 0.16, 0.24, 0.02, 0.16, 0.02, gold, 'accent')
  kit.count('Giant Swing landmark')
}

/** Golden Mount: the man-made hill, spiral climb and golden chedi. */
export function goldenMount(kit: Kit, x: number, z: number, yaw = 0) {
  kit.at(x, z, 0.69, yaw)
  const green = '#6f8a55'
  const gold = '#e3bd63'
  const stone = '#d8c8a8'
  // Hill with a stone retaining wall and a winding climb.
  kit.cylinder(0, 0.58, 0, 0.62, 1.16, green, 'green', 0.3, 16)
  kit.cylinder(0, 0.12, 0, 0.72, 0.2, '#7d9460', 'green', 0.68, 16)
  kit.cylinder(0, 0.11, 0, 0.74, 0.18, '#c9b89a', 'wall', 0.72, 16)
  for (let i = 0; i < 40; i++) {
    const angle = i * 0.44
    const radius = 0.61 - i * 0.0075
    const y = 0.14 + i * 0.026
    kit.box(Math.cos(angle) * radius, y, Math.sin(angle) * radius, 0.13, 0.028, 0.17, stone, 'wall', -angle)
  }
  // Golden chedi on the summit, with a ceremonial umbrella.
  chedi(kit, 0, 0, 0.18, 1.25, 1.12, gold, '#f7e6ad')
  kit.cylinder(0, 2.52, 0, 0.018, 0.2, gold, 'accent', 0.004, 6)
  kit.cylinder(0, 2.62, 0, 0.11, 0.03, '#b65a3a', 'roof', 0.02, 8)
  // A small sala at the foot of the hill.
  kit.box(-0.42, 0.16, 0.38, 0.24, 0.28, 0.2, '#efe7d2', 'wall')
  kit.prism(-0.42, 0.34, 0.38, 0.34, 0.28, 0.1, '#b65a3a', 'roof', 0.1)
  // Low wall and gate.
  for (const [w, d, xx, zz] of [
    [1.3, 0.04, 0, -0.65],
    [0.5, 0.04, -0.4, 0.65],
    [0.5, 0.04, 0.4, 0.65],
    [0.04, 1.3, -0.65, 0],
    [0.04, 1.3, 0.65, 0],
  ] as const) {
    kit.box(xx, 0.12, zz, w, 0.2, d, '#e6dcc4', 'wall')
    kit.box(xx, 0.23, zz, w * 1.02, 0.03, d * 1.1, '#b65a3a', 'roof')
  }
  // Trees around the base.
  for (const [tx, tz] of [
    [-0.52, 0.46],
    [0.5, -0.42],
    [-0.42, -0.48],
  ]) {
    kit.cylinder(tx, 0.32, tz, 0.014, 0.25, '#7b6a4c', 'metal')
    kit.sphere(tx, 0.55, tz, 0.14, '#6f9c5e', 'green', 0.8)
  }
  kit.count('Golden Mount landmark')
}

/** Baiyoke Tower II: the slender old tallest tower with its observation deck and antenna. */
export function baiyoke(kit: Kit, x: number, z: number, yaw = 0) {
  kit.at(x, z, 0.69, yaw)
  const wall = '#d8d2c2'
  const glass = '#9fb6bc'
  const gold = '#d9b45a'
  kit.box(0, 0.18, 0, 0.94, 0.36, 0.94, wall, 'wall')
  kit.box(0, 0.22, 0.47, 0.5, 0.22, 0.02, '#4d6f75', 'glass')
  kit.box(0, 0.39, 0, 0.98, 0.05, 0.98, gold, 'accent')
  // Main shaft.
  kit.prism(0, 3.3, 0, 0.52, 0.52, 5.8, glass, 'glass', 0.82)
  for (let y = 0.55; y < 6.0; y += 0.2)
    kit.box(0, y, 0, 0.54, 0.018, 0.54, '#d8e2dd', 'metal')
  for (let y = 0.65; y < 5.6; y += 0.4)
    kit.box(0, y, 0.27, 0.42, 0.06, 0.012, '#d8e2dd', 'metal')
  // Revolving observation deck.
  kit.cylinder(0, 5.8, 0, 0.4, 0.24, glass, 'glass', 0.38, 16)
  kit.cylinder(0, 5.8, 0, 0.42, 0.05, gold, 'accent', 0.42, 16)
  kit.cylinder(0, 5.96, 0, 0.34, 0.04, wall, 'wall', 0.34, 16)
  // Upper shaft, crown and antenna.
  kit.prism(0, 6.3, 0, 0.34, 0.34, 0.65, wall, 'wall', 0.85)
  kit.box(0, 6.65, 0, 0.4, 0.05, 0.4, gold, 'accent')
  kit.cylinder(0, 7.25, 0, 0.014, 1.1, '#c7c2b4', 'metal', 0.004, 6)
  for (let i = 0; i < 3; i++) kit.cylinder(0, 6.85 + i * 0.3, 0, 0.018, 0.03, '#e2604a', 'accent', 0.018, 6)
  kit.box(0, 0.12, 0.48, 0.3, 0.1, 0.02, '#ff5d8f', 'neon')
  kit.count('Baiyoke landmark')
}

/** King Power Mahanakhon: the pixelated glass tower with its spiral cut. */
export function mahanakhon(kit: Kit, x: number, z: number, yaw = 0) {
  kit.at(x, z, 0.69, yaw)
  const glass = '#7f9fa8'
  const metal = '#d8e2dd'
  const gold = '#d9b45a'
  kit.box(0, 0.24, 0, 1.0, 0.48, 1.0, '#d8d2c2', 'wall')
  kit.box(0, 0.26, 0.51, 0.55, 0.26, 0.02, '#4d6f75', 'glass')
  kit.box(0, 0.5, 0, 1.04, 0.05, 1.04, gold, 'accent')
  const levels = 26
  const bw = 0.8
  const bd = 0.8
  const step = 0.23
  for (let i = 0; i < levels; i++) {
    const y = 0.52 + i * step
    const missing = (i * 3) % 4
    for (let q = 0; q < 4; q++) {
      if (q === missing) continue
      const qx = q === 0 || q === 3 ? -bw * 0.25 : bw * 0.25
      const qz = q < 2 ? -bd * 0.25 : bd * 0.25
      kit.box(qx, y + step / 2, qz, bw * 0.5, step, bd * 0.5, glass, 'glass')
      if (i % 4 === 0) kit.box(qx, y + step - 0.012, qz, bw * 0.5, 0.018, bd * 0.5, metal, 'metal')
    }
    if (i % 5 === 0) kit.box(0, y + step - 0.008, 0, bw * 1.01, 0.014, bd * 1.01, gold, 'accent')
  }
  const top = 0.52 + levels * step
  // Sky deck and crown.
  kit.box(0, top + 0.06, 0, 0.88, 0.12, 0.88, metal, 'metal')
  kit.box(0, top + 0.18, 0, 0.8, 0.18, 0.8, '#cfe4e0', 'windowCool')
  kit.box(0, top + 0.3, 0, 0.9, 0.03, 0.9, gold, 'accent')
  kit.cylinder(0, top + 0.56, 0, 0.008, 0.5, metal, 'metal', 0.003, 6)
  kit.box(0, top + 0.84, 0, 0.02, 0.02, 0.02, '#ff5d8f', 'neon')
  kit.count('Mahanakhon landmark')
}

/** Rama VIII Bridge: a single inverted-Y pylon, a fan of cables and a river deck. */
export function ramaVIII(kit: Kit, x: number, z: number, yaw = 0) {
  kit.at(x, z, 0.69, yaw)
  const deck = '#b9b6a8'
  const white = '#e8e4d6'
  const cable = '#d8d4c4'
  const gold = '#d9b45a'
  const deckY = -0.04
  // Deck and approaches.
  kit.box(0, deckY, 0, 4.0, 0.07, 0.52, deck, 'wall')
  kit.box(0, deckY + 0.045, 0, 4.0, 0.012, 0.36, '#4d5552', 'dark')
  for (const s of [-1, 1]) {
    kit.box(0, deckY + 0.09, s * 0.25, 4.0, 0.09, 0.018, white, 'metal')
    for (let i = 0; i < 12; i++) kit.box(-1.8 + i * 0.32, deckY + 0.13, s * 0.25, 0.02, 0.06, 0.012, white, 'metal')
  }
  // Piers in the river.
  for (const px of [-1.2, 1.2]) {
    kit.box(px, deckY - 0.32, 0, 0.18, 0.6, 0.42, '#a8a596', 'wall')
    kit.box(px, deckY - 0.62, 0, 0.24, 0.08, 0.5, '#8f8d7e', 'wall')
  }
  // Inverted-Y pylon: two legs across the deck, converging above it, then a mast.
  for (const s of [-1, 1])
    kit.beam(
      new THREE.Vector3(0, deckY + 0.05, s * 0.3),
      new THREE.Vector3(0, 3.45, 0),
      0.065,
      white,
      'wall',
    )
  kit.box(0, 1.8, 0, 0.14, 0.1, 0.62, white, 'wall')
  kit.beam(new THREE.Vector3(0, 3.4, 0), new THREE.Vector3(0, 4.35, 0), 0.05, white, 'wall')
  kit.cylinder(0, 4.42, 0, 0.035, 0.16, gold, 'accent', 0.02, 8)
  // Cable fan.
  for (const s of [-1, 1])
    for (const lx of [-1.55, -1.15, -0.75, -0.35, 0.35, 0.75, 1.15, 1.55])
      kit.beam(
        new THREE.Vector3(0, 4.28, 0),
        new THREE.Vector3(lx, deckY + 0.1, s * 0.22),
        0.007,
        cable,
        'metal',
      )
  // Lamp posts at the deck ends.
  for (const px of [-1.9, 1.9]) {
    kit.cylinder(px, deckY + 0.2, 0, 0.012, 0.35, white, 'metal')
    kit.box(px, deckY + 0.38, 0, 0.06, 0.03, 0.03, '#ffd9a0', 'window')
  }
  // Abutments.
  for (const s of [-1, 1]) kit.box(s * 2.02, deckY - 0.1, 0, 0.18, 0.24, 0.6, '#a8a596', 'wall')
  kit.count('Rama VIII landmark')
}
