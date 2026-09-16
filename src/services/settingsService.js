/**
 * Service pengaturan toko (PRD A-7) — TERHUBUNG KE SUPABASE (tabel `settings`).
 *
 * Penting: nilai ongkos kirim di tabel ini dipakai LANGSUNG oleh fungsi
 * `vd_create_order` di database, sehingga perubahan dari halaman
 * "Pengaturan Toko" langsung berlaku untuk pesanan baru (tanpa deploy ulang).
 *
 * Di frontend disimpan sebagai objek; di database berupa pasangan kunci-nilai.
 */

import { supabase } from '../lib/supabaseClient';
import { DEFAULT_SETTINGS } from '../lib/constants';

const TABLE = 'settings';

/** READ — gabungkan isi tabel dengan nilai default agar tidak ada kolom kosong. */
export async function fetchSettings() {
  const { data, error } = await supabase.from(TABLE).select('kunci,nilai');

  if (error) {
    // Tabel belum dibuat / RLS memblokir → pakai nilai default agar UI tetap jalan.
    console.warn(
      '[settingsService] Gagal memuat pengaturan dari Supabase, memakai nilai default:',
      error.message,
    );
    return { ...DEFAULT_SETTINGS };
  }

  const mapped = Object.fromEntries((data ?? []).map((row) => [row.kunci, row.nilai]));
  return { ...DEFAULT_SETTINGS, ...mapped };
}

/** UPDATE — simpan perubahan admin (upsert per kunci). */
export async function updateSettings(patch) {
  const entries = Object.entries(patch ?? {}).filter(([, nilai]) => nilai !== undefined);
  if (entries.length === 0) return fetchSettings();

  const rows = entries.map(([kunci, nilai]) => ({ kunci, nilai: String(nilai) }));

  const { error } = await supabase.from(TABLE).upsert(rows, { onConflict: 'kunci' });

  if (error) {
    if (error.code === '42501' || /row-level security/i.test(String(error.message))) {
      throw new Error(
        'Pengaturan tidak bisa disimpan: peran admin belum terpasang di database. Jalankan `select public.vd_grant_admin(\'email-anda@gmail.com\');` di SQL Editor, lalu keluar & masuk kembali.',
      );
    }
    throw new Error(error.message ?? 'Gagal menyimpan pengaturan.');
  }

  return fetchSettings();
}
