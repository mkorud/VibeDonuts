import { Link } from 'react-router-dom';
import { DECOR_IMAGES } from '../../data/seed';
import { useSettings } from '../../hooks/useSettings';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { IconArrowRight, IconClock, IconStar, IconTruck, IconWhatsapp } from '../common/Icons';

/** Poin kepercayaan singkat yang ditampilkan di bawah tombol hero. */
const TRUST_POINTS = [
  { icon: IconClock, title: 'Dipanggang pagi', text: 'Selalu segar hari itu' },
  { icon: IconTruck, title: 'Antar cepat', text: 'Area Kudus & sekitarnya' },
  { icon: IconStar, title: 'Rasa premium', text: 'Bahan pilihan, handmade' },
];

/** Bagian pembuka halaman beranda (PRD 3.1: "Hero Section"). */
export function HeroSection({ featuredProduct = null }) {
  const { settings } = useSettings();
  const waNumber = String(settings.whatsapp_toko ?? '').replace(/[^\d]/g, '');

  return (
    <section className="relative overflow-hidden">
      {/* Latar dekoratif */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blush-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-butter-100/70 blur-3xl" />

      <div className="container-page relative py-12 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Kolom teks */}
          <div className="vd-fade-up">
            <Badge variant="info" size="md" icon={<IconStar className="h-3.5 w-3.5" />}>
              Donat handmade no. 1 di Kudus
            </Badge>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-[3.4rem]">
              Donat lembut,
              <br />
              <span className="text-blush-500">vibe-nya bikin happy.</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-cocoa-500 sm:text-lg">
              Dibuat fresh setiap pagi dengan bahan premium. Pilih donat favoritmu, masukkan ke
              keranjang, dan pesan tanpa perlu daftar akun.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button to="/produk" size="lg" iconRight={<IconArrowRight className="h-4 w-4" />}>
                Pesan Sekarang
              </Button>

              <Button
                href={waNumber ? `https://wa.me/${waNumber}` : '#'}
                variant="secondary"
                size="lg"
                iconLeft={<IconWhatsapp className="h-4 w-4" />}
              >
                Tanya via WhatsApp
              </Button>
            </div>

            <dl className="mt-10 grid gap-5 sm:grid-cols-3">
              {TRUST_POINTS.map((point) => (
                <div key={point.title} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-blush-500 shadow-soft">
                    <point.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <dt className="text-sm font-bold text-cocoa-900">{point.title}</dt>
                    <dd className="text-xs text-cocoa-400">{point.text}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {/* Kolom gambar */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-blob bg-cocoa-100 shadow-lift">
              <img
                src={DECOR_IMAGES.hero}
                alt="Aneka donat VibeDonuts"
                className="h-72 w-full object-cover sm:h-96 lg:h-[30rem]"
              />
            </div>

            {/* Kartu melayang: produk unggulan */}
            {featuredProduct ? (
              <Link
                to={`/produk/${featuredProduct.slug}`}
                className="vd-float absolute -bottom-6 left-4 flex w-64 items-center gap-3 rounded-card bg-white p-3 shadow-lift ring-1 ring-cocoa-100 transition hover:-translate-y-1 sm:left-6"
              >
                <img
                  src={featuredProduct.url_foto}
                  alt={featuredProduct.nama}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-blush-500">
                    Paling dicari
                  </p>
                  <p className="truncate text-sm font-bold text-cocoa-900">
                    {featuredProduct.nama}
                  </p>
                  <p className="text-xs text-cocoa-400">Stok {featuredProduct.stok} buah</p>
                </div>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}