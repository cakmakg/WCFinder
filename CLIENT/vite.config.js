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
    // Not: Frontend direkt http://localhost:8000/api kullanıyor, proxy gerekmiyor
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8000',
    //     changeOrigin: true,
    //   },
    // },
  },
  
  // ✅ Build ayarları (SEO & Performance optimizasyonları)
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development', // Production'da kapalı
    minify: 'terser', // Daha iyi minification
    terserOptions: {
      compress: {
        drop_console: false, // ✅ DEBUG: Console log'ları her zaman göster
        drop_debugger: false, // ✅ DEBUG: Debugger'ları da göster
        // Production'da event handler'ların bozulmasını önle
        keep_fnames: true, // Function isimlerini koru (debug için)
        keep_classnames: true, // Class isimlerini koru
      },
      mangle: {
        // Production'da minification sırasında event handler'ları bozma
        keep_fnames: true, // Function isimlerini koru
        keep_classnames: true, // Class isimlerini koru
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk'ları ayır (cache için)
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          leaflet: ['leaflet', 'react-leaflet'],
        },
      },
    },
    // Chunk size uyarıları
    chunkSizeWarningLimit: 1000,
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
