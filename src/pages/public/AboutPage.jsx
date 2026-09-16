import { DECOR_IMAGES } from '../../data/seed';
import { useSettings } from '../../hooks/useSettings';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SectionHeading } from '../../components/common/SectionHeading';
import { IconClock, IconMapPin, IconWhatsapp } from '../../components/common/Icons';

/** Halaman Tentang & Kontak (PRD 3.1). */
export function AboutPage() {
  const { settings } = useSettings();
  const waNumber = String(settings.whatsapp_toko ?? '').replace(/[^\d]/g, '');

  return (
    <div className="container-page py-10 lg:py-14">
      <SectionHeading
        eyebrow="Tentang Kami"
        title="Dapur kecil dengan standar besar"
        description="VibeDonuts dimulai dari satu wajan di dapur rumah pada 2023. Sekarang kami melayani ratusan pesanan setiap minggu - tanpa mengubah resep aslinya."
      />

      <div className="mt-10 grid items-center gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-blob bg-cocoa-100 shadow-lift">
          <img
            src={DECOR_IMAGES.about}
            alt="Dapur VibeDonuts"
            className="h-72 w-full object-cover sm:h-96"
          />
        </div>

        <div>
          <Badge variant="info" size="md">
            Sejak 2023
          </Badge>

          <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">
            Donat handmade, bukan pabrikan
          </h2>

          <div className="mt-4 space-y-4 text-sm leading-relaxed text-cocoa-500 sm:text-base">
            <p>
              Setiap donat dibentuk, digoreng, dan dihias secara manual oleh tim dapur kami. Karena
              itu rasa dan teksturnya konsisten: lembut di hari yang sama, tanpa bahan pengawet.
            </p>
            <p>
              Kami menjual langsung tanpa perantara marketplace, sehingga harga tetap wajar dan stok
              yang Anda lihat di katalog benar-benar stok dapur hari ini.
            </p>
          </div>
        </div>
      </div>

      {/* Kartu kontak */}
      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        <div className="rounded-card bg-white p-6 shadow-soft ring-1 ring-cocoa-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blush-100 text-blush-600">
            <IconMapPin className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-base font-bold text-cocoa-900">Alamat Dapur</h3>
          <p className="mt-2 text-sm leading-relaxed text-cocoa-500">
            Jl. Sunan Kudus No. 88, Kudus, Jawa Tengah 59315
          </p>
        </div>

        <div className="rounded-card bg-white p-6 shadow-soft ring-1 ring-cocoa-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-butter-100 text-butter-400">
            <IconClock className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-base font-bold text-cocoa-900">Jam Operasional</h3>
          <p className="mt-2 text-sm leading-relaxed text-cocoa-500">
            Setiap hari, 08.00 - 20.00 WIB. Pesanan online ditutup pukul 18.00.
          </p>
        </div>

        <div className="rounded-card bg-white p-6 shadow-soft ring-1 ring-cocoa-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cream-200 text-cocoa-700">
            <IconWhatsapp className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-base font-bold text-cocoa-900">Kontak</h3>
          <p className="mt-2 text-sm leading-relaxed text-cocoa-500">
            WhatsApp: +{settings.whatsapp_toko}
          </p>
          <Button
            href={waNumber ? `https://wa.me/${waNumber}` : '#'}
            variant="secondary"
            size="sm"
            className="mt-4"
            iconLeft={<IconWhatsapp className="h-4 w-4" />}
          >
            Chat Sekarang
          </Button>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-14 rounded-blob bg-blush-100 px-6 py-12 text-center">
        <h2 className="text-2xl font-extrabold sm:text-3xl">Sudah lapir?</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-cocoa-600 sm:text-base">
          Cek stok donat hari ini dan pesan dalam hitungan menit.
        </p>
        <Button to="/produk" variant="primary" size="lg" className="mt-6">
          Lihat Katalog
        </Button>
      </div>
    </div>
  );
}
