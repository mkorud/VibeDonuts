import { FieldWrapper } from './FieldWrapper';
import { selectStateClass } from './fieldStyles';
import { IconChevronDown } from './Icons';

/**
 * Pilihan dropdown standar (PRD 3.2: "Select").
 *
 * Contoh:
 *   <Select label="Kategori" name="category_id" value={form.category_id}
 *           onChange={handleChange} options={options} placeholder="Pilih kategori" />
 */
export function Select({
  id,
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = '',
  error = '',
  hint = '',
  required = false,
  disabled = false,
  containerClassName = '',
  className = '',
  ...rest
}) {
  const fieldId = id ?? name;

  return (
    <FieldWrapper
      id={fieldId}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={containerClassName}
    >
      <div className="relative">
        <select
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          className={`${selectStateClass(Boolean(error))} ${
            value === '' || value === null ? 'text-cocoa-400' : ''
          } ${className}`}
          {...rest}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <IconChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" />
      </div>
    </FieldWrapper>
  );
}
