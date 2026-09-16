import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

/** Hook ringkas untuk memakai state keranjang. */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart harus dipakai di dalam <CartProvider>.');
  }
  return context;
}