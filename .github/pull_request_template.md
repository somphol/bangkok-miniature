## Summary

<!-- What changed, and why? Link the issue if there is one. -->

## Changes

<!-- A short bullet list. Mention any geography, camera, landmark or UI change. -->

## Verification

<!-- Tick what you ran. Add the output or a screenshot for visual changes. -->

- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build:single`
- [ ] `npm run verify`
- [ ] `npm run shot` (visual changes)

## Visual changes

<!-- Before/after screenshots, or "none". -->

## Checklist

- [ ] Landmark anchors, camera views and `scripts/verify.mjs` targets agree.
- [ ] `tests/geometry.test.ts` envelopes are updated if a model grew.
- [ ] Both locales are updated for visible copy.
- [ ] `CHANGELOG.md` is updated for a user-visible change.
- [ ] `docs/index.html` is refreshed if this is a release.
- [ ] No secrets, credentials, personal data or generated `node_modules/` are included.
