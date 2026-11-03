# Changelog

All notable changes to Bangkok Miniature are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-11-02

Initial public release.

### Added

- A compressed, original Bangkok geography: the Chao Phraya, the historic east bank, Thonburi, a
  floating tabletop tray and a connected street plan with named major roads and local sois.
- Eight hand-authored landmarks: Grand Palace, Wat Arun, Wat Pho, Giant Swing, Golden Mount,
  Baiyoke Tower II, King Power Mahanakhon and Rama VIII Bridge.
- Nine ordinary building families: shophouse, heritage, low-rise, market, mixed-use, condo, office,
  hotel and pixel tower, generated from a seeded plan.
- Three road bridges with real water spans, plus traffic on the road graph, cars on the Rama VIII
  deck, river ferries, long-tail boats and pedestrians.
- Day and night lighting, animated water, park and riverfront detail, street stalls, spirit houses
  and lamp glow.
- English and Thai interface copy, live language switching, compact and embed layouts, landmark
  camera flights, screenshot and fullscreen controls.
- A deterministic capture surface (`window.__scene`) used by the verification suite.
- A one-file offline build (`dist-single/index.html`) and a GitHub Pages deployment from
  `docs/index.html`.
- Plan and geometry tests (`npm test`) and a 22-check headless-Chrome verification
  (`npm run verify`).

### Changed

- The landmark bar shortens its labels and drops the arrow on narrower desktops so all eight names
  remain readable.
- Road centre lines are drawn only on major roads; sois stay unmarked.

### Verification

- `npm test` passes: connected road graph, parcel containment/non-overlap, bridge water spans,
  landmark envelopes and nine distinct building families.
- `npm run verify` passes 22/22 checks under the sandbox CSP: eight landmark flights, day/night,
  reset, zoom, orbit, pan, rotate, both locales and the 345×345 embed, with no console errors and
  no external requests.
- The published page was loaded in headless Chrome: 8 landmarks, 1,226 road edges, 140 buildings,
  40 vehicles, 3 boats, no page errors.

### Notes

- Geography and landmark positions are compressed and interpretive; this is not a survey map.
- The project is released under the MIT licence; third-party notices are in
  [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt).

[Unreleased]: https://github.com/somphol/bangkok-miniature/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/somphol/bangkok-miniature/releases/tag/v0.1.0
