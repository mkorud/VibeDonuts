import { ORDER_STATUS, ORDER_STATUS_FLOW } from '../../lib/constants';
import { IconAlert, IconCheck, IconClock } from '../common/Icons';

/** Keterangan singkat untuk setiap tahap agar pelanggan paham artinya. */
const STEP_HINTS = {
  [ORDER_STATUS.MENUNGGU_PEMBAYARAN]: 'Silakan transfer lalu unggah bukti pembayaran.',
  [ORDER_STATUS.MENUNGGU_VERIFIKASI]: 'Admin sedang memeriksa bukti transfer Anda.',
  [ORDER_STATUS.DIPROSES]: 'Donat sedang disiapkan di dapur kami.',
  [ORDER_STATUS.DIKIRIM]: 'Pesanan sudah dalam perjalanan ke alamat Anda.',
  [ORDER_STATUS.SELESAI]: 'Pesanan sudah diterima. Terima kasih!',
};

/**
 * Garis waktu status pesanan (PRD 3.1: halaman Lacak Pesanan).
 * Menandai tahap yang sudah dilewati, tahap sekarang, dan tahap berikutnya.
 */
export function OrderTimeline({ status, className = '' }) {
  const isCancelled = status === ORDER_STATUS.DIBATALKAN;
  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);

  if (isCancelled) {
    return (
      <div
        className={`flex items-start gap-3 rounded-card border border-rose-200 bg-rose-50 p-4 ${className}`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <IconAlert className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-rose-700">Pesanan dibatalkan</p>
          <p className="mt-0.5 text-xs leading-relaxed text-rose-600">
            Pesanan dibatalkan karena melewati batas waktu pembayaran 2 jam atau atas permintaan
            pelanggan. Silakan buat pesanan baru bila masih ingin memesan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ol className={`space-y-0 ${className}`}>
      {ORDER_STATUS_FLOW.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step} className="flex gap-3">
            {/* Penanda & garis penghubung */}
            <div className="flex flex-col items-center">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-2 ${
                  isDone
                    ? 'bg-emerald-500 text-white ring-emerald-100'
                    : isCurrent
                      ? 'bg-blush-500 text-white ring-blush-100'
                      : 'bg-white text-cocoa-300 ring-cocoa-100'
                }`}
              >
                {isDone ? (
                  <IconCheck className="h-4 w-4" />
                ) : isCurrent ? (
                  <IconClock className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </span>

              {index < ORDER_STATUS_FLOW.length - 1 ? (
                <span
                  className={`my-1 w-0.5 flex-1 ${isDone ? 'bg-emerald-300' : 'bg-cocoa-100'}`}
                  aria-hidden="true"
                />
              ) : null}
            </div>

            {/* Teks tahap */}
            <div className={`pb-5 ${index === ORDER_STATUS_FLOW.length - 1 ? 'pb-0' : ''}`}>
              <p
                className={`text-sm font-bold ${
                  isCurrent ? 'text-blush-600' : isDone ? 'text-cocoa-800' : 'text-cocoa-400'
                }`}
              >
                {step}
                {isCurrent ? (
                  <span className="ml-2 rounded-full bg-blush-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blush-600">
                    Sekarang
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-cocoa-400">{STEP_HINTS[step]}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}