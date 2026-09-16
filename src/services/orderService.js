/**
 * Service pesanan — TERHUBUNG KE SUPABASE (tabel orders & order_items).
 *
 * Semua aturan bisnis PRD kini dieksekusi DI DALAM DATABASE lewat fungsi
 * (lihat supabase/03_orders.sql):
 * - vd_create_order : cek stok ganda dengan kunci baris (4.1), harga dikunci &
 *   total dihitung ulang di server (4.2/4.4), stok berkurang + riwayat.
 * - vd_cancel_order : batalkan pesanan + stok dikembalikan (4.1).
 * - trigger vd_guard_order_status : status hanya maju satu langkah (4.3).
 *
 * Komponen React tidak berubah — nama fungsi & bentuk data sama seperti versi mock.
 */

import { supabase } from '../lib/supabaseClient';
import { normalizePhone } from '../lib/format';
import { ORDER_STATUS, ORDER_STATUS_FLOW } from '../lib/constants';

/** Kolom yang diambil: pesanan + rinciannya (relasi FK order_items). */
const SELECT_ORDER = '*, order_items(*)';

/** Samakan bentuk baris Supabase (order_items nested) dengan bentuk lama (items). */
function mapOrder(row) {
  if (!row) return null;
  return { ...row, items: row.items ?? row.order_items ?? [] };
}

/**
 * Terjemahkan error Supabase. Kode P0001/P0002 = RAISE EXCEPTION dari fungsi
 * VibeDonuts — pesannya sudah bahasa Indonesia sesuai PRD, diteruskan apa adanya
 * (contoh: "Maaf, stok Donat Tiramisu tinggal 2. Silakan sesuaikan jumlahnya.").
 */
function translateError(error, fallbackMessage) {
  const code = error?.code ?? '';
  const raw = String(error?.message ?? '');

  if (code === 'P0001' || code === 'P0002') return raw || fallbackMessage;
  if (code === 'PGRST202' || /could not find the function/i.test(raw)) {
    return 'Fungsi database belum ada. Jalankan supabase/03_orders.sql & supabase/07_orders_privacy.sql di SQL Editor.';
  }
  if (code === 'PGRST205' || code === '42P01' || /could not find the table|does not exist/i.test(raw)) {
    return 'Tabel pesanan belum ada di Supabase. Jalankan supabase/03_orders.sql & supabase/07_orders_privacy.sql di SQL Editor.';
  }
  if (code === '42501' || /row-level security|permission denied/i.test(raw)) {
    return 'Akses ditolak: peran admin belum terpasang di database. Jalankan `select public.vd_grant_admin(\'email-anda@gmail.com\');` di SQL Editor, lalu keluar & masuk kembali.';
  }
  if (/failed to fetch|networkerror/i.test(raw)) {
    return 'Tidak bisa terhubung ke Supabase. Periksa koneksi internet Anda.';
  }
  return raw || fallbackMessage;
}

/** READ — semua pesanan, terbaru di atas (A-6). */
export async function fetchOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(SELECT_ORDER)
    .order('dibuat_pada', { ascending: false });

  if (error) throw new Error(translateError(error, 'Gagal memuat pesanan.'));
  return (data ?? []).map(mapOrder);
}

/** READ — satu pesanan berdasarkan id (halaman konfirmasi & detail admin). */
export async function fetchOrderById(id) {
  const { data, error } = await supabase
    .from('orders')
    .select(SELECT_ORDER)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(translateError(error, 'Gagal memuat pesanan.'));
  if (!data) throw new Error('Pesanan tidak ditemukan.');
  return mapOrder(data);
}

/**
 * READ — cari pesanan untuk halaman Lacak Pesanan (PRD P-7).
 * Dipanggil lewat RPC `vd_track_order`: database sendiri yang memvalidasi
 * pasangan KODE PESANAN + NOMOR HP. Tabel orders tidak dibaca langsung,
 * karena hanya pemilik pesanan & admin yang berhak membacanya.
 */
export async function findOrderForTracking(kodePesanan, noHp) {
  const kode = String(kodePesanan ?? '').trim().toUpperCase();
  const hp = normalizePhone(noHp);

  const { data, error } = await supabase.rpc('vd_track_order', {
    p_kode: kode,
    p_no_hp: hp,
  });

  if (error) throw new Error(translateError(error, 'Gagal mencari pesanan.'));
  if (!data) {
    throw new Error('Pesanan tidak ditemukan. Periksa kembali kode pesanan dan nomor HP Anda.');
  }
  return mapOrder(data);
}

/**
 * INSERT — buat pesanan lewat RPC `vd_create_order` (SATU transaksi atomik):
 * stok dicek ulang & dikunci, harga dikunci, total dihitung ulang di server,
 * stok berkurang, dan riwayat stok tercatat (PRD 4.1/4.2/4.4).
 * Bila stok tidak cukup, error berisi pesan PRD ("Maaf, stok ... tinggal N.")
 * dan TIDAK ADA data yang tersimpan.
 */
export async function createOrder(payload) {
  const items = Array.isArray(payload.items) ? payload.items : [];
  if (items.length === 0) throw new Error('Keranjang masih kosong.');

  const { data, error } = await supabase.rpc('vd_create_order', {
    p_items: items.map((item) => ({
      product_id: item.product_id,
      jumlah: Math.max(1, Math.trunc(Number(item.jumlah) || 1)),
    })),
    p_nama_pelanggan: String(payload.nama_pelanggan ?? '').trim(),
    p_no_hp: normalizePhone(payload.no_hp),
    p_alamat: String(payload.alamat ?? '').trim(),
    p_catatan: String(payload.catatan ?? '').trim(),
    p_ongkos_kirim: Math.max(0, Math.trunc(Number(payload.ongkos_kirim) || 0)),
  });

  if (error) throw new Error(translateError(error, 'Gagal membuat pesanan.'));
  return mapOrder(data);
}

/**
 * UPDATE — ubah status pesanan. Validasi "hanya maju satu langkah" dijalankan
 * dua lapis: di sini (UX) dan di trigger database (kebenaran, PRD 4.3).
 * Pembatalan memakai RPC khusus agar stok ikut dikembalikan (PRD 4.1).
 */
export async function updateOrderStatus(id, nextStatus) {
  const current = await fetchOrderById(id);

  if (current.status === ORDER_STATUS.SELESAI || current.status === ORDER_STATUS.DIBATALKAN) {
    throw new Error(`Pesanan berstatus "${current.status}" tidak bisa diubah lagi.`);
  }

  if (nextStatus !== ORDER_STATUS.DIBATALKAN) {
    const currentStep = ORDER_STATUS_FLOW.indexOf(current.status);
    const nextStep = ORDER_STATUS_FLOW.indexOf(nextStatus);
    if (nextStep === -1 || nextStep !== currentStep + 1) {
      throw new Error('Status hanya boleh maju satu langkah, tidak boleh mundur atau melompat.');
    }
  }

  if (nextStatus === ORDER_STATUS.DIBATALKAN) {
    const { data, error } = await supabase.rpc('vd_cancel_order', { p_order_id: id });
    if (error) throw new Error(translateError(error, 'Gagal membatalkan pesanan.'));
    return mapOrder(data);
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status: nextStatus })
    .eq('id', id)
    .select(SELECT_ORDER)
    .single();

  if (error) throw new Error(translateError(error, 'Gagal mengubah status pesanan.'));
  return mapOrder(data);
}

/**
 * UPDATE — unggah bukti transfer dari pelanggan (PRD K-7).
 * Lewat RPC `vd_attach_transfer_proof`: database memeriksa hak akses
 * (pemilik pesanan / admin) dan HANYA mengubah kolom bukti + status —
 * pembeli tidak bisa menyentuh total/harga dari sisi klien (PRD 4.4).
 * Status otomatis naik "Menunggu Pembayaran" -> "Menunggu Verifikasi".
 */
export async function attachTransferProof(id, urlBuktiTransfer) {
  const { data, error } = await supabase.rpc('vd_attach_transfer_proof', {
    p_order_id: id,
    p_url: String(urlBuktiTransfer ?? '').trim(),
  });

  if (error) throw new Error(translateError(error, 'Gagal menyimpan bukti transfer.'));
  if (!data) throw new Error('Gagal menyimpan bukti transfer.');
  return mapOrder(data);
}

/**
 * Batalkan otomatis pesanan yang tidak dibayar dalam 2 jam (PRD 4.1).
 * Di produksi sebaiknya dijalankan cron/scheduled job; di MVP tersedia sebagai
 * aksi "Batalkan kedaluwarsa" di dashboard admin.
 */
export async function cancelExpiredOrders(maxAgeHours = 2) {
  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('orders')
    .select('id')
    .eq('status', ORDER_STATUS.MENUNGGU_PEMBAYARAN)
    .lt('dibuat_pada', cutoff);

  if (error) throw new Error(translateError(error, 'Gagal memeriksa pesanan kedaluwarsa.'));

  let cancelled = 0;
  for (const row of data ?? []) {
    const { error: cancelError } = await supabase.rpc('vd_cancel_order', { p_order_id: row.id });
    if (cancelError) throw new Error(translateError(cancelError, 'Gagal membatalkan pesanan kedaluwarsa.'));
    cancelled += 1;
  }
  return cancelled;
}

/** READ — ringkasan angka dashboard (PRD A-2), dihitung dari pesanan Supabase. */
export async function fetchOrderStats() {
  const orders = await fetchOrders();
  const now = new Date();

  const isSameDay = (iso) => {
    const date = new Date(iso);
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  };

  const isSameMonth = (iso) => {
    const date = new Date(iso);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  };

  const perluTindakan = [ORDER_STATUS.MENUNGGU_PEMBAYARAN, ORDER_STATUS.MENUNGGU_VERIFIKASI];

  return {
    pesananBaru: orders.filter((order) => perluTindakan.includes(order.status)).length,
    pesananHariIni: orders.filter((order) => isSameDay(order.dibuat_pada)).length,
    penjualanBulanIni: orders
      .filter(
        (order) =>
          isSameMonth(order.dibuat_pada) && order.status !== ORDER_STATUS.DIBATALKAN,
      )
      .reduce((sum, order) => sum + order.total_bayar, 0),
    totalPesanan: orders.length,
    pesananDibatalkan: orders.filter((order) => order.status === ORDER_STATUS.DIBATALKAN).length,
  };
}

/** READ — riwayat pesanan milik satu pengguna (Dashboard Pembeli, hari ke-3). */
export async function fetchOrdersByUser(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(SELECT_ORDER)
    .eq('user_id', userId)
    .order('dibuat_pada', { ascending: false });

  if (error) throw new Error(translateError(error, 'Gagal memuat riwayat pesanan.'));
  return (data ?? []).map(mapOrder);
}


