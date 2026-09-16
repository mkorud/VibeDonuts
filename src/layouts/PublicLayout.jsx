import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/public/Navbar';
import { Footer } from '../components/public/Footer';
import { CartDrawer } from '../components/public/CartDrawer';
import { AuthModal } from '../components/auth/AuthModal';
import { ToastContainer } from '../components/common/Toast';

/**
 * Kerangka halaman publik (beranda, katalog, detail, tentang, lacak, keranjang, checkout).
 *
 * CartDrawer diletakkan di level layout supaya tombol keranjang di Navbar bisa
 * membuka sidebar, dan toast tetap tampil walau halaman berganti.
 * AuthModal menangani Masuk/Daftar akun (Supabase Auth) dari mana pun.
 */
export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
      <CartDrawer />
      <AuthModal />
      <ToastContainer />
    </div>
  );
}