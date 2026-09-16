/**
 * Label kecil berwarna (PRD 3.2 menyebut label status; dipakai juga untuk
 * label "Stok Habis", "Stok Menipis", dan kategori produk).
 */

const VARIANTS = {
  neutral: 'bg-cocoa-100 text-cocoa-700 ring-cocoa-200',
  cream: 'bg-cream-200 text-cocoa-700 ring-cream-300',
  success: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  warning: 'bg-butter-100 text-butter-400 ring-butter-200',
  danger: 'bg-rose-100 text-rose-700 ring-rose-200',
  info: 'bg-blush-100 text-blush-600 ring-blush-200',
  dark: 'bg-cocoa-800 text-cream-50 ring-cocoa-700',
};

const SIZES = {
  sm: 'px-2.5 py-0.5 text-[11px]',
  md: 'px-3 py-1 text-xs',
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  icon = null,
  className = '',
  style,
}) {
  return (
    <span
      style={style}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset ${
        VARIANTS[variant] ?? VARIANTS.neutral
      } ${SIZES[size] ?? SIZES.sm} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}

/**
 * Badge stok produk yang mengikuti aturan PRD 4.1:
 * 0 = Stok Habis, <= 5 = Stok Menipis, selain itu tidak menampilkan badge.
 */
export function StockBadge({ stok, lowStockThreshold = 5 }) {
  const value = Number(stok) || 0;

  if (value <= 0) {
    return (
      <Badge variant="danger" size="md">
        Stok Habis
      </Badge>
    );
  }

  if (value <= lowStockThreshold) {
    return (
      <Badge variant="warning" size="md">
        Sisa {value}
      </Badge>
    );
  }

  return null;
}