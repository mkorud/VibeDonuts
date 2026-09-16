/**
 * Tampilan saat data sedang diambil (PRD 3.2: "Loading").
 * Bisa dipakai inline (`fullScreen={false}`) atau menutupi seluruh layar.
 */
export function Loading({ label = 'Memuat data...', fullScreen = false, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-cocoa-500 ${
        fullScreen ? 'min-h-screen bg-cream-100' : 'py-16'
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

/** Kerangka kartu produk yang berdenyut saat katalog sedang dimuat. */
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-card bg-white shadow-soft">
      <div className="aspect-4/3 w-full bg-cocoa-100" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 rounded-full bg-cocoa-100" />
        <div className="h-3 w-full rounded-full bg-cocoa-100" />
        <div className="h-3 w-4/5 rounded-full bg-cocoa-100" />
        <div className="h-9 w-full rounded-full bg-cocoa-100" />
      </div>
    </div>
  );
}

/** Grid kerangka kartu produk. */
export function ProductGridSkeleton({ count = 3, className = '' }) {
  return (
    <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );
}