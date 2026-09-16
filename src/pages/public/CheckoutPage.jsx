import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useSettings } from '../../hooks/useSettings';
import { useOrders } from '../../hooks/useOrders';
import { useToast } from '../../hooks/useToast';
import { formatRupiah } from '../../lib/format';
import { CheckoutForm } from '../../components/public/CheckoutForm';
import { CartSummary } from '../../components/public/CartSummary';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { SectionHeading } from '../../components/common/SectionHeading';
import { Loading } from '../../components/common/Loading';
import { IconArrowRight, IconCart } from '../../components/common/Icons';

/**
 * Halaman checkout (PRD K-5 & 4.2).
 * Pelanggan mengisi nama, nomor HP, alamat; total dihitung ulang oleh service
 * saat pesanan dibuat (tidak mempercayai angka browser).
 */
export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, isEmpty, subtotal, totalItems, clearCart } = useCart();
  const { ongkosKirim, settings } = useSettings();
  const { placeOrder } = useOrders();
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isEmpty) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<IconCart className="h-7 w-7" />}
          title="Belum ada yang di-checkout"
          description="Keranjang masih kosong. Pilih donat dulu, lalu kembali ke halaman ini."
          action={
            <Button to="/produk" iconRight={<IconArrowRight className="h-4 w-4" />}>
              Lihat Katalog Donat
            </Button>
          }
        />
      </div>
    );
  }

  const handleSubmit = async (formValues) => {
    setIsSubmitting(true);
    try {
      const order = await placeOrder({
        ...formValues,
        ongkos_kirim: ongkosKirim,
        items: items.map((item) => ({
          product_id: item.product_id,
          jumlah: item.jumlah,
        })),
      });

      success(`Pesanan ${order.kode_pesanan} berhasil dibuat!`);

      // Keranjang dikosongkan HANYA setelah pesanan berhasil dibuat.
      // Bila checkout gagal (mis. stok kurang), isi keranjang dipertahankan
      // agar pelanggan tinggal menyesuaikan jumlahnya.
      clearCart();

      navigate(`/pesanan/${order.id}`);
    } catch (err) {
      error(err.message ?? 'Gagal membuat pesanan. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-page py-10 lg:py-14">
      <SectionHeading
        eyebrow="Checkout"
        title="Data Pengiriman"
        description="Isi data pemesan. Setelah ini Anda tinggal melakukan transfer sesuai total."
      />

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        {/* Formulir */}
        <div className="rounded-card bg-white p-5 shadow-soft ring-1 ring-cocoa-100 sm:p-6">
          <CheckoutForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </div>

        {/* Ringkasan pesanan */}
        <div className="lg:sticky lg:top-24">
          <div className="rounded-card bg-white p-5 shadow-soft ring-1 ring-cocoa-100">
            <h2 className="text-base font-bold text-cocoa-900">
              Donat dipesan ({totalItems} buah)
            </h2>

            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={item.product_id} className="flex items-start justify-between gap-3 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-cocoa-800">
                      {item.nama}
                    </span>
                    <span className="text-xs text-cocoa-400">
                      {item.jumlah} x {formatRupiah(item.harga)}
                    </span>
                  </span>
                  <span className="shrink-0 font-bold text-cocoa-800">
                    {formatRupiah(item.harga * item.jumlah)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <CartSummary
            subtotal={subtotal}
            ongkosKirim={ongkosKirim}
            totalItems={totalItems}
            className="mt-4"
            note={`Transfer ke ${settings.nama_bank} ${settings.nomor_rekening} a.n. ${settings.atas_nama}. Instruksi lengkap muncul setelah pesanan dibuat.`}
          />
        </div>
      </div>

      {isSubmitting ? <Loading label="Menyimpan pesanan Anda..." className="py-8" /> : null}
    </div>
  );
}
