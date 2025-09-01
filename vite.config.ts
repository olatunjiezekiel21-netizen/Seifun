import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import replace from '@rollup/plugin-replace';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Workaround: some transitive deps ship PURE annotations Rollup chokes on
    // Strip those comments in problematic packages during bundling
    replace({
      preventAssignment: true,
      values: {
        '/*#__PURE__*/': ''
      },
      delimiters: ['', ''],
      include: [
        /node_modules\/@reown\/appkit.*/,
        /node_modules\/@walletconnect.*/,
        /node_modules\/ox\/_esm\/.*/
      ]
    })
  ],
  base: '/', // Root path for Netlify deployment
  define: {
    // Prevent leaking OpenAI key into client bundle even if set in env
    'import.meta.env.VITE_OPENAI_API_KEY': '""',
    // Define global variables for Node.js compatibility
    global: 'globalThis',
    'process.env': 'process.env'
  },
  resolve: {
    alias: {
      // Fix Netlify build: some plugins require('uniqBy')
      // Map it to lodash.uniqby implementation
      'uniqBy': 'lodash.uniqby',
      'uniqby': 'lodash.uniqby',
      // Alias node-sass to sass to avoid requiring deprecated binary
      'node-sass': 'sass',
      // Node.js polyfills for browser environment
      'fs': 'memfs',
      'path': 'path-browserify',
      'crypto': 'crypto-browserify',
      'stream': 'stream-browserify',
      'util': 'util',
      'buffer': 'buffer',
      'process': 'process/browser'
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
    // Use default esbuild minifier to avoid Rollup/terser annotation issues
    rollupOptions: {
      external: [
        // Externalize server-only and node builtins to prevent client bundle errors
        '@netlify/functions',
        'mongodb',
        'openai',
        'dotenv',
        'net', 'tls', 'http', 'https', 'zlib', 'url'
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
