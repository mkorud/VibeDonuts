import { SORT_OPTIONS } from '../../lib/constants';
import { Select } from '../common/Select';

/** Dropdown urutan katalog produk (PRD P-2: "Urutkan"). */
export function SortSelect({ value, onChange, className = '' }) {
  return (
    <Select
      id="urutkan"
      label="Urutkan"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      options={SORT_OPTIONS}
      containerClassName={`w-full sm:w-52 ${className}`}
    />
  );
}