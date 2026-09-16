import { Link } from 'react-router-dom';
import { formatRupiah, truncate } from '../../lib/format';
import { useCart } from '../../hooks/useCart';
import { Badge, StockBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { ProductImage } from '../common/ProductImage';
import { IconArrowRight, IconCart } from '../common/Icons';

/**
 * Kartu produk untuk katalog & beranda (PRD 3.2: "ProductCard").
 *
 * Menampilkan foto, nama, harga, dan tombol "Tambah ke Keranjang".
 * Produk dengan stok 0 tetap tampil namun tombolnya nonaktif (PRD P-5).
 */
export function ProductCard({ product, categoryName = '', className = '' }) {
  const { addItem } = useCart();
  const isSoldOut = Number(product.stok) <= 0;

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-cocoa-100 transition hover:-translate-y-1 hover:shadow-lift ${className}`}
    >
      {/* Foto + label stok */}
      <Link to={`/produk/${product.slug}`} className="relative block">
        <ProductImage
          src={product.url_foto}
          alt={product.nama}
          wrapperClassName="aspect-4/3 w-full"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <span className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          <StockBadge stok={product.stok} />
        </span>

        {categoryName ? (
          <span className="absolute bottom-3 left-3">
            <Badge variant="dark">{categoryName}</Badge>
          </span>
        ) : null}
      </Link>

      {/* Informasi produk */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex-1">
          <h3 className="text-base font-bold leading-snug text-cocoa-900">
            <Link to={`/produk/${product.slug}`} className="transition hover:text-blush-500">
              {product.nama}
            </Link>
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-cocoa-400">
            {truncate(product.deskripsi, 80)}
          </p>
        </div>

        <p className="text-lg font-extrabold text-cocoa-900">{formatRupiah(product.harga)}</p>

        <div className="flex items-center gap-2">
          <Button
            variant={isSoldOut ? 'secondary' : 'primary'}
            size="sm"
            disabled={isSoldOut}
            onClick={() => addItem(product, 1)}
            className="flex-1"
            iconLeft={isSoldOut ? null : <IconCart className="h-4 w-4" />}
          >
            {isSoldOut ? 'Stok Habis' : 'Tambah'}
          </Button>

          <Button
            to={`/produk/${product.slug}`}
            variant="secondary"
            size="sm"
            aria-label={`Lihat detail ${product.nama}`}
            iconRight={<IconArrowRight className="h-4 w-4" />}
          >
            Detail
          </Button>
        </div>
      </div>
    </article>
  );
}