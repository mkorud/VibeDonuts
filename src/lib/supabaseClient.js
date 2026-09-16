/**
 * Klien Supabase (satu instance untuk seluruh aplikasi).
 *
 * Keamanan (PRD 4.4):
 * - Kredensial disimpan di file `.env` (di-gitignore), bukan di dalam kode.
 *   Vite hanya mengekspos variabel berawalan `VITE_` ke browser.
 * - Yang dipakai HANYA `anon key` — kunci ini memang dirancang publik dan
 *   pengaman sebenarnya ada di Row Level Security (RLS) sisi database
 *   (lihat supabase/02_products_policies.sql).
 * - SERVICE_ROLE KEY tidak boleh pernah diletakkan di frontend.
 * - MVP belum memakai Supabase Auth, jadi sesi tidak dipersistensi.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Gagal cepat & pesan jelas agar tidak bingung saat layar kosong.
  throw new Error(
    'Konfigurasi Supabase belum lengkap. Salin .env.example menjadi .env lalu isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Sesi disimpan aman di browser (localStorage) + token diperbarui otomatis.
    // Kredensial kredensial rahasia tetap milik Supabase; yang tersimpan hanya token sesi.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
