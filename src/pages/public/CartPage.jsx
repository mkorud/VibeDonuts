import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../hooks/useAuth';
import { formatRupiah } from '../../lib/format';
import { CartItem } from '../../components/public/CartItem';
import { CartSummary } from '../../components/public/CartSummary';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SectionHeading } from '../../components/common/SectionHeading';
import { useToast } from '../../hooks/useToast';
import { IconArrowRight, IconCart, IconTrash } from '../../components/common/Icons';

/** Halaman keranjang penuh (PRD K-1 s.d. K-3). */
export function CartPage() {
  const {
    items,
    isEmpty,
    subtotal,
    totalItems,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { ongkosKirim } = useSettings();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { success } = useToast();
  const [isConfirmClear, setIsConfirmClear] = useState(false);

  if (isEmpty) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<IconCart className="h-7 w-7" />}
          title="Keranjang masih kosong"
          description="Belum ada donat yang dipilih. Lihat katalog dan pilih favoritmu!"
          action={
            <Button to="/produk" iconRight={<IconArrowRight className="h-4 w-4" />}>
              Lihat Katalog Donat
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-10 lg:py-14">
      <SectionHeading
        eyebrow="Keranjang"
        title="Tinjau Pesananmu"
        description={`Ada ${totalItems} buah donat di keranjang. Periksa jumlahnya sebelum checkout.`}
        action={
          <Button
            variant="ghost"
            onClick={() => setIsConfirmClear(true)}
            iconLeft={<IconTrash className="h-4 w-4" />}
          >
            Kosongkan keranjang
          </Button>
        }
      />

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        {/* Daftar barang */}
        <div className="divide-y divide-cocoa-100 rounded-card bg-white px-5 shadow-soft ring-1 ring-cocoa-100 sm:px-6">
          {items.map((item) => (
            <CartItem
              key={item.product_id}
              item={item}
              onQuantityChange={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        {/* Ringkasan */}
        <div className="lg:sticky lg:top-24">
          <CartSummary
            subtotal={subtotal}
            ongkosKirim={ongkosKirim}
            totalItems={totalItems}
            note={`Ongkos kirim ${formatRupiah(ongkosKirim)} berlaku flat. Total akhir dikonfirmasi ulang saat pesanan dibuat.`}
          >
            <Button
              to={isAuthenticated ? '/checkout' : undefined}
              onClick={
                isAuthenticated
                  ? undefined
                  : () => openAuthModal('login', { redirectTo: '/checkout' })
              }
              variant="blush"
              size="lg"
              fullWidth
              iconRight={<IconArrowRight className="h-4 w-4" />}
            >
              {isAuthenticated ? 'Lanjut ke Checkout' : 'Masuk untuk Checkout'}
            </Button>

            <Button to="/produk" variant="secondary" fullWidth>
              Tambah donat lain
            </Button>
          </CartSummary>

          <p className="mt-4 text-center text-xs text-cocoa-400">
            Butuh bantuan? <Link to="/tentang" className="font-semibold text-cocoa-700">Hubungi kami</Link>
          </p>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmClear}
        onClose={() => setIsConfirmClear(false)}
        onConfirm={() => {
          clearCart();
          setIsConfirmClear(false);
          success('Keranjang dikosongkan.');
        }}
        title="Kosongkan keranjang?"
        description="Semua donat di keranjang akan dihapus."
        confirmLabel="Ya, kosongkan"
      />
    </div>
  );
}
