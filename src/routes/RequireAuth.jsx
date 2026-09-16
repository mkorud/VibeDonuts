import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/common/Loading';

/**
 * Penjaga rute pembeli (Dashboard Pembeli & Checkout).
 * Pengunjung yang belum login dan mengetik alamat ini langsung diarahkan
 * kembali ke halaman utama etalase.
 */
export function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen label="Memeriksa sesi akun..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
