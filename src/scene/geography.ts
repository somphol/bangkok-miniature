/**
 * The compressed geography of central Bangkok.
 *
 * North is -z, east is +x. The Chao Phraya runs north to south through the middle of the tray,
 * splitting the historic west bank (Thonburi) from the east bank (Rattanakosin, Chinatown, Siam,
 * Silom). Everything is deliberately tabletop scale, not survey data.
 */

export type Point = [number, number]

export type LandmarkId =
  | 'grand-palace'
  | 'wat-arun'
  | 'wat-pho'
  | 'giant-swing'
  | 'golden-mount'
  | 'baiyoke'
  | 'mahanakhon'
  | 'rama-viii'

export interface LandmarkAnchor {
  id: LandmarkId
  /** World position of the model origin. */
  x: number
  z: number
  y: number
  /** Reserved footprint on the plan. */
  w: number
  d: number
  /** Height the camera looks at, and the offset from the target to the camera. */
  look: number
  view: [number, number, number]
  /** Model yaw in radians. */
  yaw: number
}

export const LANDMARKS: LandmarkAnchor[] = [
  {
    id: 'grand-palace',
    x: 2.35,
    z: -7.4,
    y: 0.69,
    w: 1.8,
    d: 1.8,
    look: 1.9,
    view: [4.8, 4.4, 6.8],
    yaw: 0.08,
  },
  {
    id: 'wat-arun',
    x: -2.3,
    z: -6.8,
    y: 0.69,
    w: 1.5,
    d: 1.5,
    look: 2.2,
    view: [6.8, 4.6, 5.8],
    yaw: -0.12,
  },
  {
    id: 'wat-pho',
    x: 2.2,
    z: -4.3,
    y: 0.69,
    w: 1.6,
    d: 1.5,
    look: 1.5,
    view: [4.5, 3.8, -2.0],
    yaw: -0.05,
  },
  {
    id: 'giant-swing',
    x: 2.2,
    z: -2.0,
    y: 0.69,
    w: 1.2,
    d: 1.0,
    look: 1.9,
    view: [4.2, 3.8, -4.5],
    yaw: 0.16,
  },
  {
    id: 'golden-mount',
    x: 3.0,
    z: 0.0,
    y: 0.69,
    w: 1.5,
    d: 1.5,
    look: 1.8,
    view: [4.5, 4.0, -1.0],
    yaw: 0.3,
  },
  {
    id: 'baiyoke',
    x: 2.4,
    z: 2.6,
    y: 0.69,
    w: 1.2,
    d: 1.2,
    look: 4.5,
    view: [-8.5, 7.0, 8.8],
    yaw: -0.1,
  },
  {
    id: 'mahanakhon',
    x: 2.9,
    z: 6.4,
    y: 0.69,
    w: 1.3,
    d: 1.3,
    look: 4.2,
    view: [-9.0, 7.5, 9.5],
    yaw: 0.18,
  },
  {
    id: 'rama-viii',
    x: -0.35,
    z: -13.6,
    y: 0.69,
    w: 4.4,
    d: 1.4,
    look: 2.2,
    view: [4.2, 5.2, 9.6],
    yaw: 0,
  },
]

export interface ParkSite {
  id: string
  name: string
  x: number
  z: number
  w: number
  d: number
  kind: 'park' | 'lawn' | 'riverside'
}

export const PARK_SITES: ParkSite[] = [
  { id: 'sanam-luang', name: 'Sanam Luang', x: 2.3, z: -9.6, w: 1.4, d: 1.8, kind: 'lawn' },
  { id: 'lumphini', name: 'Lumphini Park', x: 3.2, z: 4.6, w: 1.7, d: 2.2, kind: 'park' },
  { id: 'santichaiprakarn', name: 'Santichaiprakarn Park', x: -2.9, z: -10.4, w: 1.1, d: 1.2, kind: 'riverside' },
]

/** River cross-sections from north to south: centreline x and half-width. */
const RIVER_Z = [-15.8, -14.4, -13.0, -11.6, -10.2, -8.8, -7.4, -6.0, -4.6, -3.2, -1.8, -0.4, 1.0, 2.4, 3.8, 5.2, 6.6, 8.0, 9.4, 10.8, 12.2, 13.6, 15.0, 15.8]
const RIVER_X = [-0.4, -0.36, -0.3, -0.22, -0.14, -0.05, 0.03, 0.06, 0.03, -0.03, -0.1, -0.12, -0.06, 0.03, 0.12, 0.2, 0.26, 0.3, 0.31, 0.28, 0.23, 0.18, 0.13, 0.1]

export function riverCenter(z: number) {
  if (z <= RIVER_Z[0]) return RIVER_X[0]
  const last = RIVER_Z.length - 1
  if (z >= RIVER_Z[last]) return RIVER_X[last]
  for (let i = 1; i <= last; i++) {
    if (z <= RIVER_Z[i]) {
      const t = (z - RIVER_Z[i - 1]) / (RIVER_Z[i] - RIVER_Z[i - 1])
      return RIVER_X[i - 1] + (RIVER_X[i] - RIVER_X[i - 1]) * t
    }
  }
  return RIVER_X[last]
}

export function riverHalf(z: number) {
  return 1.28 + 0.07 * Math.cos(z * 0.45)
}

export const riverLeft = (z: number) => riverCenter(z) - riverHalf(z)
export const riverRight = (z: number) => riverCenter(z) + riverHalf(z)

const OUTER_WEST = [-3.15, -3.75, -4.0, -4.12, -4.2, -4.28, -4.34, -4.36, -4.34, -4.3, -4.3, -4.33, -4.36, -4.38, -4.38, -4.34, -4.3, -4.24, -4.16, -4.06, -3.94, -3.78, -3.56, -3.3]
const OUTER_EAST = [3.15, 3.75, 4.0, 4.12, 4.2, 4.28, 4.34, 4.36, 4.34, 4.3, 4.3, 4.33, 4.36, 4.38, 4.38, 4.34, 4.3, 4.24, 4.16, 4.06, 3.94, 3.78, 3.56, 3.3]

const outerWest: Point[] = RIVER_Z.map((z, i) => [OUTER_WEST[i], z])
const outerEast: Point[] = RIVER_Z.map((z, i) => [OUTER_EAST[i], z])
const westRiverEdge: Point[] = RIVER_Z.map((z) => [riverLeft(z), z])
const eastRiverEdge: Point[] = RIVER_Z.map((z) => [riverRight(z), z])

/** West bank: Thonburi. Clockwise from the north-west corner. */
export const WEST_BANK: Point[] = [...outerWest, ...westRiverEdge.slice().reverse()]
/** East bank: Rattanakosin to Silom. Clockwise from the north river edge. */
export const EAST_BANK: Point[] = [...eastRiverEdge, ...outerEast.slice().reverse()]
export const LAND_POLYGONS: Point[][] = [WEST_BANK, EAST_BANK]

export function inPolygon(x: number, z: number, polygon: Point[]) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]
    const b = polygon[j]
    if (a[1] > z !== b[1] > z && x < ((b[0] - a[0]) * (z - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside
  }
  return inside
}

export function insideLand(x: number, z: number) {
  return LAND_POLYGONS.some((polygon) => inPolygon(x, z, polygon))
}

export interface Bridge {
  id: string
  name: string
  z: number
  width: number
}

/** Road bridges that actually connect the two banks. Rama VIII is a landmark of its own. */
export const BRIDGES: Bridge[] = [
  { id: 'memorial', name: 'Memorial Bridge', z: -5.9, width: 0.3 },
  { id: 'phra-pokklao', name: 'Phra Pokklao Bridge', z: 1.2, width: 0.3 },
  { id: 'krungthep', name: 'Krungthep Bridge', z: 8.8, width: 0.3 },
]

export function districtAt(x: number, z: number) {
  if (x < riverCenter(z)) return z < -4 ? 'Thonburi' : z < 4 ? 'Khlong San' : 'Thonburi'
  if (z < -8) return 'Rattanakosin'
  if (z < -3) return 'Phra Nakhon'
  if (z < 1) return 'Chinatown'
  if (z < 4) return 'Siam'
  if (z < 7) return 'Silom'
  return 'Bang Rak'
}

/** Landmark and park footprints, with a little breathing room, for the plan and the parcel pass. */
export function reservedSites(margin = 0) {
  return [
    ...LANDMARKS.map((l) => ({ id: l.id, x: l.x, z: l.z, w: l.w + margin * 2, d: l.d + margin * 2 })),
    ...PARK_SITES.map((p) => ({ id: p.id, x: p.x, z: p.z, w: p.w + margin * 2, d: p.d + margin * 2 })),
  ]
}

export function insideReserved(x: number, z: number, margin = 0) {
  return reservedSites(margin).some((r) => Math.abs(x - r.x) < r.w / 2 && Math.abs(z - r.z) < r.d / 2)
}

/** The tray is a little wider than the city so the river reads as water, not a seam. */
export const TRAY = { w: 12.6, d: 33.5, waterY: 0.28, landY: 0.46, roadY: 0.65, buildingY: 0.69 }
