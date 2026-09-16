import { useEffect, useState } from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { TextArea } from '../common/TextArea';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ProductImage } from '../common/ProductImage';
import { MAX_STOCK } from '../../lib/constants';

/** Nilai awal formulir produk (mode "Tambah Produk"). */
const EMPTY_FORM = {
  nama: '',
  category_id: '',
  harga: '',
  stok: '',
  deskripsi: '',
  url_foto: '',
  aktif: true,
};

/** Ubah baris produk menjadi nilai formulir. */
function toFormState(product) {
  if (!product) return EMPTY_FORM;
  return {
    nama: product.nama ?? '',
    category_id: product.category_id ? String(product.category_id) : '',
    harga: String(product.harga ?? ''),
    stok: String(product.stok ?? 0),
    deskripsi: product.deskripsi ?? '',
    url_foto: product.url_foto ?? '',
    aktif: product.aktif !== false,
  };
}

/** Validasi isian produk sesuai PRD 4.4. */
export function validateProduct(form) {
  const errors = {};

  if (!form.nama.trim()) errors.nama = 'Nama produk wajib diisi.';
  else if (form.nama.trim().length < 3) errors.nama = 'Nama produk minimal 3 karakter.';

  const harga = Number(form.harga);
  if (form.harga === '' || !Number.isFinite(harga)) errors.harga = 'Harga wajib diisi.';
  else if (harga < 1000) errors.harga = 'Harga minimal Rp 1.000.';

  const stok = Number(form.stok);
  if (form.stok === '' || !Number.isFinite(stok)) errors.stok = 'Stok wajib diisi.';
  else if (!Number.isInteger(stok) || stok < 0) errors.stok = 'Stok harus angka bulat >= 0.';
  else if (stok > MAX_STOCK) errors.stok = `Stok maksimal ${MAX_STOCK}.`;

  if (!form.category_id) errors.category_id = 'Kategori wajib dipilih.';

  if (form.url_foto.trim() && !/^https?:\/\//i.test(form.url_foto.trim())) {
    errors.url_foto = 'URL gambar harus dimulai dengan http:// atau https://';
  }

  return errors;
}

/**
 * Formulir tambah / ubah produk (PRD A-3).
 * Isian inti sesuai PRD: Nama, Harga, Deskripsi, Gambar (URL) + kategori, stok, status aktif.
 */
export function ProductForm({
  isOpen,
  onClose,
  onSubmit,
  product = null,
  categories = [],
  isSubmitting = false,
}) {
  const [form, setForm] = useState(() => toFormState(product));
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(product);

  // Isi ulang formulir setiap kali produk yang diedit berubah.
  useEffect(() => {
    if (isOpen) {
      setForm(toFormState(product));
      setErrors({});
    }
  }, [isOpen, product]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateProduct(form);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await onSubmit({
      nama: form.nama.trim(),
      category_id: Number(form.category_id),
      harga: Number(form.harga),
      stok: Number(form.stok),
      deskripsi: form.deskripsi.trim(),
      url_foto: form.url_foto.trim(),
      aktif: form.aktif,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Ubah Produk' : 'Tambah Produk'}
      description="Isi data donat dengan lengkap agar pelanggan mudah menemukannya."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Nama Produk"
          name="nama"
          value={form.nama}
          onChange={handleChange}
          placeholder="Contoh: Donat Tiramisu"
          error={errors.nama}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Harga"
            name="harga"
            type="number"
            min="0"
            step="500"
            prefix="Rp"
            value={form.harga}
            onChange={handleChange}
            placeholder="18000"
            error={errors.harga}
            required
          />

          <Input
            label="Stok"
            name="stok"
            type="number"
            min="0"
            step="1"
            value={form.stok}
            onChange={handleChange}
            placeholder="24"
            hint="Stok berkurang otomatis saat ada pesanan masuk."
            error={errors.stok}
            required
          />
        </div>

        <Select
          label="Kategori"
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          placeholder="Pilih kategori"
          error={errors.category_id}
          options={categories.map((category) => ({
            value: String(category.id),
            label: category.nama,
          }))}
          required
        />

        <TextArea
          label="Deskripsi"
          name="deskripsi"
          value={form.deskripsi}
          onChange={handleChange}
          placeholder="Ceritakan rasa, tekstur, dan isian donat ini..."
          rows={3}
        />

        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <Input
            label="Gambar (URL)"
            name="url_foto"
            value={form.url_foto}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/..."
            hint="Tempel tautan foto donat (JPG/PNG/WEBP)."
            error={errors.url_foto}
          />

          <ProductImage
            src={form.url_foto}
            alt="Pratinjau foto produk"
            wrapperClassName="h-20 w-20 self-end rounded-xl ring-1 ring-cocoa-100"
            className="h-20 w-20 object-cover"
          />
        </div>

        {/* Status aktif */}
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-cream-100 px-4 py-3">
          <span>
            <span className="block text-sm font-semibold text-cocoa-800">Produk aktif</span>
            <span className="block text-xs text-cocoa-400">
              Produk nonaktif disembunyikan dari katalog pelanggan.
            </span>
          </span>

          <input
            type="checkbox"
            name="aktif"
            checked={form.aktif}
            onChange={(event) =>
              setForm((current) => ({ ...current, aktif: event.target.checked }))
            }
            className="h-5 w-5 accent-cocoa-700"
          />
        </label>

        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEdit ? 'Simpan Perubahan' : 'Simpan Produk'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
