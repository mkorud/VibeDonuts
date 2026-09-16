import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

/** Hook untuk menampilkan notifikasi kecil (PRD 3.2). */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast harus dipakai di dalam <ToastProvider>.');
  }
  return context;
}
