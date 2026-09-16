import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../common/Logo';
import { Button } from '../common/Button';
import { IconCart, IconClose, IconLock, IconMenu, IconUser } from '../common/Icons';

/** Menu utama halaman publik (PRD 3.1). */
const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/produk', label: 'Produk' },
  { to: '/lacak', label: 'Lacak Pesanan' },
  { to: '/tentang', label: 'Tentang' },
];

function navLinkClass({ isActive }) {
  return [
    'rounded-full px-3.5 py-2 text-sm font-semibold transition',
    isActive
      ? 'bg-cocoa-800 text-cream-50'
      : 'text-cocoa-600 hover:bg-cocoa-100 hover:text-cocoa-900',
  ].join(' ');
}

/**
 * Navbar halaman publik (PRD 3.2).
 * Berisi: Logo, menu Home & Produk, tombol Keranjang (dengan angka jumlah barang),
 * dan tombol Login admin.
 */
export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems, openCart } = useCart();
  const { isAuthenticated, isLoading, userEmail, openAuthModal } = useAuth();
  const location = useLocation();

  // Tutup menu mobile otomatis setiap kali halaman berpindah.
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-cocoa-100/80 bg-cream-100/85 backdrop-blur-md">
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-3 lg:h-20">
          {/* Logo */}
          <Logo to="/" size="md" className="shrink-0" />

          {/* Menu desktop */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Menu utama">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Aksi kanan */}
          <div className="flex items-center gap-2">
            {/* Tombol keranjang */}
            <button
              type="button"
              onClick={openCart}
              aria-label={`Buka keranjang, ${totalItems} barang`}
              className="relative inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-cocoa-700 ring-1 ring-cocoa-200 transition hover:bg-cocoa-50 hover:ring-cocoa-300"
            >
              <IconCart className="h-5 w-5" />
              <span className="hidden text-sm font-semibold sm:inline">Keranjang</span>
              {totalItems > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blush-500 px-1 text-[11px] font-bold text-white ring-2 ring-cream-100">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              ) : null}
            </button>

            {/* Tombol akun: Login (popup) / email pengguna -> Dashboard Pembeli */}
            {isLoading ? (
              <span className="hidden h-9 w-28 animate-pulse rounded-full bg-cocoa-100 sm:block" />
            ) : isAuthenticated ? (
              <Button
                to="/akun"
                variant="secondary"
                size="sm"
                className="hidden max-w-[190px] sm:inline-flex"
                iconLeft={<IconUser className="h-4 w-4" />}
              >
                <span className="truncate">{userEmail}</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => openAuthModal('login')}
                iconLeft={<IconLock className="h-4 w-4" />}
              >
                Login
              </Button>
            )}

            {/* Tombol menu mobile */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={isMobileMenuOpen}
              className="inline-flex items-center justify-center rounded-full bg-white p-2 text-cocoa-700 ring-1 ring-cocoa-200 transition hover:bg-cocoa-50 lg:hidden"
            >
              {isMobileMenuOpen ? (
                <IconClose className="h-5 w-5" />
              ) : (
                <IconMenu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Panel menu mobile */}
      {isMobileMenuOpen ? (
        <div className="border-t border-cocoa-100 bg-cream-50 lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-4" aria-label="Menu mobile">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  [
                    'rounded-xl px-4 py-3 text-sm font-semibold transition',
                    isActive
                      ? 'bg-cocoa-800 text-cream-50'
                      : 'text-cocoa-700 hover:bg-cocoa-100',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}

            {isLoading ? null : isAuthenticated ? (
              <Button
                to="/akun"
                variant="primary"
                className="mt-2"
                fullWidth
                iconLeft={<IconUser className="h-4 w-4" />}
              >
                <span className="truncate">{userEmail}</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                className="mt-2"
                fullWidth
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                iconLeft={<IconLock className="h-4 w-4" />}
              >
                Masuk / Daftar
              </Button>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
