import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  if (mode === 'development') {
    // Chạy LAN
    return {
      plugins: [vue()],
      server: {
        host: "0.0.0.0",
        port: 5173
      }
    }
  } else {
    // Build deploy GitHub Pages
    return {
      plugins: [vue()],
      base: '/HoangAnh/'   // 👈 repo name của bạn
    }
  }
})
