import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppProviders } from './context/AppProviders';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RequireAuth } from './routes/RequireAuth';

/* Halaman publik */
import { HomePage } from './pages/public/HomePage';
import { ProductsPage } from './pages/public/ProductsPage';
import { ProductDetailPage } from './pages/public/ProductDetailPage';
import { CartPage } from './pages/public/CartPage';
import { CheckoutPage } from './pages/public/CheckoutPage';
import { OrderSuccessPage } from './pages/public/OrderSuccessPage';
import { TrackOrderPage } from './pages/public/TrackOrderPage';
import { AboutPage } from './pages/public/AboutPage';
import { CustomerDashboardPage } from './pages/public/CustomerDashboardPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

/* Halaman admin */
import { DashboardPage } from './pages/admin/DashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

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
            <Route path="produk" element={<ProductsPage />} />
            <Route path="produk/:slug" element={<ProductDetailPage />} />
            <Route path="keranjang" element={<CartPage />} />

            {/* Checkout wajib akun — tombol di keranjang memicu popup login untuk tamu */}
            <Route
              path="checkout"
              element={
                <RequireAuth>
                  <CheckoutPage />
                </RequireAuth>
              }
            />
            {/* Halaman konfirmasi pesanan — hanya PEMILIK pesanan (RLS membatasi
                bacaan tabel orders; pesanan orang lain tampil sebagai "tidak ditemukan") */}
            <Route
              path="pesanan/:orderId"
              element={
                <RequireAuth>
                  <OrderSuccessPage />
                </RequireAuth>
              }
            />
            <Route path="lacak" element={<TrackOrderPage />} />
            <Route path="tentang" element={<AboutPage />} />

            {/* Dashboard Pembeli — wajib login; tamu dialihkan ke beranda */}
            <Route
              path="akun"
              element={
                <RequireAuth>
                  <CustomerDashboardPage />
                </RequireAuth>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
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
            <Route index element={<DashboardPage />} />
            <Route path="produk" element={<AdminProductsPage />} />
            <Route path="pesanan" element={<AdminOrdersPage />} />
            <Route path="pengaturan" element={<AdminSettingsPage />} />
          </Route>
          </Routes>
        </ErrorBoundary>
      </AppProviders>
    </BrowserRouter>
  );
}
