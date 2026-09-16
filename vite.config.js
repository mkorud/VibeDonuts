import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Konfigurasi Vite + React 19 + Tailwind CSS v4.
// Plugin Tailwind v4 menggantikan postcss.config.js / tailwind.config.js lama.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
