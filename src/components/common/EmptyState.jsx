import { IconBox } from './Icons';

/**
 * Tampilan saat data kosong (PRD 3.2: "EmptyState").
 * Contoh pesan: "Keranjang masih kosong".
 */
export function EmptyState({
  icon = null,
  title = 'Belum ada data',
  description = '',
  action = null,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-card border border-dashed border-cocoa-200 bg-cream-50 px-6 py-14 text-center ${className}`}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cocoa-100 text-cocoa-400">
        {icon ?? <IconBox className="h-7 w-7" />}
      </span>

      <h3 className="mt-4 text-lg font-bold text-cocoa-800">{title}</h3>

      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-cocoa-400">{description}</p>
      ) : null}

      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}