import { useContext } from 'react';
import { OrderContext } from '../context/OrderContext';

/** Hook data pesanan (checkout, lacak pesanan, kelola pesanan admin). */
export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders harus dipakai di dalam <OrderProvider>.');
  }
  return context;
}
