import { Link } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import { formatRupiah, formatDateTime } from '../../lib/format';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { StatCard } from '../../components/admin/StatCard';
import { OrderStatusBadge } from '../../components/public/OrderStatusBadge';
import { StockBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import {
  IconArrowRight,
  IconBox,
  IconClock,
  IconReceipt,
  IconTrendUp,
  IconWallet,
} from '../../components/common/Icons';

/** Dashboard admin: kartu ringkasan (PRD A-2) + daftar stok menipis & pesanan terbaru. */
export function DashboardPage() {
  const { stats, orders, isLoading } = useOrders();
  const { products, lowStockProducts } = useProducts();

  if (isLoading) {
    return <Loading label="Memuat ringkasan..." fullScreen />;
  }

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Dashboard"
        description="Ringkasan toko hari ini. Semua angka diperbarui otomatis saat ada pesanan masuk."
        action={
          <Button to="/admin/produk" variant="primary" iconLeft={<IconBox className="h-4 w-4" />}>
            Kelola Produk
          </Button>
        }
      />

      {/* Kartu ringkasan */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pesanan Baru"
          value={stats.pesananBaru}
          hint="Perlu verifikasi / diproses"
          icon={<IconReceipt className="h-5 w-5" />}
          accent="blush"
        />
        <StatCard
          label="Pesanan Hari Ini"
          value={stats.pesananHariIni}
          hint="Masuk sejak tengah malam"
          icon={<IconClock className="h-5 w-5" />}
          accent="cream"
        />
        <StatCard
          label="Penjualan Bulan Ini"
          value={formatRupiah(stats.penjualanBulanIni)}
          hint="Pesanan yang tidak dibatalkan"
          icon={<IconWallet className="h-5 w-5" />}
          accent="butter"
        />
        <StatCard
          label="Total Produk"
          value={products.length}
          hint={`${lowStockProducts.length} produk stok menipis`}
          icon={<IconTrendUp className="h-5 w-5" />}
          accent="dark"
        />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-2">
        {/* Stok menipis */}
        <section className="rounded-card bg-white p-5 shadow-soft ring-1 ring-cocoa-100 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-cocoa-900">Stok Menipis</h2>
            <Button to="/admin/produk" variant="ghost" size="sm">
              Atur stok
            </Button>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Semua stok aman. Tidak ada produk di bawah ambang batas.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-cocoa-100">
              {lowStockProducts.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-cocoa-900">{product.nama}</p>
                    <p className="text-xs text-cocoa-400">
                      {formatRupiah(product.harga)} - {product.stok} buah tersisa
                    </p>
                  </div>
                  <StockBadge stok={product.stok} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Pesanan terbaru */}
        <section className="rounded-card bg-white p-5 shadow-soft ring-1 ring-cocoa-100 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-cocoa-900">Pesanan Terbaru</h2>
            <Button
              to="/admin/pesanan"
              variant="ghost"
              size="sm"
              iconRight={<IconArrowRight className="h-3.5 w-3.5" />}
            >
              Semua pesanan
            </Button>
          </div>

          {recentOrders.length === 0 ? (
            <EmptyState
              icon={<IconReceipt className="h-7 w-7" />}
              title="Belum ada pesanan"
              description="Pesanan pelanggan akan muncul di sini."
              className="mt-4 border-none bg-cream-50"
            />
          ) : (
            <ul className="mt-4 divide-y divide-cocoa-100">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-cocoa-900">
                      {order.kode_pesanan}
                    </p>
                    <p className="truncate text-xs text-cocoa-400">
                      {order.nama_pelanggan} - {formatDateTime(order.dibuat_pada)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="hidden text-sm font-bold text-cocoa-800 sm:inline">
                      {formatRupiah(order.total_bayar)}
                    </span>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
