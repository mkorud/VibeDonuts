import { useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabaseClient';
import { resetMockDatabase } from '../../services/mockDb';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { SettingsForm } from '../../components/admin/SettingsForm';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Button } from '../../components/common/Button';
import { IconRefresh } from '../../components/common/Icons';

/** Halaman Pengaturan Toko (PRD A-7) + zona reset data demo. */
export function AdminSettingsPage() {
  const { settings, saveSettings } = useSettings();
  const { success, error, info } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSave = async (patch) => {
    setIsSaving(true);
    try {
      await saveSettings(patch);
      success('Pengaturan toko tersimpan.');
    } catch (err) {
      error(err.message ?? 'Gagal menyimpan pengaturan.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Reset data demo ke kondisi awal:
   * 1. Supabase  -> RPC vd_reset_demo_data: hapus semua data asli lalu isi ulang
   *                 3 donat contoh + 3 pesanan contoh + pengaturan awal.
   * 2. localStorage -> bersihkan sisa data tiruan (mock) lama.
   * Setelah selesai, halaman dimuat ulang agar seluruh state ikut segar.
   */
  const handleReset = async () => {
    setIsResetting(true);
    try {
      const { error: resetError } = await supabase.rpc('vd_reset_demo_data');
      if (resetError) throw resetError;

      resetMockDatabase();
      setIsResetOpen(false);
      info('Data demo berhasil direset. Halaman akan dimuat ulang.');
      setTimeout(() => window.location.reload(), 900);
    } catch (err) {
      setIsResetOpen(false);
      const raw = String(err?.message ?? '');

      if (err?.code === 'PGRST202' || /could not find the function/i.test(raw)) {
        error('Fungsi reset belum ada di Supabase. Jalankan supabase/05_reset_demo.sql di SQL Editor.');
      } else if (/requires a WHERE clause/i.test(raw)) {
        error(
          'Fungsi reset di database masih versi lama. Jalankan ulang supabase/05_reset_demo.sql terbaru di SQL Editor.',
        );
      } else {
        error(err.message ?? 'Gagal mereset data demo.');
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <AdminPageHeader
        title="Pengaturan Toko"
        description="Ubah ongkos kirim, rekening tujuan transfer, dan kontak WhatsApp. Perubahan langsung terlihat oleh pelanggan."
      />

      <SettingsForm settings={settings} onSave={handleSave} isSaving={isSaving} />

      {/* Zona berbahaya — hanya tampil di mode pengembangan (import.meta.env.DEV),
          agar tidak bisa diakses dari build produksi */}
      {import.meta.env.DEV ? (
        <section className="rounded-card border border-rose-200 bg-rose-50 p-5 sm:p-6">
          <h2 className="text-base font-bold text-rose-700">Reset Data Demo</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-rose-600">
            Menghapus permanen SEMUA data di Supabase — pesanan, produk, kategori, dan riwayat stok —
            lalu mengisi ulang data demo: 3 donat contoh (stok normal, menipis, habis), 3 pesanan
            contoh beserta riwayatnya, dan pengaturan toko awal. Gunakan hanya untuk demo/latihan,
            bukan di toko yang sudah berjalan sungguhan.
          </p>

          <Button
            variant="danger"
            className="mt-4"
            onClick={() => setIsResetOpen(true)}
            isLoading={isResetting}
            iconLeft={<IconRefresh className="h-4 w-4" />}
          >
            Reset Data Demo
          </Button>
        </section>
      ) : null}

      <ConfirmDialog
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={handleReset}
        isLoading={isResetting}
        title="Reset seluruh data ke kondisi demo?"
        description="Semua pesanan dan produk yang sekarang ada di Supabase akan DIHAPUS PERMANEN, lalu diganti data demo awal (3 donat + 3 pesanan contoh). Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Ya, Reset Data"
      />
    </div>
  );
}
