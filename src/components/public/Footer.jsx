import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { useSettings } from '../../hooks/useSettings';
import { IconMapPin, IconPhone, IconWhatsapp } from '../common/Icons';

/** Tautan footer dikelompokkan agar mudah ditambah nanti. */
const FOOTER_LINKS = [
  {
    title: 'Belanja',
    links: [
      { to: '/', label: 'Beranda' },
      { to: '/produk', label: 'Semua Donat' },
      { to: '/keranjang', label: 'Keranjang' },
      { to: '/lacak', label: 'Lacak Pesanan' },
    ],
  },
  {
    title: 'Bantuan',
    links: [
      { to: '/tentang', label: 'Tentang Kami' },
      { to: '/akun', label: 'Akun Saya' },
      { to: '/', label: 'Login Admin' },
    ],
  },
];

/** Bagian bawah halaman publik (PRD 3.2: "Footer"). */
export function Footer() {
  const { settings } = useSettings();
  const waNumber = String(settings.whatsapp_toko ?? '').replace(/[^\d]/g, '');

  return (
    <footer className="mt-20 border-t border-cocoa-100 bg-cream-50">
      <div className="container-page py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Logo size="md" showTagline />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-cocoa-500">
              Donat premium handmade yang dibuat segar setiap pagi. Pesan online, lihat stok
              terbaru secara langsung, dan kami antar ke depan pintu Anda.
            </p>
          </div>

          {/* Tautan */}
          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-bold uppercase tracking-wide text-cocoa-900">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-cocoa-500 transition hover:text-blush-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Kontak toko */}
        <div className="mt-12 grid gap-4 border-t border-cocoa-100 pt-8 sm:grid-cols-3">
          <p className="flex items-start gap-3 text-sm text-cocoa-500">
            <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-blush-500" />
            <span>Jl. Sunan Kudus No. 88, Kudus, Jawa Tengah</span>
          </p>

          <p className="flex items-start gap-3 text-sm text-cocoa-500">
            <IconPhone className="mt-0.5 h-4 w-4 shrink-0 text-blush-500" />
            <span>Setiap hari, 08.00 - 20.00 WIB</span>
          </p>

          <p className="flex items-start gap-3 text-sm text-cocoa-500">
            <IconWhatsapp className="mt-0.5 h-4 w-4 shrink-0 text-blush-500" />
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-cocoa-700 transition hover:text-blush-500"
            >
              Chat WhatsApp
            </a>
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-cocoa-100 pt-6 text-xs text-cocoa-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} VibeDonuts. Semua hak dilindungi.</p>
          <p>MVP v1.0 - pemesanan tanpa akun, pembayaran transfer manual.</p>
        </div>
      </div>
    </footer>
  );
}