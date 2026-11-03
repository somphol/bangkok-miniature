// Folds the Vite build into one self-contained HTML file with no external requests.
//   node scripts/inline-build.mjs [dist] [out]
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const dist = resolve(process.argv[2] ?? 'dist')
const out = resolve(process.argv[3] ?? 'dist-single/index.html')
const index = join(dist, 'index.html')
if (!existsSync(index)) {
  console.error(`Missing ${index}: run npm run build first.`)
  process.exit(1)
}
const html = readFileSync(index, 'utf8')
const scriptTag = /<script type="module" crossorigin src="\.\/assets\/([^"]+\.js)"><\/script>/
const styleTag = /<link rel="stylesheet" crossorigin href="\.\/assets\/([^"]+\.css)">/
const script = html.match(scriptTag)
const style = html.match(styleTag)
if (!script) {
  console.error('Could not find the single module script in dist/index.html.')
  process.exit(1)
}
const escapeScript = (text) => text.replace(/<\/script/gi, () => '<\\/script').replace(/<!--/g, () => '\\x3C!--')
const escapeStyle = (text) => text.replace(/<\/style/gi, () => '<\\/style')
const js = escapeScript(readFileSync(join(dist, 'assets', script[1]), 'utf8'))
const css = style ? escapeStyle(readFileSync(join(dist, 'assets', style[1]), 'utf8')) : ''
let single = html.replace(scriptTag, () => `<script type="module">${js}</script>`)
if (style) single = single.replace(styleTag, () => `<style>${css}</style>`)
if (/<script\b[^>]*\ssrc=/i.test(single) || /<link\b[^>]*rel=["']?stylesheet/i.test(single)) {
  console.error('The inlined file still references an external script or stylesheet.')
  process.exit(1)
}
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, single)
const sha = createHash('sha256').update(single).digest('hex').slice(0, 16)
console.log(`Wrote ${out}: ${Buffer.byteLength(single)} bytes, sha256 ${sha}`)
