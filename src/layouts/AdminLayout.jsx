import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import { useToast } from '../hooks/useToast';
import { useLockBodyScroll } from '../hooks/useUiHelpers';
import { getInitials } from '../lib/format';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/common/Button';
import { ToastContainer } from '../components/common/Toast';
import {
  IconBox,
  IconChart,
  IconClose,
  IconLogout,
  IconMenu,
  IconReceipt,
  IconSettings,
  IconStore,
} from '../components/common/Icons';

/** Menu sidebar dashboard admin (PRD A-2 s.d. A-7). */
const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: IconChart, end: true },
  { to: '/admin/produk', label: 'Kelola Produk', icon: IconBox },
  { to: '/admin/pesanan', label: 'Kelola Pesanan', icon: IconReceipt, badgeKey: 'pesananBaru' },
  { to: '/admin/pengaturan', label: 'Pengaturan Toko', icon: IconSettings },
];

/** Kerangka halaman admin: sidebar tetap di desktop, drawer di layar kecil. */
export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, userEmail, signOut } = useAuth();
  const { stats } = useOrders();
  const { info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useLockBodyScroll(isSidebarOpen);

  // Tutup drawer setiap pindah menu.
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    info('Anda sudah keluar dari dashboard.');
    navigate('/', { replace: true });
  };

  const sidebarContent = (
    <div className="flex h-full flex-col gap-6 p-5">
      <div className="flex items-center justify-between gap-2">
        <Logo to="/admin" size="sm" />
        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Tutup menu"
          className="rounded-full p-2 text-cocoa-400 transition hover:bg-cocoa-100 lg:hidden"
        >
          <IconClose className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Menu dashboard">
        {ADMIN_LINKS.map((link) => {
          const badgeCount = link.badgeKey ? stats[link.badgeKey] : 0;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition',
                  isActive
                    ? 'bg-cocoa-800 text-cream-50 shadow-soft'
                    : 'text-cocoa-600 hover:bg-cocoa-100 hover:text-cocoa-900',
                ].join(' ')
              }
            >
              <link.icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{link.label}</span>

              {badgeCount > 0 ? (
                <span className="rounded-full bg-blush-500 px-2 py-0.5 text-[11px] font-bold text-white">
                  {badgeCount}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-cocoa-100 pt-5">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-cocoa-600 transition hover:bg-cocoa-100"
        >
          <IconStore className="h-5 w-5" />
          Lihat Toko
        </Link>

        <div className="flex items-center gap-3 rounded-xl bg-cream-100 px-3.5 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cocoa-800 text-xs font-bold text-cream-50">
            {getInitials(userEmail ?? 'Admin')}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-cocoa-900">{userEmail ?? 'Admin'}</p>
            <p className="truncate text-xs text-cocoa-400">Admin VibeDonuts</p>
          </div>
        </div>

        <Button
          variant="secondary"
          fullWidth
          onClick={handleLogout}
          iconLeft={<IconLogout className="h-4 w-4" />}
        >
          Keluar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-100 lg:flex">
      {/* Sidebar desktop */}
      <aside className="hidden w-72 shrink-0 border-r border-cocoa-100 bg-cream-50 lg:block">
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Drawer sidebar mobile */}
      {isSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            tabIndex={-1}
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 cursor-default bg-cocoa-900/45 backdrop-blur-sm"
          />
          <div className="vd-slide-in-right absolute inset-y-0 left-0 w-72 max-w-[85%] bg-cream-50 shadow-lift">
            {sidebarContent}
          </div>
        </div>
      ) : null}

      {/* Area konten */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Bar atas khusus layar kecil */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-cocoa-100 bg-cream-50/95 px-4 py-3 backdrop-blur lg:hidden">
          <Logo to="/admin" size="sm" />

          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Buka menu"
            className="rounded-full bg-white p-2 text-cocoa-700 ring-1 ring-cocoa-200"
          >
            <IconMenu className="h-5 w-5" />
          </button>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
