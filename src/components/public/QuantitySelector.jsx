import { IconMinus, IconPlus } from '../common/Icons';

const SIZES = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
};

/**
 * Tombol − dan + untuk mengatur jumlah barang (PRD 3.2: "QuantitySelector").
 * Tombol + otomatis nonaktif bila jumlah sudah menyentuh batas stok (PRD 4.4).
 */
export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  disabled = false,
  compact = false,
  label = 'Jumlah',
  className = '',
}) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;
  const buttonSize = SIZES[size] ?? SIZES.md;

  const stepClass = [
    'inline-flex items-center justify-center rounded-full text-cocoa-700 transition',
    'hover:bg-white hover:shadow-soft disabled:cursor-not-allowed disabled:text-cocoa-300 disabled:hover:bg-transparent disabled:hover:shadow-none',
  ].join(' ');

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full bg-cream-200 p-1 ring-1 ring-cocoa-200 ${
        compact ? 'gap-0.5' : ''
      } ${className}`}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={!canDecrease}
        aria-label={`Kurangi ${label.toLowerCase()}`}
        className={`${stepClass} ${buttonSize}`}
      >
        <IconMinus className="h-4 w-4" />
      </button>

      <span
        className={`min-w-8 text-center text-sm font-bold text-cocoa-900 ${
          compact ? 'min-w-6' : ''
        }`}
        aria-live="polite"
      >
        {value}
      </span>

      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={!canIncrease}
        aria-label={`Tambah ${label.toLowerCase()}`}
        className={`${stepClass} ${buttonSize}`}
      >
        <IconPlus className="h-4 w-4" />
      </button>
    </div>
  );
}