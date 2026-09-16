import { Link } from 'react-router-dom';
import { formatRupiah } from '../../lib/format';
import { QuantitySelector } from './QuantitySelector';
import { IconTrash } from '../common/Icons';
import { DECOR_IMAGES } from '../../data/seed';

/**
 * Satu baris barang di keranjang (PRD 3.2: "CartItem").
 * Dipakai di dalam CartDrawer (compact) maupun halaman /keranjang.
 */
export function CartItem({ item, onQuantityChange, onRemove, compact = false }) {
  const subtotal = item.harga * item.jumlah;
  const imageSrc = item.url_foto || DECOR_IMAGES.fallbackProduct;

  return (
    <div className="flex gap-3 py-4">
      {/* Foto produk */}
      <Link
        to={item.slug ? `/produk/${item.slug}` : '/produk'}
        className="shrink-0 overflow-hidden rounded-xl ring-1 ring-cocoa-100"
      >
        <img
          src={imageSrc}
          alt={item.nama}
          loading="lazy"
          className={`object-cover ${compact ? 'h-16 w-16' : 'h-20 w-20 sm:h-24 sm:w-24'}`}
        />
      </Link>

      {/* Info & pengaturan jumlah */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={item.slug ? `/produk/${item.slug}` : '/produk'}
              className="line-clamp-2 text-sm font-bold text-cocoa-900 transition hover:text-blush-500"
            >
              {item.nama}
            </Link>
            <p className="mt-0.5 text-xs text-cocoa-400">
              {formatRupiah(item.harga)} &times; {item.jumlah}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.product_id)}
            aria-label={`Hapus ${item.nama} dari keranjang`}
            className="shrink-0 rounded-full p-1.5 text-cocoa-300 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <IconTrash className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <QuantitySelector
            value={item.jumlah}
            onChange={(next) => onQuantityChange(item.product_id, next)}
            min={1}
            max={Math.min(item.stok, 20)}
            size="sm"
            compact
            aria-label={`Jumlah ${item.nama}`}
          />

          <p className="text-sm font-extrabold text-cocoa-900">{formatRupiah(subtotal)}</p>
        </div>

        {item.stok <= 5 && item.stok > 0 ? (
          <p className="text-xs font-medium text-butter-400">
            Sisa stok {item.stok} buah. Segera selesaikan pesanan Anda.
          </p>
        ) : null}
      </div>
    </div>
  );
}