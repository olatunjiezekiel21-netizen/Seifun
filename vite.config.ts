import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Root path for Netlify deployment
  resolve: {
    alias: {
      // Fix Netlify build: some plugins require('uniqBy')
      // Map it to lodash.uniqby implementation
      'uniqBy': 'lodash.uniqby',
      'uniqby': 'lodash.uniqby',
      // Alias node-sass to sass to avoid requiring deprecated binary
      'node-sass': 'sass'
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable sourcemaps for production
    minify: 'terser', // Better minification
    terserOptions: {
      compress: {
        drop_console: false, // Keep console.log statements
        drop_debugger: false
      }
    },
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
