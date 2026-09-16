import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { formatRupiah, formatDateTime } from '../../lib/format';
import { TrackOrderForm } from '../../components/public/TrackOrderForm';
import { OrderStatusBadge } from '../../components/public/OrderStatusBadge';
import { OrderTimeline } from '../../components/public/OrderTimeline';
import { SectionHeading } from '../../components/common/SectionHeading';
import { EmptyState } from '../../components/common/EmptyState';
import { Loading } from '../../components/common/Loading';
import { IconSearch } from '../../components/common/Icons';

/** Halaman Lacak Pesanan (PRD P-7): kode pesanan + nomor HP. */
export function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const { findForTracking } = useOrders();

  const [order, setOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async ({ kode, noHp }) => {
    setIsSearching(true);
    setErrorMessage('');

    try {
      const found = await findForTracking(kode, noHp);
      setOrder(found);
    } catch (err) {
      setOrder(null);
      setErrorMessage(err.message ?? 'Pesanan tidak ditemukan.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container-page py-10 lg:py-14">
      <SectionHeading
        eyebrow="Lacak Pesanan"
        title="Di mana donat saya?"
        description="Masukkan kode pesanan dan nomor HP yang Anda pakai saat memesan. Tanpa perlu login."
      />

      <div className="mt-8 max-w-2xl">
        <TrackOrderForm
          onSubmit={handleSearch}
          isLoading={isSearching}
          defaultKode={searchParams.get('kode') ?? ''}
        />
      </div>

      {isSearching ? <Loading label="Mencari pesanan..." className="py-10" /> : null}

      {!isSearching && errorMessage ? (
        <div className="mt-8 max-w-2xl">
          <EmptyState
            icon={<IconSearch className="h-7 w-7" />}
            title="Pesanan tidak ditemukan"
            description={errorMessage}
          />
        </div>
      ) : null}

      {!isSearching && !errorMessage && !order ? (
        <div className="mt-8 max-w-2xl">
          <EmptyState
            icon={<IconSearch className="h-7 w-7" />}
            title="Masukkan data untuk mulai melacak"
            description="Kode pesanan terlihat di halaman konfirmasi setelah Anda checkout, formatnya VD-YYMM-XXXX."
          />
        </div>
      ) : null}

      {order && !isSearching ? (
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_400px]">
          {/* Progres */}
          <div className="rounded-card bg-white p-5 shadow-soft ring-1 ring-cocoa-100 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-cocoa-900">{order.kode_pesanan}</h2>
                <p className="text-xs text-cocoa-400">
                  Dibuat {formatDateTime(order.dibuat_pada)} - a.n {order.nama_pelanggan}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="mt-6">
              <OrderTimeline status={order.status} />
            </div>

            <p className="mt-6 border-t border-cocoa-100 pt-4 text-xs leading-relaxed text-cocoa-400">
              Dikirim ke: <span className="text-cocoa-600">{order.alamat}</span>
            </p>
          </div>

          {/* Ringkasan biaya */}
          <div className="rounded-card bg-white p-5 shadow-soft ring-1 ring-cocoa-100 sm:p-6">
            <h3 className="text-base font-bold text-cocoa-900">Ringkasan Pesanan</h3>

            <ul className="mt-4 space-y-3 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block font-semibold text-cocoa-800">{item.nama_produk}</span>
                    <span className="text-xs text-cocoa-400">
                      {item.jumlah} x {formatRupiah(item.harga_satuan)}
                    </span>
                  </span>
                  <span className="font-bold text-cocoa-800">{formatRupiah(item.subtotal)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2 border-t border-dashed border-cocoa-200 pt-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-cocoa-500">Ongkos kirim</dt>
                <dd className="font-semibold text-cocoa-800">
                  {formatRupiah(order.ongkos_kirim)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-bold text-cocoa-900">Total bayar</dt>
                <dd className="text-lg font-extrabold text-blush-500">
                  {formatRupiah(order.total_bayar)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      ) : null}
    </div>
  );
}
