/**
 * Judul bagian yang dipakai berulang di halaman publik
 * agar jarak (spacing) dan gaya teksnya seragam.
 */
export function SectionHeading({
  eyebrow = '',
  title,
  description = '',
  action = null,
  align = 'left',
  className = '',
}) {
  const alignment = align === 'center' ? 'items-center text-center' : 'items-start text-left';

  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}
    >
      <div className={`flex flex-col ${alignment}`}>
        {eyebrow ? (
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-blush-500">
            {eyebrow}
          </span>
        ) : null}

        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">{title}</h2>

        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cocoa-500 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}