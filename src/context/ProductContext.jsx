import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as productService from '../services/productService';
import * as categoryService from '../services/categoryService';

export const ProductContext = createContext(null);

/**
 * Sumber tunggal data produk & kategori untuk SELURUH aplikasi
 * (halaman publik memakai `activeProducts`, dashboard admin memakai `products`).
 *
 * Di PRD 3.3 produk diambil ulang dari server setiap halaman dibuka; di sini
 * "server" adalah service layer, sehingga komponen tetap tipis.
 */
export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [productRows, categoryRows] = await Promise.all([
        productService.fetchProducts({ includeInactive: true }),
        categoryService.fetchCategories(),
      ]);
      setProducts(productRows);
      setCategories(categoryRows);
    } catch (err) {
      setError(err.message ?? 'Gagal memuat data produk.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Produk yang tampil di toko (PRD P-5: produk stok 0 tetap tampil). */
  const activeProducts = useMemo(() => products.filter((product) => product.aktif), [products]);

  /** Peta id -> nama kategori untuk ditampilkan di tabel admin. */
  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((category) => [String(category.id), category.nama])),
    [categories],
  );

  const getCategoryName = useCallback(
    (categoryId) => categoryMap[String(categoryId)] ?? 'Tanpa kategori',
    [categoryMap],
  );

  const getProductById = useCallback(
    (id) => products.find((product) => String(product.id) === String(id)) ?? null,
    [products],
  );

  const getProductBySlug = useCallback(
    (slug) => products.find((product) => product.slug === slug) ?? null,
    [products],
  );

  /** --- Aksi admin: produk (PRD A-3) --- */

  const addProduct = useCallback(async (input) => {
    const created = await productService.createProduct(input);
    setProducts((current) => [created, ...current]);
    return created;
  }, []);

  const editProduct = useCallback(async (id, input) => {
    const updated = await productService.updateProduct(id, input);
    setProducts((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    return updated;
  }, []);

  const removeProduct = useCallback(async (id) => {
    await productService.deleteProduct(id);
    setProducts((current) => current.filter((item) => String(item.id) !== String(id)));
    return true;
  }, []);

  const toggleActive = useCallback(async (id) => {
    const updated = await productService.toggleProductActive(id);
    setProducts((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    return updated;
  }, []);

  /** Ubah stok dengan jumlah akhir + catat riwayat (PRD A-4). */
  const changeStock = useCallback(
    async (id, newStock, options) => {
      const updated = await productService.updateStock(id, newStock, options);
      setProducts((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      return updated;
    },
    [],
  );

  /** --- Aksi admin: kategori (PRD A-5) --- */

  const addCategory = useCallback(async (nama) => {
    const created = await categoryService.createCategory(nama);
    setCategories((current) => [...current, created]);
    return created;
  }, []);

  const editCategory = useCallback(async (id, nama) => {
    const updated = await categoryService.updateCategory(id, nama);
    setCategories((current) =>
      current.map((item) => (String(item.id) === String(updated.id) ? updated : item)),
    );
    return updated;
  }, []);

  const removeCategory = useCallback(async (id) => {
    await categoryService.deleteCategory(id);
    setCategories((current) => current.filter((item) => String(item.id) !== String(id)));
    return true;
  }, []);

  /** Produk stok menipis untuk ringkasan dashboard (PRD A-2). */
  const lowStockProducts = useMemo(
    () => products.filter((product) => product.aktif && product.stok <= 5).sort((a, b) => a.stok - b.stok),
    [products],
  );

  const value = useMemo(
    () => ({
      products,
      activeProducts,
      categories,
      categoryMap,
      lowStockProducts,
      isLoading,
      error,
      refresh,
      getCategoryName,
      getProductById,
      getProductBySlug,
      addProduct,
      editProduct,
      removeProduct,
      toggleActive,
      changeStock,
      addCategory,
      editCategory,
      removeCategory,
    }),
    [
      products,
      activeProducts,
      categories,
      categoryMap,
      lowStockProducts,
      isLoading,
      error,
      refresh,
      getCategoryName,
      getProductById,
      getProductBySlug,
      addProduct,
      editProduct,
      removeProduct,
      toggleActive,
      changeStock,
      addCategory,
      editCategory,
      removeCategory,
    ],
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}
