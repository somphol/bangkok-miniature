import type { Kit } from './kit'
import type { Parcel } from './plan'

export type Family = 'shophouse' | 'heritage' | 'lowrise' | 'market' | 'mixed' | 'condo' | 'office' | 'hotel' | 'pixel'

export const FAMILIES: Family[] = ['shophouse', 'heritage', 'lowrise', 'market', 'mixed', 'condo', 'office', 'hotel', 'pixel']

const SHOP_COLORS = ['#e0a94a', '#c96b4a', '#7fb3a1', '#e8c27a', '#c97f95', '#d99a3c', '#9fbf8a', '#d98a4a', '#b8a0d0']
const NEON = ['#ff5d8f', '#ffb347', '#6fe3d2', '#ff7a59', '#c78bff', '#ffe066']
const AWNING = ['#b7473f', '#2f7d72', '#d99a35', '#3f6e9e', '#8a5a9e']

function windows(kit: Kit, w: number, d: number, h: number, floors: number, rng: () => number, warm = true) {
  const cols = Math.max(1, Math.floor(w / 0.085))
  const rows = Math.max(1, floors)
  for (let f = 0; f < rows; f++) {
    const y = 0.2 + ((h - 0.24) * (f + 0.5)) / rows
    for (let c = 0; c < cols; c++) {
      const x = -w / 2 + ((c + 0.5) * w) / cols
      const lit = rng() < 0.55
      const color = lit ? (warm ? '#ffd49a' : '#bfe6ee') : '#31505a'
      kit.box(x, y, d / 2 + 0.007, (w / cols) * 0.58, 0.055, 0.014, color, lit ? 'window' : 'glass')
      kit.box(x, y, -d / 2 - 0.007, (w / cols) * 0.58, 0.055, 0.014, color, lit ? 'window' : 'glass')
    }
  }
  const sideCols = Math.max(1, Math.floor(d / 0.09))
  for (let f = 0; f < rows; f++) {
    const y = 0.2 + ((h - 0.24) * (f + 0.5)) / rows
    for (let c = 0; c < sideCols; c++) {
      const z = -d / 2 + ((c + 0.5) * d) / sideCols
      const lit = rng() < 0.45
      const color = lit ? (warm ? '#ffd49a' : '#bfe6ee') : '#31505a'
      kit.box(w / 2 + 0.007, y, z, 0.014, 0.055, (d / sideCols) * 0.58, color, lit ? 'window' : 'glass')
      kit.box(-w / 2 - 0.007, y, z, 0.014, 0.055, (d / sideCols) * 0.58, color, lit ? 'window' : 'glass')
    }
  }
}

function roofKit(kit: Kit, w: number, d: number, h: number, rng: () => number, style: 'tank' | 'garden' | 'antenna' | 'plain' = 'tank') {
  kit.box(0, h + 0.02, 0, w * 1.02, 0.035, d * 1.02, '#b9b3a2', 'wall')
  if (style === 'tank') {
    const tx = -w * 0.2
    const tz = -d * 0.18
    for (const [dx, dz] of [
      [-0.045, -0.045],
      [0.045, -0.045],
      [-0.045, 0.045],
      [0.045, 0.045],
    ])
      kit.box(tx + dx, h + 0.09, tz + dz, 0.012, 0.14, 0.012, '#6f7f80', 'metal')
    kit.cylinder(tx, h + 0.2, tz, 0.07, 0.14, '#8fb3bd', 'metal', 0.065, 10)
    kit.cylinder(tx, h + 0.28, tz, 0.072, 0.025, '#5f7f86', 'metal', 0.072, 10)
    kit.box(w * 0.18, h + 0.07, d * 0.16, 0.11, 0.08, 0.09, '#a7aea4', 'wall')
    kit.box(w * 0.18, h + 0.12, d * 0.16, 0.12, 0.025, 0.1, '#7f8c8b', 'metal')
  } else if (style === 'garden') {
    kit.box(0, h + 0.05, 0, w * 0.62, 0.06, d * 0.55, '#5f8f5a', 'green')
    for (let i = 0; i < 4; i++)
      kit.sphere(-w * 0.2 + i * w * 0.13, h + 0.13, d * 0.12, 0.05 + rng() * 0.02, '#6f9c5e', 'green', 0.8)
    kit.box(w * 0.2, h + 0.12, -d * 0.18, 0.12, 0.08, 0.1, '#a7aea4', 'wall')
  } else if (style === 'antenna') {
    kit.cylinder(w * 0.16, h + 0.24, -d * 0.12, 0.006, 0.42, '#9aa9a8', 'metal', 0.004, 6)
    kit.box(-w * 0.2, h + 0.07, d * 0.1, 0.12, 0.09, 0.1, '#a7aea4', 'wall')
    kit.box(w * 0.16, h + 0.47, -d * 0.12, 0.02, 0.02, 0.02, '#ff6b5a', 'neon')
  }
}

function shopSign(kit: Kit, w: number, d: number, h: number, rng: () => number) {
  const color = NEON[Math.floor(rng() * NEON.length)]
  const vertical = rng() < 0.45
  if (vertical) {
    const x = w * 0.36
    kit.box(x, 0.5 + h * 0.18, d / 2 + 0.02, 0.055, 0.22, 0.02, color, 'neon')
    kit.box(x, 0.5 + h * 0.18, d / 2 + 0.032, 0.035, 0.18, 0.006, '#fff3d8', 'window')
  } else {
    kit.box(0, 0.42, d / 2 + 0.022, w * 0.62, 0.075, 0.02, color, 'neon')
    kit.box(0, 0.42, d / 2 + 0.034, w * 0.52, 0.045, 0.006, '#fff3d8', 'window')
  }
}

function shophouse(kit: Kit, p: Parcel, rng: () => number) {
  const { w, d, height: h } = p
  const wall = SHOP_COLORS[Math.floor(rng() * SHOP_COLORS.length)]
  const trim = '#efe5cf'
  const floors = Math.max(2, Math.min(5, Math.round(h / 0.31)))
  kit.box(0, h / 2, 0, w, h, d, wall, 'wall')
  kit.box(0, 0.16, d / 2 + 0.008, w * 0.82, 0.26, 0.02, '#33555c', 'glass')
  kit.box(0, 0.31, d / 2 + 0.02, w * 0.9, 0.035, 0.035, trim, 'wall')
  kit.box(0, 0.42, d / 2 + 0.04, w * 0.86, 0.06, 0.16, AWNING[Math.floor(rng() * AWNING.length)], 'roof')
  kit.box(0, h - 0.05, d / 2 + 0.01, w * 0.96, 0.055, 0.035, trim, 'wall')
  windows(kit, w, d, h, floors - 1, rng, true)
  shopSign(kit, w, d, h, rng)
  roofKit(kit, w, d, h, rng, rng() < 0.6 ? 'tank' : 'plain')
  if (rng() < 0.25) kit.prism(0, h + 0.11, 0, w * 1.04, d * 1.04, 0.18, '#b45a3c', 'roof', 0.08)
  kit.count('shophouse')
}

function heritage(kit: Kit, p: Parcel, rng: () => number) {
  const { w, d, height: h } = p
  const wall = ['#e0b878', '#d99a6a', '#e6cfa8', '#c98b6a'][Math.floor(rng() * 4)]
  const trim = '#f4ead4'
  kit.box(0, h / 2, 0, w, h, d, wall, 'wall')
  for (let f = 0; f < 3; f++) {
    const y = 0.2 + (f * (h - 0.3)) / 3
    kit.box(0, y, d / 2 + 0.01, w * 0.9, 0.04, 0.025, trim, 'wall')
    kit.box(0, y + 0.09, d / 2 + 0.012, w * 0.75, 0.12, 0.018, '#587b82', 'glass')
    kit.box(0, y + 0.16, d / 2 + 0.014, w * 0.42, 0.035, 0.02, trim, 'wall')
  }
  for (let i = 0; i < 4; i++) {
    const x = -w * 0.36 + i * w * 0.24
    kit.cylinder(x, 0.16, d / 2 + 0.055, 0.018, 0.28, trim, 'wall', 0.018, 8)
  }
  kit.box(0, h - 0.03, 0, w * 1.04, 0.07, d * 1.04, trim, 'wall')
  kit.prism(0, h + 0.14, 0, w * 1.06, d * 1.06, 0.2, '#a8563c', 'roof', 0.05)
  roofKit(kit, w * 0.7, d * 0.7, h + 0.24, rng, 'antenna')
  kit.count('heritage')
}

function lowrise(kit: Kit, p: Parcel, rng: () => number) {
  const { w, d, height: h } = p
  const wall = ['#efe0c2', '#e6c98e', '#d9b07a', '#f0d9b0'][Math.floor(rng() * 4)]
  kit.box(0, h / 2, 0, w, h, d, wall, 'wall')
  kit.box(0, 0.15, d / 2 + 0.01, w * 0.55, 0.24, 0.02, '#4d6c6a', 'glass')
  kit.box(0, h - 0.04, 0, w * 1.02, 0.06, d * 1.02, '#e7dcc2', 'wall')
  kit.prism(0, h + 0.12, 0, w * 1.12, d * 1.12, 0.2, rng() < 0.5 ? '#b65a3a' : '#c98a3e', 'roof', 0.06)
  windows(kit, w * 0.9, d * 0.9, h, 1, rng, true)
  if (rng() < 0.5) {
    kit.cylinder(w * 0.4, h + 0.2, -d * 0.2, 0.01, 0.3, '#8b7a5a', 'metal', 0.008, 6)
    kit.box(w * 0.4, h + 0.34, -d * 0.2, 0.06, 0.02, 0.06, '#d7b45a', 'accent')
  }
  kit.count('lowrise')
}

function market(kit: Kit, p: Parcel, rng: () => number) {
  const { w, d, height: h } = p
  kit.box(0, h * 0.45, 0, w, h * 0.9, d, '#c9bda4', 'wall')
  kit.box(0, h * 0.88, 0, w * 1.06, 0.05, d * 1.06, '#9a8e78', 'metal')
  kit.prism(0, h * 0.9, 0, w * 1.08, d * 1.08, 0.12, '#8d5f4a', 'roof', 0.1)
  for (let i = 0; i < 3; i++) {
    const x = -w * 0.3 + i * w * 0.3
    kit.box(x, h * 0.42, d / 2 + 0.01, w * 0.22, h * 0.55, 0.02, '#5f7a74', 'glass')
    kit.box(x, h * 0.18, d / 2 + 0.04, w * 0.25, 0.08, 0.12, AWNING[i % AWNING.length], 'roof')
    kit.cylinder(x, h * 0.22, d / 2 + 0.06, 0.04, 0.1, '#b98548', 'wall', 0.04, 8)
  }
  for (let i = 0; i < 3; i++) kit.box(-w * 0.35 + i * w * 0.35, h * 0.7, -d * 0.3, 0.05, 0.05, 0.05, '#ffe6b0', 'window')
  kit.count('market')
}

function mixed(kit: Kit, p: Parcel, rng: () => number) {
  const { w, d, height: h } = p
  const front = Math.min(h, 0.85)
  kit.box(0, front / 2, d * 0.12, w, front, d * 0.76, SHOP_COLORS[Math.floor(rng() * SHOP_COLORS.length)], 'wall')
  kit.box(0, 0.16, d * 0.5 + 0.01, w * 0.8, 0.24, 0.02, '#33555c', 'glass')
  kit.box(0, 0.37, d * 0.5 + 0.04, w * 0.85, 0.06, 0.14, AWNING[Math.floor(rng() * AWNING.length)], 'roof')
  windows(kit, w, d * 0.76, front, 2, rng, true)
  shopSign(kit, w, d * 0.76, front, rng)
  const towerH = h
  kit.box(-w * 0.08, towerH / 2, -d * 0.16, w * 0.62, towerH, d * 0.48, '#8fb0b8', 'glass')
  for (let y = 0.3; y < towerH; y += 0.24)
    kit.box(-w * 0.08, y, -d * 0.16 + d * 0.24, w * 0.64, 0.022, 0.02, '#d3dfd8', 'metal')
  kit.box(-w * 0.08, towerH + 0.02, -d * 0.16, w * 0.66, 0.04, d * 0.5, '#b9c7c4', 'metal')
  kit.cylinder(-w * 0.08, towerH + 0.2, -d * 0.16, 0.008, 0.35, '#9aa9a8', 'metal', 0.005, 6)
  kit.count('mixed')
}

function condo(kit: Kit, p: Parcel, rng: () => number) {
  const { w, d, height: h } = p
  const podium = 0.36
  const shaft = ['#d9e2dd', '#b8d4d0', '#d8c9b0', '#c9d6e0'][Math.floor(rng() * 4)]
  kit.box(0, podium / 2, 0, w * 1.04, podium, d * 1.04, '#d8d2c2', 'wall')
  kit.box(0, 0.16, d * 0.52 + 0.01, w * 0.7, 0.22, 0.02, '#476f77', 'glass')
  kit.box(0, podium + (h - podium) / 2, 0, w * 0.78, h - podium, d * 0.78, shaft, 'glass')
  const floors = Math.max(3, Math.floor((h - podium) / 0.24))
  for (let f = 0; f < floors; f++) {
    const y = podium + 0.12 + f * 0.24
    const side = f % 2 === 0 ? 1 : -1
    kit.box(side * w * 0.23, y, d * 0.4, w * 0.44, 0.025, 0.16, '#f0eadb', 'wall')
    kit.box(side * w * 0.23, y + 0.06, d * 0.49, w * 0.42, 0.05, 0.012, '#7aa4ae', 'glass')
    kit.box(side * w * 0.23, y + 0.11, d * 0.49, w * 0.44, 0.012, 0.012, '#c7d2c8', 'metal')
  }
  for (let y = podium; y < h; y += 0.24) kit.box(0, y, d * 0.39 + 0.01, w * 0.8, 0.012, 0.012, '#c7d2c8', 'metal')
  kit.box(0, h + 0.02, 0, w * 0.82, 0.04, d * 0.82, '#c7d2c8', 'metal')
  kit.box(w * 0.18, h + 0.05, -d * 0.16, w * 0.26, 0.05, d * 0.24, '#6fbfc4', 'glass')
  kit.box(w * 0.18, h + 0.09, -d * 0.16, w * 0.22, 0.012, d * 0.2, '#bde8e3', 'windowCool')
  roofKit(kit, w * 0.5, d * 0.5, h + 0.04, rng, 'garden')
  kit.count('condo')
}

function office(kit: Kit, p: Parcel, rng: () => number) {
  const { w, d, height: h } = p
  const podium = 0.28
  const glass = ['#7fa4b0', '#5f8f9a', '#8fa8b8', '#6f9f9a'][Math.floor(rng() * 4)]
  kit.box(0, podium / 2, 0, w * 1.06, podium, d * 1.06, '#c9c5b7', 'wall')
  kit.box(0, podium + (h - podium) / 2, 0, w * 0.84, h - podium, d * 0.84, glass, 'glass')
  for (let y = podium + 0.1; y < h; y += 0.16) {
    kit.box(0, y, d * 0.42 + 0.01, w * 0.86, 0.016, 0.014, '#c8d8d6', 'metal')
    kit.box(0, y, -d * 0.42 - 0.01, w * 0.86, 0.016, 0.014, '#c8d8d6', 'metal')
  }
  for (const x of [-w * 0.3, w * 0.3]) kit.box(x, h / 2 + podium, d * 0.42 + 0.02, 0.014, h - podium, 0.016, '#c8d8d6', 'metal')
  kit.box(0, h + 0.03, 0, w * 0.86, 0.05, d * 0.86, '#b9c7c4', 'metal')
  kit.cylinder(w * 0.2, h + 0.22, -d * 0.2, 0.007, 0.4, '#9aa9a8', 'metal', 0.004, 6)
  kit.box(-w * 0.2, h + 0.08, d * 0.15, w * 0.25, 0.1, d * 0.2, '#aab4ae', 'wall')
  if (rng() < 0.35) kit.box(0, h + 0.14, 0, w * 0.5, 0.1, 0.02, NEON[Math.floor(rng() * NEON.length)], 'neon')
  kit.count('office')
}

function hotel(kit: Kit, p: Parcel, rng: () => number) {
  const { w, d, height: h } = p
  kit.box(0, h * 0.32, 0, w, h * 0.64, d, '#d7c9b1', 'wall')
  kit.box(w * 0.06, h * 0.72, 0, w * 0.72, h * 0.56, d * 0.76, '#b7c9c6', 'glass')
  for (let y = 0.3; y < h * 0.7; y += 0.2)
    kit.box(0, y, d / 2 + 0.008, w * 0.94, 0.045, 0.02, '#8aa3a8', 'glass')
  for (let y = h * 0.5; y < h; y += 0.22) {
    kit.box(-w * 0.3, y, d * 0.38, w * 0.34, 0.03, 0.14, '#f0eadb', 'wall')
    kit.box(w * 0.3, y, d * 0.38, w * 0.34, 0.03, 0.14, '#f0eadb', 'wall')
  }
  kit.box(0, h + 0.04, 0, w * 0.78, 0.08, d * 0.8, '#c7d2c8', 'metal')
  kit.box(0, h + 0.16, d * 0.2, w * 0.6, 0.14, 0.02, NEON[Math.floor(rng() * NEON.length)], 'neon')
  kit.box(0, h + 0.16, d * 0.212, w * 0.45, 0.06, 0.008, '#fff3d8', 'window')
  kit.box(-w * 0.18, h + 0.05, -d * 0.15, w * 0.28, 0.04, d * 0.22, '#6fbfc4', 'glass')
  roofKit(kit, w * 0.4, d * 0.4, h + 0.04, rng, 'garden')
  kit.count('hotel')
}

function pixel(kit: Kit, p: Parcel, rng: () => number) {
  const { w, d, height: h } = p
  const levels = Math.max(10, Math.floor(h / 0.2))
  const bw = w * 0.9
  const bd = d * 0.9
  kit.box(0, 0.16, 0, w * 1.04, 0.32, d * 1.04, '#d8d2c2', 'wall')
  for (let i = 0; i < levels; i++) {
    const y = 0.32 + i * 0.2
    const missing = (i * 3) % 4
    for (let q = 0; q < 4; q++) {
      if (q === missing) continue
      const qx = q === 0 || q === 3 ? -bw * 0.25 : bw * 0.25
      const qz = q < 2 ? -bd * 0.25 : bd * 0.25
      kit.box(qx, y + 0.1, qz, bw * 0.5, 0.2, bd * 0.5, '#a8c2c8', 'glass')
    }
    if (i % 3 === 0) kit.box(0, y + 0.19, 0, bw, 0.018, bd, '#d8e2dd', 'metal')
  }
  kit.box(0, h + 0.03, 0, bw * 0.9, 0.05, bd * 0.9, '#c7d2c8', 'metal')
  kit.box(0, h + 0.12, 0, bw * 0.6, 0.12, bd * 0.6, '#cfe4e0', 'windowCool')
  kit.cylinder(0, h + 0.32, 0, 0.008, 0.3, '#9aa9a8', 'metal', 0.004, 6)
  kit.count('pixel')
}

export function addBuilding(kit: Kit, parcel: Parcel, rng: () => number) {
  kit.at(parcel.x, parcel.z, 0.69, parcel.rot)
  if (parcel.family === 'shophouse') shophouse(kit, parcel, rng)
  else if (parcel.family === 'heritage') heritage(kit, parcel, rng)
  else if (parcel.family === 'lowrise') lowrise(kit, parcel, rng)
  else if (parcel.family === 'market') market(kit, parcel, rng)
  else if (parcel.family === 'mixed') mixed(kit, parcel, rng)
  else if (parcel.family === 'condo') condo(kit, parcel, rng)
  else if (parcel.family === 'office') office(kit, parcel, rng)
  else if (parcel.family === 'hotel') hotel(kit, parcel, rng)
  else pixel(kit, parcel, rng)
}
