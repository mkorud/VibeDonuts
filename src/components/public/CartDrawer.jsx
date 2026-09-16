import { useCart } from '../../hooks/useCart';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../hooks/useAuth';
import { useEscapeKey, useLockBodyScroll } from '../../hooks/useUiHelpers';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { IconCart, IconClose, IconArrowRight } from '../common/Icons';

/**
 * Sidebar keranjang belanja yang bisa dibuka & ditutup (PRD 2.2 + 3.2).
 *
 * Desain sebagai panel samping (drawer) supaya pelanggan bisa melihat isi
 * keranjang tanpa meninggalkan halaman katalog - penting di layar HP.
 */
export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    subtotal,
    totalItems,
    updateQuantity,
    removeItem,
  } = useCart();

  const { ongkosKirim } = useSettings();
  const { isAuthenticated, openAuthModal } = useAuth();

  useLockBodyScroll(isOpen);
  useEscapeKey(closeCart, isOpen);

  /** Checkout khusus akun (Supabase Auth). Tamu dipicu lewat popup login dulu. */
  const handleCheckout = () => {
    closeCart();
    if (!isAuthenticated) {
      openAuthModal('login', { redirectTo: '/checkout' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Keranjang belanja">
      {/* Area gelap: klik untuk menutup */}
      <button
        type="button"
        aria-label="Tutup keranjang"
        tabIndex={-1}
        onClick={closeCart}
        className="absolute inset-0 cursor-default bg-cocoa-900/45 backdrop-blur-sm"
      />

      {/* Panel keranjang */}
      <aside className="vd-slide-in-right relative flex h-full w-full max-w-md flex-col bg-cream-100 shadow-lift">
        {/* Kepala panel */}
        <header className="flex items-center justify-between gap-3 border-b border-cocoa-100 bg-white px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blush-100 text-blush-600">
              <IconCart className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-cocoa-900">Keranjang Belanja</h2>
              <p className="text-xs text-cocoa-400">
                {totalItems > 0 ? `${totalItems} buah donat dipilih` : 'Belum ada barang'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Tutup keranjang"
            className="rounded-full p-2 text-cocoa-400 transition hover:bg-cocoa-100 hover:text-cocoa-700"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </header>

        {/* Isi keranjang */}
        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-5">
            <EmptyState
              icon={<IconCart className="h-7 w-7" />}
              title="Keranjang masih kosong"
              description="Yuk pilih donat favorit Anda dulu. Stok terbaru selalu tampil di halaman katalog."
              className="w-full"
              action={
                <Button to="/produk" onClick={closeCart} iconRight={<IconArrowRight className="h-4 w-4" />}>
                  Lihat Katalog Donat
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 divide-y divide-cocoa-100 overflow-y-auto bg-white px-5">
              {items.map((item) => (
                <CartItem
                  key={item.product_id}
                  item={item}
                  compact
                  onQuantityChange={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <footer className="border-t border-cocoa-100 bg-cream-50 p-5">
              <CartSummary
                subtotal={subtotal}
                ongkosKirim={ongkosKirim}
                totalItems={totalItems}
                className="p-0 shadow-none ring-0"
                note="Ongkos kirim flat untuk area Kudus. Konfirmasi alamat saat checkout."
              >
                <Button
                  to={isAuthenticated ? '/checkout' : undefined}
                  onClick={handleCheckout}
                  variant="primary"
                  fullWidth
                  size="lg"
                  iconRight={<IconArrowRight className="h-4 w-4" />}
                >
                  {isAuthenticated ? 'Lanjut ke Checkout' : 'Masuk untuk Checkout'}
                </Button>
                <div className="flex gap-2">
                  <Button to="/keranjang" variant="secondary" fullWidth onClick={closeCart}>
                    Lihat Keranjang
                  </Button>
                  <Button variant="ghost" onClick={closeCart} className="shrink-0">
                    Lanjut Belanja
                  </Button>
                </div>
              </CartSummary>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

