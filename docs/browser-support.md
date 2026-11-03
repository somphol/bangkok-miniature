# Browser support

## Requirements

- **WebGL 2** with hardware acceleration.
- JavaScript enabled (the page is a module script).
- A viewport of at least 320×320; the compact layout is designed down to 345×345.

If WebGL 2 is unavailable, the page shows a localised message instead of a blank canvas. There is
no 2D fallback.

## Tested browsers

| Browser | Status | Notes |
| --- | --- | --- |
| Chrome / Edge (recent) | Supported | Primary development target |
| Firefox (recent) | Supported | WebGL 2 path; verify visually |
| Safari 16.4+ | Supported | WebGL 2; check the Thai font fallback |
| Mobile Safari | Supported | Touch orbit/pinch; compact layout |
| Chrome Android | Supported | Touch orbit/pinch; compact layout |
| Headless Chromium (CI) | Supported | SwiftShader; use `npm run verify` |
| Internet Explorer / legacy Edge | Not supported | No WebGL 2 / module support |

The verification suite runs on macOS Chrome with SwiftShader and on Linux Chromium in CI. Touch is
checked under emulation at 390×844; a physical-device pass is still on the roadmap.

## Layouts

- **Full:** at least 900 px wide and 560 px high. The title column is visible and the camera is
  shifted right.
- **Compact:** below either breakpoint. The intro is hidden; the landmark bar becomes a 4×2 grid.
- **Embed:** `?embed=1` hides the header, intro and collectible line; designed for 345×345 and
  larger iframes.

## Input

- Mouse: drag to orbit, right-drag to pan, wheel to zoom.
- Keyboard: arrow keys pan; `+` / `−` zoom; Tab reaches every overlay control.
- Touch: drag to orbit, pinch to zoom, tap a landmark.
- The landmark buttons are the accessible, deterministic way to move the camera.

## Reduced motion

`prefers-reduced-motion: reduce` is respected:

- camera flights become cuts;
- the day/night blend is instant;
- the loading spinner does not animate.

Traffic and water continue to move; the scene is the content, not a decorative background.

## Known limitations

- **Software rendering.** Headless Chrome without a GPU path uses SwiftShader and runs slowly. This
  is an environment limit, not a browser support issue.
- **Old GPUs.** Very old integrated GPUs may fail to create a WebGL 2 context; the page reports it.
- **Thai fonts.** Minimal Linux images may not have a Thai font; the copy still exists in the DOM
  and is readable by a screen reader.
- **Sandboxed embeds.** A `sandbox allow-scripts` iframe has an opaque origin; downloads and
  fullscreen are hidden, and the language toggle skips the URL update. The scene still works.
- **iOS low-power mode.** WebGL may be throttled; the scene is still interactive but the frame rate
  drops.

## Checking WebGL 2

In the browser console:

```js
!!document.createElement('canvas').getContext('webgl2')
```

`true` means the context is available. If it is `false`, enable hardware acceleration or try a
different browser.
