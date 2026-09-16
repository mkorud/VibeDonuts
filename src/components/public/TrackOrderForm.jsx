import { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { IconSearch } from '../common/Icons';
import { isValidPhone } from '../../lib/format';

/**
 * Formulir pencarian pesanan (PRD P-7).
 * Pelanggan memasukkan KODE PESANAN + NOMOR HP yang dipakai saat memesan.
 */
export function TrackOrderForm({
  onSubmit,
  isLoading = false,
  defaultKode = '',
  defaultNoHp = '',
  className = '',
}) {
  const [kode, setKode] = useState(defaultKode);
  const [noHp, setNoHp] = useState(defaultNoHp);
  const [errors, setErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!kode.trim()) {
      nextErrors.kode = 'Kode pesanan wajib diisi. Contoh: VD-2609-0001';
    }
    if (!noHp.trim()) {
      nextErrors.noHp = 'Nomor HP wajib diisi.';
    } else if (!isValidPhone(noHp)) {
      nextErrors.noHp = 'Nomor HP minimal 10 angka.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({ kode: kode.trim().toUpperCase(), noHp: noHp.trim() });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-card bg-white p-5 shadow-soft ring-1 ring-cocoa-100 sm:p-6 ${className}`}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Kode Pesanan"
          name="kode_pesanan"
          value={kode}
          onChange={(event) => {
            setKode(event.target.value.toUpperCase());
            setErrors((current) => ({ ...current, kode: undefined }));
          }}
          placeholder="VD-2609-0001"
          error={errors.kode}
          required
        />

        <Input
          label="Nomor HP"
          name="no_hp"
          type="tel"
          inputMode="numeric"
          value={noHp}
          onChange={(event) => {
            setNoHp(event.target.value);
            setErrors((current) => ({ ...current, noHp: undefined }));
          }}
          placeholder="081234567890"
          error={errors.noHp}
          required
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        className="mt-5"
        isLoading={isLoading}
        iconLeft={<IconSearch className="h-4 w-4" />}
      >
        Lacak Pesanan
      </Button>

      <p className="mt-3 text-center text-xs text-cocoa-400">
        Kode pesanan dikirim saat Anda selesai checkout, formatnya <strong>VD-YYMM-XXXX</strong>.
      </p>
    </form>
  );
}