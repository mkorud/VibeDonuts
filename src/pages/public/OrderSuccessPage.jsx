import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useSettings } from '../../hooks/useSettings';
import { useToast } from '../../hooks/useToast';
import { formatRupiah, formatDateTime } from '../../lib/format';
import { ORDER_STATUS, TRANSFER_PROOF_HINT } from '../../lib/constants';
import { OrderStatusBadge } from '../../components/public/OrderStatusBadge';
import { OrderTimeline } from '../../components/public/OrderTimeline';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { IconCheckCircle, IconReceipt, IconTag, IconWhatsapp } from '../../components/common/Icons';

/** Halaman konfirmasi & instruksi pembayaran (PRD K-6 & K-7). */
export function OrderSuccessPage() {
  const { orderId } = useParams();
  const { getOrderById, isLoading, uploadTransferProof } = useOrders();
  const { settings } = useSettings();
  const { success, error } = useToast();
  const [proofUrl, setProofUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const order = getOrderById(orderId);

  if (isLoading) {
    return <Loading label="Memuat pesanan..." fullScreen />;
  }

  if (!order) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<IconReceipt className="h-7 w-7" />}
          title="Pesanan tidak ditemukan"
          description="Pesanan ini bukan milik akun Anda atau sudah tidak tersedia. Gunakan halaman Lacak Pesanan (kode pesanan + nomor HP) untuk memeriksanya."
          action={
            <Button to="/lacak">Buka Lacak Pesanan</Button>
          }
        />
      </div>
    );
  }

  const canUploadProof =
    order.status === ORDER_STATUS.MENUNGGU_PEMBAYARAN ||
    order.status === ORDER_STATUS.MENUNGGU_VERIFIKASI;

  const handleUploadProof = async (event) => {
    event.preventDefault();
    if (!/^https?:\/\//i.test(proofUrl.trim())) {
      error('Tempel tautan bukti transfer yang diawali http:// atau https://');
      return;
    }

    setIsUploading(true);
    try {
      await uploadTransferProof(order.id, proofUrl.trim());
      setProofUrl('');
      success('Bukti transfer terkirim. Admin akan memverifikasi maksimal 1x24 jam.');
    } catch (err) {
      error(err.message ?? 'Gagal menyimpan bukti transfer.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container-page py-10 lg:py-14">
      {/* Banner sukses */}
      <div className="vd-fade-up flex items-start gap-4 rounded-card bg-emerald-50 p-5 ring-1 ring-emerald-100 sm:items-center sm:p-6">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <IconCheckCircle className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-xl font-extrabold text-emerald-800 sm:text-2xl">
            Pesanan berhasil dibuat!
          </h1>
          <p className="mt-1 text-sm text-emerald-700">
            Simpan kode pesanan ini: <strong>{order.kode_pesanan}</strong> - dibuat{' '}
            {formatDateTime(order.dibuat_pada)}
          </p>
        </div>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_400px]">
        {/* Progres pesanan */}
        <div className="rounded-card bg-white p-5 shadow-soft ring-1 ring-cocoa-100 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-cocoa-900">Status Pesanan</h2>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="mt-6">
            <OrderTimeline status={order.status} />
          </div>

          <p className="mt-6 border-t border-cocoa-100 pt-4 text-xs leading-relaxed text-cocoa-400">
            Alamat pengiriman: <span className="text-cocoa-600">{order.alamat}</span> -{' '}
            <Link to="/lacak" className="font-semibold text-cocoa-700">
              lacak pesanan ini
            </Link>
          </p>
        </div>

        {/* Instruksi pembayaran */}
        <div className="space-y-4">
          <div className="rounded-card bg-white p-5 shadow-soft ring-1 ring-cocoa-100 sm:p-6">
            <h2 className="text-base font-bold text-cocoa-900">Instruksi Pembayaran</h2>

            <p className="mt-3 text-3xl font-extrabold text-blush-500">
              {formatRupiah(order.total_bayar)}
            </p>
            <p className="mt-1 text-xs text-cocoa-400">
              {formatRupiah(order.total_barang)} barang
              {Number(order.diskon) > 0 ? ` - ${formatRupiah(order.diskon)} diskon kupon` : ''} +{' '}
              {formatRupiah(order.ongkos_kirim)} ongkos kirim
            </p>

            {/* Kupon promo yang dipakai (mini-challenge) — nilainya dihitung server */}
            {Number(order.diskon) > 0 || order.kode_kupon ? (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                <IconTag className="h-3.5 w-3.5" />
                Kupon {order.kode_kupon || 'promo'} aktif - hemat {formatRupiah(order.diskon)}
              </span>
            ) : null}

            <dl className="mt-5 space-y-2.5 rounded-xl bg-cream-100 p-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-cocoa-500">Bank</dt>
                <dd className="font-bold text-cocoa-900">{settings.nama_bank}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-cocoa-500">Nomor rekening</dt>
                <dd className="font-bold text-cocoa-900">{settings.nomor_rekening}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-cocoa-500">Atas nama</dt>
                <dd className="font-bold text-cocoa-900">{settings.atas_nama}</dd>
              </div>
            </dl>

            <p className="mt-4 text-xs leading-relaxed text-cocoa-400">{TRANSFER_PROOF_HINT}</p>

            <a
              href={`https://wa.me/${String(settings.whatsapp_toko ?? '').replace(/[^\d]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-cocoa-700 ring-1 ring-cocoa-200 transition hover:bg-cocoa-50"
            >
              <IconWhatsapp className="h-4 w-4" />
              Konfirmasi via WhatsApp
            </a>
          </div>

          {/* Unggah bukti transfer (PRD K-7) */}
          {canUploadProof ? (
            <form
              onSubmit={handleUploadProof}
              className="rounded-card bg-white p-5 shadow-soft ring-1 ring-cocoa-100 sm:p-6"
            >
              <h2 className="text-base font-bold text-cocoa-900">Unggah Bukti Transfer</h2>
              <p className="mt-1 text-xs text-cocoa-400">
                Tempel tautan foto bukti transfer (misalnya dari Google Drive atau Imgur).
              </p>

              <Input
                label="Tautan bukti transfer"
                name="url_bukti_transfer"
                value={proofUrl}
                onChange={(event) => setProofUrl(event.target.value)}
                placeholder="https://..."
                containerClassName="mt-4"
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                className="mt-4"
                isLoading={isUploading}
              >
                Kirim Bukti Transfer
              </Button>
            </form>
          ) : (
            <Button to="/produk" variant="secondary" fullWidth>
              Pesan donat lagi
            </Button>
          )}
        </div>
      </div>

      {/* Rincian item */}
      <div className="mt-8 overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-cocoa-100">
        <div className="border-b border-cocoa-100 px-5 py-4">
          <h2 className="text-base font-bold text-cocoa-900">Rincian Pesanan</h2>
        </div>

        <ul className="divide-y divide-cocoa-100 px-5">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
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

        <p className="px-5 py-4 text-xs text-cocoa-400">
          Catatan pesanan: {order.catatan || 'tidak ada catatan'}
        </p>
      </div>
    </div>
  );
}
