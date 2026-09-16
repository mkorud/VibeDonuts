/**
 * Konstanta & aturan bisnis VibeDonuts.
 * Nilai di sini mengikuti PRD Bagian 4 (Logika Bisnis) agar mudah dicari saat revisi.
 */

/** Ambang batas "stok menipis" pada ringkasan dashboard (PRD 4.1). */
export const LOW_STOCK_THRESHOLD = 5;

/** Batas maksimal jumlah pesanan per produk dalam satu transaksi (PRD 4.4). */
export const MAX_QTY_PER_ITEM = 20;

/** Batas atas untuk input stok manual admin. */
export const MAX_STOCK = 9999;

/** Unggahan foto produk: maksimal 2 MB, format JPG/PNG/WEBP (PRD 4.4). */
export const IMAGE_UPLOAD_RULES = {
  maxSizeMb: 2,
  maxSizeBytes: 2 * 1024 * 1024,
  accept: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  acceptLabel: 'JPG, PNG, atau WEBP (maks. 2 MB)',
};

/** Nilai awal pengaturan toko (PRD Bagian 5 - tabel settings). */
export const DEFAULT_SETTINGS = {
  ongkos_kirim: 10000,
  nomor_rekening: '1234567890',
  nama_bank: 'BCA',
  atas_nama: 'Rina VibeDonuts',
  whatsapp_toko: '6281234567890',
};

/** Alur status pesanan sesuai PRD 4.3 (status hanya boleh maju satu langkah). */
export const ORDER_STATUS = {
  MENUNGGU_PEMBAYARAN: 'Menunggu Pembayaran',
  MENUNGGU_VERIFIKASI: 'Menunggu Verifikasi',
  DIPROSES: 'Diproses',
  DIKIRIM: 'Dikirim',
  SELESAI: 'Selesai',
  DIBATALKAN: 'Dibatalkan',
};

/** Urutan maju status pesanan. */
export const ORDER_STATUS_FLOW = [
  ORDER_STATUS.MENUNGGU_PEMBAYARAN,
  ORDER_STATUS.MENUNGGU_VERIFIKASI,
  ORDER_STATUS.DIPROSES,
  ORDER_STATUS.DIKIRIM,
  ORDER_STATUS.SELESAI,
];

/** Warna badge per status (dipakai OrderStatusBadge). */
export const ORDER_STATUS_STYLE = {
  [ORDER_STATUS.MENUNGGU_PEMBAYARAN]: 'bg-butter-100 text-butter-400 ring-butter-200',
  [ORDER_STATUS.MENUNGGU_VERIFIKASI]: 'bg-blush-100 text-blush-600 ring-blush-200',
  [ORDER_STATUS.DIPROSES]: 'bg-cream-200 text-cocoa-700 ring-cream-300',
  [ORDER_STATUS.DIKIRIM]: 'bg-sky-100 text-sky-700 ring-sky-200',
  [ORDER_STATUS.SELESAI]: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  [ORDER_STATUS.DIBATALKAN]: 'bg-rose-100 text-rose-700 ring-rose-200',
};

/** Opsi pengurutan katalog produk (PRD P-2). */
export const SORT_OPTIONS = [
  { value: 'terbaru', label: 'Terbaru' },
  { value: 'termurah', label: 'Harga: Termurah' },
  { value: 'termahal', label: 'Harga: Termahal' },
  { value: 'nama', label: 'Nama: A - Z' },
];

/** Nilai filter kategori "semua". */
export const ALL_CATEGORY = 'semua';

/** Status bukti transfer yang dikirim pelanggan (PRD K-7). */
export const TRANSFER_PROOF_HINT =
  'Bukti transfer akan diverifikasi admin maksimal 1x24 jam pada jam operasional.';
