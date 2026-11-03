# Deployment

The published site is a single static HTML file. There is no server, build step at request time, or
runtime API.

- Repository: <https://github.com/somphol/bangkok-miniature>
- Live site: <https://somphol.github.io/bangkok-miniature/>
- Pages source: `main` branch, `/docs` folder
- Published file: `docs/index.html`
- Local build: `dist-single/index.html`

## Build the deployable file

```sh
npm ci
npm test
npm run build:single
cp dist-single/index.html docs/index.html
```

`npm run build:single` runs the typecheck, the Vite build and `scripts/inline-build.mjs`. The result
is one HTML file with the JS and CSS inlined. `docs/index.html` is the copy GitHub Pages serves;
`dist-single/` is ignored by git.

Keep `docs/.nojekyll` in place. It stops GitHub Pages from running Jekyll on the folder; the app is
already a static file and does not need processing.

## GitHub Pages setup

In the repository: **Settings → Pages → Build and deployment → Deploy from a branch**, then choose
`main` and `/docs`. The first build takes a minute; later pushes to `main` rebuild automatically.

The repository's homepage is set to the Pages URL. If you fork the project, update the homepage and
the links in the README.

## Content-Security-Policy

GitHub Pages cannot set response headers. The page is written to be self-contained, and the
verification suite runs it under a strict policy:

```text
sandbox allow-scripts; default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'
```

If you host the file somewhere that can set headers (Netlify, Cloudflare Pages, an object store with
a header rule), add that policy. The `sandbox` directive makes the page an opaque origin, so the app
hides downloads and fullscreen and skips the URL update when the language is switched; the scene
itself still works.

## Caching and updates

The file name is stable, so a browser or CDN may cache the old build. After a deploy:

- check the Pages build status in the repository's Actions/Pages panel;
- hard-refresh, or append a query string such as `?v=0.1.0`;
- for a CDN, purge the path or use a short cache TTL for `index.html`.

The scene itself has no versioned API and no service worker, so there is no cache migration to
handle.

## Custom domain

1. Add a `CNAME` file to `docs/` containing the domain.
2. Configure the DNS record at the registrar.
3. Set the custom domain in **Settings → Pages** and enable HTTPS.

Do not add a CNAME to the repository unless the domain is actually configured; it would break the
default Pages URL.

## Rollback

The site is a single file in git. To roll back:

```sh
git revert <bad-commit>
git push origin main
```

Pages rebuilds from the new commit. Alternatively, restore `docs/index.html` from the last known
good commit and push. The local `dist-single/index.html` is not tracked, so always rebuild it from
the source commit you intend to deploy.

## Release checklist

1. `npm test`
2. `npm run typecheck`
3. `npm run build:single`
4. `npm run verify`
5. `cp dist-single/index.html docs/index.html`
6. Commit and push `main`
7. Confirm the Pages build reports `built`
8. Load the live URL in a browser and in headless Chrome
