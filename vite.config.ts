import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Minimal type shim so vite.config.ts can read env vars without pulling in
// @types/node just for one field. The workflow sets VITE_BASE='/LightX/'.
declare const process: { env: Record<string, string | undefined> };

/**
 * `base` can be overridden at build time via VITE_BASE (defaults to '/' for
 * local dev + self-hosting; the GitHub Pages workflow sets it to '/LightX/').
 */
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
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
