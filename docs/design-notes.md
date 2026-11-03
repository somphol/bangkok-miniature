# Design notes

## The idea

A Bangkok that reads in one glance: a wide river, gold temples on the old bank, a modern skyline on
the other, and a tray small enough to hold in two hands. The scene is a collectible, not a map. Every
decision favours silhouette and atmosphere over measured accuracy.

## Composition

- **The river is the spine.** It is deliberately wider than scale (about 2.5 units, roughly a third
  of the land width) so it reads as a ribbon from the overview and still gives the boats room.
- **Two banks, different rhythms.** The west bank is low-rise, warm and temple-led. The east bank
  carries the old town, Chinatown and the tower skyline. The contrast is the story.
- **The tray is a frame.** A rounded beige tray with a raised rim and a soft shadow makes the city
  an object. The water continues to the tray edge; the city is not a cut-out on a flat plane.
- **The camera is a 3/4 aerial.** The overview looks from the south-east, so the river runs
  diagonally through the frame and the title has room on the left. Landmark flights move closer
  without losing the context of the banks.

## Palette

| Role | Day | Night |
| --- | --- | --- |
| Background / ink | warm cream `#efe6d2`, deep teal `#23423f` | `#0c1524`, `#e8eee6` |
| Accent | gold `#c99a3f` | gold, with warm window light |
| Secondary | coral `#d45a45` | coral status dot, neon signs |
| River | murky green `#2f6b5e` | `#0e242c` with warm streaks |
| Land | sand `#cfc8ad` | dark olive |
| Buildings | pastel shophouses, cream heritage, blue-green glass | warm windows, neon signs |

The UI uses a serif display face for the title (system serif: Iowan Old Style / Palatino / Georgia)
and a humanist sans for controls. No web fonts are loaded; the single file must stay offline.

## Landmarks as silhouettes

Each landmark has one or two features that must survive at 1–4 units tall:

- Grand Palace: the gold chedi and the tiered green/gold roof.
- Wat Arun: the central prang and the four small prangs.
- Wat Pho: the long hall and the four chedis.
- Giant Swing: two thin red columns and the crossbeam.
- Golden Mount: the green cone and the spiral ramp.
- Baiyoke: the slender shaft, gold ring and long antenna.
- Mahanakhon: the missing-quadrant spiral.
- Rama VIII: the inverted-Y pylon and the cable fan.

If a change makes one of these read less clearly at the overview distance, it is the wrong change,
even if it adds detail.

## Day and night

Day is a hazy tropical morning: warm sun, cool sky fill, a pale sky and a bright tray. Night is not
a filter: the sun drops, the hemisphere cools, the exposure and environment intensity fall, the
water darkens, windows and signs emit, and lamp pools appear on the ground. The transition is a
smooth blend over about a second; reduced-motion mode cuts it.

## UI

- The full layout reserves the left third for the title and shifts the camera right with a view
  offset, so the city is not hidden behind the copy.
- The landmark bar is a single row on desktop and a 4×2 grid in compact. Below 1350 px it drops the
  arrow and reduces the type so all eight names fit.
- The info card is a small editorial card, not a modal: it appears above the bar and leaves the
  scene visible.
- The location line, compass and collectible line are deliberately quiet. The scene is the hero.

## What was avoided

- A photorealistic render or a texture-heavy look. The diorama is stylised and readable at a glance.
- A uniform grid. Bangkok's streets are not a Manhattan grid; the plan mixes named roads, a rotated
  local grid and a river that interrupts both.
- A single flat skyline. The old town is low-rise; the towers are south and east of it.
- Generic “Asian city” decoration. The details are specific: shophouses, spirit houses, tuk-tuks,
  long-tail boats, river ferries, gold chedis, a pixelated tower.
- Brand marks or third-party fonts. The identity is text and colour only.
