import { Button } from './Button';
import { IconAlert, IconRefresh } from './Icons';

/**
 * Banner galat saat data gagal diambil dari Supabase (mis. tabel belum dibuat
 * atau RLS memblokir). Tujuannya agar kegagalan tidak "diam-diam" tampil
 * sebagai halaman kosong — pengguna/admin langsung tahu apa yang salah.
 */
export function ErrorNotice({ message, onRetry = null, title = 'Gagal memuat data dari Supabase', className = '' }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`flex flex-col gap-3 rounded-card border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <IconAlert className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-rose-700">{title}</p>
          <p className="mt-0.5 break-words text-xs leading-relaxed text-rose-600">{message}</p>
        </div>
      </div>

      {onRetry ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="shrink-0"
          iconLeft={<IconRefresh className="h-3.5 w-3.5" />}
        >
          Coba Lagi
        </Button>
      ) : null}
    </div>
  );
}
