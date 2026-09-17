import { useState } from 'react';
import { formatRupiah } from '../../lib/format';
import { hitungDiskon } from '../../lib/coupons';
import { IconInfo, IconTag, IconTrash, IconTruck } from '../common/Icons';

/**
 * Kotak ringkasan total biaya (PRD K-4) + kupon promo (mini-challenge).
 * Rumus: Total bayar = Total barang − Diskon kupon + Ongkos kirim (PRD 4.2).
 */
export function CartSummary({
  subtotal,
  ongkosKirim,
  totalItems = 0,
  kupon = null,
  onApplyKupon,
  onRemoveKupon,
  children = null,
  note = null,
  className = '',
}) {
  const [kodeInput, setKodeInput] = useState('');
  const [pesanKupon, setPesanKupon] = useState(null);

  const diskon = hitungDiskon(subtotal, kupon);
  const totalBayar = Math.max(0, subtotal - diskon + ongkosKirim);

  const handleApplyKupon = (event) => {
    event.preventDefault();
    if (typeof onApplyKupon !== 'function') return;
    const hasil = onApplyKupon(kodeInput);
    setPesanKupon(hasil);
    if (hasil.ok) setKodeInput('');
  };

  const handleRemoveKupon = () => {
    setPesanKupon(null);
    setKodeInput('');
    if (typeof onRemoveKupon === 'function') onRemoveKupon();
  };

  return (
    <div className={`rounded-card bg-white p-5 shadow-soft ring-1 ring-cocoa-100 ${className}`}>
      <h2 className="text-base font-bold text-cocoa-900">Ringkasan Biaya</h2>

      {/* Kupon promo — mini-challenge (input + notifikasi sukses/gagal) */}
      <div className="mt-4 rounded-xl border border-dashed border-cocoa-200 bg-cream-50 p-3">
        {kupon ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <IconTag className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-emerald-700">
                  Kupon {kupon.kode} aktif 🎉
                </p>
                <p className="text-xs text-emerald-600">
                  Hemat {formatRupiah(diskon)} ({kupon.persen}% dari belanja)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveKupon}
              aria-label="Hapus kupon"
              className="shrink-0 rounded-full p-1.5 text-emerald-500 transition hover:bg-emerald-100 hover:text-emerald-700"
            >
              <IconTrash className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyKupon} className="flex flex-col gap-2 sm:flex-row">
            <input
              value={kodeInput}
              onChange={(event) => setKodeInput(event.target.value.toUpperCase())}
              placeholder="Punya kode kupon? Contoh: VIBE20"
              aria-label="Kode kupon"
              className="min-w-0 flex-1 rounded-lg border border-cocoa-200 bg-white px-3 py-2 text-sm uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal placeholder:text-cocoa-300 focus:border-cocoa-400 focus:outline-none focus:ring-2 focus:ring-cocoa-100"
            />
            <button
              type="submit"
              disabled={!kodeInput.trim()}
              className="shrink-0 rounded-lg bg-cocoa-800 px-4 py-2 text-sm font-semibold text-cream-50 transition hover:bg-cocoa-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Terapkan Kupon
            </button>
          </form>
        )}

        {/* Notifikasi visual sukses/gagal penerapan kupon */}
        {pesanKupon ? (
          <p
            role="status"
            className={`mt-2 flex items-start gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${
              pesanKupon.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
            }`}
          >
            <span aria-hidden="true">{pesanKupon.ok ? '🎉' : '⚠️'}</span>
            <span className="flex-1">{pesanKupon.pesan}</span>
          </p>
        ) : null}
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-cocoa-500">
            Total barang{totalItems > 0 ? ` (${totalItems} buah)` : ''}
          </dt>
          <dd className="font-semibold text-cocoa-800">{formatRupiah(subtotal)}</dd>
        </div>

        {kupon && diskon > 0 ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-1.5 font-semibold text-emerald-600">
              <IconTag className="h-4 w-4" />
              Diskon {kupon.kode}
            </dt>
            <dd className="font-bold text-emerald-600">− {formatRupiah(diskon)}</dd>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-1.5 text-cocoa-500">
            <IconTruck className="h-4 w-4 text-cocoa-300" />
            Ongkos kirim
          </dt>
          <dd className="font-semibold text-cocoa-800">
            {ongkosKirim > 0 ? formatRupiah(ongkosKirim) : 'Gratis'}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-dashed border-cocoa-200 pt-3">
          <dt className="text-base font-bold text-cocoa-900">Total bayar</dt>
          <dd className="text-lg font-extrabold text-blush-500">{formatRupiah(totalBayar)}</dd>
        </div>
      </dl>

      {note ? (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-cream-100 px-3 py-2.5 text-xs leading-relaxed text-cocoa-500">
          <IconInfo className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cocoa-400" />
          <span>{note}</span>
        </p>
      ) : null}

      {children ? <div className="mt-5 space-y-3">{children}</div> : null}
    </div>
  );
}