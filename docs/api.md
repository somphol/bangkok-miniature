# Capture API (`window.__scene`)

The page installs a small inspection surface for the verification suite, recorders and debugging.
It is **internal**: it is versioned with the scene but is not a public, semver-stable API. The
verification suite is the contract that keeps it honest.

The API exists in both live and capture mode, but `step()` and `script()` are only added in
`?capture=1`.

## Surface

```ts
window.__scene = {
  slug: 'bangkok-miniature',
  version: '0.1.1',
  ready: boolean,                 // true after the first rendered frame
  cover: { fps: 30, frames: 300, posterAt: 1.5 },
  errorLog: string[],             // window errors and unhandled rejections
  inspect(): Inspect,
  act(name: string, arg?: unknown): Inspect,
  step?(frames?: number, dt?: number): Inspect,
  script?(time: number): void,
}
```

## `inspect()`

```ts
{
  quality: 'high',
  audio: 'none',
  errors: number,
  lang: 'en' | 'th',
  facts: {
    landmarks: number,
    roadEdges: number,
    vehicles: number,
    pedestrians: number,
    boats: number,
    buildings: number,
    triangles: number,
    drawCalls: number,
    reducedMotion: boolean,
  },
  state: {
    selected: string | null,      // landmark id
    night: number,                // 0..1
    targetNight: 0 | 1,
    rotating: boolean,
    azimuth: number,              // OrbitControls spherical
    polar: number,
    distance: number,
    target: [number, number, number],
    transition: boolean,          // camera flight in progress
    cameraClear: boolean,         // camera not inside a building envelope
    layout: 'full' | 'compact',
    embed: boolean,
    time: number,                 // virtual seconds
  },
}
```

`facts` is captured from the first rendered frame, so it is stable for a given build. `state` is
live.

## `act(name, arg)`

| Name | Argument | Effect |
| --- | --- | --- |
| `landmark` | landmark id or 0-based index | Select the landmark, open the card, fly the camera |
| `close` | — | Close the card, keep the camera |
| `night` | boolean (optional) | Set day/night; omit to toggle |
| `rotate` | boolean (optional) | Set auto-rotate; omit to toggle |
| `reset` | — | Close the card, stop rotation, fly home |
| `zoom` | positive number, clamped 0.2..5 | Scale the camera distance |
| `orbit` | `[dTheta, dPhi]` | Rotate around the target |
| `pan` | `[dx, dz]` | Move the target and camera in the ground plane |

`act()` wraps the React state updates in `flushSync`, so the button, card and camera change in one
call. Camera flights still take about 1.3 seconds of virtual time unless reduced motion is active.

## `step(frames = 1, dt = 1/30)`

Only in `?capture=1`. Advances the simulation by `frames * dt` virtual seconds, rendering one frame
per step, and returns `inspect()`. The RAF loop is not started in capture mode, so this is the only
way time moves.

`dt` must be finite and positive; `frames` must be a non-negative integer. The verification uses
`dt = 1/30`.

## `script(time)`

Only in `?capture=1`. A small cover timeline used by a recorder:

| Time | Cue |
| --- | --- |
| 2.6 s | select Grand Palace |
| 5.2 s | select Wat Arun |
| 7.2 s | night |
| 7.5 s | reset |

Seeking backwards calls `home()` and replays the cues. The timeline is deliberately simple; it is
not a general animation editor.

## Example

```js
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1200, height: 720 } })
await page.emulateMedia({ reducedMotion: 'reduce' }) // cuts flights; optional
await page.goto('https://somphol.github.io/bangkok-miniature/?capture=1')
await page.waitForFunction(() => window.__scene?.ready === true)

await page.evaluate(() => window.__scene.act('landmark', 'wat-arun'))
await page.evaluate(() => window.__scene.step(2))
const { state, facts } = await page.evaluate(() => window.__scene.inspect())
console.log(state.target, facts.triangles)
await browser.close()
```

Without reduced motion, step enough frames to finish the 1.3 s flight (about 40 frames at 30 fps).
The verification uses reduced motion for speed and exactness.

## Stability

- The names and shapes above are the ones the verification suite uses.
- If you change `inspect()` or `act()`, update `scripts/verify.mjs` and
  [verification.md](verification.md) in the same change.
- The API is not exposed as a promise of backwards compatibility for third-party integrations.
