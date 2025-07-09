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
    // Optimize for production
    minify: 'terser',
    target: 'es2020',
    sourcemap: false,
  },
  server: {
    port: 3000,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8765',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  preview: {
    port: 3000,
    cors: true,
  },
  define: {
    global: 'globalThis',
  },
  base: '/',
}) 