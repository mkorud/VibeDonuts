/**
 * Kartu angka ringkasan dashboard (PRD A-2):
 * "Pesanan Baru", "Pesanan Hari Ini", "Penjualan Bulan Ini", dan lainnya.
 */
export function StatCard({ label, value, icon = null, hint = '', accent = 'blush', className = '' }) {
  const accents = {
    blush: 'bg-blush-100 text-blush-600',
    butter: 'bg-butter-100 text-butter-400',
    cream: 'bg-cream-200 text-cocoa-700',
    dark: 'bg-cocoa-800 text-cream-50',
    success: 'bg-emerald-100 text-emerald-700',
    danger: 'bg-rose-100 text-rose-700',
  };

  return (
    <div
      className={`flex items-start gap-4 rounded-card bg-white p-5 shadow-soft ring-1 ring-cocoa-100 ${className}`}
    >
      {icon ? (
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            accents[accent] ?? accents.blush
          }`}
        >
          {icon}
        </span>
      ) : null}

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-400">{label}</p>
        <p className="mt-1 truncate text-xl font-extrabold text-cocoa-900 sm:text-2xl">{value}</p>
        {hint ? <p className="mt-1 text-xs text-cocoa-400">{hint}</p> : null}
      </div>
    </div>
  );
}