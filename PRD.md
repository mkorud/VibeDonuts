# PRD — VibeDonuts (Toko Donat Premium Online)

**Versi:** 1.0 · **Tanggal:** 15 September 2026
**Jenis dokumen:** Product Requirement Document untuk MVP (versi paling sederhana yang sudah bisa dipakai jualan)
**Pembaca dokumen:** pemilik bisnis, programmer, desainer

---

## 1. Ringkasan Produk

**Apa itu VibeDonuts?**
Sebuah website tempat pelanggan bisa melihat daftar donat, memasukkannya ke keranjang, lalu memesan. Pemilik toko punya halaman khusus (dashboard admin) untuk mengatur produk, stok, dan pesanan yang masuk.

**Tujuan MVP:**
Bisa menerima pesanan pertama secara online tanpa perlu chat manual satu per satu, dan pemilik bisa melihat semua pesanan dalam satu tempat.

**Target pengguna:**

| Pengguna | Kebutuhan utama |
|---|---|
| Pelanggan | Lihat donat, tahu harga & stok, pesan dengan cepat |
| Admin (pemilik toko) | Atur produk & stok, lihat & proses pesanan masuk |

**Yang SENGAJA TIDAK dibuat di MVP** (supaya cepat selesai dan tidak membengkak):

- Akun login untuk pelanggan (pelanggan memesan sebagai tamu)
- Pembayaran otomatis (payment gateway) — MVP pakai transfer manual
- Kode promo/diskon, poin loyalti, ulasan produk, wishlist
- Ongkos kirim otomatis per jarak
- Notifikasi email/WhatsApp otomatis

Semua ini masuk daftar pengembangan berikutnya (lihat Bagian 7).

---

## 2. Ruang Lingkup Fitur

### 2.1 Halaman Publik (untuk pelanggan)

| No | Fitur | Penjelasan |
|---|---|---|
| P-1 | Beranda | Menampilkan banner, 4–8 donat unggulan, dan ajakan untuk belanja |
| P-2 | Katalog Produk | Daftar semua donat. Bisa disaring per kategori dan diurutkan (termurah/termahal/terbaru) |
| P-3 | Pencarian | Kotak cari berdasarkan nama donat |
| P-4 | Detail Produk | Foto besar, nama, harga, deskripsi, sisa stok, tombol "Tambah ke Keranjang" |
| P-5 | Label Habis | Donat yang stoknya 0 tetap tampil, tapi tombolnya nonaktif dan diberi label "Stok Habis" |
| P-6 | Halaman Tentang & Kontak | Cerita singkat brand, alamat toko, nomor WhatsApp |
| P-7 | Lacak Pesanan | Pelanggan memasukkan Kode Pesanan + nomor HP untuk melihat status pesanannya |

### 2.2 Keranjang Belanja & Pemesanan

| No | Fitur | Penjelasan |
|---|---|---|
| K-1 | Tambah ke keranjang | Pelanggan memilih jumlah, lalu barang masuk keranjang |
| K-2 | Keranjang bertahan | Isi keranjang tidak hilang saat halaman di-refresh (disimpan di browser pelanggan) |
| K-3 | Ubah isi keranjang | Tambah jumlah, kurangi jumlah, atau hapus barang |
| K-4 | Ringkasan biaya | Total harga barang + ongkos kirim = total bayar |
| K-5 | Formulir Checkout | Nama, nomor HP, alamat lengkap, catatan (opsional) |
| K-6 | Konfirmasi pesanan | Setelah dikirim, pelanggan mendapat Kode Pesanan (contoh: `VD-2609-0031`) dan instruksi transfer |
| K-7 | Unggah bukti transfer | Pelanggan mengunggah foto bukti transfer di halaman konfirmasi |

### 2.3 Dashboard Admin (khusus pemilik toko)

| No | Fitur | Penjelasan |
|---|---|---|
| A-1 | Login admin | Halaman masuk dengan email & kata sandi. Hanya admin yang bisa akses dashboard |
| A-2 | Ringkasan | Jumlah pesanan baru, pesanan hari ini, total penjualan bulan ini, daftar produk yang stoknya menipis |
| A-3 | Kelola Produk | Tambah, ubah, dan nonaktifkan produk (nama, harga, foto, deskripsi, kategori) |
| A-4 | Kelola Stok | Ubah jumlah stok per produk, plus riwayat perubahan stok |
| A-5 | Kelola Kategori | Tambah/ubah/hapus kategori donat (misal: Klasik, Premium, Musiman) |
| A-6 | Kelola Pesanan | Lihat semua pesanan, buka detailnya, lihat bukti transfer, ubah status pesanan |
| A-7 | Pengaturan Toko | Nomor rekening tujuan, besaran ongkos kirim, nomor WhatsApp toko |

---

## 3. Struktur Halaman & Komponen React

### 3.1 Daftar Halaman (Routing)

**Bagian Publik**

| Alamat halaman | Nama halaman | Isi |
|---|---|---|
| `/` | Beranda | Banner + produk unggulan |
| `/produk` | Katalog | Semua produk + filter |
| `/produk/:slug` | Detail Produk | Satu produk lengkap |
| `/keranjang` | Keranjang | Daftar barang yang dipilih |
| `/checkout` | Checkout | Formulir data pengiriman |
| `/pesanan-berhasil/:kode` | Konfirmasi | Kode pesanan + instruksi bayar |
| `/lacak` | Lacak Pesanan | Cek status pesanan |
| `/tentang` | Tentang Kami | Profil brand |

**Bagian Admin** (semua harus login dulu)

| Alamat halaman | Nama halaman |
|---|---|
| `/admin/login` | Masuk Admin |
| `/admin` | Ringkasan Dashboard |
| `/admin/produk` | Daftar Produk |
| `/admin/produk/baru` | Tambah Produk |
| `/admin/produk/:id/edit` | Ubah Produk |
| `/admin/kategori` | Kelola Kategori |
| `/admin/pesanan` | Daftar Pesanan |
| `/admin/pesanan/:id` | Detail Pesanan |
| `/admin/pengaturan` | Pengaturan Toko |

### 3.2 Komponen React yang Dibutuhkan

Bayangkan komponen seperti **balok LEGO**: satu balok dibuat sekali, lalu dipakai berulang kali di banyak halaman.

**Komponen bersama (dipakai di mana-mana)**

- `Navbar` — menu atas + ikon keranjang beserta angka jumlah barang
- `Footer` — bagian bawah halaman
- `Button` — tombol standar (utama, sekunder, nonaktif)
- `Input` / `Select` / `TextArea` — isian formulir
- `Modal` — kotak pop-up (misal konfirmasi hapus)
- `Toast` — notifikasi kecil ("Produk ditambahkan ke keranjang")
- `Loading` — tampilan saat data sedang diambil
- `EmptyState` — tampilan saat data kosong ("Keranjang masih kosong")

**Komponen bagian publik**

- `ProductCard` — kartu satu donat (foto, nama, harga, tombol)
- `ProductGrid` — kumpulan `ProductCard` yang tersusun rapi
- `CategoryFilter` — tombol-tombol saringan kategori
- `SearchBar` — kotak pencarian
- `QuantitySelector` — tombol `−` dan `+` untuk mengatur jumlah
- `CartItem` — satu baris barang di keranjang
- `CartSummary` — kotak ringkasan total biaya
- `CheckoutForm` — formulir data pengiriman
- `OrderStatusBadge` — label warna status pesanan

**Komponen bagian admin**

- `AdminLayout` — kerangka dashboard (menu samping + area isi)
- `StatCard` — kotak angka ringkasan
- `DataTable` — tabel data yang bisa diurutkan & punya halaman
- `ProductForm` — formulir tambah/ubah produk
- `ImageUploader` — unggah foto produk
- `OrderDetailPanel` — rincian satu pesanan
- `StatusDropdown` — pilihan untuk mengubah status pesanan

### 3.3 Penyimpanan Data Sementara di Aplikasi (State)

| Jenis data | Disimpan di mana | Kenapa |
|---|---|---|
| Isi keranjang | Browser pelanggan (localStorage) | Agar tidak hilang saat halaman ditutup/refresh |
| Daftar produk | Diambil dari server tiap kali halaman dibuka | Harga & stok harus selalu terbaru |
| Status login admin | Token yang disimpan aman di browser | Untuk memastikan hanya admin yang bisa masuk |

---

## 4. Logika Bisnis (Aturan Main Sistem)

### 4.1 Aturan Stok

**Kapan stok BERKURANG?**
Stok berkurang **saat pesanan berhasil dibuat** (saat pelanggan menekan "Pesan Sekarang" di halaman checkout), bukan saat barang masuk keranjang.

> Alasannya: kalau stok berkurang saat masuk keranjang, orang yang cuma iseng lihat-lihat akan "mengunci" stok padahal tidak jadi beli.

**Kapan stok BERTAMBAH kembali?**

| Kejadian | Efek ke stok |
|---|---|
| Admin membatalkan pesanan | Stok dikembalikan sejumlah barang di pesanan itu |
| Pesanan kedaluwarsa (tidak dibayar dalam 2 jam) | Sistem membatalkan otomatis, stok dikembalikan |
| Admin menambah stok manual (produksi baru) | Stok bertambah sesuai input admin |

**Cara admin mengubah stok:**
Admin memasukkan **jumlah akhir**, bukan selisih. Contoh: stok sekarang 12, admin produksi 30 lagi → admin mengisi angka `42`, bukan `30`. Ini lebih kecil risiko salah hitung.

Setiap perubahan stok dicatat di riwayat: siapa yang mengubah, kapan, dari berapa ke berapa, dan alasannya.

**Pengecekan ganda saat checkout:**
Sebelum pesanan disimpan, sistem mengecek ulang stok di database. Kalau ternyata stok sudah tidak cukup (ada orang lain yang lebih cepat memesan), pesanan ditolak dan pelanggan diberi pesan: *"Maaf, stok Donat Tiramisu tinggal 2. Silakan sesuaikan jumlahnya."*

**Aturan tambahan:**

- Stok tidak boleh bernilai minus. Nilai terkecil adalah 0.
- Produk dengan stok 0 tetap tampil, tapi tidak bisa dibeli.
- Produk dengan stok ≤ 5 muncul di daftar "stok menipis" pada ringkasan dashboard.

### 4.2 Aturan Harga

- Harga **dikunci saat pesanan dibuat**. Kalau besok admin menaikkan harga, pesanan kemarin tetap memakai harga lama. Karena itu harga satuan ikut disalin ke dalam rincian pesanan.
- Rumus perhitungan:
  - Subtotal per barang = harga satuan × jumlah
  - Total barang = jumlah semua subtotal
  - **Total bayar = Total barang + Ongkos kirim**
- Ongkos kirim di MVP bernilai tetap (flat), diatur admin di halaman Pengaturan Toko.

### 4.3 Alur Status Pesanan

```
Menunggu Pembayaran
        │
        ├──► (pelanggan unggah bukti) ──► Menunggu Verifikasi
        │                                        │
        │                                        ▼
        │                                     Diproses ──► Dikirim ──► Selesai
        │
        └──► (2 jam lewat / admin batalkan) ──► Dibatalkan  → stok kembali
```

| Status | Artinya | Siapa yang mengubah |
|---|---|---|
| Menunggu Pembayaran | Pesanan masuk, belum ada bukti transfer | Otomatis sistem |
| Menunggu Verifikasi | Bukti transfer sudah diunggah | Otomatis saat pelanggan unggah |
| Diproses | Admin sudah cek uangnya masuk, donat sedang dibuat | Admin |
| Dikirim | Pesanan sudah diserahkan ke kurir | Admin |
| Selesai | Pesanan diterima pelanggan | Admin |
| Dibatalkan | Pesanan gagal/dibatalkan | Admin atau sistem |

**Aturan status:** status hanya boleh maju satu langkah, tidak boleh mundur. Pesanan yang sudah "Selesai" tidak bisa diubah lagi.

### 4.4 Aturan Keamanan & Validasi

- Semua halaman `/admin/*` hanya bisa dibuka setelah login. Kalau belum login, otomatis dilempar ke halaman login.
- Kata sandi admin disimpan dalam bentuk teracak (hash), tidak pernah disimpan apa adanya.
- Nomor HP wajib diisi dan minimal 10 angka.
- Jumlah pesanan per produk minimal 1 dan maksimal sebanyak stok yang tersedia.
- Foto produk maksimal 2 MB, format JPG/PNG/WEBP.
- Perhitungan total bayar **dihitung ulang di server**, tidak percaya angka kiriman dari browser (agar tidak bisa dicurangi).

---

## 5. Skema Data (Isi Database)

Bayangkan database seperti **kumpulan buku catatan**, satu buku untuk satu jenis informasi.

### Tabel `users` — Buku Catatan Admin

| Kolom | Isi | Contoh |
|---|---|---|
| id | Nomor unik | 1 |
| nama | Nama admin | Rina |
| email | Untuk login | rina@vibedonuts.id |
| password_hash | Kata sandi teracak | (teks acak) |
| peran | admin / staf | admin |
| dibuat_pada | Tanggal dibuat | 2026-09-15 |

### Tabel `categories` — Buku Kategori

| Kolom | Isi | Contoh |
|---|---|---|
| id | Nomor unik | 3 |
| nama | Nama kategori | Premium |
| slug | Nama untuk alamat web | premium |

### Tabel `products` — Buku Produk

| Kolom | Isi | Contoh |
|---|---|---|
| id | Nomor unik | 12 |
| category_id | Menunjuk ke kategori mana | 3 |
| nama | Nama donat | Donat Tiramisu |
| slug | Nama untuk alamat web | donat-tiramisu |
| deskripsi | Penjelasan produk | Donat lembut dengan krim kopi... |
| harga | Harga satuan (rupiah) | 18000 |
| stok | Sisa stok saat ini | 24 |
| url_foto | Alamat foto produk | /uploads/tiramisu.jpg |
| aktif | Tampil di toko atau tidak | ya |
| dibuat_pada / diubah_pada | Jejak waktu | 2026-09-15 |

### Tabel `orders` — Buku Pesanan (data utama pesanan)

| Kolom | Isi | Contoh |
|---|---|---|
| id | Nomor unik | 31 |
| kode_pesanan | Kode untuk pelanggan | VD-2609-0031 |
| nama_pelanggan | Nama pemesan | Budi Santoso |
| no_hp | Nomor HP | 081234567890 |
| alamat | Alamat lengkap pengiriman | Jl. Melati No. 5, Kudus |
| catatan | Pesan tambahan | Tolong tanpa taburan kacang |
| total_barang | Jumlah harga semua donat | 90000 |
| ongkos_kirim | Biaya kirim | 10000 |
| total_bayar | Total akhir | 100000 |
| status | Status pesanan | Menunggu Verifikasi |
| url_bukti_transfer | Foto bukti bayar | /uploads/bukti-31.jpg |
| dibuat_pada / diubah_pada | Jejak waktu | 2026-09-15 |

### Tabel `order_items` — Buku Rincian Isi Pesanan

Satu pesanan bisa berisi beberapa jenis donat, jadi rinciannya dicatat terpisah.

| Kolom | Isi | Contoh |
|---|---|---|
| id | Nomor unik | 77 |
| order_id | Milik pesanan yang mana | 31 |
| product_id | Donat yang mana | 12 |
| nama_produk | Nama donat saat dibeli | Donat Tiramisu |
| harga_satuan | Harga saat dibeli (dikunci) | 18000 |
| jumlah | Berapa buah | 5 |
| subtotal | harga_satuan × jumlah | 90000 |

> Nama dan harga sengaja disalin ke sini supaya nota lama tetap benar meskipun produknya nanti diganti nama atau dihapus.

### Tabel `stock_logs` — Buku Riwayat Stok

| Kolom | Isi | Contoh |
|---|---|---|
| id | Nomor unik | 105 |
| product_id | Produk yang mana | 12 |
| perubahan | Tambah/kurang berapa | −5 |
| stok_sebelum / stok_sesudah | Nilai stok | 29 → 24 |
| alasan | Kenapa berubah | Pesanan VD-2609-0031 |
| user_id | Siapa yang mengubah (kosong = sistem) | 1 |
| dibuat_pada | Kapan | 2026-09-15 |

### Tabel `settings` — Buku Pengaturan Toko

| Kolom | Isi | Contoh |
|---|---|---|
| kunci | Nama pengaturan | ongkos_kirim |
| nilai | Isinya | 10000 |

Isi awal: `ongkos_kirim`, `nomor_rekening`, `nama_bank`, `atas_nama`, `whatsapp_toko`.

### Hubungan Antar Tabel (ringkas)

- Satu **kategori** memiliki banyak **produk**
- Satu **pesanan** memiliki banyak **rincian pesanan**
- Satu **produk** bisa muncul di banyak **rincian pesanan**
- Satu **produk** memiliki banyak **riwayat stok**

---

## 6. Kriteria Selesai (Checklist Sebelum Diluncurkan)

- [ ] Pelanggan bisa memesan dari beranda sampai dapat kode pesanan tanpa error
- [ ] Stok benar-benar berkurang setelah pesanan dibuat
- [ ] Stok kembali normal setelah pesanan dibatalkan
- [ ] Produk stok 0 tidak bisa dimasukkan ke keranjang
- [ ] Isi keranjang tidak hilang setelah halaman di-refresh
- [ ] Halaman `/admin` tidak bisa dibuka tanpa login
- [ ] Admin bisa menambah produk baru dan produk langsung tampil di katalog
- [ ] Admin bisa mengubah status pesanan dan pelanggan melihat perubahannya di halaman Lacak Pesanan
- [ ] Tampilan rapi di layar HP (mayoritas pembeli memakai HP)
- [ ] Halaman katalog terbuka di bawah 3 detik

---

## 7. Rencana Pengembangan Berikutnya

**Tahap 2 (setelah MVP jalan 1–2 bulan)**

1. Pembayaran otomatis (QRIS / virtual account)
2. Akun pelanggan + riwayat pembelian
3. Notifikasi otomatis via WhatsApp saat status pesanan berubah
4. Kode promo dan diskon

**Tahap 3**

5. Ongkos kirim otomatis berdasarkan jarak
6. Ulasan & rating produk
7. Laporan penjualan yang bisa diunduh
8. Jadwal pre-order untuk donat musiman

---

## Lampiran: Istilah yang Dipakai di Dokumen Ini

| Istilah | Arti sederhana |
|---|---|
| MVP | Versi paling sederhana yang sudah bisa dipakai jualan |
| Frontend | Bagian yang dilihat & disentuh pengguna (tampilan website) |
| Backend | Bagian "dapur" di server yang mengolah dan menyimpan data |
| Database | Tempat penyimpanan data permanen |
| Komponen | Potongan tampilan yang bisa dipakai ulang, seperti balok LEGO |
| Routing | Aturan halaman mana yang muncul untuk alamat web tertentu |
| State | Ingatan sementara aplikasi selama dipakai |
| Slug | Versi nama yang ramah alamat web (contoh: `donat-tiramisu`) |
| Hash | Cara mengacak kata sandi agar tidak terbaca siapa pun |
| Validasi | Pengecekan agar data yang masuk benar dan masuk akal |

---

## Fitur Tambahan (Mini-Challenge Kelulusan)
- Menyediakan kolom input teks kupon promo pada komponen antarmuka keranjang belanja pengguna.
- Sistem wajib memvalidasi kecocokan kode kupon input.
- Jika pengguna memasukkan kode kupon yang valid (yaitu: "VIBE20"), sistem secara otomatis menghitung pemotongan harga sebesar 20% dari total biaya belanja.
- Menampilkan notifikasi visual status sukses/gagal penerapan kupon yang menarik di layar.
