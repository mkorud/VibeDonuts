import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS, readStorage, writeStorage } from '../lib/storage';

/**
 * Hook menyimpan state ke localStorage (dipakai keranjang agar isinya tidak
 * hilang saat halaman di-refresh - PRD K-2).
 *
 * @param {string} key kunci localStorage
 * @param {*} initialValue nilai awal bila belum ada data tersimpan
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = readStorage(key, undefined);
    // null bisa muncul dari data lama yang korup di localStorage; pakai nilai awal.
    return stored === undefined || stored === null ? initialValue : stored;
  });

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  /** Kembalikan state ke nilai awal dan bersihkan localStorage. */
  const reset = useCallback(() => {
    setValue(initialValue);
    writeStorage(key, initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, setValue, reset];
}

export { STORAGE_KEYS };