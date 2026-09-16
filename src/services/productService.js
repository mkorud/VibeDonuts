/**
 * Service produk — satu-satunya pintu masuk data produk dari/ke UI.
 *
 * === TERHUBUNG KE SUPABASE (hari ke-2) ===
 * Semua fungsi kini memanggil tabel `products` di Supabase (PostgreSQL)
 * lewat SDK resmi `@supabase/supabase-js`. Komponen React tidak perlu tahu
 * detailnya — nama fungsi & bentuk data sama persis seperti versi mock.
 *
 * Keamanan (PRD 4.4):
 * - Hanya memakai ANON KEY di browser; SERVICE_ROLE KEY tidak boleh pernah
 *   berada di frontend.
 * - INSERT/UPDATE/DELETE dibatasi Row Level Security di database
 *   (lihat supabase/02_products_policies.sql).
 * - Total bayar & stok tetap divalidasi ulang di sini (sisi "server" MVP).
 *
 * Catatan: riwayat `stock_logs` masih memakai penyimpanan mock sampai
 * tabelnya dibuat di Supabase — tidak memengaruhi fungsi produk.
 */

import { supabase } from '../lib/supabaseClient';
import { slugify } from '../lib/format';
import { LOW_STOCK_THRESHOLD, MAX_STOCK } from '../lib/constants';
import { readTable, writeTable, nextId } from './mockDb';

const TABLE = 'products';

/** Batasi stok: tidak boleh minus, tidak boleh melebihi MAX_STOCK (PRD 4.1). */
export function clampStock(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(Math.max(0, Math.trunc(number)), MAX_STOCK);
}

/**
 * Terjemahkan error Supabase menjadi pesan yang bisa ditindaklanjuti,
 * termasuk petunjuk bila penyebabnya setup database (tabel/RLS).
 */
function translateError(error, fallbackMessage) {
  const code = error?.code ?? '';
  const raw = String(error?.message ?? '');

  if (code === '42P01' || /does not exist|could not find the table/i.test(raw)) {
    return 'Tabel belum ada di Supabase. Jalankan supabase/01_products.sql di SQL Editor.';
  }
  if (code === '42501' || /row-level security|permission denied|jwt/i.test(raw)) {
    return 'Akses diblokir Row Level Security. Jalankan supabase/02_products_policies.sql di SQL Editor.';
  }
  if (code === '23514') {
    return 'Data ditolak database: ada nilai yang melanggar aturan (mis. stok minus, nama terlalu pendek, atau format slug).';
  }
  if (code === '23505') {
    return 'Data duplikat: slug produk sudah dipakai produk lain.';
  }
  if (/failed to fetch|networkerror/i.test(raw)) {
    return 'Tidak bisa terhubung ke Supabase. Periksa koneksi internet Anda.';
  }
  return raw || fallbackMessage;
}

/** Apakah error ini pelanggaran unique constraint pada kolom slug? */
function isDuplicateSlugError(error) {
  return (
    error?.code === '23505' &&
    `${error?.details ?? ''} ${error?.message ?? ''}`.toLowerCase().includes('slug')
  );
}

/** Susun baris sesuai skema Supabase (nama kolom = PRD Bagian 5). */
function toRow(input) {
  return {
    category_id: Number(input.category_id) || null,
    nama: String(input.nama ?? '').trim(),
    deskripsi: String(input.deskripsi ?? '').trim(),
    harga: Math.max(0, Math.trunc(Number(input.harga) || 0)),
    stok: clampStock(input.stok),
    url_foto: String(input.url_foto ?? '').trim(),
    aktif: input.aktif !== false,
  };
}

/** READ — daftar produk, terbaru di atas (katalog & admin). */
export async function fetchProducts({ includeInactive = false } = {}) {
  let query = supabase.from(TABLE).select('*').order('dibuat_pada', { ascending: false });
  if (!includeInactive) query = query.eq('aktif', true);

  const { data, error } = await query;
  if (error) throw new Error(translateError(error, 'Gagal memuat daftar produk.'));
  return data ?? [];
}

/** READ — satu produk berdasarkan id. */
export async function fetchProductById(id) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(translateError(error, 'Gagal memuat produk.'));
  if (!data) throw new Error('Produk tidak ditemukan.');
  return data;
}

/** READ — satu produk berdasarkan slug (halaman /produk/:slug). */
export async function fetchProductBySlug(slug) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('slug', slug).maybeSingle();
  if (error) throw new Error(translateError(error, 'Gagal memuat produk.'));
  if (!data) throw new Error('Produk tidak ditemukan.');
  return data;
}

/** READ — produk aktif dengan stok menipis (ringkasan dashboard, PRD A-2). */
export async function fetchLowStockProducts() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('aktif', true)
    .lte('stok', LOW_STOCK_THRESHOLD)
    .order('stok');

  if (error) throw new Error(translateError(error, 'Gagal memuat produk stok menipis.'));
  return data ?? [];
}

/**
 * INSERT — simpan produk baru (tombol "Simpan Produk" di dashboard admin).
 * Slug dibuat otomatis dari nama; bila duplikat, dicoba lagi dengan akhiran -2, -3, dst.
 */
export async function createProduct(input) {
  const row = toRow(input);
  if (!row.nama) throw new Error('Nama produk wajib diisi.');

  const baseSlug = slugify(row.nama) || 'produk';
  const maxAttempts = 6;
  let lastError = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ ...row, slug })
      .select()
      .single();

    if (!error) return data;

    lastError = error;
    // 23505 + kolom slug = nama tabrakan -> coba slug berikutnya.
    if (!isDuplicateSlugError(error)) {
      throw new Error(translateError(error, 'Gagal menambah produk.'));
    }
  }

  throw new Error(translateError(lastError, 'Slug produk selalu duplikat. Coba nama produk lain.'));
}

/**
 * UPDATE — ubah produk yang sudah ada (formulir "Ubah Produk" & toggle aktif).
 * Mengirim hanya kolom yang berubah; slug dibuat ulang bila nama diganti.
 */
export async function updateProduct(id, input) {
  const previous = await fetchProductById(id);

  const patch = {};
  if (input.category_id !== undefined) patch.category_id = Number(input.category_id) || null;
  if (input.deskripsi !== undefined) patch.deskripsi = String(input.deskripsi).trim();
  if (input.harga !== undefined) patch.harga = Math.max(0, Math.trunc(Number(input.harga) || 0));
  if (input.stok !== undefined) patch.stok = clampStock(input.stok);
  if (input.url_foto !== undefined) patch.url_foto = String(input.url_foto).trim();
  if (input.aktif !== undefined) patch.aktif = Boolean(input.aktif);

  const nextName = String(input.nama ?? previous.nama).trim();
  const renamed = nextName !== previous.nama;
  if (renamed) {
    if (!nextName) throw new Error('Nama produk wajib diisi.');
    patch.nama = nextName;
  }

  if (Object.keys(patch).length === 0) return previous;

  const maxAttempts = renamed ? 6 : 1;
  let lastError = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const payload = { ...patch };
    if (renamed) {
      const baseSlug = slugify(nextName) || 'produk';
      payload.slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (!error) return data;

    lastError = error;
    if (!(renamed && isDuplicateSlugError(error))) {
      throw new Error(translateError(error, 'Gagal menyimpan perubahan produk.'));
    }
  }

  throw new Error(translateError(lastError, 'Slug produk selalu duplikat. Coba nama produk lain.'));
}

/**
 * DELETE — hapus produk permanen dari database (tombol "Hapus Produk").
 * Aksi ini tidak bisa dibatalkan; UI sudah memakai dialog konfirmasi sebelum memanggil sini.
 */
export async function deleteProduct(id) {
  const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select().maybeSingle();

  if (error) throw new Error(translateError(error, 'Gagal menghapus produk.'));
  if (!data) throw new Error('Produk tidak ditemukan atau sudah terhapus.');
  return true;
}

/** UPDATE — aktif/nonaktifkan produk tanpa menghapusnya (A-3). */
export async function toggleProductActive(id) {
  const product = await fetchProductById(id);
  return updateProduct(id, { aktif: !product.aktif });
}

/**
 * UPDATE — ubah stok manual (A-4). Admin mengisi JUMLAH AKHIR, bukan selisih.
 * Riwayat perubahan dicatat ke `stock_logs` (masih mock sampai tabelnya dibuat).
 */
export async function updateStock(
  id,
  newStock,
  { reason = 'Penyesuaian stok manual', userId = null } = {},
) {
  const previous = await fetchProductById(id);
  const stokSesudah = clampStock(newStock);
  const selisih = stokSesudah - previous.stok;

  if (selisih === 0) return previous;

  const { data, error } = await supabase
    .from(TABLE)
    .update({ stok: stokSesudah })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(translateError(error, 'Gagal mengubah stok.'));

  // Riwayat stok (mock) — ganti ke Supabase setelah tabel stock_logs dibuat.
  const logs = readTable('stockLogs');
  writeTable('stockLogs', [
    ...logs,
    {
      id: nextId(logs),
      product_id: previous.id,
      perubahan: selisih,
      stok_sebelum: previous.stok,
      stok_sesudah: stokSesudah,
      alasan: reason,
      user_id: userId,
      dibuat_pada: new Date().toISOString(),
    },
  ]);

  return data;
}

/** READ — riwayat perubahan stok (masih mock, lihat catatan di atas). */
export async function fetchStockLogs(productId = null) {
  const logs = readTable('stockLogs');
  const filtered = productId
    ? logs.filter((log) => String(log.product_id) === String(productId))
    : logs;
  return [...filtered].sort((a, b) => new Date(b.dibuat_pada) - new Date(a.dibuat_pada));
}


