import { Modal } from './Modal';
import { Button } from './Button';
import { IconAlert, IconTrash } from './Icons';

/**
 * Dialog konfirmasi tindakan berbahaya (contoh: "Hapus Produk").
 * Dipakai halaman admin agar admin tidak menghapus data karena salah klik.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi tindakan',
  description = 'Tindakan ini tidak bisa dibatalkan.',
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  isLoading = false,
  isDangerous = true,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} size="sm">
      <div className="flex gap-4">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            isDangerous ? 'bg-rose-100 text-rose-600' : 'bg-butter-100 text-butter-400'
          }`}
        >
          {isDangerous ? <IconTrash className="h-5 w-5" /> : <IconAlert className="h-5 w-5" />}
        </span>
        <p className="text-sm leading-relaxed text-cocoa-600">
          Data yang dihapus tidak dapat dikembalikan. Pastikan Anda sudah yakin sebelum
          melanjutkan.
        </p>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          variant={isDangerous ? 'danger' : 'primary'}
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
