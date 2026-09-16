import { useCallback } from 'react';
import { useEscapeKey, useLockBodyScroll } from '../../hooks/useUiHelpers';
import { IconClose } from './Icons';

const SIZES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

/**
 * Kotak pop-up serbaguna (PRD 3.2: "Modal").
 *
 * - Menutup lewat tombol X, klik area gelap, atau tombol Escape.
 * - Scroll halaman dikunci selama modal terbuka.
 * - Di layar HP modal menempel ke bawah (bottom sheet) agar nyaman dijangkau ibu jari.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description = '',
  children,
  footer = null,
  size = 'md',
  hideCloseButton = false,
  closeOnBackdrop = true,
}) {
  useLockBodyScroll(isOpen);

  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  useEscapeKey(handleClose, isOpen);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Tutup"
        tabIndex={-1}
        onClick={closeOnBackdrop ? handleClose : undefined}
        className="absolute inset-0 cursor-default bg-cocoa-900/45 backdrop-blur-sm"
      />

      <div
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-blob bg-white shadow-lift sm:rounded-card ${
          SIZES[size] ?? SIZES.md
        }`}
      >
        {title || !hideCloseButton ? (
          <div className="flex items-start justify-between gap-4 border-b border-cocoa-100 px-5 py-4 sm:px-6">
            <div>
              {title ? <h2 className="text-lg font-bold text-cocoa-900">{title}</h2> : null}
              {description ? (
                <p className="mt-1 text-sm text-cocoa-400">{description}</p>
              ) : null}
            </div>

            {hideCloseButton ? null : (
              <button
                type="button"
                onClick={handleClose}
                aria-label="Tutup"
                className="-mr-1 rounded-full p-2 text-cocoa-400 transition hover:bg-cocoa-100 hover:text-cocoa-700"
              >
                <IconClose className="h-5 w-5" />
              </button>
            )}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        {footer ? (
          <div className="border-t border-cocoa-100 bg-cream-50 px-5 py-4 sm:px-6">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
