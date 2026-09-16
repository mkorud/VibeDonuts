import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/common/Loading';

/**
 * Penjaga rute admin (PRD A-1 & 4.4).
 *
 * 1. Sesi divalidasi lewat supabase.auth.getSession() — dijalankan AuthProvider
 *    saat aplikasi pertama dibuka (isi properti `isLoading`).
 * 2. Selain "sudah login", wajib berperan ADMIN (email terdaftar di
 *    VITE_ADMIN_EMAILS). Guest maupun pembeli biasa yang mencoba /admin/*
 *    langsung dilempar ke halaman utama etalase.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen label="Memeriksa hak akses..." />;
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
