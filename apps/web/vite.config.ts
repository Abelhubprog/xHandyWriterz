import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    // Static definitions only - no dynamic env processing
    'global': 'window'
  },
  optimizeDeps: {
    exclude: ['@reown/appkit', '@reown/appkit-adapter-wagmi'],
    include: ['react', 'react-dom', 'react-router-dom']
  },
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: true,
    cors: true,
    hmr: {
      port: 5173,
      host: 'localhost',
      overlay: true,
      protocol: 'ws'
    },
    fs: {
      strict: false
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    proxy: {
      '/api': {
        target: 'https://ahandywriterz-production.up.railway.app',  // Production Strapi
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
});
