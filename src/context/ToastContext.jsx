import { createContext, useCallback, useMemo, useState } from 'react';

export const ToastContext = createContext(null);

/**
 * Toast = notifikasi kecil "Produk ditambahkan ke keranjang" (PRD 3.2).
 * Maksimal 3 toast tampil bersamaan agar layar tidak penuh.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, options = {}) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const toast = {
      id,
      message,
      type: options.type ?? 'success',
      duration: options.duration ?? 3400,
    };
    setToasts((current) => [...current.slice(-2), toast]);
    return id;
  }, []);

  const success = useCallback((message) => showToast(message, { type: 'success' }), [showToast]);
  const error = useCallback((message) => showToast(message, { type: 'error', duration: 4600 }), [
    showToast,
  ]);
  const info = useCallback((message) => showToast(message, { type: 'info' }), [showToast]);

  const value = useMemo(
    () => ({ toasts, showToast, removeToast, success, error, info }),
    [toasts, showToast, removeToast, success, error, info],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
