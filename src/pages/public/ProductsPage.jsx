import { useMemo, useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { ProductGrid } from '../../components/public/ProductGrid';
import { SearchBar } from '../../components/public/SearchBar';
import { CategoryFilter } from '../../components/public/CategoryFilter';
import { SortSelect } from '../../components/public/SortSelect';
import { SectionHeading } from '../../components/common/SectionHeading';
import { ErrorNotice } from '../../components/common/ErrorNotice';
import { ALL_CATEGORY } from '../../lib/constants';

/** Halaman katalog produk (PRD P-2): cari, filter kategori, dan urutkan. */
export function ProductsPage() {
  const { activeProducts, categories, isLoading, error, refresh } = useProducts();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL_CATEGORY);
  const [sort, setSort] = useState('terbaru');

  const visibleProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    let rows = activeProducts.filter((product) => {
      const matchKeyword =
        !keyword ||
        product.nama.toLowerCase().includes(keyword) ||
        String(product.deskripsi ?? '').toLowerCase().includes(keyword);
      const matchCategory =
        category === ALL_CATEGORY || String(product.category_id) === String(category);

      return matchKeyword && matchCategory;
    });

    rows = [...rows].sort((a, b) => {
      if (sort === 'termurah') return a.harga - b.harga;
      if (sort === 'termahal') return b.harga - a.harga;
      if (sort === 'nama') return a.nama.localeCompare(b.nama, 'id');
      return new Date(b.dibuat_pada) - new Date(a.dibuat_pada);
    });

    return rows;
  }, [activeProducts, search, category, sort]);

  const resetFilters = () => {
    setSearch('');
    setCategory(ALL_CATEGORY);
    setSort('terbaru');
  };

  const isFiltering = Boolean(search) || category !== ALL_CATEGORY || sort !== 'terbaru';

  return (
    <div className="container-page py-10 lg:py-14">
      <SectionHeading
        eyebrow="Katalog"
        title="Semua Donat Kami"
        description="Stok diperbarui langsung setiap ada pesanan masuk. Donat dengan label merah berarti stoknya sudah habis."
      />

      {/* Bilah alat: pencarian + urutan */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SearchBar value={search} onChange={setSearch} className="sm:max-w-sm sm:flex-1" />
        <SortSelect value={sort} onChange={setSort} />
      </div>

      {/* Filter kategori */}
      <CategoryFilter
        categories={categories}
        value={category}
        onChange={setCategory}
        className="mt-4"
      />

      <p className="mt-6 text-sm text-cocoa-400">
        {isLoading
          ? 'Memuat katalog...'
          : `Menampilkan ${visibleProducts.length} dari ${activeProducts.length} donat`}
        {isFiltering && !isLoading ? ' (tersaring)' : ''}
      </p>

      <ErrorNotice message={error} onRetry={refresh} className="mt-4" />

      <div className="mt-4">
        <ProductGrid
          products={visibleProducts}
          categories={categories}
          isLoading={isLoading}
          skeletonCount={6}
          emptyTitle={
            isFiltering ? 'Tidak ada donat yang cocok' : 'Belum ada donat hari ini'
          }
          emptyDescription={
            isFiltering
              ? 'Coba kata kunci lain atau pilih kategori "Semua Donat".'
              : 'Silakan datang lagi nanti, stok baru biasanya diunggah pagi hari.'
          }
          onReset={isFiltering ? resetFilters : null}
        />
      </div>
    </div>
  );
}
