import { useEffect, useState } from 'react';
import { DataTable } from './DataTable';
import { Badge, StockBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { ProductImage } from '../common/ProductImage';
import { EmptyState } from '../common/EmptyState';
import { Modal } from '../common/Modal';
import { formatRupiah } from '../../lib/format';
import { IconBox, IconEdit, IconTrash } from '../common/Icons';

/**
 * Tabel kelola produk (PRD A-3) dengan aksi "Hapus Produk".
 * Aksi baris: Ubah, Stok, Aktif/Nonaktif, dan Hapus Produk.
 */
export function ProductTable({
  products = [],
  getCategoryName = () => '',
  isLoading = false,
  onEdit,
  onEditStock,
  onDelete,
  onToggleActive,
  emptyState = null,
}) {
  const columns = [
    {
      key: 'produk',
      header: 'Produk',
      render: (product) => (
        <div className="flex items-center gap-3">
          <ProductImage
            src={product.url_foto}
            alt={product.nama}
            wrapperClassName="h-12 w-12 shrink-0 rounded-xl ring-1 ring-cocoa-100"
            className="h-12 w-12 object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-bold text-cocoa-900">{product.nama}</p>
            <p className="truncate text-xs text-cocoa-400">/{product.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'kategori',
      header: 'Kategori',
      render: (product) => (
        <span className="text-cocoa-600">{getCategoryName(product.category_id)}</span>
      ),
    },
    {
      key: 'harga',
      header: 'Harga',
      render: (product) => (
        <span className="font-semibold text-cocoa-800">{formatRupiah(product.harga)}</span>
      ),
    },
    {
      key: 'stok',
      header: 'Stok',
      render: (product) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-cocoa-900">{product.stok}</span>
          <StockBadge stok={product.stok} />
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (product) =>
        product.aktif ? (
          <Badge variant="success">Aktif</Badge>
        ) : (
          <Badge variant="neutral">Nonaktif</Badge>
        ),
    },
    {
      key: 'aksi',
      header: 'Aksi',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (product) => (
        <div className="flex flex-wrap justify-end gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(product)}
            iconLeft={<IconEdit className="h-3.5 w-3.5" />}
          >
            Ubah
          </Button>

          <Button variant="ghost" size="sm" onClick={() => onEditStock(product)}>
            Stok
          </Button>

          <Button variant="ghost" size="sm" onClick={() => onToggleActive(product)}>
            {product.aktif ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(product)}
            iconLeft={<IconTrash className="h-3.5 w-3.5" />}
          >
            Hapus Produk
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={products}
      isLoading={isLoading}
      emptyState={
        emptyState ?? (
          <EmptyState
            icon={<IconBox className="h-7 w-7" />}
            title="Belum ada produk"
            description="Tambahkan donat pertama Anda dengan tombol Tambah Produk di atas."
          />
        )
      }
    />
  );
}

/** Dialog ubah stok manual (PRD A-4): admin mengisi JUMLAH AKHIR, bukan selisih. */
export function StockDialog({ isOpen, onClose, product, onSubmit, isSubmitting = false }) {
  const [stokBaru, setStokBaru] = useState('');
  const [alasan, setAlasan] = useState('');

  useEffect(() => {
    if (isOpen && product) {
      setStokBaru(String(product.stok ?? 0));
      setAlasan('');
    }
  }, [isOpen, product]);

  if (!product) return null;

  const parsed = Number(stokBaru);
  const isValid = stokBaru !== '' && Number.isInteger(parsed) && parsed >= 0;
  const selisih = isValid ? parsed - Number(product.stok ?? 0) : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ubah Stok" description={product.nama} size="sm">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!isValid) return;
          onSubmit(product.id, parsed, alasan.trim());
        }}
        className="flex flex-col gap-4"
        noValidate
      >
        <p className="rounded-xl bg-cream-100 px-4 py-3 text-xs leading-relaxed text-cocoa-500">
          Stok sekarang: <strong className="text-cocoa-800">{product.stok}</strong>. Masukkan jumlah
          stok terbaru setelah Anda menghitung ulang hasil produksi. Setiap perubahan dicatat ke
          riwayat stok.
        </p>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-cocoa-700">Stok terbaru</span>
          <input
            type="number"
            min="0"
            step="1"
            value={stokBaru}
            onChange={(event) => setStokBaru(event.target.value)}
            className="w-full rounded-xl border border-cocoa-200 bg-white px-3.5 py-2.5 text-sm text-cocoa-900 focus:border-cocoa-400 focus:outline-none focus:ring-2 focus:ring-cocoa-100"
            required
          />
          {isValid && selisih !== 0 ? (
            <span
              className={`text-xs font-semibold ${
                selisih > 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {selisih > 0 ? `+${selisih}` : selisih} dari stok sekarang
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-cocoa-700">Alasan (opsional)</span>
          <input
            type="text"
            value={alasan}
            onChange={(event) => setAlasan(event.target.value)}
            placeholder="Contoh: produksi pagi 2 loyang"
            className="w-full rounded-xl border border-cocoa-200 bg-white px-3.5 py-2.5 text-sm text-cocoa-900 placeholder:text-cocoa-300 focus:border-cocoa-400 focus:outline-none focus:ring-2 focus:ring-cocoa-100"
          />
        </label>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={!isValid}>
            Simpan Stok
          </Button>
        </div>
      </form>
    </Modal>
  );
}
