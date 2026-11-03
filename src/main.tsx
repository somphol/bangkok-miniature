import { createRoot } from 'react-dom/client'
import App from './App'
import { STRINGS, normaliseLang } from './i18n'
import './style.css'

function hasWebGL2() {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

const lang = normaliseLang(new URLSearchParams(window.location.search).get('lang'))
const root = createRoot(document.getElementById('root')!)
if (hasWebGL2()) {
  root.render(<App />)
} else {
  root.render(<p className="webgl-missing">{STRINGS[lang].webglMissing}</p>)
}
