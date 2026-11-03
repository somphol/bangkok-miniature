# Support

## Where to ask

- **Bug reports** — open a GitHub issue using the bug report template. Include the browser, OS,
  URL parameters, a screenshot if possible, and the output of
  `window.__scene.inspect()` from the browser console.
- **Feature ideas** — open a GitHub issue using the feature request template. Explain the visual or
  interaction problem before proposing an implementation.
- **Security problems** — follow [SECURITY.md](SECURITY.md); do not open a public issue.
- **Usage questions** — the guides in [docs/README.md](docs/README.md) and the
  [README](README.md) cover setup, controls, verification and deployment.

## What to include in a bug report

```text
Browser and version:
OS and device:
URL (including ?lang, ?embed, ?view, ?capture):
What happened:
What you expected:
Steps to reproduce:
Console errors (if any):
window.__scene.inspect() output:
```

If the scene is slow or blank, first check that the browser has WebGL 2 and hardware acceleration
enabled. The page shows a localised message when WebGL 2 is missing.

## What is supported

- The current `main` branch and the latest release.
- The single-file build at <https://somphol.github.io/bangkok-miniature/>.
- Modern Chrome, Edge, Firefox and Safari with WebGL 2.
- Desktop, phone and 345×345 embed layouts.

## What is not supported

- Survey accuracy, navigation, GIS import or real-time traffic data.
- Custom city commissions through the issue tracker.
- Browsers without WebGL 2.
- Headless environments without a working GPU path; `npm run verify` is the deterministic check
  there, and `npm run shot` is expected to be slow under SwiftShader.
- Audio: the scene has no sound.

## Response expectations

This is a small project maintained on a best-effort basis. Issues and pull requests are read, but
there is no guaranteed response time. Clear reproductions and small, focused changes are the
fastest route to a fix.
