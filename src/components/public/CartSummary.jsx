import { formatRupiah } from '../../lib/format';
import { IconInfo, IconTruck } from '../common/Icons';

/**
 * Kotak ringkasan total biaya (PRD K-4).
 * Rumus: Total bayar = Total barang + Ongkos kirim (ongkos kirim flat - PRD 4.2).
 */
export function CartSummary({
  subtotal,
  ongkosKirim,
  totalItems = 0,
  children = null,
  note = null,
  className = '',
}) {
  const totalBayar = Number(subtotal) + Number(ongkosKirim);

  return (
    <div className={`rounded-card bg-white p-5 shadow-soft ring-1 ring-cocoa-100 ${className}`}>
      <h2 className="text-base font-bold text-cocoa-900">Ringkasan Biaya</h2>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-cocoa-500">
            Total barang{totalItems > 0 ? ` (${totalItems} buah)` : ''}
          </dt>
          <dd className="font-semibold text-cocoa-800">{formatRupiah(subtotal)}</dd>
        </div>

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