import { ALL_CATEGORY } from '../../lib/constants';

/**
 * Deretan tombol filter kategori (PRD P-2).
 * Di layar HP deretan ini bisa digeser ke samping (no-scrollbar).
 */
export function CategoryFilter({ categories = [], value = ALL_CATEGORY, onChange, className = '' }) {
  const options = [
    { value: ALL_CATEGORY, label: 'Semua Donat' },
    ...categories.map((category) => ({ value: String(category.id), label: category.nama })),
  ];

  return (
    <div className={`no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 ${className}`}>
      {options.map((option) => {
        const isActive = String(value) === String(option.value);

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? 'bg-cocoa-800 text-cream-50 shadow-soft'
                : 'bg-white text-cocoa-600 ring-1 ring-cocoa-200 hover:bg-cocoa-50'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}