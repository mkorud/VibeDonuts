/**
 * Kumpulan fungsi bantu (formatter & validasi) yang dipakai lintas halaman.
 */

/** Format angka menjadi Rupiah tanpa desimal. Contoh: 18000 -> "Rp 18.000" */
export function formatRupiah(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

/** Format tanggal ISO ke format Indonesia. Contoh: "15 Sep 2026, 14:30" */
export function formatDateTime(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** Buat slug ramah URL dari nama produk. Contoh: "Donat Tiramisu!" -> "donat-tiramisu" */
export function slugify(text) {
  return String(text ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Kode pesanan format PRD: VD-YYMM-XXXX. Contoh: VD-2609-0031
 * @param {Date} date - tanggal pesanan dibuat
 * @param {number} sequence - nomor urut pesanan
 */
export function generateOrderCode(date = new Date(), sequence = 1) {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const seq = String(sequence).padStart(4, '0');
  return `VD-${yy}${mm}-${seq}`;
}

/** Normalisasi nomor HP Indonesia: hanya angka, awalan 0 / 62 tetap dipertahankan. */
export function normalizePhone(phone) {
  return String(phone ?? '').replace(/[^\d]/g, '');
}

/** Validasi nomor HP sesuai PRD 4.4: wajib diisi, minimal 10 angka. */
export function isValidPhone(phone) {
  const digits = normalizePhone(phone);
  return digits.length >= 10 && digits.length <= 15;
}

/** Ambil inisial nama untuk avatar teks. Contoh: "Budi Santoso" -> "BS" */
export function getInitials(name) {
  return String(name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/** Potong teks panjang agar rapi di kartu produk. */
export function truncate(text, maxLength = 96) {
  const value = String(text ?? '').trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}...`;
}

/** Buat ID unik sederhana untuk data yang belum tersimpan di database. */
export function createId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
