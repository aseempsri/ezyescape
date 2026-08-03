import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS === 'true' ? '/ezyescape/' : '/',
  server: {
    proxy: {
      '/auth': 'http://localhost:3002',
      '/api': 'http://localhost:3002',
      '/uploads': 'http://localhost:3002',
      '/health': 'http://localhost:3002',
    },
  },
})
