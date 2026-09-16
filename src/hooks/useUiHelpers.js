import { useCallback, useEffect, useState } from 'react';

/**
 * Mengunci scroll halaman saat modal / drawer keranjang terbuka.
 * Dipakai Modal, CartDrawer, dan AdminLayout (menu samping versi mobile).
 */
export function useLockBodyScroll(isLocked) {
  useEffect(() => {
    if (!isLocked) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isLocked]);
}

/**
 * Mendeteksi klik di luar elemen (dipakai dropdown status pesanan & menu profil).
 * @param {Function} handler
 */
export function useClickOutside(handler) {
  const [element, setElement] = useState(null);

  useEffect(() => {
    if (!element) return undefined;
    const listener = (event) => {
      if (!element.contains(event.target)) handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [element, handler]);

  return useCallback((node) => setElement(node), []);
}

/** Tombol Escape untuk menutup modal/drawer. */
export function useEscapeKey(handler, isActive = true) {
  useEffect(() => {
    if (!isActive) return undefined;
    const listener = (event) => {
      if (event.key === 'Escape') handler(event);
    };
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [handler, isActive]);
}