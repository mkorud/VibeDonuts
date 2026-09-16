import { DataTable } from './DataTable';
import { OrderStatusBadge } from '../public/OrderStatusBadge';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { Modal } from '../common/Modal';
import { formatRupiah, formatDateTime } from '../../lib/format';
import { ORDER_STATUS, ORDER_STATUS_FLOW } from '../../lib/constants';
import { IconSearch, IconReceipt } from '../common/Icons';

/** Status berikutnya setelah `status` (PRD 4.3: maju satu langkah). */
function nextStatus(status) {
  const index = ORDER_STATUS_FLOW.indexOf(status);
  if (index === -1 || index === ORDER_STATUS_FLOW.length - 1) return null;
  return ORDER_STATUS_FLOW[index + 1];
}

/**
 * Tabel kelola pesanan (PRD A-6).
 * Admin dapat melihat detail, menggeser status satu langkah, atau membatalkan
 * pesanan yang belum dibayar.
 */
export function OrdersTable({
  orders = [],
  isLoading = false,
  onOpenDetail,
  onAdvance,
  onCancel,
  emptyState = null,
}) {
  const columns = [
    {
      key: 'kode_pesanan',
      header: 'Kode & Waktu',
      render: (order) => (
        <div>
          <p className="font-bold text-cocoa-900">{order.kode_pesanan}</p>
          <p className="text-xs text-cocoa-400">{formatDateTime(order.dibuat_pada)}</p>
        </div>
      ),
    },
    {
      key: 'pelanggan',
      header: 'Pelanggan',
      render: (order) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-cocoa-800">{order.nama_pelanggan}</p>
          <p className="truncate text-xs text-cocoa-400">{order.no_hp}</p>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Isi Pesanan',
      render: (order) => {
        const first = order.items?.[0];
        const restCount = (order.items?.length ?? 0) - 1;

        return (
          <div className="min-w-0">
            <p className="truncate text-cocoa-700">
              {first ? `${first.jumlah}x ${first.nama_produk}` : '-'}
            </p>
            {restCount > 0 ? (
              <p className="text-xs text-cocoa-400">+{restCount} produk lainnya</p>
            ) : null}
          </div>
        );
      },
    },
    {
      key: 'total_bayar',
      header: 'Total',
      render: (order) => (
        <span className="font-bold text-cocoa-900">{formatRupiah(order.total_bayar)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (order) => <OrderStatusBadge status={order.status} />,
    },
    {
      key: 'aksi',
      header: 'Aksi',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (order) => {
        const next = nextStatus(order.status);
        // PRD 4.3: admin boleh membatalkan selama pesanan belum Selesai/Dibatalkan.
        // Pembatalan lewat vd_cancel_order mengembalikan stok secara otomatis.
        const cancellable =
          order.status !== ORDER_STATUS.SELESAI && order.status !== ORDER_STATUS.DIBATALKAN;

        return (
          <div className="flex flex-wrap justify-end gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenDetail(order)}
              iconLeft={<IconSearch className="h-3.5 w-3.5" />}
            >
              Detail
            </Button>

            {next ? (
              <Button variant="primary" size="sm" onClick={() => onAdvance(order, next)}>
                {next === ORDER_STATUS.SELESAI ? 'Tandai Selesai' : `Ke ${next}`}
              </Button>
            ) : null}

            {cancellable ? (
              <Button variant="ghost" size="sm" onClick={() => onCancel(order)}>
                Batalkan
              </Button>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={orders}
      isLoading={isLoading}
      emptyState={
        emptyState ?? (
          <EmptyState
            icon={<IconReceipt className="h-7 w-7" />}
            title="Belum ada pesanan"
            description="Pesanan pelanggan akan tampil di sini setelah ada yang checkout."
          />
        )
      }
    />
  );
}

/** Modal detail pesanan: data pelanggan, alamat, rincian item, dan bukti transfer. */
export function OrderDetailModal({ isOpen, onClose, order }) {
  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pesanan ${order.kode_pesanan}`}
      description={`${order.nama_pelanggan} - ${formatDateTime(order.dibuat_pada)}`}
      size="lg"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <OrderStatusBadge status={order.status} />
          <p className="text-lg font-extrabold text-blush-500">{formatRupiah(order.total_bayar)}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-cream-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-400">Kontak</p>
            <p className="mt-1 text-sm font-semibold text-cocoa-800">{order.nama_pelanggan}</p>
            <p className="text-sm text-cocoa-500">{order.no_hp}</p>
          </div>

          <div className="rounded-xl bg-cream-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-400">
              Bukti Transfer
            </p>
            <p className="mt-1 text-sm text-cocoa-600">
              {order.url_bukti_transfer ? (
                <a
                  href={order.url_bukti_transfer}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-blush-500 hover:underline"
                >
                  Lihat bukti transfer
                </a>
              ) : (
                'Belum diunggah'
              )}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-400">
            Alamat Pengiriman
          </p>
          <p className="mt-1 text-sm leading-relaxed text-cocoa-700">{order.alamat}</p>
          {order.catatan ? (
            <p className="mt-2 text-xs italic text-cocoa-400">Catatan: {order.catatan}</p>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-xl ring-1 ring-cocoa-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream-50 text-xs uppercase tracking-wide text-cocoa-400">
              <tr>
                <th className="px-4 py-2.5">Produk</th>
                <th className="px-4 py-2.5 text-center">Qty</th>
                <th className="px-4 py-2.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cocoa-100">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2.5 font-medium text-cocoa-800">{item.nama_produk}</td>
                  <td className="px-4 py-2.5 text-center text-cocoa-600">{item.jumlah}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-cocoa-800">
                    {formatRupiah(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-cream-50 text-sm">
              <tr>
                <td colSpan={2} className="px-4 py-2 text-cocoa-500">
                  Total barang
                </td>
                <td className="px-4 py-2 text-right font-semibold text-cocoa-800">
                  {formatRupiah(order.total_barang)}
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="px-4 pb-2 text-cocoa-500">
                  Ongkos kirim
                </td>
                <td className="px-4 pb-2 text-right font-semibold text-cocoa-800">
                  {formatRupiah(order.ongkos_kirim)}
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="px-4 pb-3 font-bold text-cocoa-900">
                  Total bayar
                </td>
                <td className="px-4 pb-3 text-right font-extrabold text-blush-500">
                  {formatRupiah(order.total_bayar)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Modal>
  );
}
