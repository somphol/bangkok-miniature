# Customization recipes

These are the changes most people ask for. Run `npm test` after any geometry/plan change and
`npm run verify` after any camera or UI change.

## Move a landmark

The anchor is one record in `LANDMARKS` in `src/scene/geography.ts`:

```ts
{
  id: 'wat-arun',
  x: -2.3, z: -6.8, y: 0.69,
  w: 1.5, d: 1.5,        // reserved footprint
  look: 2.2,             // camera target height
  view: [6.8, 4.6, 5.8], // camera offset from the target
  yaw: -0.12,
}
```

1. Change `x`, `z`, `w`, `d`, `look`, `view` or `yaw`.
2. Update the same target in `scripts/verify.mjs` (`targets`).
3. Run `npm test` — the anchor must stay on the correct bank and clear of the road graph.
4. Run `npm run verify` — the flight must land on the target and `cameraClear` must stay true.
5. If the model grows, widen its lot or adjust the envelope in `tests/geometry.test.ts`.

The camera offset is in world axes, not local axes: `[+x, +y, +z]` from the target. For an east-bank
landmark, a positive `x` offset looks from the east; for a west-bank landmark, a positive `x` offset
looks across the river.

## Add a landmark model

1. Write the model in `src/scene/landmarks.ts` with the `Kit` helpers. Author it in local space and
   call `kit.at(x, z, 0.69, yaw)` at the start.
2. Export it and add it to the `landmarkBuilders` map in `src/scene/scene.ts`.
3. Add the id to `LandmarkId` in `geography.ts`, `LANDMARKS` and `LANDMARK_IDS` in `config.ts`.
4. Add the name/area/text/short strings to both locales in `src/i18n.ts`.
5. Add an envelope and hash check in `tests/geometry.test.ts`.
6. Add the camera target to `targets` in `scripts/verify.mjs`.
7. Update the landmark count in the verification facts if it changes from eight.

## Add a building family

1. Add the family name to the `Family` union in `src/scene/buildings.ts`.
2. Add a builder function and a branch in `addBuilding`.
3. Add it to `FAMILIES`.
4. Weight it in `familyFor` in `src/scene/plan.ts`.
5. Add it to the family loop in `tests/geometry.test.ts` (the loop uses `FAMILIES`, so this is
   automatic if the array is updated).

Families are procedural. Keep the footprint inside the parcel, use the `Kit` primitives and give the
model a distinct silhouette; the geometry test hashes the result.

## Change the geography

The river is a table of `z`, centre `x` and a cosine half-width. The banks are built from outer-edge
points plus the river edge. Changing the river moves the bank edges and can invalidate landmark
anchors, roads and bridges.

1. Edit `RIVER_Z`, `RIVER_X`, `OUTER_WEST`, `OUTER_EAST` or `riverHalf` in `geography.ts`.
2. Re-check every `LANDMARKS` anchor and every major road in `plan.ts`.
3. Run `tests/plan.test.ts` first; it reports detached graph components, parcels on water and
   bridge endpoints that are no longer on land.
4. Re-run `npm run verify`; the landmark flights may need new offsets.
5. Refresh `docs/index.html` if the visual result is a release.

The tray is `TRAY` in `geography.ts`; if you widen it, adjust the initial camera in `scene.ts` and
the `viewOffset` framing in `App.tsx`.

## Change the camera

- Overview: `INITIAL` and `INITIAL_TARGET` in `src/scene/scene.ts`.
- Landmark flights: the `view` offset in `LANDMARKS`.
- Debug views: `DEBUG_VIEWS` in `scene.ts` (`?view=…`).
- Field of view: the `PerspectiveCamera(36, …)` constructor.
- Zoom limits: `controls.minDistance` / `maxDistance` and the `zoom` clamp in `scene.ts`.

Always run `npm run verify` after a camera change; it checks that the camera is not inside a
building envelope.

## Add a locale

1. Copy the `en` block in `src/i18n.ts`, translate the values and add the block under a new key.
2. Add the key to `LANGS` and `normaliseLang`.
3. Update the `?lang=` documentation and the verify locale check.
4. Keep the `lm…Name/Area/Text/Short` keys in the same order; the landmark bar uses `LANDMARK_KEYS`.
5. Check that the compact landmark bar still fits: the short labels are the tightest constraint.

See [i18n.md](i18n.md) for typography and layout notes.

## Change the palette or lighting

- UI: the CSS variables at the top of `src/style.css`.
- Sky, fog and sun: the top of `src/scene/scene.ts`.
- Water and parks: `src/scene/environment.ts`.
- Buildings: the colour arrays in `src/scene/buildings.ts`.
- Landmark materials: the colours passed to the `Kit` calls in `src/scene/landmarks.ts`.

Take a day and a night screenshot after a palette change; the emissive materials and the water
colour are tuned together.

## Add a URL parameter

`App.tsx` reads `window.location.search` at module load. Add the parameter to the `params` block,
pass it into `createCity` if the scene needs it, and document it in
[docs/getting-started.md](getting-started.md). Keep capture mode deterministic: a new parameter
must not start an independent clock.
