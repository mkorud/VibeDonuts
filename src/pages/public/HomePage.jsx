import { useMemo } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { HeroSection } from '../../components/public/HeroSection';
import { ProductGrid } from '../../components/public/ProductGrid';
import { SectionHeading } from '../../components/common/SectionHeading';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ErrorNotice } from '../../components/common/ErrorNotice';
import {
  IconAward,
  IconHeart,
  IconSparkles,
  IconArrowRight,
  IconTruck,
} from '../../components/common/Icons';

/** Tiga alasan membeli di VibeDonuts, ditampilkan di tengah beranda. */
const VALUE_PROPS = [
  {
    icon: IconSparkles,
    title: 'Dibuat setiap pagi',
    text: 'Adonan dicampur dan digoreng fresh setiap hari. Tidak ada donat semalam.',
  },
  {
    icon: IconAward,
    title: 'Bahan premium',
    text: 'Cokelat couverture, krim mascarpone, dan selai buatan sendiri.',
  },
  {
    icon: IconHeart,
    title: 'Tanpa akun',
    text: 'Cukup isi nama, nomor HP, dan alamat. Pesanan langsung masuk dapur.',
  },
];

/** Halaman beranda (PRD 3.1). */
export function HomePage() {
  const { activeProducts, categories, isLoading, error, refresh } = useProducts();

  const featured = useMemo(() => activeProducts.slice(0, 3), [activeProducts]);
  const heroProduct = activeProducts[0] ?? null;

  return (
    <>
      <HeroSection featuredProduct={heroProduct} />

      {/* Katalog unggulan */}
      <section className="container-page py-14 lg:py-20">
        <SectionHeading
          eyebrow="Menu Hari Ini"
          title="Donat paling dicari"
          description="Semua stok yang Anda lihat di sini adalah stok nyata hari ini."
          action={
            <Button to="/produk" variant="secondary" iconRight={<IconArrowRight className="h-4 w-4" />}>
              Lihat semua donat
            </Button>
          }
        />

        <ErrorNotice message={error} onRetry={refresh} className="mt-8" />

        <ProductGrid
          products={featured}
          categories={categories}
          isLoading={isLoading}
          skeletonCount={3}
          className="mt-8"
          emptyTitle="Toko sedang bersiap"
          emptyDescription="Donat hari ini belum diunggah. Coba lagi sebentar lagi, ya."
        />
      </section>

      {/* Nilai jual */}
      <section className="bg-cream-50 py-14 lg:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Kenapa VibeDonuts"
            title="Kecil-kecil cabe rawit, manis-manis bikin nagih"
            align="center"
            className="sm:flex-col sm:items-center"
          />

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {VALUE_PROPS.map((prop) => (
              <div
                key={prop.title}
                className="rounded-card bg-white p-6 text-center shadow-soft ring-1 ring-cocoa-100"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blush-100 text-blush-600">
                  <prop.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-bold text-cocoa-900">{prop.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cocoa-500">{prop.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner ajakan pesan */}
      <section className="container-page py-14 lg:py-20">
        <div className="relative overflow-hidden rounded-blob bg-cocoa-800 px-6 py-12 text-center shadow-lift sm:px-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blush-500/25 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-butter-300/25 blur-2xl" />

          <div className="relative">
            <Badge variant="cream" size="md">
              Pengiriman hari yang sama
            </Badge>

            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold text-cream-50 sm:text-4xl">
              Lapar donat? Stok hari ini terbatas.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-cream-200 sm:text-base">
              Pesan sebelum stok habis. Kami kirim dengan motor khusus agar donat sampai dalam
              kondisi masih lembut.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                to="/produk"
                variant="blush"
                size="lg"
                iconRight={<IconArrowRight className="h-4 w-4" />}
              >
                Pesan Sekarang
              </Button>

              <Button
                to="/lacak"
                variant="secondary"
                size="lg"
                iconLeft={<IconTruck className="h-4 w-4" />}
              >
                Lacak Pesanan
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
