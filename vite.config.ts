import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
const API_TARGET = process.env.VITE_DEV_API_TARGET ?? 'http://localhost:4000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': API_TARGET,
      '/uploads': API_TARGET,
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules')) {
            if (/three|@react-three/.test(id)) return 'three-vendor'
          }
        },
      },
    },
  },
})
