import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// One JS chunk and one CSS file, with every asset inlined, so the single-file build is trivial.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2022',
    modulePreload: { polyfill: false },
    cssCodeSplit: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
})
