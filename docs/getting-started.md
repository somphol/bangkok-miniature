# Getting started

## Requirements

- Node.js **22.4 or newer** (`.nvmrc` pins the major version).
- npm 10 or newer.
- A browser with **WebGL 2** and hardware acceleration for the live scene.
- Chrome or Chromium for `npm run verify` and `npm run shot`.

No API keys, accounts, databases or network services are required.

## Install and run

```sh
git clone https://github.com/somphol/bangkok-miniature.git
cd bangkok-miniature
npm ci
npm run dev
```

Vite prints a local URL, usually <http://localhost:5173>. Open it in a WebGL 2 browser.

## Build

```sh
npm run typecheck      # tsc --noEmit
npm test               # plan and geometry checks, no browser
npm run build          # production build in dist/
npm run build:single   # one self-contained file: dist-single/index.html
```

`dist-single/index.html` has no external assets. Open it directly, serve it from any static host, or
copy it to `docs/index.html` for GitHub Pages. See [deployment.md](deployment.md).

## Controls

| Control | Action |
| --- | --- |
| Landmark buttons | Fly to the dedicated camera view |
| Day / Night | Blend the lighting, water and window emissive |
| Auto rotate | Slow orbit around the current target |
| Reset | Return to the overview and close the landmark card |
| Drag | Orbit |
| Right-drag / arrow keys | Pan |
| Wheel / `+` / `−` | Zoom |
| Camera | Save a PNG of the current canvas |
| Fullscreen | Enter fullscreen outside a sandbox |
| `ไทย` / `EN` | Switch the interface language live |

## URL parameters

| Parameter | Effect |
| --- | --- |
| `?lang=en` / `?lang=th` | Start in English or Thai |
| `?embed=1` | Compact embed layout without the header and intro |
| `?capture=1` | Do not start the RAF loop; advance with `window.__scene.step()` |
| `?view=topdown` | Debug viewpoint: top-down |
| `?view=oldtown` | Debug viewpoint: Rattanakosin |
| `?view=silom` | Debug viewpoint: Silom |
| `?view=river` | Debug viewpoint: the river |
| `?view=bridge` | Debug viewpoint: Rama VIII |

`?capture=1` is for verification and recording. It freezes the simulation until
`window.__scene.step(n, dt)` is called.

## Troubleshooting

**The page says WebGL 2 is missing.** Enable hardware acceleration in the browser or try another
browser. The scene does not have a 2D fallback.

**The scene is blank after loading.** Check the console. A missing WebGL 2 context is the most
common cause; the page shows a localised message. If you are in a headless browser, use
`npm run verify` rather than `npm run shot`.

**`npm run verify` cannot find Chrome.** Set `CHROME_PATH` to the executable, or install Chrome /
Chromium in a standard location. The script also checks Playwright's cached browser path.

**`npm run verify` is slow or times out.** Headless Chrome without a GPU uses SwiftShader. The
verification uses virtual time and should still finish; `npm run shot` is the slow visual harness.

**Port 5173 is in use.** Vite picks the next free port and prints it.

**The Thai text looks wrong.** The UI uses system fonts. macOS has Thai fonts; some minimal Linux
images do not. Install a Thai font or use a browser with one.
