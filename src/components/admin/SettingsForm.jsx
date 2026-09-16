import { useEffect, useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { formatRupiah } from '../../lib/format';

/**
 * Formulir pengaturan toko (PRD A-7).
 * Nilai di sini dipakai halaman checkout (ongkos kirim & rekening tujuan)
 * dan halaman Tentang (WhatsApp).
 */
export function SettingsForm({ settings, onSave, isSaving = false }) {
  const [form, setForm] = useState(() => ({
    ongkos_kirim: String(settings.ongkos_kirim ?? ''),
    nama_bank: settings.nama_bank ?? '',
    nomor_rekening: settings.nomor_rekening ?? '',
    atas_nama: settings.atas_nama ?? '',
    whatsapp_toko: settings.whatsapp_toko ?? '',
  }));
  const [errors, setErrors] = useState({});

  // Sinkronkan bila pengaturan diperbarui dari tempat lain.
  useEffect(() => {
    setForm({
      ongkos_kirim: String(settings.ongkos_kirim ?? ''),
      nama_bank: settings.nama_bank ?? '',
      nomor_rekening: settings.nomor_rekening ?? '',
      atas_nama: settings.atas_nama ?? '',
      whatsapp_toko: settings.whatsapp_toko ?? '',
    });
  }, [settings]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    const ongkos = Number(form.ongkos_kirim);
    if (form.ongkos_kirim === '' || !Number.isFinite(ongkos) || ongkos < 0) {
      errors.ongkos_kirim = 'Ongkos kirim harus angka >= 0.';
    }
    if (!form.nama_bank.trim()) errors.nama_bank = 'Nama bank wajib diisi.';
    if (!form.nomor_rekening.trim()) errors.nomor_rekening = 'Nomor rekening wajib diisi.';
    if (!form.atas_nama.trim()) errors.atas_nama = 'Nama pemilik rekening wajib diisi.';

    const wa = form.whatsapp_toko.replace(/[^\d]/g, '');
    if (wa.length < 10) errors.whatsapp_toko = 'Nomor WhatsApp minimal 10 angka.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await onSave({
      ongkos_kirim: ongkos,
      nama_bank: form.nama_bank.trim(),
      nomor_rekening: form.nomor_rekening.trim(),
      atas_nama: form.atas_nama.trim(),
      whatsapp_toko: wa,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="rounded-card bg-white p-5 shadow-soft ring-1 ring-cocoa-100 sm:p-6">
        <h2 className="text-base font-bold text-cocoa-900">Ongkos Kirim</h2>
        <p className="mt-1 text-xs text-cocoa-400">
          Berlaku flat untuk semua pesanan (PRD 4.2). Saat ini {formatRupiah(settings.ongkos_kirim)}.
        </p>

        <div className="mt-4 max-w-xs">
          <Input
            label="Ongkos kirim"
            name="ongkos_kirim"
            type="number"
            min="0"
            step="1000"
            prefix="Rp"
            value={form.ongkos_kirim}
            onChange={handleChange}
            error={errors.ongkos_kirim}
            required
          />
        </div>
      </div>

      <div className="rounded-card bg-white p-5 shadow-soft ring-1 ring-cocoa-100 sm:p-6">
        <h2 className="text-base font-bold text-cocoa-900">Rekening Tujuan Transfer</h2>
        <p className="mt-1 text-xs text-cocoa-400">
          Ditampilkan ke pelanggan di halaman konfirmasi pesanan.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Nama bank"
            name="nama_bank"
            value={form.nama_bank}
            onChange={handleChange}
            placeholder="BCA"
            error={errors.nama_bank}
            required
          />

          <Input
            label="Nomor rekening"
            name="nomor_rekening"
            value={form.nomor_rekening}
            onChange={handleChange}
            placeholder="1234567890"
            error={errors.nomor_rekening}
            required
          />

          <Input
            label="Atas nama"
            name="atas_nama"
            value={form.atas_nama}
            onChange={handleChange}
            placeholder="Rina VibeDonuts"
            error={errors.atas_nama}
            required
            containerClassName="sm:col-span-2"
          />
        </div>
      </div>

      <div className="rounded-card bg-white p-5 shadow-soft ring-1 ring-cocoa-100 sm:p-6">
        <h2 className="text-base font-bold text-cocoa-900">Kontak WhatsApp</h2>
        <p className="mt-1 text-xs text-cocoa-400">
          Format internasional tanpa tanda plus, contoh: 6281234567890.
        </p>

        <div className="mt-4 max-w-xs">
          <Input
            label="Nomor WhatsApp toko"
            name="whatsapp_toko"
            type="tel"
            value={form.whatsapp_toko}
            onChange={handleChange}
            error={errors.whatsapp_toko}
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="lg" isLoading={isSaving}>
          Simpan Pengaturan
        </Button>
      </div>
    </form>
  );
}
