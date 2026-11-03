# Contributing to Bangkok Miniature

Thanks for taking the time to look at the project. It is a small, deliberately self-contained
diorama: a compressed Bangkok, eight hand-authored landmarks, procedural buildings and a single
offline HTML build. Contributions that keep that focus are welcome.

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Good first issues

- A landmark model that reads better from its camera view.
- A missing piece of Bangkok street life (a pier, a market, a sala, a sign) that fits the existing
  scale and palette.
- Documentation corrections, especially Thai copy and accessibility notes.
- A verification check that catches a real regression.

## Scope

The project is **not** a GIS product, a navigation tool, a real-time data viewer or a photo-to-3D
reconstruction. Geography is intentionally compressed. Please do not open a change that tries to
make the scene survey-accurate without discussing the composition first.

## Setup

Requirements: Node.js **22.4 or newer**, npm, and a WebGL 2 browser. `npm run verify` and
`npm run shot` also need Chrome or Chromium.

```sh
git clone https://github.com/somphol/bangkok-miniature.git
cd bangkok-miniature
npm ci
npm run dev
```

The dev server prints the local URL. Open it with a hardware-accelerated browser.

## Before you change code

Read these two files first:

- [ARCHITECTURE.md](ARCHITECTURE.md) — the construction order and the invariants.
- [AGENTS.md](AGENTS.md) — the short working notes another agent or maintainer needs.

The most important invariant is the **landmark table**. `LANDMARKS` in
`src/scene/geography.ts` carries each anchor, reserved footprint, look height, camera offset and
yaw. The same targets are repeated in `scripts/verify.mjs`. If you move a landmark, update both or
the flight will point at empty ground.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with live reload |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Plan and geometry checks with `tsx`; no browser |
| `npm run build` | Typecheck plus a production Vite build into `dist/` |
| `npm run build:single` | The build plus the one-file inline output |
| `npm run verify` | Builds the single file and runs the headless-Chrome suite |
| `npm run shot` | Writes day/night and landmark screenshots to `shots/` |

`npm run shot` is a visual inspection tool, not a pass/fail gate. Headless Chrome on a machine
without GPU-backed WebGL falls back to SwiftShader, which is slow; use `npm run verify` for the
deterministic check.

## Code style

- TypeScript is strict. Prefer explicit types at module boundaries and avoid `any`.
- Keep simulation motion in `tick(dt)`. Do not use `performance.now()` inside the scene; capture
  stepping depends on virtual time.
- Use the seeded RNG (`makeRng`, `mulberry`) for anything placed or animated. Do not add
  `Math.random()` to scene construction.
- Keep the scene offline: no `fetch`, storage, remote images, web fonts or model calls. The single
  file must run under the sandbox CSP in [docs/deployment.md](docs/deployment.md).
- Prefer the `Kit` primitives (`box`, `cylinder`, `prism`, `sphere`, `beam`) and instancing over
  one mesh per detail.
- Comments should explain *why* a coordinate, clearance or camera value exists, not restate the
  code.
- Keep UI copy in `src/i18n.ts`. Do not hardcode visible strings in components.

## Tests

Run at least:

```sh
npm test
npm run typecheck
npm run build:single
```

Before opening a pull request that changes geometry, camera views, landmarks, roads or the UI,
also run:

```sh
npm run verify
```

If you add a landmark, add its target to `scripts/verify.mjs` and its envelope to
`tests/geometry.test.ts`. If you change the plan, update `tests/plan.test.ts`. If you change a
visible string, update both locales.

## Commits and pull requests

- Keep commits focused. A good message says what changed and why, for example
  `Tighten the Golden Mount spiral` or `Fix bridge spans after widening the river`.
- Describe visual changes and include a screenshot or a before/after when it helps.
- Use the pull request template and tick the checks you actually ran.
- Update [CHANGELOG.md](CHANGELOG.md) for user-visible changes.
- Do not commit `node_modules/`, `dist/`, `dist-single/`, `shots/` or credentials. The published
  Pages copy is `docs/index.html`; regenerate it with the command in
  [docs/deployment.md](docs/deployment.md).

## Release checklist

1. Update the version in `package.json`.
2. Move the `Unreleased` entries in `CHANGELOG.md` into the new version and date them.
3. Run `npm test`, `npm run typecheck`, `npm run build:single` and `npm run verify`.
4. Copy the single file: `cp dist-single/index.html docs/index.html`.
5. Commit, push `main`, and confirm the Pages build reports `built`.
6. Tag the release (`git tag vX.Y.Z && git push origin vX.Y.Z`) and publish the GitHub release.

## Maintainer

Somphol — [@somphol](https://github.com/somphol).
