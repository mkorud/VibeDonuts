/**
 * Badge status pesanan (PRD 4.3).
 * Warna diambil dari ORDER_STATUS_STYLE agar konsisten di semua halaman.
 */
import { ORDER_STATUS, ORDER_STATUS_STYLE } from '../../lib/constants';

export function OrderStatusBadge({ status, size = 'md', className = '' }) {
  const style = ORDER_STATUS_STYLE[status] ?? ORDER_STATUS_STYLE[ORDER_STATUS.MENUNGGU_PEMBAYARAN];
  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ring-1 ring-inset ${style} ${sizeClass} ${className}`}
    >
      {status}
    </span>
  );
}