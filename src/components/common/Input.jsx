import { FieldWrapper } from './FieldWrapper';
import { fieldStateClass } from './fieldStyles';

/**
 * Isian teks standar (PRD 3.2: "Input").
 *
 * Contoh:
 *   <Input label="Nama Donat" name="nama" value={nama} onChange={handleChange}
 *          error={errors.nama} required />
 */
export function Input({
  id,
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  error = '',
  hint = '',
  required = false,
  disabled = false,
  prefix = null,
  suffix = null,
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
        {prefix ? (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-medium text-cocoa-400">
            {prefix}
          </span>
        ) : null}

        <input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          className={`${fieldStateClass(Boolean(error))} ${prefix ? 'pl-10' : ''} ${
            suffix ? 'pr-12' : ''
          } ${className}`}
          {...rest}
        />

        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm font-medium text-cocoa-400">
            {suffix}
          </span>
        ) : null}
      </div>
    </FieldWrapper>
  );
}
