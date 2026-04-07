import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router'],
          elementPlus: ['element-plus', '@element-plus/icons-vue'],
          echarts: ['echarts']
        }
      }
    }
  },
  base: '/',
  server: {
    port: 8888,
    host: 'localhost',
    open: 'http://localhost:8888'
  },
  test: {
    environment: 'jsdom'
  }
})
