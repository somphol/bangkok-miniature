# Bangkok Miniature documentation

These guides are for the repository and for anyone changing the scene. The deployed app is
[`docs/index.html`](index.html); the Markdown files in this folder are source documentation and are
not part of the offline single-file build.

| Guide | What it covers |
| --- | --- |
| [Getting started](getting-started.md) | Install, run, build, controls and URL parameters |
| [Architecture](../ARCHITECTURE.md) | Construction order, coordinates, graph, rendering and capture |
| [Verification](verification.md) | Unit/geometry tests, headless-Chrome checks and the capture API |
| [Deployment](deployment.md) | GitHub Pages, the single-file build, CSP, caching and rollback |
| [Customization](customization.md) | Move a landmark, add a family, change geography or add a locale |
| [Landmarks](landmarks.md) | Anchor/view table, model notes and the envelope invariant |
| [Performance](performance.md) | Budgets, instancing, shadows, water and profiling |
| [Internationalization](i18n.md) | English/Thai copy, adding a locale and typography |
| [Design notes](design-notes.md) | Art direction, composition, palette, camera and UI |

The short operational notes for another agent or maintainer are in [AGENTS.md](../AGENTS.md). The
release history is in [CHANGELOG.md](../CHANGELOG.md).
