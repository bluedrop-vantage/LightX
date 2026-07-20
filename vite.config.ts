import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  worker: {
    format: 'es',
  },
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('katex')) return 'katex';
            if (id.includes('three')) return 'three';
            if (id.includes('react-dom') || id.includes('scheduler')) return 'react';
            if (id.includes('/react/')) return 'react';
            if (id.includes('zustand') || id.includes('use-sync-external-store')) return 'state';
            if (id.includes('comlink')) return 'workers';
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
});
