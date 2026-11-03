# Bangkok Miniature — working notes

## What it is

A single-page, offline interactive 3D diorama of central Bangkok: the Chao Phraya splits a
floating tray into the historic east bank and Thonburi, with eight dedicated landmarks, nine
ordinary building families, traffic, river boats, day/night lighting and English/Thai UI. It is
compressed and interpretive, not a map or GIS product.

The deployable artifact is `dist-single/index.html`. The source is a Vite + React + TypeScript +
three.js project.

## Commands

```sh
npm ci
npm run dev            # live dev server
npm run build:single   # tsc + vite build + inline -> dist-single/index.html
npm test               # plan/geometry checks with tsx, no browser
npm run verify         # build:single, then headless-Chrome interaction checks
npm run shot           # screenshots into shots/ (SwiftShader, visual only)
```

`npm run verify` drives `window.__scene` in `?capture=1` mode with virtual time, so it does not
depend on frame rate. It needs Chrome at `/Applications/Google Chrome.app/...` or `CHROME_PATH`.
`npm run shot` needs the same Chrome and is deliberately not a pass/fail gate.

## Architecture

Order of construction in `src/scene/scene.ts`:

1. `geography.ts` defines the river centreline, bank polygons, bridges, parks and landmark anchors.
2. `plan.ts` builds named major roads and a clipped rotated grid, splits every crossing into a
   planar graph, adds bridge spans, then places street-front and lattice parcels.
3. `buildings.ts` adds the nine ordinary families through `Kit`.
4. `landmarks.ts` adds the eight dedicated models through the same `Kit`.
5. `environment.ts` adds land, tray, water, roads, bridges, promenade, piers, parks, trees, stalls,
   spirit houses and lamp glow; then `kit.finish()` emits the instanced meshes.
6. `traffic.ts` adds vehicles, pedestrians, river boats and Rama VIII bridge cars.
7. `scene.ts` owns the renderer, camera flights, day/night, capture API and disposal.

UI: `src/App.tsx`, `src/i18n.ts`, `src/style.css`. The capture surface is installed in `App.tsx`
(`window.__scene`), not in the scene module.

## Decisions and constraints

- **Coordinates.** North is `-z`, east is `+x`; the tray is 12.6 × 33.5 units. The river is ~2.5
  units wide on purpose: it is the composition's central ribbon. Changing `riverHalf()` moves the
  bank edges and will invalidate landmark lots and road anchors.
- **Landmarks are one table.** `LANDMARKS` in `geography.ts` carries the anchor, reserved
  footprint, look height, camera offset and yaw. The same values are repeated in
  `scripts/verify.mjs` (`targets`) and in the screenshot expectations. If an anchor moves, update
  both or a flight will point at empty ground.
- **Road graph.** Major roads are authored polylines; the grid is clipped to `insideLand`. Bridges
  are explicit water-span edges marked `bridge: true`. The graph must remain one connected
  component; `tests/plan.test.ts` fails if a bank or a connector detaches.
- **Parcels.** Street-front rows are placed first, then the lattice shares the same spatial hash, so
  the two passes cannot overlap. Parcels keep `rot` aligned to their local street/grid frame.
- **Seeded placement.** `planCity(1946)`, the building RNG, the environment RNG and the traffic RNG
  are deterministic. Do not introduce `Math.random()` in scene construction.
- **Virtual time.** All motion advances through `tick(dt)`. Capture mode never starts the RAF loop;
  `window.__scene.step(n, dt)` advances it. Do not use `performance.now()` inside the simulation.
- **One offline file.** No image URLs, fonts, fetch, storage or model calls. The single-file build
  inlines one JS chunk and one CSS file; keep `vite.config.ts`'s `inlineDynamicImports`,
  `assetsInlineLimit` and `cssCodeSplit` settings. The UI uses system fonts only.
- **Strict CSP.** The published page is expected to run under
  `sandbox allow-scripts; default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline';
  img-src data: blob:; font-src data:; connect-src 'none'`. Downloads and fullscreen are hidden when
  the page is sandboxed or embedded.
- **Landmark envelopes.** `tests/geometry.test.ts` asserts each model stays inside its authoring
  envelope. Widen a lot in `geography.ts` before growing a model past it.
- **Instancing.** `Kit` batches boxes/cylinders/spheres/beams per material; custom geometry is
  merged per material at `finish()`. Keep new details as primitives where possible.

## Known issues

- Geography and landmark positions are compressed and deliberately not to scale.
- Headless Chrome here uses SwiftShader; `npm run verify` passes but `npm run shot` is slow.
- There is no audio, no measurement/GIS import, and no photo-to-3D reconstruction.
- The river boats follow the centreline; they do not queue at piers or avoid each other.
- Ordinary buildings are procedural; only the eight landmarks are hand-authored.
- The Thai UI depends on a system Thai font; macOS has one, some Linux images do not.

## Continuity

- Local project: `/Users/somphol/bangkok-miniature`.
- Single-file artifact: `dist-single/index.html` (about 900 KB, sha printed by the build).
- Screenshots: `shots/` (ignored by git).
- No GitHub repository has been created from this session; the project is ready to publish. If it
  is published, keep this file at the repository root and copy the single file to the Pages target.
