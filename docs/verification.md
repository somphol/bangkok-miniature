# Verification

The project has three levels of checking: static types, deterministic geometry/plan tests, and a
headless-browser interaction suite. The first two run anywhere Node runs; the third needs Chrome or
Chromium.

## 1. Typecheck and build

```sh
npm run typecheck
npm run build
```

`npm run build` runs the typecheck again before Vite. A build failure is a hard failure; the Pages
copy must come from a successful `npm run build:single`.

## 2. Plan and geometry tests

```sh
npm test
```

`tests/plan.test.ts` builds the city with the production seed and checks:

- parcels are inside the land polygons;
- parcels are clear of every road and of the reserved landmark/park sites;
- no two parcels overlap (rotated-rectangle separating-axis test);
- the road graph is one connected component, so both banks and every connector are reachable;
- each bridge edge starts and ends on land and its midpoint is over water;
- landmark anchors are on the correct bank (Rama VIII is the deliberate exception over the river);
- the river is wide enough to read and its centre is water.

`tests/geometry.test.ts` builds every landmark and every building family in isolation and checks:

- finite geometry positions and finite, non-singular instance matrices;
- each landmark stays inside its authoring envelope and reaches its minimum height;
- each landmark has its own geometry hash;
- the nine ordinary families have distinct geometry hashes.

The tests are deliberately fast and do not need a browser. Run them after any plan, parcel,
landmark or building change.

## 3. Headless interaction suite

```sh
npm run verify
```

This runs `npm run build:single` and then `scripts/verify.mjs`. The script serves the single file
with the sandbox CSP, opens it in headless Chrome, and drives `window.__scene` in capture mode. It
checks **22** things:

- facts: eight landmarks, a connected graph, vehicles, boats, buildings, triangle/draw-call budget;
- eight landmark flights: camera target, selected id, chosen button, `aria-pressed`, camera clear;
- night and day;
- reset;
- zoom, orbit, pan and auto-rotate;
- no console errors and no external requests;
- Thai and English locale copy;
- the 345×345 embed: header/intro hidden, compact layout, all eight landmark buttons, every visible
  control inside the frame.

The CSP used by the suite is the same policy documented in [deployment.md](deployment.md). The
suite uses `page.emulateMedia({ reducedMotion: 'reduce' })` so camera flights cut immediately and
the checks are independent of frame rate.

## The capture API

In `?capture=1` mode the page exposes:

```js
window.__scene.ready          // true after the first rendered frame
window.__scene.inspect()      // facts + camera/UI state
window.__scene.act(name, arg) // 'landmark', 'night', 'rotate', 'reset', 'zoom', 'orbit', 'pan'
window.__scene.step(n, dt)    // advance n frames of dt seconds and render
window.__scene.script(t)      // cover timeline used by a recorder
```

`act()` wraps the React state updates in `flushSync`, so the button, info card and camera change in
one call. `step()` is the only way to advance a capture; there is no RAF loop in that mode.

## Adding a check

If you add a landmark:

1. add its anchor and view to `LANDMARKS` in `src/scene/geography.ts`;
2. add the id to `LANDMARK_IDS` in `src/config.ts` and the i18n keys;
3. add the model to `landmarks.ts` and the builder map in `scene.ts`;
4. add the camera target to `targets` in `scripts/verify.mjs`;
5. add the envelope to `tests/geometry.test.ts`.

If you add a road or a bridge, add the relevant invariant to `tests/plan.test.ts` (for example, a
bridge must connect two land nodes and have a water midpoint).

## Visual checks

```sh
npm run shot
```

`shot.mjs` writes `shots/day.png`, `shots/night.png`, one image per landmark and a night overview.
It uses SwiftShader and is intentionally not a pass/fail gate. Review the images before a release;
a green verify run does not prove the composition looks right.

## Environment limits

- Headless Chrome on a machine without a GPU-backed path runs at a few frames per second. The
  verification uses virtual time so the assertions still complete.
- The `shot` harness is slower and can time out on very slow software rendering; reduce the
  viewport or step count if needed.
- Phone behaviour is checked under touch emulation, not on a physical device.
