import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    allowedHosts: ['dienert-mbp']
  },
  preview: {
    allowedHosts: ['dienert-mbp']
  },
  optimizeDeps: {
    include: ['date-fns', 'date-fns/locale', 'react-is']
  }
})
