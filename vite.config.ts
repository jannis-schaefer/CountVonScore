import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    // Serve SW and manifest without transformation
    middlewareMode: false,
  },
  build: {
    rollupOptions: {
      input: {
        main: '/index.html',
      },
    },
    // Copy service worker and manifest to dist
    copyPublicDir: true,
  },
})
