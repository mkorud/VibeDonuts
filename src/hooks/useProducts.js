import { useContext } from 'react';
import { ProductContext } from '../context/ProductContext';

/** Hook data produk & kategori (publik maupun admin). */
export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts harus dipakai di dalam <ProductProvider>.');
  }
  return context;
}
