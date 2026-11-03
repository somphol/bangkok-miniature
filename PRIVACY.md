# Privacy

Bangkok Miniature is a static, offline-first 3D scene. It is designed not to collect, store or
transmit personal data.

## The scene

- No accounts, sign-in, cookies, analytics, advertising or tracking pixels.
- No `localStorage`, `sessionStorage`, IndexedDB or other client-side persistence.
- No runtime network requests. The single-file build has no external scripts, styles, images, fonts,
  model files or API calls.
- The screenshot control renders the canvas to a PNG in the browser and downloads it locally. The
  image is not uploaded anywhere by this project.
- The language choice is kept in memory. The toggle tries to add `?lang=` to the current URL so a
  reload keeps the choice; this is a URL parameter, not stored data. In a sandboxed document the URL
  update is skipped.

## Hosting

The published site is served by **GitHub Pages**. GitHub may process standard request metadata
(IP address, user agent, requested path) as part of serving the page; that processing is governed by
[GitHub's privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
This project does not receive or analyse those logs.

If you self-host the single file, the hosting provider's policy applies. The file itself makes no
requests, so there is nothing for the host to observe beyond the initial page load.

## Embedding

The scene can be embedded with `?embed=1`. It sends one `postMessage` to its parent when the first
frame is ready (`bangkok-miniature:ready`) and one on a WebGL failure (`bangkok-miniature:error`).
The message contains only the slug and version; no user data. The parent page's own privacy policy
applies to the surrounding page.

## Contact

Questions or concerns about privacy can be raised through the repository's
[issues](https://github.com/somphol/bangkok-miniature/issues) or the maintainer's GitHub profile.
Do not include personal data in a public issue.

## Changes

If a future version adds analytics, accounts or any network feature, this file must be updated in
the same change and the change must be called out in the release notes.
