// Visual check: serves dist/ and writes a handful of screenshots to shots/.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync, mkdirSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { chromium } from 'playwright-core'

const root = resolve('dist')
const out = resolve('shots')
mkdirSync(out, { recursive: true })
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' }
const server = createServer(async (req, res) => {
  const path = (req.url ?? '/').split('?')[0]
  const file = path === '/' ? join(root, 'index.html') : join(root, path)
  try {
    const body = await readFile(file)
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' }).end(body)
  } catch {
    res.writeHead(404).end()
  }
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}/`
let playwrightChrome = ''
try {
  playwrightChrome = chromium.executablePath()
} catch {
  playwrightChrome = ''
}
const chrome = [
  process.env.CHROME_PATH,
  playwrightChrome,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].find((candidate) => candidate && existsSync(candidate))
if (!chrome) {
  console.error('Chrome not found. Install Chrome/Chromium or set CHROME_PATH.')
  process.exit(1)
}
const browser = await chromium.launch({
  executablePath: chrome,
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage({ viewport: { width: 1500, height: 860 } })
page.setDefaultTimeout(120000)
await page.emulateMedia({ reducedMotion: 'reduce' })
page.on('console', (m) => console.log('console', m.type(), m.text()))
page.on('pageerror', (e) => console.log('pageerror', e.message))
await page.goto(`${base}?capture=1`, { waitUntil: 'load' })
await page.waitForFunction(() => window.__scene?.ready === true, null, { timeout: 120000 })
const step = (n) => page.evaluate((count) => window.__scene.step(count), n)
await step(4)
await page.screenshot({ path: join(out, 'day.png') })
const facts = await page.evaluate(() => window.__scene.inspect().facts)
console.log('facts', facts)
for (const id of ['grand-palace', 'wat-arun', 'wat-pho', 'giant-swing', 'golden-mount', 'baiyoke', 'mahanakhon', 'rama-viii']) {
  await page.evaluate((landmark) => window.__scene.act('landmark', landmark), id)
  await step(2)
  await page.screenshot({ path: join(out, `${id}.png`) })
}
await page.evaluate(() => window.__scene.act('night', true))
await step(2)
await page.screenshot({ path: join(out, 'night.png') })
await page.evaluate(() => window.__scene.act('reset'))
await step(2)
await page.screenshot({ path: join(out, 'night-overview.png') })
await browser.close()
server.close()
