import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppProviders } from './context/AppProviders';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Loading } from './components/common/Loading';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RequireAuth } from './routes/RequireAuth';

/* Beranda dimuat LANGSUNG (bukan lazy) agar tampilan pertama paling cepat. */
import { HomePage } from './pages/public/HomePage';

/**
 * Code-splitting: halaman lainnya dipecah menjadi chunk terpisah dan hanya
 * diunduh saat rutenya dibuka — pengunjung etalase tidak perlu mengunduh
 * kode dashboard admin. React.lazy butuh default export, sedangkan halaman
 * kita memakai named export, jadi dipetakan lewat .then((m) => ({ default: ... })).
 */
function lazyNamed(loader, name) {
  return lazy(() => loader().then((module) => ({ default: module[name] })));
}

const ProductsPage = lazyNamed(() => import('./pages/public/ProductsPage'), 'ProductsPage');
const ProductDetailPage = lazyNamed(() => import('./pages/public/ProductDetailPage'), 'ProductDetailPage');
const CartPage = lazyNamed(() => import('./pages/public/CartPage'), 'CartPage');
const CheckoutPage = lazyNamed(() => import('./pages/public/CheckoutPage'), 'CheckoutPage');
const OrderSuccessPage = lazyNamed(() => import('./pages/public/OrderSuccessPage'), 'OrderSuccessPage');
const TrackOrderPage = lazyNamed(() => import('./pages/public/TrackOrderPage'), 'TrackOrderPage');
const AboutPage = lazyNamed(() => import('./pages/public/AboutPage'), 'AboutPage');
const CustomerDashboardPage = lazyNamed(() => import('./pages/public/CustomerDashboardPage'), 'CustomerDashboardPage');
const NotFoundPage = lazyNamed(() => import('./pages/public/NotFoundPage'), 'NotFoundPage');

const DashboardPage = lazyNamed(() => import('./pages/admin/DashboardPage'), 'DashboardPage');
const AdminProductsPage = lazyNamed(() => import('./pages/admin/AdminProductsPage'), 'AdminProductsPage');
const AdminOrdersPage = lazyNamed(() => import('./pages/admin/AdminOrdersPage'), 'AdminOrdersPage');
const AdminSettingsPage = lazyNamed(() => import('./pages/admin/AdminSettingsPage'), 'AdminSettingsPage');

/** Fallback saat chunk halaman sedang diunduh (navigasi antar halaman). */
function PageSuspense({ children }) {
  return (
    <Suspense
      fallback={
        <div className="container-page py-16">
          <Loading label="Memuat halaman..." />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

/**
 * Peta rute aplikasi VibeDonuts (PRD 3.1 & 3.3).
 *
 * - Halaman publik dibungkus PublicLayout (Navbar + Footer + CartDrawer + AuthModal).
 * - Halaman admin dibungkus AdminLayout + ProtectedRoute (wajib SESI + PERAN ADMIN).
 * - Checkout & Dashboard Pembeli dilindungi RequireAuth (wajib login).
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <ErrorBoundary>
          <ScrollToTop />

          <Routes>
            {/* --- Toko online (publik) --- */}
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route
                path="produk"
                element={
                  <PageSuspense>
                    <ProductsPage />
                  </PageSuspense>
                }
              />
              <Route
                path="produk/:slug"
                element={
                  <PageSuspense>
                    <ProductDetailPage />
                  </PageSuspense>
                }
              />
              <Route
                path="keranjang"
                element={
                  <PageSuspense>
                    <CartPage />
                  </PageSuspense>
                }
              />

              {/* Checkout wajib akun — tombol di keranjang memicu popup login untuk tamu */}
              <Route
                path="checkout"
                element={
                  <RequireAuth>
                    <PageSuspense>
                      <CheckoutPage />
                    </PageSuspense>
                  </RequireAuth>
                }
              />
              {/* Halaman konfirmasi pesanan — hanya PEMILIK pesanan (RLS membatasi
                  bacaan tabel orders; pesanan orang lain tampil sebagai "tidak ditemukan") */}
              <Route
                path="pesanan/:orderId"
                element={
                  <RequireAuth>
                    <PageSuspense>
                      <OrderSuccessPage />
                    </PageSuspense>
                  </RequireAuth>
                }
              />
              <Route
                path="lacak"
                element={
                  <PageSuspense>
                    <TrackOrderPage />
                  </PageSuspense>
                }
              />
              <Route
                path="tentang"
                element={
                  <PageSuspense>
                    <AboutPage />
                  </PageSuspense>
                }
              />

              {/* Dashboard Pembeli — wajib login; tamu dialihkan ke beranda */}
              <Route
                path="akun"
                element={
                  <RequireAuth>
                    <PageSuspense>
                      <CustomerDashboardPage />
                    </PageSuspense>
                  </RequireAuth>
                }
              />

              <Route
                path="*"
                element={
                  <PageSuspense>
                    <NotFoundPage />
                  </PageSuspense>
                }
              />
            </Route>

            {/* --- Dashboard admin --- */}
            {/* Popup autentikasi di Navbar menggantikan halaman /admin/login.
                Guard di sini menuntut SESI + PERAN ADMIN (lihat ProtectedRoute). */}
            <Route
              path="admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <PageSuspense>
                    <DashboardPage />
                  </PageSuspense>
                }
              />
              <Route
                path="produk"
                element={
                  <PageSuspense>
                    <AdminProductsPage />
                  </PageSuspense>
                }
              />
              <Route
                path="pesanan"
                element={
                  <PageSuspense>
                    <AdminOrdersPage />
                  </PageSuspense>
                }
              />
              <Route
                path="pengaturan"
                element={
                  <PageSuspense>
                    <AdminSettingsPage />
                  </PageSuspense>
                }
              />
            </Route>
          </Routes>
        </ErrorBoundary>
      </AppProviders>
    </BrowserRouter>
  );
}
