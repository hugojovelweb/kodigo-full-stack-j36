import { defineConfig } from 'vite';

// Configuracion minima de Vite: usamos TypeScript vanilla, sin frameworks de UI.
export default defineConfig({
  root: '.',
  base: './',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
