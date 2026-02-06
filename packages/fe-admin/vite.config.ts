import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: process.env.VITE_BASE || '/',
  server: { port: 4000 },
  optimizeDeps: {
    exclude: ['@bug/shared'],
  },
})