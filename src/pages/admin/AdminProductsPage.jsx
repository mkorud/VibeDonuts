import { useMemo, useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useToast } from '../../hooks/useToast';
import { formatRupiah } from '../../lib/format';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { ProductTable, StockDialog } from '../../components/admin/ProductTable';
import { ProductForm } from '../../components/admin/ProductForm';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ErrorNotice } from '../../components/common/ErrorNotice';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/public/SearchBar';
import { IconPlus } from '../../components/common/Icons';

/**
 * Halaman Kelola Produk (PRD A-3 & A-4).
 * Aksi: Tambah Produk, Ubah, ubah stok manual, aktif/nonaktif, dan Hapus Produk
 * (hapus selalu lewat dialog konfirmasi agar tidak salah klik).
 */
export function AdminProductsPage() {
  const {
    products,
    categories,
    getCategoryName,
    isLoading,
    error: productsError,
    refresh,
    addProduct,
    editProduct,
    removeProduct,
    toggleActive,
    changeStock,
  } = useProducts();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockProduct, setStockProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const visibleProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return products;
    return products.filter(
      (product) =>
        product.nama.toLowerCase().includes(keyword) ||
        getCategoryName(product.category_id).toLowerCase().includes(keyword),
    );
  }, [products, search, getCategoryName]);

  const openCreateForm = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleSubmitProduct = async (input) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await editProduct(editingProduct.id, input);
        success(`Produk "${input.nama}" diperbarui.`);
      } else {
        await addProduct(input);
        success(`Produk "${input.nama}" ditambahkan ke katalog.`);
      }
      setFormOpen(false);
      setEditingProduct(null);
    } catch (err) {
      error(err.message ?? 'Gagal menyimpan produk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveStock = async (productId, newStock, reason) => {
    setIsSubmitting(true);
    try {
      const updated = await changeStock(productId, newStock, {
        reason: reason || 'Penyesuaian stok manual',
      });
      success(`Stok ${updated.nama} diperbarui menjadi ${updated.stok} buah.`);
      setStockProduct(null);
    } catch (err) {
      error(err.message ?? 'Gagal mengubah stok.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setIsSubmitting(true);
    try {
      await removeProduct(deletingProduct.id);
      success(`Produk "${deletingProduct.nama}" dihapus.`);
      setDeletingProduct(null);
    } catch (err) {
      error(err.message ?? 'Gagal menghapus produk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      const updated = await toggleActive(product.id);
      success(
        updated.aktif
          ? `${updated.nama} ditampilkan kembali di katalog.`
          : `${updated.nama} disembunyikan dari katalog.`,
      );
    } catch (err) {
      error(err.message ?? 'Gagal mengubah status produk.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Kelola Produk"
        description={`${products.length} produk terdaftar. Harga termurah ${formatRupiah(
          Math.min(...products.map((product) => product.harga), 0),
        )}.`}
        action={
          <Button
            variant="primary"
            onClick={openCreateForm}
            iconLeft={<IconPlus className="h-4 w-4" />}
          >
            Tambah Produk
          </Button>
        }
      />

      <div className="max-w-sm">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Cari nama produk atau kategori..."
        />
      </div>

      <ErrorNotice message={productsError} onRetry={refresh} />

      <ProductTable
        products={visibleProducts}
        getCategoryName={getCategoryName}
        isLoading={isLoading}
        onEdit={openEditForm}
        onEditStock={setStockProduct}
        onDelete={setDeletingProduct}
        onToggleActive={handleToggleActive}
      />

      {/* Modal tambah / ubah produk */}
      <ProductForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmitProduct}
        product={editingProduct}
        categories={categories}
        isSubmitting={isSubmitting}
      />

      {/* Dialog ubah stok */}
      <StockDialog
        isOpen={Boolean(stockProduct)}
        product={stockProduct}
        onClose={() => setStockProduct(null)}
        onSubmit={handleSaveStock}
        isSubmitting={isSubmitting}
      />

      {/* Konfirmasi hapus produk */}
      <ConfirmDialog
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
        title={`Hapus "${deletingProduct?.nama ?? ''}"?`}
        description="Produk akan dihapus permanen dari katalog dan tidak bisa dikembalikan."
        confirmLabel="Ya, Hapus Produk"
      />
    </div>
  );
}
