/**
 * Kupon promo — Mini-Challenge Kelulusan (PRD: "Fitur Tambahan").
 *
 * Daftar di sini adalah SUMBER VALIDASI SISI KLIEN (umpan balik instan di UI).
 * Saat checkout, kode kupon dikirim ke database dan DIVALIDASI ULANG oleh
 * fungsi `vd_create_order` (PRD 4.4 — total bayar dihitung ulang di server),
 * sehingga kupon tidak bisa dipalsukan dari browser.
 */

/** Kupon yang aktif. Tambahkan entri baru di sini untuk meluncurkan promo. */
export const KOUPON_TERSEDIA = [
  { kode: 'VIBE20', persen: 20, label: 'Diskon 20% seluruh belanja' },
];

/** Cari kupon berdasarkan kode (tidak peka huruf besar/kecil). */
export function cariKupon(kode) {
  const bersih = String(kode ?? '').trim().toUpperCase();
  return KOUPON_TERSEDIA.find((k) => k.kode === bersih) ?? null;
}

/**
 * Hitung potongan rupiah dari subtotal.
 * `Math.floor` = pembulatan ke bawah, SENGAJA sama dengan pembagian integer
 * di fungsi database agar angka di UI dan di nota server selalu identik.
 */
export function hitungDiskon(subtotal, kupon) {
  if (!kupon || !kupon.persen) return 0;
  const subtotalAman = Math.max(0, Number(subtotal) || 0);
  return Math.floor((subtotalAman * kupon.persen) / 100);
}
