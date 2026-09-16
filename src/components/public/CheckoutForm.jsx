import { useState } from 'react';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { Button } from '../common/Button';
import { IconArrowRight } from '../common/Icons';
import { isValidPhone, normalizePhone } from '../../lib/format';
import { useSettings } from '../../hooks/useSettings';

/** Nilai awal formulir checkout. */
const EMPTY_FORM = {
  nama_pelanggan: '',
  no_hp: '',
  alamat: '',
  catatan: '',
};

/**
 * Validasi isian checkout sesuai PRD 4.4:
 * nama wajib, nomor HP wajib minimal 10 angka, alamat wajib, catatan opsional.
 */
export function validateCheckout(form) {
  const errors = {};

  if (!String(form.nama_pelanggan ?? '').trim()) {
    errors.nama_pelanggan = 'Nama penerima wajib diisi.';
  } else if (String(form.nama_pelanggan).trim().length < 3) {
    errors.nama_pelanggan = 'Nama minimal 3 karakter.';
  }

  if (!String(form.no_hp ?? '').trim()) {
    errors.no_hp = 'Nomor HP wajib diisi.';
  } else if (!isValidPhone(form.no_hp)) {
    errors.no_hp = 'Nomor HP minimal 10 angka, contoh: 081234567890.';
  }

  if (!String(form.alamat ?? '').trim()) {
    errors.alamat = 'Alamat pengiriman wajib diisi.';
  } else if (String(form.alamat).trim().length < 10) {
    errors.alamat = 'Alamat terlalu singkat. Tulis nama jalan, nomor rumah, dan patokan.';
  }

  return errors;
}

/**
 * Formulir data pemesan di halaman checkout (PRD K-5).
 * Data dikirim ke halaman checkout dalam keadaan sudah bersih (trim & normalisasi HP).
 */
export function CheckoutForm({ onSubmit, isLoading = false, disabled = false }) {
  const { settings } = useSettings();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateCheckout(form);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit({
      nama_pelanggan: form.nama_pelanggan.trim(),
      no_hp: normalizePhone(form.no_hp),
      alamat: form.alamat.trim(),
      catatan: form.catatan.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <Input
        label="Nama Penerima"
        name="nama_pelanggan"
        value={form.nama_pelanggan}
        onChange={handleChange}
        placeholder="Contoh: Ibu Sari"
        error={errors.nama_pelanggan}
        required
        autoComplete="name"
      />

      <Input
        label="Nomor HP / WhatsApp"
        name="no_hp"
        type="tel"
        inputMode="numeric"
        value={form.no_hp}
        onChange={handleChange}
        placeholder="081234567890"
        hint="Kami pakai nomor ini untuk konfirmasi pesanan."
        error={errors.no_hp}
        required
        autoComplete="tel"
      />

      <TextArea
        label="Alamat Pengiriman"
        name="alamat"
        value={form.alamat}
        onChange={handleChange}
        placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, dan patokan lokasi"
        rows={3}
        error={errors.alamat}
        required
      />

      <TextArea
        label="Catatan untuk Penjual (opsional)"
        name="catatan"
        value={form.catatan}
        onChange={handleChange}
        placeholder="Contoh: tolong tulis ucapan ulang tahun di kotaknya"
        rows={2}
        maxLength={300}
        hint="Maksimal 300 karakter."
      />

      <p className="rounded-xl bg-cream-100 px-3.5 py-3 text-xs leading-relaxed text-cocoa-500">
        Pembayaran melalui transfer ke {settings.nama_bank} {settings.nomor_rekening} a.n.{' '}
        {settings.atas_nama}. Pesanan otomatis dibatalkan bila belum dibayar dalam 2 jam.
      </p>

      <Button
        type="submit"
        variant="blush"
        size="lg"
        fullWidth
        isLoading={isLoading}
        disabled={disabled}
        iconRight={<IconArrowRight className="h-4 w-4" />}
      >
        Pesan Sekarang
      </Button>
    </form>
  );
}