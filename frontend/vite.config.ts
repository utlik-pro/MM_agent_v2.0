import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Ensure iframe compatibility
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 3000,
    cors: true,
  },
  define: {
    global: 'globalThis',
  },
}) 