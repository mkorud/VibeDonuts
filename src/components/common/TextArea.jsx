import { FieldWrapper } from './FieldWrapper';
import { fieldStateClass } from './fieldStyles';

/**
 * Isian teks panjang (PRD 3.2: "TextArea").
 * Dipakai untuk deskripsi produk dan catatan pengiriman.
 */
export function TextArea({
  id,
  label,
  name,
  value,
  onChange,
  placeholder = '',
  rows = 4,
  error = '',
  hint = '',
  required = false,
  disabled = false,
  maxLength,
  containerClassName = '',
  className = '',
  ...rest
}) {
  const fieldId = id ?? name;
  const showCounter = Number.isFinite(maxLength);

  return (
    <FieldWrapper
      id={fieldId}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={containerClassName}
    >
      <textarea
        id={fieldId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        aria-invalid={Boolean(error) || undefined}
        className={`${fieldStateClass(Boolean(error))} resize-y leading-relaxed ${className}`}
        {...rest}
      />

      {showCounter ? (
        <p className="text-right text-xs text-cocoa-400">
          {String(value ?? '').length}/{maxLength}
        </p>
      ) : null}
    </FieldWrapper>
  );
}
