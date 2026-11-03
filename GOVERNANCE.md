# Governance

Bangkok Miniature is a small, single-maintainer project. This document explains how decisions,
releases and contributions are handled so the process is predictable.

## Maintainer

**Somphol** ([@somphol](https://github.com/somphol)) is the maintainer and has final responsibility
for the repository, releases, the published site and security responses.

## Decisions

- Small, focused changes (a model tweak, a copy fix, a test) are reviewed and merged by the
  maintainer.
- Changes to geography, the landmark table, the road plan, the public capture API or the visual
  direction are discussed in an issue first. The maintainer makes the final call, guided by the
  project's design notes and the verification suite.
- A pull request that breaks the connected road graph, the landmark envelopes or the 22-check
  verification is not merged without a clear reason and a corresponding update to the tests.

## Contributions

Contributions are welcome under the [Code of Conduct](CODE_OF_CONDUCT.md). The practical process is
in [CONTRIBUTING.md](CONTRIBUTING.md): fork, branch, test, open a pull request with the template.
There is no copyright assignment or contributor licence agreement; contributions are accepted under
the project's MIT licence.

## Releases

- Versions follow [Semantic Versioning](https://semver.org/). The current release is **0.1.1**.
- The changelog is the source of truth for user-visible changes.
- A release requires `npm test`, `npm run typecheck`, `npm run build:single` and `npm run verify`.
- The tag is `vX.Y.Z`; the GitHub release carries the changelog summary; the Pages copy is
  `docs/index.html`.
- The release process is documented in [docs/release-process.md](docs/release-process.md).

## Security

Security reports are handled privately as described in [SECURITY.md](SECURITY.md). Private
vulnerability reporting is enabled on the repository. Do not open a public issue for a suspected
vulnerability.

## Code of Conduct

Enforcement follows [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). The maintainer is responsible for
reviewing reports and applying the enforcement guidelines.

## Changes to this document

Changes to governance are proposed in an issue and merged by the maintainer. If the project gains
co-maintainers, this document should be updated with their roles and the decision process before
the change takes effect.
