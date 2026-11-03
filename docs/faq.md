# FAQ

### Is this an accurate map of Bangkok?

No. The geography is deliberately compressed into a tabletop tray. The river is wider than scale,
the banks are narrowed, and the landmarks are moved closer together. It is a recognisable diorama,
not a survey map or a navigation tool. See [design-notes.md](design-notes.md).

### Can I use the project?

Yes. The source is MIT licensed; see [LICENSE](../LICENSE). The production bundle includes React,
React DOM, Scheduler and three.js, all MIT; their notices are in
[THIRD_PARTY_NOTICES.txt](../THIRD_PARTY_NOTICES.txt) and are embedded in the single-file build.
No third-party brand marks, fonts or photographs are included.

### Why is the river so wide?

Because it is the composition's spine. At true scale the Chao Phraya would be a thin line at this
miniature size and the two banks would read as one mass. The wider ribbon gives the boats room,
separates the historic and modern banks, and makes the overview legible. See
[design-notes.md](design-notes.md).

### Why are there only about 140 buildings?

The city is a diorama, not a simulation. The count is tuned so the landmarks remain legible, the
road graph is readable from above, and the scene stays comfortable on a laptop. Adding buildings is
possible; see [customization.md](customization.md).

### Why is there no sound?

Audio is out of scope for this release. The scene has no audio assets, no autoplay and no mute
state. If audio is added later, it must remain optional and must not start before a user gesture.

### Why does the camera fly in an arc?

The landmark views are close to the buildings. The flight lifts the camera above the tallest
blockers before descending, so it does not cut through a tower. `cameraClear` in the verification
suite checks the end position; the arc is visible during the transition.

### Why does the city look different from Google Maps?

The street plan mixes named Bangkok roads, a rotated local grid and a river that interrupts both.
The grid is an abstraction; it is not a traced street map. The goal is the *feel* of the old town,
Chinatown and the Silom skyline, not block-by-block accuracy.

### How do I add a landmark or a building family?

The step-by-step recipes are in [customization.md](customization.md) and
[landmarks.md](landmarks.md). The short version: model it, add the anchor, add the i18n copy, add
the verification target, run `npm test` and `npm run verify`.

### Why does the Thai text look wrong on my machine?

The UI uses system fonts only, because the single file must stay offline and font-free. macOS and
most desktop systems have Thai fonts; a minimal Linux image may not. Install a Thai font or use a
browser/system with one.

### Why is it slow in headless Chrome?

Headless Chrome without a GPU-backed path falls back to SwiftShader. The scene runs at a few frames
per second there. `npm run verify` uses virtual time and is the deterministic check; `npm run shot`
is the slow visual harness. See [performance.md](performance.md).

### Can I embed it?

Yes. Add `?embed=1` to the single-file URL. The compact layout hides the header and intro. If you
host it yourself, serve the documented CSP; GitHub Pages cannot set headers. See
[deployment.md](deployment.md).

### Why does the landmark bar shorten some names?

Below 1350 px the full bar drops the decorative arrow and reduces the type so all eight names fit.
In the compact layout the bar becomes a 4×2 grid with short names; the full name is still the
button's accessible label.

### Why is the version 0.1.1?

0.1.0 was the initial public release. 0.1.1 packages the full documentation set and embeds the
third-party notices in the single-file build. The changelog records both releases and the
verification evidence. The release process is in [release-process.md](release-process.md).

### How do I report a bug or a security problem?

Bugs and feature requests go through the GitHub issue templates; see [SUPPORT.md](../SUPPORT.md).
Security problems should follow [SECURITY.md](../SECURITY.md), not a public issue.
