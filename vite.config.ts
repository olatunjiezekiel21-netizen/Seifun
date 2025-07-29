import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Root path for Netlify deployment
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable sourcemaps for production
    minify: 'terser', // Better minification
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ethers: ['ethers'],
          icons: ['lucide-react']
        }
      }
    }
  },
  server: {
    port: 8080,
    host: true
  },
  preview: {
    port: 8080,
    host: true
  }
});
