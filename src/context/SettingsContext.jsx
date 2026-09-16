import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as settingsService from '../services/settingsService';
import { DEFAULT_SETTINGS } from '../lib/constants';

export const SettingsContext = createContext(null);

/**
 * Pengaturan toko (PRD A-7): ongkos kirim, rekening tujuan, nomor WhatsApp.
 * Dipakai halaman checkout (ongkos kirim), konfirmasi pesanan (instruksi transfer),
 * dan halaman Tentang/Kontak (WhatsApp).
 */
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setSettings(await settingsService.fetchSettings());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveSettings = useCallback(async (patch) => {
    const next = await settingsService.updateSettings(patch);
    setSettings(next);
    return next;
  }, []);

  const value = useMemo(
    () => ({
      settings,
      isLoading,
      refresh,
      saveSettings,
      /** Ongkos kirim flat MVP (PRD 4.2). */
      ongkosKirim: Number(settings.ongkos_kirim) || 0,
    }),
    [settings, isLoading, refresh, saveSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
