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
    emptyOutDir: true,
    sourcemap: false,
    // Chunk per-halaman sudah dipecah lewat React.lazy di App.jsx (bukti: log
    // build memuat chunk terpisah per halaman). Ambang 600 kB dipilih karena
    // chunk entry memuat inti aplikasi (React, Supabase, router) yang memang
    // dibutuhkan semua halaman — bukan kode yang belum dipecah.
    chunkSizeWarningLimit: 600,
  },
});
