import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const AuthContext = createContext(null);

/**
 * Daftar email yang berhak membuka Dashboard Admin.
 * Diambil dari .env (VITE_ADMIN_EMAILS) — kredensial tidak pernah hardcode di kode.
 * Catatan keamanan: pengecekan peran di sini melindungi NAVIGASI; pengaman
 * sesungguhnya untuk data tetap Row Level Security di database.
 */
const ADMIN_EMAILS = String(import.meta.env.VITE_ADMIN_EMAILS ?? 'admin@vibedonuts.id')
  .split(',')
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);

/**
 * Autentikasi resmi Supabase Auth (PRD A-1 & 4.4):
 * - Sesi divalidasi saat aplikasi dibuka lewat supabase.auth.getSession().
 * - Perubahan sesi (masuk/keluar di tab lain) mengikuti onAuthStateChange.
 * - Kata sandi di-hash oleh Supabase; frontend tidak pernah menyimpannya.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null);

  // Validasi sesi awal + ikuti perubahan sesi secara real-time.
  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session ?? null);
      setIsLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const user = session?.user ?? null;

  /** Admin = peran resmi di app_metadata (hanya bisa diubah lewat Dashboard/Admin API)
   *  ATAU email terdaftar di VITE_ADMIN_EMAILS. */
  const isAdmin = useMemo(() => {
    const email = String(user?.email ?? '').toLowerCase();
    if (!email) return false;
    if (user?.app_metadata?.role === 'admin') return true;
    return ADMIN_EMAILS.includes(email);
  }, [user]);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  }, []);

  const signUp = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // Bila proyek mengaktifkan konfirmasi email, session akan null →
    // pengguna harus klik tautan konfirmasi sebelum bisa masuk.
    return { needsEmailConfirmation: !data.session && Boolean(data.user) };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  /** Buka popup autentikasi. `options.redirectTo` = halaman tujuan setelah berhasil masuk. */
  const openAuthModal = useCallback((mode = 'login', options = {}) => {
    setAuthModalMode(mode === 'register' ? 'register' : 'login');
    setRedirectAfterLogin(options.redirectTo ?? null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setRedirectAfterLogin(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      userEmail: user?.email ?? null,
      isAuthenticated: Boolean(session),
      isAdmin,
      role: isAdmin ? 'admin' : user ? 'customer' : null,
      isLoading,
      signIn,
      signUp,
      signOut,
      isAuthModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
      redirectAfterLogin,
    }),
    [
      session,
      user,
      isAdmin,
      isLoading,
      signIn,
      signUp,
      signOut,
      isAuthModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
      redirectAfterLogin,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
