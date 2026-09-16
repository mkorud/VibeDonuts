import { useMemo, useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { useToast } from '../../hooks/useToast';
import { ORDER_STATUS } from '../../lib/constants';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { OrdersTable, OrderDetailModal } from '../../components/admin/OrdersTable';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Button } from '../../components/common/Button';
import { IconClock } from '../../components/common/Icons';

/** Filter status cepat (PRD A-6). */
const STATUS_FILTERS = [
  { value: 'semua', label: 'Semua' },
  { value: ORDER_STATUS.MENUNGGU_PEMBAYARAN, label: 'Menunggu Pembayaran' },
  { value: ORDER_STATUS.MENUNGGU_VERIFIKASI, label: 'Menunggu Verifikasi' },
  { value: ORDER_STATUS.DIPROSES, label: 'Diproses' },
  { value: ORDER_STATUS.DIKIRIM, label: 'Dikirim' },
  { value: ORDER_STATUS.SELESAI, label: 'Selesai' },
  { value: ORDER_STATUS.DIBATALKAN, label: 'Dibatalkan' },
];

/** Halaman Kelola Pesanan (PRD A-6): detail, geser status, batalkan. */
export function AdminOrdersPage() {
  const { orders, isLoading, setOrderStatus, cancelExpired } = useOrders();
  const { success, error, info } = useToast();

  const [filter, setFilter] = useState('semua');
  const [detailOrder, setDetailOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  const visibleOrders = useMemo(
    () => (filter === 'semua' ? orders : orders.filter((order) => order.status === filter)),
    [orders, filter],
  );

  const handleAdvance = async (order, next) => {
    try {
      await setOrderStatus(order.id, next);
      success(`Pesanan ${order.kode_pesanan} -> ${next}.`);
    } catch (err) {
      error(err.message ?? 'Gagal mengubah status pesanan.');
    }
  };

  const handleCancel = async () => {
    if (!cancellingOrder) return;
    setIsBusy(true);
    try {
      await setOrderStatus(cancellingOrder.id, ORDER_STATUS.DIBATALKAN);
      success(`Pesanan ${cancellingOrder.kode_pesanan} dibatalkan. Stok dikembalikan.`);
      setCancellingOrder(null);
    } catch (err) {
      error(err.message ?? 'Gagal membatalkan pesanan.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleCancelExpired = async () => {
    setIsBusy(true);
    try {
      const count = await cancelExpired();
      if (count > 0) {
        success(`${count} pesanan kedaluwarsa dibatalkan otomatis.`);
      } else {
        info('Tidak ada pesanan yang kedaluwarsa.');
      }
    } catch (err) {
      error(err.message ?? 'Gagal menjalankan pembatalan otomatis.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Kelola Pesanan"
        description="Geser status satu langkah sesuai alur PRD 4.3. Membatalkan pesanan mengembalikan stok produk."
        action={
          <Button
            variant="secondary"
            onClick={handleCancelExpired}
            isLoading={isBusy}
            iconLeft={<IconClock className="h-4 w-4" />}
          >
            Batalkan kedaluwarsa
          </Button>
        }
      />

      {/* Filter status */}
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {STATUS_FILTERS.map((option) => {
          const count =
            option.value === 'semua'
              ? orders.length
              : orders.filter((order) => order.status === option.value).length;
          const isActive = filter === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              aria-pressed={isActive}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'bg-cocoa-800 text-cream-50 shadow-soft'
                  : 'bg-white text-cocoa-600 ring-1 ring-cocoa-200 hover:bg-cocoa-50'
              }`}
            >
              {option.label}
              <span className={`ml-2 text-xs ${isActive ? 'text-cream-200' : 'text-cocoa-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Petunjuk QA: daftar kosong umumnya karena peran admin belum terpasang di database */}
      {!isLoading && orders.length === 0 && filter === 'semua' ? (
        <div className="rounded-card border border-butter-200 bg-butter-50 p-4 text-sm leading-relaxed text-cocoa-600">
          <p className="font-bold text-cocoa-800">Tidak ada pesanan yang dapat ditampilkan</p>
          <p className="mt-1">
            Jika Anda baru diangkat sebagai admin, jalankan di SQL Editor:
            <code className="mx-1.5 rounded-md bg-white px-2 py-0.5 font-mono text-xs ring-1 ring-cocoa-200">
              select public.vd_grant_admin('email-anda@gmail.com');
            </code>
            lalu keluar &amp; masuk kembali ke aplikasi.
          </p>
        </div>
      ) : null}

      <OrdersTable
        orders={visibleOrders}
        isLoading={isLoading}
        onOpenDetail={setDetailOrder}
        onAdvance={handleAdvance}
        onCancel={setCancellingOrder}
      />

      <OrderDetailModal
        isOpen={Boolean(detailOrder)}
        order={detailOrder}
        onClose={() => setDetailOrder(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(cancellingOrder)}
        onClose={() => setCancellingOrder(null)}
        onConfirm={handleCancel}
        isLoading={isBusy}
        title={`Batalkan ${cancellingOrder?.kode_pesanan ?? ''}?`}
        description="Stok produk pada pesanan ini akan dikembalikan ke katalog."
        confirmLabel="Ya, Batalkan Pesanan"
      />
    </div>
  );
}
