import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from '../common/Loading';
import { EmptyState } from '../common/EmptyState';
import { Button } from '../common/Button';
import { IconSearch } from '../common/Icons';

/**
 * Grid kartu produk (PRD 3.2: "ProductGrid").
 * Sekaligus menangani tiga kondisi: sedang memuat, kosong, dan ada data.
 */
export function ProductGrid({
  products = [],
  categories = [],
  isLoading = false,
  skeletonCount = 6,
  emptyTitle = 'Donat tidak ditemukan',
  emptyDescription = 'Coba kata kunci lain atau pilih kategori yang berbeda.',
  onReset = null,
  className = '',
}) {
  const categoryMap = Object.fromEntries(
    categories.map((category) => [String(category.id), category.nama]),
  );

  if (isLoading) {
    return <ProductGridSkeleton count={skeletonCount} className={className} />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<IconSearch className="h-7 w-7" />}
        title={emptyTitle}
        description={emptyDescription}
        className={className}
        action={
          onReset ? (
            <Button variant="secondary" onClick={onReset}>
              Tampilkan semua donat
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryName={categoryMap[String(product.category_id)] ?? ''}
        />
      ))}
    </div>
  );
}