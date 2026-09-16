import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { fetchOrdersByUser } from '../../services/orderService';
import { formatRupiah, formatDateTime } from '../../lib/format';
import { OrderStatusBadge } from '../../components/public/OrderStatusBadge';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorNotice } from '../../components/common/ErrorNotice';
import { SectionHeading } from '../../components/common/SectionHeading';
import {
  IconArrowRight,
  IconBox,
  IconChart,
  IconReceipt,
  IconUser,
  IconWallet,
} from '../../components/common/Icons';

/** Baris ringkas satu pesanan di riwayat pembeli. */
function OrderHistoryRow({ order }) {
  const first = order.items?.[0];
  const restCount = (order.items?.length ?? 0) - 1;

  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-cocoa-900">{order.kode_pesanan}</p>
          <OrderStatusBadge status={order.status} size="sm" />
        </div>
        <p className="mt-1 truncate text-xs text-cocoa-400">
          {formatDateTime(order.dibuat_pada)} -{' '}
          {first ? `${first.jumlah}x ${first.nama_produk}` : '-'}
          {restCount > 0 ? ` +${restCount} produk lain` : ''}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <p className="text-sm font-extrabold text-cocoa-900">{formatRupiah(order.total_bayar)}</p>
        <Button
          to={`/pesanan/${order.id}`}
          variant="secondary"
          size="sm"
          iconRight={<IconArrowRight className="h-3.5 w-3.5" />}
        >
          Detail
        </Button>
      </div>
    </li>
  );
}

/**
 * Dashboard Pembeli (hari ke-3): profil singkat + riwayat pesanan milik akun.
 * Dilindungi RequireAuth — tamu yang mengetik /akun langsung dialihkan ke beranda.
 */
export function CustomerDashboardPage() {
  const { user, userEmail, signOut, isAdmin } = useAuth();
  const { error: showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadOrders = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      setOrders(await fetchOrdersByUser(user.id));
    } catch (err) {
      const message = err.message ?? 'Gagal memuat riwayat pesanan.';
      setErrorMessage(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, showError]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const totalBelanja = orders
    .filter((order) => order.status !== 'Dibatalkan')
    .reduce((sum, order) => sum + order.total_bayar, 0);

  return (
    <div className="container-page py-10 lg:py-14">
      <SectionHeading
        eyebrow="Akun Saya"
        title="Dashboard Pembeli"
        description="Riwayat pesanan Anda tersimpan otomatis di akun — tidak perlu mencatat kode pesanan lagi."
      />

      <ErrorNotice message={errorMessage} onRetry={loadOrders} className="mt-6" />

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[320px_1fr]">
        {/* Kartu profil */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-card bg-white p-5 shadow-soft ring-1 ring-cocoa-100 sm:p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blush-100 text-blush-600">
              <IconUser className="h-6 w-6" />
            </span>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-cocoa-400">
              Email akun
            </p>
            <p className="mt-1 break-all text-sm font-bold text-cocoa-900">{userEmail}</p>

            <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-cocoa-100 pt-4 text-center">
              <div>
                <dt className="text-xs text-cocoa-400">Pesanan</dt>
                <dd className="text-lg font-extrabold text-cocoa-900">{orders.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-cocoa-400">Total belanja</dt>
                <dd className="text-sm font-extrabold text-blush-500">
                  {formatRupiah(totalBelanja)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 space-y-2">
              <Button
                to="/produk"
                variant="secondary"
                fullWidth
                iconLeft={<IconBox className="h-4 w-4" />}
              >
                Belanja Lagi
              </Button>
              <Button variant="ghost" fullWidth onClick={signOut}>
                Keluar dari Akun
              </Button>
            </div>
          </div>

          {/* Pintasan khusus admin (bila email akun terdaftar di VITE_ADMIN_EMAILS) */}
          {isAdmin ? (
            <div className="rounded-card bg-cocoa-800 p-5 shadow-soft sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-cream-200">
                Akses Pemilik Toko
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-cream-100">
                Akun ini terdaftar sebagai admin VibeDonuts. Kelola produk, pesanan, dan pengaturan
                toko dari dashboard admin.
              </p>
              <Button
                to="/admin"
                variant="blush"
                fullWidth
                className="mt-4"
                iconLeft={<IconChart className="h-4 w-4" />}
              >
                Buka Dashboard Admin
              </Button>
            </div>
          ) : null}
        </div>

        {/* Riwayat pesanan */}
        <div className="rounded-card bg-white p-5 shadow-soft ring-1 ring-cocoa-100 sm:p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-cocoa-900">
            <IconReceipt className="h-5 w-5 text-blush-500" />
            Riwayat Pesanan
          </h2>

          {isLoading ? (
            <Loading label="Memuat riwayat pesanan..." />
          ) : orders.length === 0 ? (
            <EmptyState
              icon={<IconWallet className="h-7 w-7" />}
              title="Belum ada pesanan"
              description="Pesanan yang Anda checkout lewat akun ini akan tampil di sini."
              className="mt-4 border-none bg-cream-50"
              action={
                <Button to="/produk" iconRight={<IconArrowRight className="h-4 w-4" />}>
                  Lihat Katalog Donat
                </Button>
              }
            />
          ) : (
            <ul className="mt-2 divide-y divide-cocoa-100">
              {orders.map((order) => (
                <OrderHistoryRow key={order.id} order={order} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

