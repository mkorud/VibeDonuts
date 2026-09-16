import { createContext, useCallback, useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../hooks/useToast';
import { STORAGE_KEYS } from '../lib/storage';
import { MAX_QTY_PER_ITEM } from '../lib/constants';

export const CartContext = createContext(null);

/**
 * State keranjang belanja (PRD 2.2).
 *
 * - Disimpan di localStorage lewat useLocalStorage sehingga isi keranjang
 *   tidak hilang saat halaman di-refresh (K-2).
 * - Harga & nama produk disalin ke item keranjang sebagai "snapshot" untuk
 *   tampilan. Saat checkout, harga tetap dihitung ulang dari database (4.2 & 4.4).
 */
export function CartProvider({ children }) {
  const [storedItems, setItems, resetCart] = useLocalStorage(STORAGE_KEYS.cart, []);
  const [isOpen, setIsOpen] = useState(false);
  const { success, error, info } = useToast();

  // Bila data di localStorage korup (bukan array), perlakukan sebagai keranjang kosong
  // agar aplikasi tetap jalan dan tidak layar putih.
  const items = Array.isArray(storedItems) ? storedItems : [];

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((open) => !open), []);

  /** Tambah produk ke keranjang, sekaligus mematuhi aturan stok (PRD P-5 & 4.4). */
  const addItem = useCallback(
    (product, jumlah = 1) => {
      if (!product) return;

      if (product.stok <= 0) {
        error(`Maaf, ${product.nama} sedang habis.`);
        return;
      }

      const qty = Math.max(1, Math.trunc(Number(jumlah) || 1));

      setItems((current) => {
        const existing = current.find((item) => String(item.product_id) === String(product.id));
        const currentQty = existing ? existing.jumlah : 0;
        const requested = currentQty + qty;
        const limit = Math.min(product.stok, MAX_QTY_PER_ITEM);
        const finalQty = Math.min(requested, limit);

        if (finalQty === currentQty) {
          info(
            product.stok <= currentQty
              ? `Stok ${product.nama} tinggal ${product.stok} buah.`
              : `Maksimal ${MAX_QTY_PER_ITEM} buah per produk dalam satu pesanan.`,
          );
          return current;
        }

        if (finalQty < requested) {
          info(`Jumlah ${product.nama} disesuaikan dengan sisa stok (${finalQty} buah).`);
        } else {
          success(`${product.nama} ditambahkan ke keranjang.`);
        }

        const snapshot = {
          product_id: product.id,
          nama: product.nama,
          slug: product.slug,
          harga: product.harga,
          url_foto: product.url_foto,
          stok: product.stok,
          jumlah: finalQty,
        };

        return existing
          ? current.map((item) => (item.product_id === product.id ? snapshot : item))
          : [...current, snapshot];
      });
    },
    [setItems, success, error, info],
  );

  /** Ubah jumlah sebuah item (PRD K-3). */
  const updateQuantity = useCallback(
    (productId, jumlah) => {
      const qty = Math.trunc(Number(jumlah) || 0);
      if (qty <= 0) {
        setItems((current) => current.filter((item) => item.product_id !== productId));
        return;
      }
      setItems((current) =>
        current.map((item) =>
          String(item.product_id) === String(productId)
            ? { ...item, jumlah: Math.min(qty, item.stok, MAX_QTY_PER_ITEM) }
            : item,
        ),
      );
    },
    [setItems],
  );

  const increment = useCallback(
    (productId) => {
      setItems((current) =>
        current.map((item) => {
          if (String(item.product_id) !== String(productId)) return item;
          const limit = Math.min(item.stok, MAX_QTY_PER_ITEM);
          if (item.jumlah >= limit) {
            info(limit <= item.stok ? `Maksimal ${limit} buah per produk.` : `Sisa stok ${item.stok} buah.`);
            return item;
          }
          return { ...item, jumlah: item.jumlah + 1 };
        }),
      );
    },
    [setItems, info],
  );

  const decrement = useCallback(
    (productId) => {
      setItems((current) =>
        current.map((item) =>
          String(item.product_id) === String(productId)
            ? { ...item, jumlah: Math.max(1, item.jumlah - 1) }
            : item,
        ),
      );
    },
    [setItems],
  );

  /** Hapus satu barang dari keranjang. */
  const removeItem = useCallback(
    (productId) => {
      setItems((current) => current.filter((item) => String(item.product_id) !== String(productId)));
      info('Barang dihapus dari keranjang.');
    },
    [setItems, info],
  );

  /** Kosongkan keranjang (dipakai setelah checkout berhasil). */
  const clearCart = useCallback(() => {
    resetCart();
  }, [resetCart]);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.jumlah, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.harga * item.jumlah, 0),
    [items],
  );

  const hasItem = useCallback(
    (productId) => items.some((item) => String(item.product_id) === String(productId)),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      totalItems,
      subtotal,
      isEmpty: items.length === 0,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      updateQuantity,
      increment,
      decrement,
      removeItem,
      clearCart,
      hasItem,
    }),
    [
      items,
      totalItems,
      subtotal,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      updateQuantity,
      increment,
      decrement,
      removeItem,
      clearCart,
      hasItem,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
