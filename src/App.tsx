import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { createCity, type CityAPI } from './scene/scene'
import { COORDINATES, LANDMARK_IDS, SLUG, VERSION } from './config'
import { LANDMARK_KEYS, STRINGS, normaliseLang, type Lang } from './i18n'
import { ArrowUpRight, Camera, Compass, MapPin, Maximize, Minus, Moon, MousePointer2, Plus, RotateCcw, RotateCw, Sun, X } from './ui/icons'

type Layout = 'full' | 'compact'
type Part = 'Name' | 'Area' | 'Text' | 'Short'

const params = typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search)
const initialLang = normaliseLang(params.get('lang'))
const embed = params.get('embed') === '1'
const capture = params.get('capture') === '1'
const view = params.get('view')
const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const restricted = typeof window !== 'undefined' && (embed || window.parent !== window || window.origin === 'null')
const touch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
const layoutOf = (): Layout => (window.innerWidth < 900 || window.innerHeight < 560 ? 'compact' : 'full')
if (typeof document !== 'undefined' && capture) document.body.dataset.capture = '1'

interface SceneApi {
  slug: string
  version: string
  ready: boolean
  cover: { fps: number; frames: number; posterAt: number }
  inspect: () => unknown
  act: (name: string, arg?: unknown) => unknown
  step?: (frames?: number, dt?: number) => unknown
  script?: (time: number) => void
  errorLog: string[]
}
declare global {
  interface Window {
    __scene?: SceneApi
  }
}

const runtime = {
  city: null as CityAPI | null,
  selected: null as string | null,
  lang: initialLang as Lang,
  layout: 'full' as Layout,
  handlers: null as null | {
    select: (index: number) => void
    close: () => void
    night: (value: boolean) => void
    rotate: (value: boolean) => void
    reset: () => void
    zoom: (factor: number) => void
  },
}

function inspect() {
  const city = runtime.city
  const facts = city?.facts
  const state = city?.state()
  return {
    quality: 'high' as const,
    audio: 'none' as const,
    errors: 0,
    lang: runtime.lang,
    facts: {
      landmarks: facts?.landmarks ?? 0,
      roadEdges: facts?.roadEdges ?? 0,
      vehicles: facts?.vehicles ?? 0,
      pedestrians: facts?.pedestrians ?? 0,
      boats: facts?.boats ?? 0,
      buildings: facts?.buildings ?? 0,
      triangles: facts?.triangles ?? 0,
      drawCalls: facts?.drawCalls ?? 0,
      reducedMotion,
    },
    state: {
      selected: runtime.selected,
      night: state?.night ?? 0,
      targetNight: state?.targetNight ?? 0,
      rotating: state?.rotating ?? false,
      azimuth: state?.azimuth ?? 0,
      polar: state?.polar ?? 0,
      distance: state?.distance ?? 0,
      target: state?.target ?? [0, 0, 0],
      transition: state?.transition ?? false,
      cameraClear: state?.cameraClear ?? true,
      layout: runtime.layout,
      embed,
      time: state?.time ?? 0,
    },
  }
}

function act(name: string, arg?: unknown) {
  const city = runtime.city
  const handlers = runtime.handlers
  if (!city || !handlers) throw new Error('scene not ready')
  if (name === 'landmark') {
    const index = typeof arg === 'string' ? LANDMARK_IDS.indexOf(arg as (typeof LANDMARK_IDS)[number]) : Number(arg)
    if (!Number.isInteger(index) || index < 0 || index >= LANDMARK_IDS.length) throw new Error(`unknown landmark ${String(arg)}`)
    flushSync(() => handlers.select(index))
  } else if (name === 'close') flushSync(() => handlers.close())
  else if (name === 'night' || name === 'rotate') {
    if (arg !== undefined && typeof arg !== 'boolean') throw new Error(`${name} needs a boolean`)
    const state = city.state()
    const value = arg ?? (name === 'night' ? state.targetNight === 0 : !state.rotating)
    flushSync(() => (name === 'night' ? handlers.night(value) : handlers.rotate(value)))
  } else if (name === 'reset') flushSync(() => handlers.reset())
  else if (name === 'zoom') {
    if (typeof arg !== 'number' || !Number.isFinite(arg) || arg <= 0) throw new Error('zoom needs a positive number')
    flushSync(() => handlers.zoom(Math.min(5, Math.max(0.2, arg))))
  } else if (name === 'orbit' || name === 'pan') {
    if (!Array.isArray(arg) || arg.length !== 2 || !arg.every((v) => typeof v === 'number' && Number.isFinite(v))) throw new Error(`${name} needs two numbers`)
    if (name === 'orbit') city.orbitBy(arg[0], arg[1])
    else city.panBy(arg[0], arg[1])
  } else throw new Error(`unknown action ${name}`)
  return inspect()
}

export default function App() {
  const host = useRef<HTMLDivElement>(null)
  const [lang, setLang] = useState<Lang>(initialLang)
  const [night, setNightState] = useState(false)
  const [rotate, setRotateState] = useState(false)
  const [ready, setReady] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [snapshot, setSnapshot] = useState<string | null>(null)
  const [layout, setLayout] = useState<Layout>(layoutOf)
  const langRef = useRef(lang)
  const layoutRef = useRef(layout)
  const selectedRef = useRef(selected)
  const nightRef = useRef(night)
  const rotateRef = useRef(rotate)
  langRef.current = lang
  layoutRef.current = layout
  selectedRef.current = selected
  nightRef.current = night
  rotateRef.current = rotate
  const t = STRINGS[lang]
  const compact = layout === 'compact'

  function select(index: number) {
    setSelected(index)
    runtime.selected = LANDMARK_IDS[index]
    setRotateState(false)
    runtime.city?.setRotate(false)
    runtime.city?.focus(index)
  }
  function close() {
    setSelected(null)
    runtime.selected = null
  }
  function reset() {
    close()
    setRotateState(false)
    runtime.city?.setRotate(false)
    runtime.city?.reset()
  }
  function changeNight(value: boolean) {
    setNightState(value)
    runtime.city?.setNight(value)
  }
  function changeRotate(value: boolean) {
    setRotateState(value)
    runtime.city?.setRotate(value)
  }
  function zoom(factor: number) {
    runtime.city?.zoom(factor)
  }
  runtime.handlers = { select, close, night: changeNight, rotate: changeRotate, reset, zoom }

  useLayoutEffect(() => {
    const update = () => {
      const next = layoutOf()
      document.body.dataset.layout = next
      runtime.layout = next
      setLayout(next)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = STRINGS[lang].title
    runtime.lang = lang
  }, [lang])

  useEffect(() => {
    if (!host.current) return
    let city: CityAPI | null = null
    try {
      city = createCity(host.current, {
        reducedMotion,
        live: !capture,
        view,
        viewOffset: () => layoutRef.current === 'full' && !embed,
        onFrame: () => {
          setReady(true)
          if (window.__scene) window.__scene.ready = true
          if (!capture && window.parent !== window) window.parent.postMessage({ type: `${SLUG}:ready`, version: VERSION }, '*')
        },
      })
      runtime.city = city
      installScene(city)
      if (capture) {
        city.tick(1 / 30)
        setReady(true)
      }
    } catch (reason) {
      setError(STRINGS[langRef.current].webglMissing)
      console.error(reason)
    }
    return () => {
      city?.dispose()
      runtime.city = null
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  function installScene(city: CityAPI) {
    const api: SceneApi = {
      slug: SLUG,
      version: VERSION,
      ready: false,
      cover: { fps: 30, frames: 300, posterAt: 1.5 },
      inspect,
      act,
      errorLog: [],
    }
    if (capture) {
      api.step = (frames = 1, dt = 1 / 30) => {
        if (!Number.isInteger(frames) || frames < 0 || !Number.isFinite(dt) || dt <= 0) throw new Error('step needs a frame count and a positive dt')
        for (let i = 0; i < frames; i++) city.tick(dt)
        return inspect()
      }
      let last = -1
      api.script = (time: number) => {
        if (!Number.isFinite(time)) throw new Error('script needs a finite time')
        if (time < last) {
          flushSync(() => {
            runtime.handlers?.close()
            runtime.handlers?.rotate(false)
          })
          city.home()
          last = -1
        }
        const cues: [number, string, unknown?][] = [
          [2.6, 'landmark', 'grand-palace'],
          [5.2, 'landmark', 'wat-arun'],
          [7.2, 'night', true],
          [7.5, 'reset'],
        ]
        for (const [at, name, arg] of cues) if (at > last + 1e-9 && at <= time + 1e-9) act(name, arg)
        last = time
      }
    }
    window.__scene = api
  }

  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      setToast(t.fullscreenUnavailable)
    }
  }

  function toggleLang() {
    const next: Lang = lang === 'en' ? 'th' : 'en'
    setLang(next)
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href)
        url.searchParams.set('lang', next)
        window.history.replaceState(null, '', url)
      } catch {
        // A sandboxed document has an opaque origin; the language still switches in memory.
      }
    }
  }

  const lm = (index: number, part: Part) => t[`lm${LANDMARK_KEYS[index]}${part}` as keyof typeof t]
  const hint = <p className="hint">{!compact && <MousePointer2 size={13} />}<span>{touch ? t.hintTouch : t.hint}</span></p>

  return (
    <main className={night ? 'app night' : 'app'}>
      <div className="canvas" ref={host} aria-label={t.sceneAria} />
      {!ready && !error && (
        <div className="loading">
          <span />
          {t.loading}
        </div>
      )}
      {error && <div className="error">{error}</div>}
      {!embed && (
        <header>
          <a
            className="brand"
            href="#"
            onClick={(event) => {
              event.preventDefault()
              reset()
            }}
            aria-label={t.homeAria}
          >
            <span className="brand-name">Bangkok</span>
            <span className="brand-slash">/</span>
            <span className="brand-lab">MINIATURE</span>
            <span className="brand-divider" />
            <span className="campaign">RIVER CITY</span>
          </a>
          <span className="edition">{t.tagline}</span>
        </header>
      )}
      {!embed && !compact && (
        <section className="intro">
          <div className="eyebrow">
            <span /> {t.eyebrow}
          </div>
          <h1>
            {t.titleLine1}
            <br />
            <em>{t.titleLine2}</em>
          </h1>
          <p>
            {t.subtitle1}
            <br />
            {t.subtitle2}
          </p>
          <div className="intro-line" />
          <span className="explore-copy">{t.explore}</span>
        </section>
      )}
      {compact && hint}
      <section className="top-controls" aria-label={t.sceneControls}>
        <div className="mode-switch">
          <button className={!night ? 'active' : ''} aria-pressed={!night} data-act="day" onClick={() => changeNight(false)}>
            <Sun size={16} />
            {t.day}
          </button>
          <button className={night ? 'active' : ''} aria-pressed={night} data-act="night" onClick={() => changeNight(true)}>
            <Moon size={15} />
            {t.night}
          </button>
        </div>
        <button
          className={'square ' + (rotate ? 'selected' : '')}
          aria-label={t.autoRotate}
          aria-pressed={rotate}
          title={t.autoRotate}
          data-act="rotate"
          onClick={() => changeRotate(!rotate)}
        >
          <RotateCw size={17} />
        </button>
        <button className="square" title={t.resetView} aria-label={t.resetView} data-act="reset" onClick={reset}>
          <RotateCcw size={17} />
        </button>
        <button className="lang" data-act="lang" onClick={toggleLang} aria-label={t.switchLang}>
          {t.switchLang}
        </button>
      </section>
      <div className="location">
        <span className="live-dot" />
        <span className="status">{night ? t.statusNight : t.statusDay}</span>
        <span className="coordinate">{COORDINATES}</span>
      </div>
      <aside className="view-tools" aria-label={t.viewTools}>
        <button aria-label={t.zoomIn} title={t.zoomIn} data-act="zoom-in" onClick={() => zoom(0.8)}>
          <Plus size={18} />
        </button>
        <button aria-label={t.zoomOut} title={t.zoomOut} data-act="zoom-out" onClick={() => zoom(1.25)}>
          <Minus size={18} />
        </button>
        {!restricted && !compact && (
          <>
            <div />
            <button aria-label={t.screenshot} title={t.screenshot} data-act="screenshot" onClick={() => setSnapshot(runtime.city?.screenshot() ?? null)}>
              <Camera size={17} />
            </button>
            <button aria-label={t.fullscreen} title={t.fullscreen} data-act="fullscreen" onClick={fullscreen}>
              <Maximize size={17} />
            </button>
          </>
        )}
      </aside>
      {!compact && (
        <div className="compass">
          <Compass size={32} strokeWidth={1} />
          <span>N</span>
        </div>
      )}
      {selected !== null && (
        <div className="landmark-info">
          <button aria-label={t.closeLandmark} data-act="close" onClick={close}>
            <X size={15} />
          </button>
          <span className="eyebrow">{lm(selected, 'Area')}</span>
          <h2>{lm(selected, 'Name')}</h2>
          <p>{lm(selected, 'Text')}</p>
        </div>
      )}
      <section className="landmark-bar" aria-label={t.landmarksLabel}>
        <div className="landmark-label">
          <MapPin size={15} />
          <span>{t.landmarksLabel}</span>
        </div>
        <div className="landmark-buttons">
          {LANDMARK_IDS.map((id, index) => (
            <button
              className={selected === index ? 'chosen' : ''}
              key={id}
              data-landmark={id}
              aria-pressed={selected === index}
              aria-label={compact ? lm(index, 'Name') : undefined}
              onClick={() => select(index)}
            >
              <span className="landmark-num">0{index + 1}</span>
              <span className="landmark-name">{lm(index, 'Short')}</span>
              <ArrowUpRight size={13} />
            </button>
          ))}
        </div>
      </section>
      {!compact && (
        <footer>
          {hint}
          {!embed && <span className="collectible">{t.collectible}</span>}
        </footer>
      )}
      {snapshot && (
        <div className="capture-backdrop" role="dialog" aria-modal="true" aria-label={t.snapshotTitle}>
          <div className="capture-panel">
            <button aria-label={t.closeSnapshot} onClick={() => setSnapshot(null)}>
              <X size={18} />
            </button>
            <img src={snapshot} alt={t.snapshotAlt} />
            <div>
              <span>{t.snapshotTitle}</span>
              <a href={snapshot} download={`bangkok-${night ? 'night' : 'day'}.png`}>
                {t.downloadPng} <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </main>
  )
}
