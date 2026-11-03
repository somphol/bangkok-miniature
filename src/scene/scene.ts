import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { Kit } from './kit'
import { planCity, type CityPlan, type Parcel } from './plan'
import { addBuilding } from './buildings'
import {
  baiyoke,
  giantSwing,
  goldenMount,
  grandPalace,
  mahanakhon,
  ramaVIII,
  watArun,
  watPho,
} from './landmarks'
import { buildEnvironment, type Environment } from './environment'
import { addTraffic } from './traffic'
import { LANDMARKS, TRAY, type LandmarkId } from './geography'

export interface CityState {
  azimuth: number
  polar: number
  distance: number
  target: [number, number, number]
  night: number
  targetNight: 0 | 1
  rotating: boolean
  transition: boolean
  cameraClear: boolean
  time: number
}

export interface CityFacts {
  landmarks: number
  roadEdges: number
  vehicles: number
  pedestrians: number
  boats: number
  buildings: number
  triangles: number
  drawCalls: number
}

export interface CityAPI {
  tick: (dt: number) => void
  state: () => CityState
  facts: CityFacts
  setNight: (value: boolean) => void
  setRotate: (value: boolean) => void
  reset: () => void
  home: () => void
  focus: (index: number) => void
  zoom: (factor: number) => void
  orbitBy: (dTheta: number, dPhi: number) => void
  panBy: (dx: number, dz: number) => void
  screenshot: () => string
  dispose: () => void
}

export interface CityOptions {
  reducedMotion: boolean
  live: boolean
  view: string | null
  viewOffset: () => boolean
  onFrame: () => void
}

const INITIAL = new THREE.Vector3(19, 27, 39)
const INITIAL_TARGET = new THREE.Vector3(0, 1.1, 0)

const DEBUG_VIEWS: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
  topdown: { position: [0, 52, 0.01], target: [0, 0.6, 0] },
  oldtown: { position: [12, 8, 2], target: [2.2, 2.2, -5.5] },
  silom: { position: [10, 9, 14], target: [2.6, 3.0, 5.8] },
  river: { position: [8, 6, 4], target: [-0.2, 1.2, -4] },
  bridge: { position: [8, 5, -8], target: [-0.4, 2.2, -13.6] },
}

interface Transition {
  from: THREE.Vector3
  to: THREE.Vector3
  targetFrom: THREE.Vector3
  targetTo: THREE.Vector3
  elapsed: number
  duration: number
  arc: number
}

export function createCity(container: HTMLDivElement, options: CityOptions): CityAPI {
  const scene = new THREE.Scene()
  const daySky = new THREE.Color('#e9e2d2')
  const nightSky = new THREE.Color('#0c1524')
  scene.background = daySky.clone()
  scene.fog = new THREE.Fog(daySky, 62, 155)
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.autoUpdate = false
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.14
  renderer.outputColorSpace = THREE.SRGBColorSpace
  container.appendChild(renderer.domElement)

  const pmrem = new THREE.PMREMGenerator(renderer)
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04)
  scene.environment = environment.texture
  scene.environmentIntensity = 0.5
  pmrem.dispose()

  const camera = new THREE.PerspectiveCamera(36, container.clientWidth / container.clientHeight, 0.05, 220)
  const debug = options.view ? DEBUG_VIEWS[options.view] : undefined
  camera.position.copy(debug ? new THREE.Vector3().fromArray(debug.position) : INITIAL)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.copy(debug ? new THREE.Vector3().fromArray(debug.target) : INITIAL_TARGET)
  controls.enableDamping = true
  controls.dampingFactor = 0.07
  controls.minDistance = 3.6
  controls.maxDistance = 82
  controls.maxPolarAngle = Math.PI * 0.475
  controls.minPolarAngle = 0.04
  controls.autoRotateSpeed = 0.42
  controls.zoomSpeed = 0.7
  controls.panSpeed = 0.6
  controls.screenSpacePanning = false
  controls.listenToKeyEvents(window)
  controls.keyPanSpeed = 18

  // Sky dome: a soft vertical gradient that shifts from warm haze to deep night.
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(150, 24, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: { uNight: { value: 0 } },
      vertexShader: 'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:
        'varying vec3 vP;uniform float uNight;void main(){float h=clamp(normalize(vP).y*.5+.5,0.,1.);vec3 day=mix(vec3(.95,.88,.76),vec3(.72,.84,.84),h);vec3 night=mix(vec3(.11,.16,.23),vec3(.035,.06,.11),h);gl_FragColor=vec4(mix(day,night,uNight),1.);}',
    }),
  )
  scene.add(sky)

  // A soft shadow beneath the floating tray.
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(70, 70).rotateX(-Math.PI / 2),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'varying vec2 vUv;void main(){float d=length(vUv-.5)*2.;gl_FragColor=vec4(.12,.13,.1,exp(-d*d*4.)*.22);}',
    }),
  )
  shadow.position.y = -1.25
  scene.add(shadow)

  const hemi = new THREE.HemisphereLight('#e2f2ff', '#b3a58a', 1.75)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight('#fff2d6', 2.45)
  sun.position.set(-14, 30, 18)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 26, bottom: -26, near: 1, far: 80 })
  sun.shadow.normalBias = 0.03
  sun.shadow.bias = -0.0002
  sun.shadow.radius = 3
  scene.add(sun)
  const fill = new THREE.DirectionalLight('#8fb8d8', 0.5)
  fill.position.set(18, 12, -16)
  scene.add(fill)

  const kit = new Kit(scene)
  const plan: CityPlan = planCity()
  for (const parcel of plan.parcels) addBuilding(kit, parcel, mulberry(parcel.x * 97 + parcel.z * 31 + 17))

  const landmarkBuilders = {
    'grand-palace': grandPalace,
    'wat-arun': watArun,
    'wat-pho': watPho,
    'giant-swing': giantSwing,
    'golden-mount': goldenMount,
    baiyoke,
    mahanakhon,
    'rama-viii': ramaVIII,
  } as const
  for (const landmark of LANDMARKS) landmarkBuilders[landmark.id as LandmarkId](kit, landmark.x, landmark.z, landmark.yaw)

  const environmentDetails: Environment = buildEnvironment(scene, kit, plan)
  kit.finish()
  const traffic = addTraffic(scene, plan.network, environmentDetails.walks)

  const blockers: THREE.Box3[] = plan.parcels.map((p) => parcelBox(p))
  for (const landmark of LANDMARKS) {
    blockers.push(
      new THREE.Box3(
        new THREE.Vector3(landmark.x - landmark.w / 2, 0.6, landmark.z - landmark.d / 2),
        new THREE.Vector3(landmark.x + landmark.w / 2, 0.7 + landmark.look + 2.4, landmark.z + landmark.d / 2),
      ),
    )
  }

  const facts: CityFacts = {
    landmarks: LANDMARKS.length,
    roadEdges: plan.network.edges.length,
    vehicles: traffic.vehicles.length + 4,
    pedestrians: traffic.people.length,
    boats: traffic.boats.length,
    buildings: plan.parcels.length + LANDMARKS.length,
    triangles: 0,
    drawCalls: 0,
  }
  container.dataset.parcels = String(plan.parcels.length)
  container.dataset.roadEdges = String(plan.network.edges.length)
  container.dataset.buildings = String(facts.buildings)

  const transitionSeconds = options.reducedMotion ? 0 : 1.3
  let night = 0
  let targetNight = 0
  let simTime = 0
  let frame = 0
  let frames = 0
  let disposed = false
  let transition: Transition | null = null
  let cameraClear = true
  const cameraPrevious = camera.position.clone()
  const spherical = new THREE.Spherical()
  const offset = new THREE.Vector3()
  const bg = daySky.clone()
  let lastShadow = -1

  controls.addEventListener('start', () => {
    transition = null
  })

  function parcelBox(p: Parcel) {
    const c = Math.abs(Math.cos(p.rot))
    const s = Math.abs(Math.sin(p.rot))
    const w = p.w * c + p.d * s
    const d = p.w * s + p.d * c
    return new THREE.Box3(
      new THREE.Vector3(p.x - w / 2 - 0.03, 0.64, p.z - d / 2 - 0.03),
      new THREE.Vector3(p.x + w / 2 + 0.03, 0.69 + p.height + 0.15, p.z + d / 2 + 0.03),
    )
  }

  function insideBlockers(point: THREE.Vector3) {
    return blockers.some((box) => box.containsPoint(point))
  }

  function keepCameraOut() {
    if (!insideBlockers(camera.position)) return
    let top = 0
    for (const box of blockers) if (box.containsPoint(camera.position)) top = Math.max(top, box.max.y)
    camera.position.y = Math.max(camera.position.y, top + 0.35)
  }

  function settleControls() {
    const damping = controls.enableDamping
    const rotating = controls.autoRotate
    controls.enableDamping = false
    controls.autoRotate = false
    controls.update()
    controls.enableDamping = damping
    controls.autoRotate = rotating
  }

  function applyTransition(dt: number) {
    if (!transition) return
    transition.elapsed += dt
    const t = transition.duration > 0 ? Math.min(transition.elapsed / transition.duration, 1) : 1
    const ease = t * t * (3 - 2 * t)
    camera.position.lerpVectors(transition.from, transition.to, ease)
    camera.position.y += Math.sin(Math.PI * ease) * transition.arc
    controls.target.lerpVectors(transition.targetFrom, transition.targetTo, ease)
    if (t >= 1) transition = null
  }

  function move(to: THREE.Vector3, target: THREE.Vector3, arc = 3) {
    settleControls()
    transition = {
      from: camera.position.clone(),
      to,
      targetFrom: controls.target.clone(),
      targetTo: target,
      elapsed: 0,
      duration: transitionSeconds,
      arc,
    }
    if (transitionSeconds === 0) {
      applyTransition(0)
      controls.update()
      cameraPrevious.copy(camera.position)
    }
  }

  function tick(dt: number) {
    if (disposed) return
    simTime += dt
    night = options.reducedMotion ? targetNight : THREE.MathUtils.damp(night, targetNight, 1.9, dt)
    if (Math.abs(night - targetNight) < 1e-4) night = targetNight
    bg.copy(daySky).lerp(nightSky, night)
    scene.background = bg
    ;(scene.fog as THREE.Fog).color.copy(bg)
    ;(sky.material as THREE.ShaderMaterial).uniforms.uNight.value = night
    hemi.intensity = 1.75 - 1.05 * night
    sun.intensity = 2.45 - 2.08 * night
    sun.color.set('#fff2d6').lerp(new THREE.Color('#8fa8d8'), night)
    fill.intensity = 0.5 + 0.55 * night
    renderer.toneMappingExposure = 1.14 - 0.08 * night
    scene.environmentIntensity = 0.5 - 0.24 * night
    kit.update(night)
    environmentDetails.update(simTime, night)
    traffic.update(dt, simTime, night)
    applyTransition(dt)
    keepCameraOut()
    controls.target.y = Math.max(0.55, controls.target.y)
    controls.target.x = THREE.MathUtils.clamp(controls.target.x, -9, 9)
    controls.target.z = THREE.MathUtils.clamp(controls.target.z, -19, 19)
    controls.update(dt)
    cameraPrevious.copy(camera.position)
    cameraClear = !insideBlockers(camera.position)
    if (lastShadow < 0 || simTime - lastShadow >= 1 / 12) {
      renderer.shadowMap.needsUpdate = true
      lastShadow = simTime
    }
    renderer.render(scene, camera)
    if (frames++ === 0) {
      facts.triangles = renderer.info.render.triangles
      facts.drawCalls = renderer.info.render.calls
      options.onFrame()
    }
  }

  function resize() {
    const w = container.clientWidth
    const h = container.clientHeight
    if (!w || !h) return
    camera.aspect = w / h
    if (options.viewOffset() && w > 850) camera.setViewOffset(w, h, -Math.min(120, w * 0.085), 0, w, h)
    else camera.clearViewOffset()
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  const observer = new ResizeObserver(resize)
  observer.observe(container)
  resize()

  let fpsStart = -1
  let fpsCount = 0
  let last = -1
  function loop(now: number) {
    if (disposed) return
    frame = requestAnimationFrame(loop)
    const dt = last < 0 ? 1 / 60 : Math.min((now - last) / 1000, 0.05)
    last = now
    tick(dt)
    if (fpsStart < 0) fpsStart = now
    fpsCount++
    if (now - fpsStart > 2000) {
      container.dataset.fps = String(Math.round((fpsCount * 1000) / (now - fpsStart)))
      fpsCount = 0
      fpsStart = now
    }
  }
  if (options.live) frame = requestAnimationFrame(loop)

  return {
    tick,
    facts,
    state: () => {
      spherical.setFromVector3(offset.copy(camera.position).sub(controls.target))
      return {
        azimuth: spherical.theta,
        polar: spherical.phi,
        distance: spherical.radius,
        target: controls.target.toArray() as [number, number, number],
        night,
        targetNight: targetNight as 0 | 1,
        rotating: controls.autoRotate,
        transition: transition !== null,
        cameraClear,
        time: simTime,
      }
    },
    setNight: (value) => {
      targetNight = value ? 1 : 0
      if (options.reducedMotion) night = targetNight
    },
    setRotate: (value) => (controls.autoRotate = value),
    reset: () => move(INITIAL.clone(), INITIAL_TARGET.clone(), 4),
    home: () => {
      settleControls()
      transition = null
      controls.autoRotate = false
      camera.position.copy(INITIAL)
      controls.target.copy(INITIAL_TARGET)
      controls.update()
      cameraPrevious.copy(camera.position)
      targetNight = 0
      night = 0
    },
    focus: (index) => {
      const landmark = LANDMARKS[index]
      if (!landmark) return
      const target = new THREE.Vector3(landmark.x, landmark.look, landmark.z)
      move(target.clone().add(new THREE.Vector3(...landmark.view)), target, 2.6)
    },
    zoom: (factor) => {
      const delta = camera.position.clone().sub(controls.target).multiplyScalar(factor)
      delta.clampLength(3.6, 82)
      move(controls.target.clone().add(delta), controls.target.clone(), 0)
    },
    orbitBy: (dTheta, dPhi) => {
      settleControls()
      transition = null
      spherical.setFromVector3(offset.copy(camera.position).sub(controls.target))
      spherical.theta += dTheta
      spherical.phi = THREE.MathUtils.clamp(spherical.phi + dPhi, controls.minPolarAngle, controls.maxPolarAngle)
      camera.position.copy(controls.target).add(offset.setFromSpherical(spherical))
      controls.update()
      cameraPrevious.copy(camera.position)
    },
    panBy: (dx, dz) => {
      settleControls()
      transition = null
      offset.set(dx, 0, dz)
      controls.target.add(offset)
      camera.position.add(offset)
      controls.update()
      cameraPrevious.copy(camera.position)
    },
    screenshot: () => {
      renderer.render(scene, camera)
      return renderer.domElement.toDataURL('image/png')
    },
    dispose: () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      controls.dispose()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
      environment.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    },
  }
}

function mulberry(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
