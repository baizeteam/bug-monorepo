import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: process.env.VITE_BASE || '/',
  resolve: {
    alias: {
      // 本机 vue-demi 依赖损坏时，使用 shim 兼容 vueuse 在 Vue3 下的运行
      'vue-demi': fileURLToPath(new URL('./src/shims/vue-demi.ts', import.meta.url)),
    },
  },
  server: { port: 4000 },
  optimizeDeps: {
    exclude: ['@bug/shared'],
  },
})