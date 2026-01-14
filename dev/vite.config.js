import { defineConfig } from 'vite';
import { Buffer } from 'buffer';
import path from 'path';

export default defineConfig({
  root: '..',
  base: '/music-library/',
  build: {
    outDir: 'dev/tmp/dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, '..', 'index.html')
      }
    }
  },
  publicDir: 'dev/tmp/public',
  server: {
    port: 8000
  },
  define: {
    'global': 'globalThis',
    'Buffer': 'Buffer',
  },
  resolve: {
    alias: {
      buffer: path.resolve(__dirname, 'node_modules', 'buffer'),
      'music-metadata': path.resolve(__dirname, 'node_modules', 'music-metadata')
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
});
