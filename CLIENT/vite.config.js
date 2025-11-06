// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ✅ Server ayarları
  server: {
    port: 5173, // Frontend port
    open: true, // Browser'ı otomatik aç
    
    // ✅ API Proxy (Opsiyonel ama önerilir)
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  
  // ✅ Build ayarları
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  
  // ✅ Path alias (opsiyonel - import kolaylığı için)
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@services': '/src/services',
      '@pages': '/src/pages',
    },
  },
})
