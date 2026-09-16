import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Logo } from '../common/Logo';

/**
 * Pesan error Supabase Auth -> bahasa Indonesia yang ramah.
 * Menerima objek error (supabase-js mengisi .code & .message) atau string.
 */
function translateAuthError(error) {
  const raw = `${error?.code ?? ''} ${error?.message ?? ''}`.trim();

  if (/invalid login credentials/i.test(raw)) return 'Email atau kata sandi salah.';
  if (/user already registered/i.test(raw)) return 'Email ini sudah terdaftar. Silakan masuk.';
  if (/email not confirmed/i.test(raw)) {
    return 'Email belum dikonfirmasi. Cek kotak masuk Anda lalu klik tautan verifikasi.';
  }
  if (/email_address_invalid|email address .* is invalid/i.test(raw)) {
    return 'Supabase menolak alamat email ini. Gunakan email sungguhan yang bisa menerima surat (mis. Gmail), karena domain contoh seperti @vibedonuts.id tidak memiliki server email.';
  }
  if (/over_email_send_rate_limit|email rate limit exceeded/i.test(raw)) {
    return 'Batas kirim email Supabase tercapai (pengirim bawaan hanya ±3-4 email per jam). Matikan opsi "Confirm email" di dashboard Supabase, atau tunggu sekitar 1 jam lalu coba lagi.';
  }
  if (/at least 6 characters/i.test(raw)) return 'Kata sandi minimal 6 karakter.';
  if (/rate limit/i.test(raw)) return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.';
  if (/unable to validate email|invalid.*email/i.test(raw)) return 'Format email tidak valid.';
  if (/signups not allowed/i.test(raw)) return 'Pendaftaran akun baru sedang ditutup oleh toko.';
  return raw || 'Terjadi kesalahan. Coba lagi.';
}

/** Dua tab pada popup autentikasi. */
const TABS = [
  { key: 'login', label: 'Masuk Akun' },
  { key: 'register', label: 'Daftar Akun Baru' },
];

/**
 * Popup Form Autentikasi (Masuk / Daftar) yang dipanggil dari Navbar
 * maupun otomatis saat pelanggan menekan tombol Checkout sebelum login.
 */
export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    signIn,
    signUp,
    redirectAfterLogin,
  } = useAuth();
  const { success, info } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = authModalMode === 'register';

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setPasswordConfirmation('');
    setFieldErrors({});
    setFormError('');
  };

  /** Dipanggil saat masuk/daftar sukses: tutup popup + lanjut ke tujuan (mis. checkout). */
  const finish = (message) => {
    success(message);
    resetForm();
    closeAuthModal();
    if (redirectAfterLogin) navigate(redirectAfterLogin);
  };

  const validate = () => {
    const errors = {};
    if (!email.trim()) errors.email = 'Email wajib diisi.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Format email tidak valid.';
    if (!password) errors.password = 'Kata sandi wajib diisi.';
    else if (password.length < 6) errors.password = 'Kata sandi minimal 6 karakter.';
    if (isRegister && password !== passwordConfirmation) {
      errors.passwordConfirmation = 'Konfirmasi kata sandi tidak sama.';
    }
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setFormError('');
    setIsSubmitting(true);

    try {
      if (isRegister) {
        const { needsEmailConfirmation } = await signUp(email.trim(), password);
        if (needsEmailConfirmation) {
          info('Akun berhasil dibuat! Cek email Anda untuk konfirmasi sebelum masuk.');
          resetForm();
          closeAuthModal();
        } else {
          finish('Akun berhasil dibuat. Selamat berbelanja!');
        }
        return;
      }

      await signIn(email.trim(), password);
      finish('Selamat datang kembali di VibeDonuts!');
    } catch (err) {
      setFormError(translateAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isAuthModalOpen} onClose={closeAuthModal} size="sm">
      <div className="flex flex-col items-center gap-2 text-center">
        <Logo size="md" />
        <p className="text-sm text-cocoa-400">
          Masuk agar riwayat pesanan Anda tersimpan rapi di akun.
        </p>
      </div>

      {/* Tab: Masuk Akun / Daftar Akun Baru */}
      <div className="mt-5 grid grid-cols-2 gap-1 rounded-full bg-cream-200 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => openAuthModal(tab.key, { redirectTo: redirectAfterLogin })}
            aria-pressed={authModalMode === tab.key}
            className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
              authModalMode === tab.key
                ? 'bg-white text-cocoa-900 shadow-soft'
                : 'text-cocoa-500 hover:text-cocoa-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="nama@email.com"
          hint={
            isRegister
              ? 'Gunakan email asli (mis. Gmail/Outlook). Domain contoh seperti @vibedonuts.id ditolak Supabase.'
              : ''
          }
          error={fieldErrors.email}
          required
          autoComplete="email"
        />

        <Input
          label="Kata Sandi"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          hint={isRegister ? 'Minimal 6 karakter.' : ''}
          error={fieldErrors.password}
          required
          autoComplete={isRegister ? 'new-password' : 'current-password'}
        />

        {isRegister ? (
          <Input
            label="Konfirmasi Kata Sandi"
            name="passwordConfirmation"
            type="password"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            placeholder="••••••••"
            error={fieldErrors.passwordConfirmation}
            required
            autoComplete="new-password"
          />
        ) : null}

        {formError ? (
          <p
            role="alert"
            className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-100"
          >
            {formError}
          </p>
        ) : null}

        <Button type="submit" variant="blush" size="lg" fullWidth isLoading={isSubmitting}>
          {isRegister ? 'Daftar Sekarang' : 'Masuk'}
        </Button>
      </form>

      <div className="mt-5 space-y-2 border-t border-cocoa-100 pt-4 text-center">
        <p className="text-xs text-cocoa-400">
          Pemilik toko? Masuk dengan email admin (daftar emailnya di VITE_ADMIN_EMAILS pada file .env).
        </p>
        <button
          type="button"
          onClick={closeAuthModal}
          className="text-xs font-semibold text-cocoa-500 transition hover:text-blush-500"
        >
          Lanjut belanja sebagai tamu
        </button>
      </div>

    </Modal>
  );
}
