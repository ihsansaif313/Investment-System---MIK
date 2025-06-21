import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: false,
    chunkSizeWarningLimit: 3000
  },
  server: {
    port: 3000,
    host: true
  },
  preview: {
    port: 5173,
    host: true
  }
})
