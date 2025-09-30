import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // By default, `loadEnv` loads `.env`, `.env.local`, `.env.[mode]`
  const env = loadEnv(mode, process.cwd());

  // Should we enable WebSockets? Default to true if not specified
  const enableWebsocket = env.VITE_ENABLE_WEBSOCKET !== 'false';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,  // Fail if port is already in use
      host: true,        // Listen on all addresses
      open: true,        // Open browser on server start
      cors: true,        // Enable CORS for all origins
      hmr: enableWebsocket
        ? {
            protocol: 'ws',
            host: 'localhost',
            port: 5173,
            clientPort: 5173, // Ensure client connects to correct port
            timeout: 5000     // Increase timeout for slower connections
          }
        : false
    },
    build: {
      outDir: 'dist',
      target: 'es2018',
      sourcemap: true,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    }
  };
});
