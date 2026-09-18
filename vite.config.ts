import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true, // 0.0.0.0      // allow access from network (important if using WiFi/LAN)
    port: 3003,      // 👉 change to your port (e.g. 8002, 5173, etc.)
    strictPort: true // optional: fail if port is already in use
  }
})