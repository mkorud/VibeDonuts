/**
 * Pembungkus localStorage yang aman.
 * Dipakai untuk K-2 (keranjang bertahan saat refresh) dan status login admin.
 */

const PREFIX = 'vibedonuts';

export const STORAGE_KEYS = {
  cart: `${PREFIX}.cart.v1`,
  auth: `${PREFIX}.auth.v1`,
  products: `${PREFIX}.products.v1`,
  categories: `${PREFIX}.categories.v1`,
  orders: `${PREFIX}.orders.v1`,
  stockLogs: `${PREFIX}.stockLogs.v1`,
  settings: `${PREFIX}.settings.v1`,
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/** Baca nilai dari localStorage, kembalikan `fallback` bila kosong/rusak. */
export function readStorage(key, fallback = null) {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    // Data lama yang korup bisa berupa "null"/"undefined" - perlakukan seperti kosong
    // agar aplikasi tidak crash saat render pertama (layar putih).
    if (parsed === null || parsed === undefined) return fallback;
    return parsed;
  } catch (error) {
    console.warn(`[storage] Gagal membaca "${key}":`, error);
    return fallback;
  }
}

/** Simpan nilai ke localStorage (gagal secara diam-diam bila storage penuh/private mode). */
export function writeStorage(key, value) {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[storage] Gagal menyimpan "${key}":`, error);
    return false;
  }
}

/** Hapus satu key dari localStorage. */
export function removeStorage(key) {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[storage] Gagal menghapus "${key}":`, error);
  }
}
