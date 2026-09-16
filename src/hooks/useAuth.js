import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/** Hook autentikasi Supabase (PRD A-1): sesi, peran admin, dan popup login. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus dipakai di dalam <AuthProvider>.');
  }
  return context;
}
