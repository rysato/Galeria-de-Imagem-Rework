import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/upload': 'http://localhost:3000',
      '/images': 'http://localhost:3000',
      '/debug': 'http://localhost:3000'
    }
  }
})