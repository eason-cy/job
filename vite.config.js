import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  server: {
    port: 8888,
    host: 'localhost',  // 只监听 localhost，避免多地址访问导致数据隔离
    open: 'http://localhost:8888'  // 强制使用 localhost 打开
  }
})