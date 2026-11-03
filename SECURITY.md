# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| 0.1.x | Yes |
| < 0.1 | No |

## Reporting a vulnerability

Please do **not** open a public issue for a security problem. Use GitHub's private vulnerability
reporting from the repository's **Security** tab if it is available, or contact the maintainer at
[@somphol](https://github.com/somphol) through a private channel listed on that profile.

Include:

- what is affected (source, single-file build, Pages deployment or a dependency);
- the steps to reproduce, with the URL and parameters if relevant;
- the browser and operating system;
- the impact you believe it has.

Do not include tokens, credentials, private keys, personal data or a working exploit against a
third party in a public issue.

## What this project does and does not do

Bangkok Miniature is a static, offline-first scene:

- It has **no server, account system, database, cookies or analytics**.
- It makes **no network requests** at runtime. The single file has no external scripts, images,
  fonts or model calls.
- It does **not** use `localStorage`, `sessionStorage` or IndexedDB.
- The published page is served by GitHub Pages, which cannot set custom response headers; the app is
  designed to be self-contained regardless.

The relevant security surface is therefore small: the dependency supply chain, the static hosting
configuration, and the Content-Security-Policy used when the page is embedded or hosted elsewhere.

## Dependency policy

- Production dependencies are pinned in `package-lock.json` and limited to React, React DOM,
  Scheduler and three.js.
- Dependabot is configured for weekly npm updates and monthly GitHub Actions updates.
- Run `npm audit` and `npm ci` from a clean checkout when reviewing a dependency change.
- Third-party licence texts are recorded in [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt).

## Content-Security-Policy

When hosting the single file outside GitHub Pages, serve it with a restrictive policy, for example:

```text
sandbox allow-scripts; default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'
```

The verification suite runs the build under this policy. GitHub Pages cannot apply it, so the page
is written not to need it; the policy is a defence in depth for embeds and other hosts.

## Disclosure and response

The maintainer aims to acknowledge a report within **7 days** and to publish a fix or mitigation
within **30 days** for a confirmed, in-scope issue. Timelines depend on severity and on upstream
dependencies. Credit is given in the release notes unless the reporter asks to remain anonymous.

## Safe harbour

Good-faith security research that respects privacy, avoids data destruction and does not target
third-party services is welcome. Please give the maintainer a reasonable chance to fix the issue
before public disclosure.
