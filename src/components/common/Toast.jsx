import { useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { IconAlert, IconCheckCircle, IconClose, IconInfo } from './Icons';

/** Gaya & ikon per jenis toast. */
const TOAST_STYLES = {
  success: { icon: IconCheckCircle, accent: 'text-emerald-600', ring: 'ring-emerald-100' },
  error: { icon: IconAlert, accent: 'text-rose-600', ring: 'ring-rose-100' },
  info: { icon: IconInfo, accent: 'text-cocoa-500', ring: 'ring-cocoa-100' },
};

/** Satu baris notifikasi, otomatis hilang setelah `duration` milidetik. */
function ToastItem({ toast, onDismiss }) {
  const style = TOAST_STYLES[toast.type] ?? TOAST_STYLES.info;
  const Icon = style.icon;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      role="status"
      className={`vd-toast-in pointer-events-auto flex w-full items-start gap-3 rounded-card bg-white px-4 py-3 shadow-lift ring-1 ${style.ring}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.accent}`} />
      <p className="flex-1 text-sm font-medium leading-snug text-cocoa-800">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Tutup notifikasi"
        className="-mr-1 rounded-full p-1 text-cocoa-300 transition hover:bg-cocoa-100 hover:text-cocoa-600"
      >
        <IconClose className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Wadah notifikasi kecil (PRD 3.2: "Toast").
 * Dipasang sekali di root aplikasi, muncul di kanan bawah (kanan atas di desktop).
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}
