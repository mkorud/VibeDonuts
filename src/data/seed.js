/**
 * Data contoh (seed) untuk mode frontend-only.
 *
 * Nama kolom sengaja dibuat PERSIS SAMA dengan tabel di PRD Bagian 5
 * (products, categories, orders, order_items, stock_logs) supaya saat backend
 * siap, cukup mengganti isi `src/services/*.js` tanpa mengubah komponen React.
 */

/** Bangun URL gambar Unsplash dengan ukuran & kualitas yang konsisten. */
function unsplash(photoId, width = 900) {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

/** Foto dekoratif halaman publik. */
export const DECOR_IMAGES = {
  hero: unsplash('1464347477106-7648bc26261b', 1200),
  heroSmall: unsplash('1514517521153-1be72277b32f', 600),
  about: unsplash('1527904324834-3bda86da6771', 1000),
  promo: unsplash('1527515545081-5db817172677', 900),
  fallbackProduct: unsplash('1597419765826-5b03fa018c18', 900),
};

/** Tabel `categories`. */
export const seedCategories = [
  { id: 1, nama: 'Klasik', slug: 'klasik' },
  { id: 2, nama: 'Premium', slug: 'premium' },
  { id: 3, nama: 'Musiman', slug: 'musiman' },
];

/**
 * Tabel `products` - 3 produk contoh sesuai permintaan MVP.
 * Stok sengaja divariasikan untuk menguji aturan PRD 4.1:
 * - Donat Tiramisu (stok 24)  -> normal
 * - Donat Cokelat Klasik (stok 4) -> masuk daftar "stok menipis" di admin
 * - Donat Strawberry Sprinkle (stok 0) -> tampil dengan label "Stok Habis" (P-5)
 */
export const seedProducts = [
  {
    id: 1,
    category_id: 2,
    nama: 'Donat Tiramisu',
    slug: 'donat-tiramisu',
    deskripsi:
      'Donat lembut dengan krim kopi mascarpone, ditaburi bubuk kakao Belanda dan serpihan cokelat premium. Manisnya pas, pahitnya elegan.',
    harga: 18000,
    stok: 24,
    url_foto: unsplash('1551106652-a5bcf4b29ab6'),
    aktif: true,
    dibuat_pada: '2026-09-10T02:15:00.000Z',
    diubah_pada: '2026-09-14T03:40:00.000Z',
  },
  {
    id: 2,
    category_id: 1,
    nama: 'Donat Cokelat Klasik',
    slug: 'donat-cokelat-klasik',
    deskripsi:
      'Resep klasik sejak hari pertama: adonan ragi 12 jam, lapisan ganache cokelat susu, dan taburan meses lembut. Selalu jadi favorit.',
    harga: 12000,
    stok: 4,
    url_foto: unsplash('1551024601-bec78aea704b'),
    aktif: true,
    dibuat_pada: '2026-09-10T02:20:00.000Z',
    diubah_pada: '2026-09-14T04:05:00.000Z',
  },
  {
    id: 3,
    category_id: 3,
    nama: 'Donat Strawberry Sprinkle',
    slug: 'donat-strawberry-sprinkle',
    deskripsi:
      'Edisi musiman dengan selai stroberi asli Ciwidey, icing pastel, dan sprinkle warna-warni. Hanya tersedia selama musim panen.',
    harga: 15000,
    stok: 0,
    url_foto: unsplash('1626094309830-abbb0c99da4a'),
    aktif: true,
    dibuat_pada: '2026-09-10T02:25:00.000Z',
    diubah_pada: '2026-09-14T04:10:00.000Z',
  },
];

/** Bangun tanggal ISO relatif terhadap sekarang (dipakai data contoh pesanan). */
function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

/**
 * Tabel `orders` + `order_items` contoh agar dashboard admin & halaman
 * Lacak Pesanan bisa langsung dicoba tanpa input manual.
 */
export const seedOrders = [
  {
    id: 30,
    kode_pesanan: 'VD-2609-0030',
    nama_pelanggan: 'Budi Santoso',
    no_hp: '081234567890',
    alamat: 'Jl. Melati No. 5, RT 02 / RW 04, Kudus',
    catatan: 'Tolong tanpa taburan kacang.',
    total_barang: 54000,
    ongkos_kirim: 10000,
    total_bayar: 64000,
    status: 'Menunggu Verifikasi',
    url_bukti_transfer: '/uploads/bukti-30.jpg',
    dibuat_pada: hoursAgo(3),
    diubah_pada: hoursAgo(2),
    items: [
      {
        id: 77,
        order_id: 30,
        product_id: 1,
        nama_produk: 'Donat Tiramisu',
        harga_satuan: 18000,
        jumlah: 3,
        subtotal: 54000,
      },
    ],
  },
  {
    id: 29,
    kode_pesanan: 'VD-2609-0029',
    nama_pelanggan: 'Sari Dewi',
    no_hp: '081298765432',
    alamat: 'Perum Griya Asri Blok C2 No. 11, Kudus',
    catatan: '',
    total_barang: 60000,
    ongkos_kirim: 10000,
    total_bayar: 70000,
    status: 'Diproses',
    url_bukti_transfer: '/uploads/bukti-29.jpg',
    dibuat_pada: hoursAgo(27),
    diubah_pada: hoursAgo(20),
    items: [
      {
        id: 76,
        order_id: 29,
        product_id: 2,
        nama_produk: 'Donat Cokelat Klasik',
        harga_satuan: 12000,
        jumlah: 5,
        subtotal: 60000,
      },
    ],
  },
  {
    id: 28,
    kode_pesanan: 'VD-2609-0028',
    nama_pelanggan: 'Andi Pratama',
    no_hp: '085712345678',
    alamat: 'Jl. Sunan Kudus No. 88, Kudus',
    catatan: 'Titip di pos keamanan ya.',
    total_barang: 66000,
    ongkos_kirim: 10000,
    total_bayar: 76000,
    status: 'Selesai',
    url_bukti_transfer: '/uploads/bukti-28.jpg',
    dibuat_pada: hoursAgo(74),
    diubah_pada: hoursAgo(50),
    items: [
      {
        id: 75,
        order_id: 28,
        product_id: 1,
        nama_produk: 'Donat Tiramisu',
        harga_satuan: 18000,
        jumlah: 2,
        subtotal: 36000,
      },
      {
        id: 74,
        order_id: 28,
        product_id: 3,
        nama_produk: 'Donat Strawberry Sprinkle',
        harga_satuan: 15000,
        jumlah: 2,
        subtotal: 30000,
      },
    ],
  },
];

/** Tabel `stock_logs` - riwayat perubahan stok (PRD A-4). */
export const seedStockLogs = [
  {
    id: 105,
    product_id: 1,
    perubahan: -3,
    stok_sebelum: 27,
    stok_sesudah: 24,
    alasan: 'Pesanan VD-2609-0030',
    user_id: null,
    dibuat_pada: hoursAgo(3),
  },
  {
    id: 104,
    product_id: 2,
    perubahan: -5,
    stok_sebelum: 9,
    stok_sesudah: 4,
    alasan: 'Pesanan VD-2609-0029',
    user_id: null,
    dibuat_pada: hoursAgo(27),
  },
  {
    id: 103,
    product_id: 1,
    perubahan: 30,
    stok_sebelum: 0,
    stok_sesudah: 30,
    alasan: 'Produksi baru batch pagi',
    user_id: 1,
    dibuat_pada: hoursAgo(30),
  },
];
