# Attribution and provenance

## Original work

Bangkok Miniature is an original implementation. Its geography, street plan, building families,
landmark models, UI copy and verification suite were written for this repository. It is **not** a
reskin of another city project and does not reuse another project's source code, coordinates,
models or copy.

The project was inspired by the general idea of a landmark-driven tabletop city diorama, including
the public [San Francisco Miniature](https://github.com/somphol/san-francisco-miniature) by the same
author. The shared part is the concept — a compressed city on a tray with camera flights and a
day/night cycle — not the implementation.

## Geography and map data

The Chao Phraya, the two banks, the street grid, the landmarks and the parks are compressed,
interpretive geometry authored for the diorama. No external map tiles, GIS data, survey data,
satellite imagery or routing data are included. Positions and distances are not accurate and must
not be used for navigation.

The landmark silhouettes are stylised interpretations, not measured reconstructions. They are
designed to be recognisable at miniature scale.

## Brand and media

No third-party logos, brand marks, wordmarks, fonts, photographs or audio are redistributed. The
UI uses system fonts only. The word “Bangkok” and the landmark names are used descriptively.

## Dependencies

The production bundle includes:

| Package | Version | Licence |
| --- | --- | --- |
| React | 19.3.1 | MIT |
| React DOM | 19.3.1 | MIT |
| Scheduler | 0.28.0 | MIT |
| three.js | 0.186.1 | MIT |

The full licence texts are in [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt). Development
dependencies (Vite, TypeScript, tsx, Playwright Core and the React Vite plugin) are not part of the
deployed single file; their licences are recorded by their packages.

## AI assistance

The project was developed with AI assistance in this repository. The architecture, scene design,
landmark models, tests and release documentation are versioned here so a human maintainer can
review, change and verify them. The verification suite is the evidence for the claims in the
README and changelog; it is not a substitute for a human review of the visual result.

## Licence

The project source is MIT licensed; see [LICENSE](LICENSE). The dependency notices are separate and
remain under their respective licences.
