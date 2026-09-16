import { ToastProvider } from './ToastContext';
import { AuthProvider } from './AuthContext';
import { SettingsProvider } from './SettingsContext';
import { ProductProvider } from './ProductContext';
import { OrderProvider } from './OrderContext';
import { CartProvider } from './CartContext';

/**
 * Semua provider state aplikasi dikumpulkan di satu tempat agar `main.jsx` tetap ringkas.
 * Urutan penting: ToastProvider & SettingsProvider di paling luar, lalu ProductProvider,
 * lalu OrderProvider (karena memakai useProducts), terakhir CartProvider
 * (memakai useToast untuk notifikasi keranjang).
 */
export function AppProviders({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <SettingsProvider>
          <ProductProvider>
            <OrderProvider>
              <CartProvider>{children}</CartProvider>
            </OrderProvider>
          </ProductProvider>
        </SettingsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
