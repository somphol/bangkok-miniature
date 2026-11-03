# Performance

The scene is built to look richer than its draw-call count suggests. The current release is about:

| Metric | Value |
| --- | --- |
| Triangles | ~430,000 |
| Draw calls | ~151 |
| Buildings | 140 (132 parcels + 8 landmarks) |
| Road edges | 1,226 |
| Vehicles | 40 |
| Pedestrians | 60 |
| Boats | 3 |
| Device pixel ratio cap | 1.6 |
| Shadow map | 2048², updated 12 times per second |

These numbers come from the first rendered frame; `window.__scene.inspect().facts` reports them at
runtime.

## Why it is fast enough

- **Instancing.** `Kit` collects every box, cylinder, prism, sphere and beam into one
  `InstancedMesh` per material. Most of the city is a handful of draw calls. Custom geometry (the
  Golden Mount spiral, park paths) is merged per material at `finish()`.
- **No textures.** Materials are vertex-coloured or flat-coloured; there are no texture uploads,
  atlases or image decodes.
- **One water plane.** The river and the tray share a single subdivided surface with a small vertex
  displacement and a normal perturbation. There is no reflection pass.
- **Shadow throttling.** The shadow map is re-rendered at 12 Hz, not every frame.
- **No postprocessing.** Tone mapping, fog and emissive materials carry the look.
- **Seeded, static placement.** The plan and the buildings are generated once at startup; nothing
  rebuilds geometry per frame.

## Where the cost goes

- The water plane is 80 × 160 segments (~25k triangles) and covers the whole tray.
- Windows are the largest instance count; each building contributes a few dozen small window
  boxes/planes.
- The landmark models are dense in instances (Mahanakhon's 26 levels, Baiyoke's bands, Wat Arun's
  prangs) but still share the kit materials.
- Traffic and people update instance matrices every frame; the count is deliberately small.

## Profiling

- `container.dataset.fps` is written by the live loop every two seconds.
- `window.__scene.inspect().facts` gives triangles, draw calls and entity counts.
- Chrome DevTools → Performance → GPU is the useful view for a real device.
- Compare day and night: night adds emissive work but not draw calls; the window material is shared.

## If you need to lower the budget

1. Reduce the water plane segments (`PlaneGeometry(..., 80, 160)` in `environment.ts`).
2. Lower the shadow map to 1024 and the shadow refresh to 8 Hz.
3. Reduce window density in `buildings.ts` (`windows()` spacing/rows) before removing whole
   buildings.
4. Reduce the tree count in `buildEnvironment` and the number of street lamps/stalls.
5. Cap the pixel ratio lower than 1.6 for low-end mobile.
6. Consider a distance-based visibility rule for windows or micro-detail, but measure first: the
   draw-call count is already low, and extra visibility logic can cost more than it saves.

## Headless and software rendering

Headless Chrome without a GPU-backed path falls back to SwiftShader, which runs the scene at a few
frames per second. That is an environment limit, not a scene defect. `npm run verify` uses virtual
time and does not depend on the frame rate; `npm run shot` is the slow visual harness. If you are
profiling, use a real GPU-backed browser.

## Mobile

The compact layout is chosen below 900 px wide or 560 px high. Touch orbit and pinch zoom are
handled by OrbitControls. The current verification covers touch emulation at 390×844 and the
345×345 embed; a physical-device pass is still on the roadmap.
