import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as orderService from '../services/orderService';
import { supabase } from '../lib/supabaseClient';
import { useProducts } from '../hooks/useProducts';

export const OrderContext = createContext(null);

/**
 * State pesanan untuk pelanggan (checkout, lacak pesanan, unggah bukti)
 * dan untuk admin (kelola pesanan - PRD A-6).
 *
 * Provider ini berada di dalam ProductProvider agar setiap perubahan stok
 * akibat pesanan langsung menyegarkan daftar produk di seluruh aplikasi.
 */
export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { refresh: refreshProducts } = useProducts();

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setOrders(await orderService.fetchOrders());
    } catch (err) {
      setError(err.message ?? 'Gagal memuat pesanan.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // QA (hari ke-3): daftar pesanan bergantung pada SESI (RLS — admin melihat
  // semua, pembeli hanya miliknya, tamu tidak ada). Segarkan otomatis setiap
  // kali status login berubah agar dashboard admin terisi tanpa reload halaman.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        refresh();
      }
    });
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  /** Buat pesanan baru. Melempar error bila stok tidak cukup (PRD 4.1). */
  const placeOrder = useCallback(
    async (payload) => {
      const order = await orderService.createOrder(payload);
      setOrders((current) => [order, ...current]);
      await refreshProducts();
      return order;
    },
    [refreshProducts],
  );

  /** Ubah status pesanan (maksimal satu langkah maju - PRD 4.3). */
  const setOrderStatus = useCallback(
    async (id, status) => {
      const updated = await orderService.updateOrderStatus(id, status);
      setOrders((current) =>
        current.map((order) => (String(order.id) === String(updated.id) ? updated : order)),
      );
      // Membatalkan pesanan mengembalikan stok, jadi produk perlu disegarkan.
      await refreshProducts();
      return updated;
    },
    [refreshProducts],
  );

  /** Simpan bukti transfer dari pelanggan (PRD K-7). */
  const uploadTransferProof = useCallback(async (id, url) => {
    const updated = await orderService.attachTransferProof(id, url);
    setOrders((current) =>
      current.map((order) => (String(order.id) === String(updated.id) ? updated : order)),
    );
    return updated;
  }, []);

  /** Batalkan pesanan kedaluwarsa > 2 jam (PRD 4.1). */
  const cancelExpired = useCallback(async () => {
    const count = await orderService.cancelExpiredOrders();
    if (count > 0) {
      await Promise.all([refresh(), refreshProducts()]);
    }
    return count;
  }, [refresh, refreshProducts]);

  /** Cari pesanan lewat kode + nomor HP (halaman Lacak Pesanan). */
  const findForTracking = useCallback(
    (kode, noHp) => orderService.findOrderForTracking(kode, noHp),
    [],
  );

  const getOrderById = useCallback(
    (id) => orders.find((order) => String(order.id) === String(id)) ?? null,
    [orders],
  );

  const stats = useMemo(() => {
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
    const perluTindakan = ['Menunggu Pembayaran', 'Menunggu Verifikasi'];

    return {
      pesananBaru: orders.filter((order) => perluTindakan.includes(order.status)).length,
      pesananHariIni: orders.filter((order) => isSameDay(order.dibuat_pada)).length,
      penjualanBulanIni: orders
        .filter((order) => isSameMonth(order.dibuat_pada) && order.status !== 'Dibatalkan')
        .reduce((sum, order) => sum + order.total_bayar, 0),
      totalPesanan: orders.length,
      pesananDibatalkan: orders.filter((order) => order.status === 'Dibatalkan').length,
    };
  }, [orders]);

  const value = useMemo(
    () => ({
      orders,
      stats,
      isLoading,
      error,
      refresh,
      placeOrder,
      setOrderStatus,
      uploadTransferProof,
      cancelExpired,
      findForTracking,
      getOrderById,
    }),
    [
      orders,
      stats,
      isLoading,
      error,
      refresh,
      placeOrder,
      setOrderStatus,
      uploadTransferProof,
      cancelExpired,
      findForTracking,
      getOrderById,
    ],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}
