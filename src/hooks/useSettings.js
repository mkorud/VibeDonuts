import { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';

/** Hook pengaturan toko (ongkos kirim, rekening, WhatsApp - PRD A-7). */
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings harus dipakai di dalam <SettingsProvider>.');
  }
  return context;
}
