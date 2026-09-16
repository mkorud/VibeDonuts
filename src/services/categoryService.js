/**
 * Service kategori (PRD A-5: tambah / ubah / hapus kategori donat).
 * Kontrak data sama dengan tabel `categories` di Supabase.
 *
 * Fungsi `fetchCategories` sengaja TIDAK melempar error bila tabel
 * `categories` belum dibuat di Supabase — ia mundur memakai kategori bawaan
 * supaya katalog tetap berfungsi (filter & nama kategori di kartu produk).
 */

import { supabase } from '../lib/supabaseClient';
import { slugify } from '../lib/format';
import { seedCategories } from '../data/seed';

const TABLE = 'categories';

/** Kategori bawaan (dipakai bila tabel belum siap). */
function fallbackCategories() {
  return [...seedCategories].sort((a, b) => a.nama.localeCompare(b.nama));
}

/** READ — ambil semua kategori (dengan fallback aman). */
export async function fetchCategories() {
  const { data, error } = await supabase.from(TABLE).select('*').order('nama');

  if (error) {
    console.warn(
      '[categoryService] Kategori diambil dari data bawaan. Penyebab:',
      error.message,
      '— Buat tabel `categories` di Supabase untuk memakai data asli.',
    );
    return fallbackCategories();
  }

  return data ?? [];
}

/** INSERT — tambah kategori baru. */
export async function createCategory(nama) {
  const trimmed = String(nama ?? '').trim();
  if (!trimmed) throw new Error('Nama kategori wajib diisi.');

  const slug = slugify(trimmed);
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ nama: trimmed, slug })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error(`Kategori "${trimmed}" sudah ada.`);
    throw new Error(error.message ?? 'Gagal menambah kategori.');
  }
  return data;
}

/** UPDATE — ubah nama kategori. */
export async function updateCategory(id, nama) {
  const trimmed = String(nama ?? '').trim();
  if (!trimmed) throw new Error('Nama kategori wajib diisi.');

  const { data, error } = await supabase
    .from(TABLE)
    .update({ nama: trimmed, slug: slugify(trimmed) })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message ?? 'Gagal mengubah kategori.');
  if (!data) throw new Error('Kategori tidak ditemukan.');
  return data;
}

/** DELETE — hapus kategori (biarkan database menolak bila masih dipakai produk). */
export async function deleteCategory(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);

  if (error) {
    if (error.code === '23503') {
      throw new Error('Kategori masih dipakai oleh produk. Pindahkan produknya dulu.');
    }
    throw new Error(error.message ?? 'Gagal menghapus kategori.');
  }
  return true;
}
