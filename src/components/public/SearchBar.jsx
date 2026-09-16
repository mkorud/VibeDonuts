import { IconClose, IconSearch } from '../common/Icons';

/**
 * Kolom pencarian produk (PRD P-2: "cari produk").
 * Tanpa tombol submit - hasil langsung tersaring saat pelanggan mengetik.
 */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Cari donat favoritmu...',
  className = '',
}) {
  return (
    <div className={`relative ${className}`}>
      <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Cari produk"
        className="w-full rounded-full border border-cocoa-200 bg-white py-2.5 pl-10 pr-10 text-sm text-cocoa-900 placeholder:text-cocoa-300 transition focus:border-cocoa-400 focus:outline-none focus:ring-2 focus:ring-cocoa-100"
      />

      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Hapus pencarian"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-cocoa-300 transition hover:bg-cocoa-100 hover:text-cocoa-600"
        >
          <IconClose className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}