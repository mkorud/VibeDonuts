import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';
import { useSettings } from '../../hooks/useSettings';
import { formatRupiah } from '../../lib/format';
import { MAX_QTY_PER_ITEM } from '../../lib/constants';
import { Badge, StockBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ProductImage } from '../../components/common/ProductImage';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { ProductGrid } from '../../components/public/ProductGrid';
import { QuantitySelector } from '../../components/public/QuantitySelector';
import {
  IconArrowLeft,
  IconCart,
  IconInfo,
  IconTruck,
  IconWhatsapp,
} from '../../components/common/Icons';

/** Halaman detail produk (PRD 3.1: klik kartu produk -> detail). */
export function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { getProductBySlug, activeProducts, categories, isLoading } = useProducts();
  const { addItem } = useCart();
  const { ongkosKirim, settings } = useSettings();
  const [jumlah, setJumlah] = useState(1);

  const product = getProductBySlug(slug);

  const related = useMemo(() => {
    if (!product) return [];
    return activeProducts
      .filter((item) => item.id !== product.id && item.category_id === product.category_id)
      .slice(0, 3);
  }, [activeProducts, product]);

  const categoryName = categories.find(
    (category) => String(category.id) === String(product?.category_id),
  )?.nama;

  if (isLoading) {
    return <Loading label="Memuat detail donat..." fullScreen />;
  }

  if (!product) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Donat tidak ditemukan"
          description="Produk yang Anda cari mungkin sudah dihapus atau tautannya salah."
          action={
            <Button to="/produk" iconLeft={<IconArrowLeft className="h-4 w-4" />}>
              Kembali ke Katalog
            </Button>
          }
        />
      </div>
    );
  }

  const isSoldOut = Number(product.stok) <= 0;
  const maxQty = Math.min(product.stok, MAX_QTY_PER_ITEM);
  const waNumber = String(settings.whatsapp_toko ?? '').replace(/[^\d]/g, '');

  const handleAddToCart = () => addItem(product, jumlah);
  const handleBuyNow = () => {
    addItem(product, jumlah);
    navigate('/checkout');
  };

  return (
    <div className="container-page py-8 lg:py-12">
      {/* Breadcrumb sederhana */}
      <nav className="flex items-center gap-2 text-xs text-cocoa-400" aria-label="Breadcrumb">
        <Link to="/" className="transition hover:text-cocoa-700">
          Home
        </Link>
        <span>/</span>
        <Link to="/produk" className="transition hover:text-cocoa-700">
          Produk
        </Link>
        <span>/</span>
        <span className="font-semibold text-cocoa-700">{product.nama}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Foto produk */}
        <div className="overflow-hidden rounded-blob bg-cocoa-100 shadow-lift">
          <ProductImage
            src={product.url_foto}
            alt={product.nama}
            wrapperClassName="aspect-4/3 w-full"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Informasi & aksi */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {categoryName ? <Badge variant="cream">{categoryName}</Badge> : null}
            <StockBadge stok={product.stok} />
          </div>

          <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{product.nama}</h1>
          <p className="mt-3 text-2xl font-extrabold text-blush-500">
            {formatRupiah(product.harga)}
          </p>

          <p className="mt-5 text-sm leading-relaxed text-cocoa-500 sm:text-base">
            {product.deskripsi || 'Deskripsi produk belum ditulis.'}
          </p>

          <div className="mt-7 rounded-card bg-white p-5 shadow-soft ring-1 ring-cocoa-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-cocoa-900">Pilih jumlah</p>
                <p className="mt-0.5 text-xs text-cocoa-400">
                  {isSoldOut
                    ? 'Stok habis, coba lagi besok.'
                    : `Tersedia ${product.stok} buah - maksimal ${MAX_QTY_PER_ITEM} buah per pesanan.`}
                </p>
              </div>

              <QuantitySelector
                value={jumlah}
                onChange={setJumlah}
                min={1}
                max={Math.max(1, maxQty)}
                disabled={isSoldOut}
                label={`Jumlah ${product.nama}`}
              />
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={isSoldOut}
                onClick={handleAddToCart}
                iconLeft={<IconCart className="h-4 w-4" />}
              >
                Tambah ke Keranjang
              </Button>

              <Button
                variant="blush"
                size="lg"
                className="flex-1"
                disabled={isSoldOut}
                onClick={handleBuyNow}
              >
                Beli Sekarang
              </Button>
            </div>
          </div>

          {/* Info tambahan */}
          <ul className="mt-6 space-y-3 text-sm text-cocoa-500">
            <li className="flex items-start gap-3">
              <IconTruck className="mt-0.5 h-4 w-4 shrink-0 text-blush-500" />
              <span>
                Ongkos kirim flat {formatRupiah(ongkosKirim)} untuk area Kudus dan sekitarnya.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <IconInfo className="mt-0.5 h-4 w-4 shrink-0 text-blush-500" />
              <span>
                Pesanan dibatalkan otomatis bila belum dibayar dalam 2 jam (stok dilepas lagi).
              </span>
            </li>
            <li className="flex items-start gap-3">
              <IconWhatsapp className="mt-0.5 h-4 w-4 shrink-0 text-blush-500" />
              <span>
                Ada permintaan khusus?{' '}
                <a
                  href={waNumber ? `https://wa.me/${waNumber}` : '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-cocoa-800 hover:text-blush-500"
                >
                  Chat toko kami
                </a>
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Donat sejenis */}
      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="text-2xl font-extrabold">Donat sejenis</h2>
          <ProductGrid products={related} categories={categories} className="mt-6" />
        </section>
      ) : null}
    </div>
  );
}
