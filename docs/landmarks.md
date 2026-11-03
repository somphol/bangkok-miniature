# Landmarks

Each landmark is a hand-authored model in `src/scene/landmarks.ts`, placed by one record in
`LANDMARKS` in `src/scene/geography.ts`. The table below is the authoring contract: the anchor,
reserved footprint, camera look height and camera offset. `scripts/verify.mjs` repeats the camera
targets; keep them in sync.

| # | Id | Anchor (x, z) | Lot (w × d) | Look | View offset | Model notes |
| - | -- | ------------- | ----------- | ---- | ----------- | ----------- |
| 01 | `grand-palace` | 2.35, −7.4 | 1.8 × 1.8 | 1.9 | `[4.8, 4.4, 6.8]` | Walled compound, golden chedi, Chakri Maha Prasat, green/gold roofs, gate |
| 02 | `wat-arun` | −2.3, −6.8 | 1.5 × 1.5 | 2.2 | `[6.8, 4.6, 5.8]` | Central prang, four small prangs, cloister, river landing |
| 03 | `wat-pho` | 2.2, −4.3 | 1.6 × 1.5 | 1.5 | `[4.5, 3.8, −2.0]` | Long hall, gilded reclining Buddha, four tiled chedis, cloister |
| 04 | `giant-swing` | 2.2, −2.0 | 1.2 × 1.0 | 1.9 | `[4.2, 3.8, −4.5]` | Two red teak columns, crossbeam, brackets, Wat Suthat behind |
| 05 | `golden-mount` | 3.0, 0.0 | 1.5 × 1.5 | 1.8 | `[4.5, 4.0, −1.0]` | Green hill, continuous spiral ramp, golden chedi, umbrella, sala |
| 06 | `baiyoke` | 2.4, 2.6 | 1.2 × 1.2 | 4.5 | `[−8.5, 7.0, 8.8]` | Tapered shaft, gold observation ring, antenna, podium |
| 07 | `mahanakhon` | 2.9, 6.4 | 1.3 × 1.3 | 4.2 | `[−9.0, 7.5, 9.5]` | Pixelated glass tower with a spiral cutout, sky deck, antenna |
| 08 | `rama-viii` | −0.35, −13.6 | 4.4 × 1.4 | 2.2 | `[4.2, 5.2, 9.6]` | Inverted-Y pylon, cable fan, deck, piers, four bridge cars |

All anchors use `y = 0.69`; `yaw` is recorded separately in `LANDMARKS`.

## How the camera view is built

`focus(i)` in `src/scene/scene.ts`:

```ts
const target = new Vector3(landmark.x, landmark.look, landmark.z)
const to = target.clone().add(new Vector3(...landmark.view))
move(to, target, 2.6)
```

The `view` offset is in world axes. A positive `x` offset puts the camera east of the target; a
positive `z` offset puts it south. The arc lifts the camera above the building envelopes during the
flight; `cameraClear` must be true at the end.

The old-town landmarks are close together. Their views are chosen to avoid another landmark
dominating the foreground: for example, the Giant Swing is seen from the north-east so the Golden
Mount does not block it, and Wat Pho is seen from the north-east so the Giant Swing is behind the
target.

## Envelopes

`tests/geometry.test.ts` checks the world-space bounding box of each model against an authoring
envelope:

| Id | Width | Depth | Minimum top |
| -- | ----- | ----- | ----------- |
| `grand-palace` | 2.0 | 2.0 | 2.2 |
| `wat-arun` | 1.9 | 1.9 | 3.8 |
| `wat-pho` | 2.0 | 1.9 | 1.6 |
| `giant-swing` | 1.6 | 1.4 | 3.4 |
| `golden-mount` | 1.9 | 1.9 | 2.8 |
| `baiyoke` | 1.6 | 1.6 | 7.8 |
| `mahanakhon` | 1.7 | 1.7 | 7.0 |
| `rama-viii` | 4.8 | 1.8 | 4.5 |

If a model needs to grow, widen its lot in `LANDMARKS` first and then adjust the envelope. The lot
also reserves space in the plan, so a wider lot removes nearby parcels.

## Adding a landmark

1. Model it in `landmarks.ts`; keep the local origin at the ground centre.
2. Add the id to `LandmarkId` and `LANDMARKS` in `geography.ts`.
3. Add it to `LANDMARK_IDS` in `config.ts` and `LANDMARK_KEYS` in `i18n.ts`; add both locales.
4. Add the builder to `landmarkBuilders` in `scene.ts`.
5. Add the envelope/hash check in `tests/geometry.test.ts`.
6. Add the camera target to `scripts/verify.mjs`.
7. If the count changes from eight, update the facts check and the README/landmark bar copy.

## Notes on the silhouettes

- The Grand Palace is a cluster, not one building: the chedi, the palace roof and the gate read from
  the south-east view. The gold spire is intentionally tall so it survives the miniature scale.
- Wat Arun is a prang, not a chedi: the tiered square base and the four small prangs are what make
  it recognisable. The spire is gold, not white.
- Wat Pho is a long low hall plus four chedis; the reclining Buddha sits in the courtyard in front
  of the hall so it is visible from above.
- The Giant Swing is two thin columns; the crossbeam and the red colour carry the silhouette. Wat
  Suthat behind it gives the eye a second roof line.
- The Golden Mount is a green cone with a continuous spiral ramp. The spiral is a tube, not a row of
  dots, so it reads as a climb rather than decoration.
- Baiyoke is a slender stack with a gold observation ring and a long antenna; the height is what
  makes it a landmark.
- Mahanakhon's identity is the missing-quadrant spiral. Do not fill the cutout with a solid block;
  the empty notch is the silhouette.
- Rama VIII is the only model over water. Its deck is at world `y = 0.65`, the same as the road, and
  the four bridge cars are driven from the anchor's yaw in `traffic.ts`.
