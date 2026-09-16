/**
 * Pembungkus label + kontrol + pesan error untuk semua isian formulir.
 * Dipakai bersama oleh Input, Select, dan TextArea.
 */
export function FieldWrapper({
  id,
  label,
  error,
  hint,
  required = false,
  className = '',
  children,
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-cocoa-700">
          {label}
          {required ? <span className="ml-0.5 text-blush-500">*</span> : null}
        </label>
      ) : null}

      {children}

      {error ? (
        <p role="alert" className="text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-cocoa-400">{hint}</p>
      ) : null}
    </div>
  );
}
