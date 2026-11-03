# Release process

The project uses [Semantic Versioning](https://semver.org/) and
[Keep a Changelog](https://keepachangelog.com/). The current release is **0.1.1**.

## Version locations

When the version changes, update all of these in the same commit:

| File | Field |
| --- | --- |
| `package.json` | `version` |
| `src/config.ts` | `VERSION` (used by `window.__scene`) |
| `README.md` | the status line near the top |
| `CITATION.cff` | `version` and `date-released` |
| `CHANGELOG.md` | the new version heading and links |

`package-lock.json` is updated by npm when the package version changes (`npm version` or a manual
edit plus `npm install --package-lock-only`).

## Pre-release checks

Run from a clean checkout:

```sh
npm ci
npm run typecheck
npm test
npm run build:single
npm run verify
npm run shot          # visual review, not a gate
```

- `npm test` must pass.
- `npm run verify` must pass 22/22 (or the updated count if checks were added).
- Review `shots/day.png`, `shots/night.png` and the landmark images for composition regressions.
- Confirm the single file is the intended size and contains the notices comment.

## Release

1. Update the version locations and move the `Unreleased` changelog entries into the new version.
2. Commit the release: `git commit -m "Release vX.Y.Z"`.
3. Build and copy the Pages artifact:

   ```sh
   npm run build:single
   cp dist-single/index.html docs/index.html
   ```

4. Commit the refreshed `docs/index.html` if it changed.
5. Tag and push:

   ```sh
   git tag -a vX.Y.Z -m "Bangkok Miniature X.Y.Z"
   git push origin main
   git push origin vX.Y.Z
   ```

6. Create the GitHub release from the tag. Use the changelog section as the body, link the live
   site and the docs, and mark it as the latest release.
7. Wait for the Pages build to report `built`; check the live URL and, for a major change, load it
   in headless Chrome.
8. Check that the CI run for `main` is green (Node 22, Node 24 and the headless interaction job).

## Hotfix

For a security or correctness fix that cannot wait for the next minor:

1. Branch from the release tag or `main`, make the smallest fix.
2. Add a changelog entry and a regression test if possible.
3. Run the pre-release checks.
4. Bump the patch version, rebuild, copy `docs/index.html`, tag and release.
5. If the issue is security-sensitive, follow the disclosure timeline in
   [SECURITY.md](../SECURITY.md).

## Rollback

- **Source:** `git revert <bad-commit>` and push; CI and Pages rebuild from the new commit.
- **Pages:** restore `docs/index.html` from the last good commit and push. The app is a single file,
  so there is no database or cache migration.
- **Release:** a published GitHub release is not deleted silently. Publish a patch release with the
  fix and, if necessary, mark the bad release as a pre-release or add a warning to its notes.

## Artifacts

| Artifact | Where |
| --- | --- |
| Source | `main` branch and `vX.Y.Z` tag |
| One-file build | `dist-single/index.html` (ignored by git) |
| Published copy | `docs/index.html` (committed, Pages source `main` / `docs`) |
| Release notes | GitHub Releases |
| CI evidence | GitHub Actions run for the release commit |
| Screenshots | `shots/` (local, ignored) |

See [deployment.md](deployment.md) for the Pages configuration and the CSP, and
[CONTRIBUTING.md](../CONTRIBUTING.md) for the contribution flow.
