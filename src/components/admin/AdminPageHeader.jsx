/** Kepala halaman admin: judul, deskripsi singkat, dan aksi di kanan. */
export function AdminPageHeader({ title, description = '', action = null, className = '' }) {
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1.5 text-sm text-cocoa-400">{description}</p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}