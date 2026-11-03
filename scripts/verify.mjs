// Deterministic interaction check for the single-file build: drives window.__scene in capture
// mode and advances virtual time, so results do not depend on frame rate or a GPU.
import { existsSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { chromium } from 'playwright-core'

const file = process.argv[2] ?? 'dist-single/index.html'
let html
try {
  html = readFileSync(file)
} catch {
  console.error(`Missing ${file}: run npm run build:single first.`)
  process.exit(1)
}
const server = createServer((req, res) => {
  const path = (req.url ?? '/').split('?')[0]
  if (path !== '/' && path !== '/index.html') {
    res.writeHead(404).end()
    return
  }
  res
    .writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      'content-security-policy':
        "sandbox allow-scripts; default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'",
    })
    .end(html)
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
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

const checks = []
const check = (id, ok, value) => {
  checks.push({ id, ok: !!ok, value })
  if (!ok) console.log('FAIL', id, JSON.stringify(value))
}
const targets = {
  'grand-palace': [2.35, 1.9, -7.4],
  'wat-arun': [-2.3, 2.2, -6.8],
  'wat-pho': [2.2, 1.5, -4.3],
  'giant-swing': [2.2, 1.9, -2.0],
  'golden-mount': [3.0, 1.8, 0.0],
  baiyoke: [2.4, 4.5, 2.6],
  mahanakhon: [2.9, 4.2, 6.4],
  'rama-viii': [-0.35, 2.2, -13.6],
}
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
const errors = []
let external = 0

const page = await browser.newPage({ viewport: { width: 1200, height: 720 } })
page.setDefaultTimeout(120000)
await page.emulateMedia({ reducedMotion: 'reduce' })
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('request', (request) => {
  if (!request.url().startsWith(base) && !request.url().startsWith('data:')) external++
})
await page.goto(`${base}?capture=1`, { waitUntil: 'load' })
await page.waitForFunction(() => window.__scene?.ready === true, null, { timeout: 120000 })
const step = (frames = 2) => page.evaluate((count) => window.__scene.step(count), frames)
const act = (name, arg) => page.evaluate(([n, a]) => window.__scene.act(n, a), [name, arg])
const inspect = () => page.evaluate(() => window.__scene.inspect())

await step(2)
let facts = (await inspect()).facts
check('facts', facts.landmarks === 8 && facts.roadEdges > 800 && facts.vehicles > 20 && facts.boats === 3 && facts.buildings > 100, facts)
check('geometry-budget', facts.triangles > 100000 && facts.triangles < 2000000 && facts.drawCalls < 400, facts)

for (const [id, target] of Object.entries(targets)) {
  await act('landmark', id)
  await step(2)
  const result = await page.evaluate(() => ({
    state: window.__scene.inspect().state,
    chosen: document.querySelector('.landmark-buttons button.chosen')?.getAttribute('data-landmark'),
    card: document.querySelector('.landmark-info h2')?.textContent ?? '',
    pressed: document.querySelector('.landmark-buttons button[aria-pressed="true"]')?.getAttribute('data-landmark'),
  }))
  check(
    `landmark-${id}`,
    result.state.selected === id &&
      result.chosen === id &&
      result.pressed === id &&
      dist(result.state.target, target) < 0.05 &&
      !result.state.transition &&
      result.state.cameraClear,
    {
      target: result.state.target.map((value) => Math.round(value * 100) / 100),
      expected: target,
      chosen: result.chosen,
      pressed: result.pressed,
      clear: result.state.cameraClear,
    },
  )
}

await act('night', true)
await step(2)
let state = (await inspect()).state
check('night', state.night > 0.9 && state.targetNight === 1, { night: state.night })
await act('night', false)
await step(2)
state = (await inspect()).state
check('day', state.night < 0.1 && state.targetNight === 0, { night: state.night })

await act('reset')
await step(2)
state = (await inspect()).state
check('reset', state.selected === null && !state.transition && dist(state.target, [0, 1.1, 0]) < 0.15, state.target)

const beforeZoom = state.distance
await act('zoom', 0.8)
await step(2)
state = (await inspect()).state
check('zoom', state.distance < beforeZoom - 0.5, { before: beforeZoom, after: state.distance })

const beforeOrbit = state.azimuth
await act('orbit', [0.3, 0])
await step(2)
state = (await inspect()).state
check('orbit', Math.abs(state.azimuth - beforeOrbit) > 0.2, { before: beforeOrbit, after: state.azimuth })

const beforePan = state.target
await act('pan', [0.3, 0])
await step(2)
state = (await inspect()).state
check('pan', Math.hypot(state.target[0] - beforePan[0], state.target[2] - beforePan[2]) > 0.2, { before: beforePan, after: state.target })

await act('rotate', true)
const rotateStart = (await inspect()).state.azimuth
await step(30)
state = (await inspect()).state
check('rotate', Math.abs(state.azimuth - rotateStart) > 0.01 && state.rotating, { before: rotateStart, after: state.azimuth })
await act('rotate', false)

check('no-console-errors', errors.length === 0, errors.slice(0, 3))
check('no-external-requests', external === 0, external)
await page.close()

// Thai locale.
const thai = await browser.newPage({ viewport: { width: 1200, height: 720 } })
thai.setDefaultTimeout(120000)
await thai.emulateMedia({ reducedMotion: 'reduce' })
await thai.goto(`${base}?capture=1&lang=th`, { waitUntil: 'load' })
await thai.waitForFunction(() => window.__scene?.ready === true, null, { timeout: 120000 })
const thaiText = await thai.evaluate(() => ({
  title: document.title,
  label: document.querySelector('.landmark-bar')?.textContent ?? '',
  intro: document.querySelector('.intro h1')?.textContent ?? '',
}))
check('locale-th', /กรุงเทพ/.test(thaiText.title) && /แลนด์มาร์ก/.test(thaiText.label) && /กรุงเทพ/.test(thaiText.intro), thaiText)
await thai.close()

// English locale.
const english = await browser.newPage({ viewport: { width: 1200, height: 720 } })
english.setDefaultTimeout(120000)
await english.goto(`${base}?capture=1&lang=en`, { waitUntil: 'load' })
await english.waitForFunction(() => window.__scene?.ready === true, null, { timeout: 120000 })
const englishText = await english.evaluate(() => ({
  title: document.title,
  label: document.querySelector('.landmark-bar')?.textContent ?? '',
}))
check('locale-en', /Bangkok Miniature/.test(englishText.title) && /A FEW CITY ICONS/.test(englishText.label), englishText)
await english.close()

// The 345×345 embed: no header/intro, every visible control inside the frame.
const embed = await browser.newPage({ viewport: { width: 345, height: 345 }, hasTouch: true })
embed.setDefaultTimeout(120000)
await embed.emulateMedia({ reducedMotion: 'reduce' })
await embed.goto(`${base}?capture=1&embed=1`, { waitUntil: 'load' })
await embed.waitForFunction(() => window.__scene?.ready === true, null, { timeout: 120000 })
const embedState = await embed.evaluate(() => {
  const hidden = !document.querySelector('header') && !document.querySelector('.intro')
  const buttons = [...document.querySelectorAll('button')].filter((button) => button.offsetParent)
  const inside = buttons.every((button) => {
    const rect = button.getBoundingClientRect()
    return rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight
  })
  return {
    hidden,
    layout: document.body.dataset.layout,
    buttons: buttons.length,
    landmarks: document.querySelectorAll('.landmark-buttons button').length,
    inside,
  }
})
check('embed-345', embedState.hidden && embedState.layout === 'compact' && embedState.landmarks === 8 && embedState.buttons >= 8 && embedState.inside, embedState)
await embed.close()

await browser.close()
server.close()
const passed = checks.filter((item) => item.ok).length
console.log(`\n${passed}/${checks.length} checks passed`)
if (passed !== checks.length) process.exitCode = 1
