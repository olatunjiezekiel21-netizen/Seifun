import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Root path for Netlify deployment
  define: {
    // Prevent leaking OpenAI key into client bundle even if set in env
    'import.meta.env.VITE_OPENAI_API_KEY': '""'
  },
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
    exclude: [
      'lucide-react',
      // Exclude server-only deps from pre-bundling
      '@netlify/functions',
      'mongodb',
      'openai',
      'dotenv',
      // Some SDKs may ship mixed env code; exclude to avoid prebundle errors
      'symphony-sdk',
      'symphony-sdk/viem'
    ],
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
      external: [
        'react/jsx-runtime',
        // Externalize server-only and node builtins to prevent client bundle errors
        '@netlify/functions',
        'mongodb',
        'openai',
        'dotenv',
        'symphony-sdk',
        'symphony-sdk/viem',
        'fs', 'path', 'net', 'tls', 'crypto', 'http', 'https', 'zlib', 'stream', 'url', 'util',
        'bufferutil', 'utf-8-validate', 'canvas'
      ],
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
