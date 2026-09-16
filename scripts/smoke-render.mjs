/**
 * Uji render cepat (smoke test) tanpa browser.
 *
 * Semua modul (termasuk React) dimuat lewat graph Vite agar hanya ada SATU salinan
 * React - lalu tiap halaman dirender dengan react-dom/server. Error render apapun
 * yang tadinya jadi "layar putih" di browser akan muncul di sini dengan stack jelas.
 *
 * Jalankan: npm run smoke
 */
import { createServer } from 'vite';

/** Modul virtual: berisi seluruh logika render, agar ikut transform Vite. */
const TEST_CODE = `
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { AppProviders } from '/src/context/AppProviders.jsx';
import { PublicLayout } from '/src/layouts/PublicLayout.jsx';
import { AdminLayout } from '/src/layouts/AdminLayout.jsx';
import { HomePage } from '/src/pages/public/HomePage.jsx';
import { ProductsPage } from '/src/pages/public/ProductsPage.jsx';
import { ProductDetailPage } from '/src/pages/public/ProductDetailPage.jsx';
import { CustomerDashboardPage } from '/src/pages/public/CustomerDashboardPage.jsx';
import { CartPage } from '/src/pages/public/CartPage.jsx';
import { CheckoutPage } from '/src/pages/public/CheckoutPage.jsx';
import { OrderSuccessPage } from '/src/pages/public/OrderSuccessPage.jsx';
import { TrackOrderPage } from '/src/pages/public/TrackOrderPage.jsx';
import { AboutPage } from '/src/pages/public/AboutPage.jsx';
import { NotFoundPage } from '/src/pages/public/NotFoundPage.jsx';
import { DashboardPage } from '/src/pages/admin/DashboardPage.jsx';
import { AdminProductsPage } from '/src/pages/admin/AdminProductsPage.jsx';
import { AdminOrdersPage } from '/src/pages/admin/AdminOrdersPage.jsx';
import { AdminSettingsPage } from '/src/pages/admin/AdminSettingsPage.jsx';

export function renderPage(location, Component, Layout = null) {
  const content = Layout
    ? React.createElement(Layout, null, React.createElement(Component, null))
    : React.createElement(Component, null);

  return renderToString(
    React.createElement(
      StaticRouter,
      { location },
      React.createElement(AppProviders, null, content),
    ),
  );
}

const REGISTRY = {
  HomePage, ProductsPage, ProductDetailPage, CartPage, CustomerDashboardPage, CheckoutPage,
  OrderSuccessPage, TrackOrderPage, AboutPage, NotFoundPage,
  DashboardPage, AdminProductsPage, AdminOrdersPage, AdminSettingsPage,
  PublicLayout, AdminLayout,
};

export function renderCase(testCase) {
  const Component = REGISTRY[testCase.Component];
  const Layout = testCase.Layout ? REGISTRY[testCase.Layout] : null;
  if (!Component) throw new Error('Komponen tidak dikenal: ' + testCase.Component);
  return renderPage(testCase.location, Component, Layout);
}
`;

const virtualSmokePlugin = {
  name: 'smoke-virtual-module',
  resolveId(id) {
    if (id === 'virtual:smoke') return '\0virtual:smoke';
    return null;
  },
  load(id) {
    if (id === '\0virtual:smoke') return TEST_CODE;
    return null;
  },
};

const CASES = [
  { location: '/', Component: 'HomePage', Layout: 'PublicLayout' },
  { location: '/produk', Component: 'ProductsPage' },
  { location: '/produk/donat-tiramisu', Component: 'ProductDetailPage' },
  { location: '/keranjang', Component: 'CartPage' },
  { location: '/akun', Component: 'CustomerDashboardPage' },
  { location: '/checkout', Component: 'CheckoutPage' },
  { location: '/pesanan/30', Component: 'OrderSuccessPage' },
  { location: '/lacak', Component: 'TrackOrderPage' },
  { location: '/tentang', Component: 'AboutPage' },
  { location: '/halaman-ngawur', Component: 'NotFoundPage' },
  { location: '/admin', Component: 'DashboardPage', Layout: 'AdminLayout' },
  { location: '/admin/produk', Component: 'AdminProductsPage' },
  { location: '/admin/pesanan', Component: 'AdminOrdersPage' },
  { location: '/admin/pengaturan', Component: 'AdminSettingsPage' },
];

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
  plugins: [virtualSmokePlugin],
});

let { renderCase } = await vite.ssrLoadModule('virtual:smoke');

let failed = 0;

for (const testCase of CASES) {
  const label = `${testCase.location} (${testCase.Component})`;
  try {
    const html = renderCase(testCase);
    console.log(`OK   ${label} -> ${html.length} chars`);
    if (html.length < 200) {
      console.warn('     ^ PERINGATAN: output sangat pendek, kemungkinan tidak merender apa-apa');
      failed += 1;
    }
  } catch (error) {
    failed += 1;
    console.error(`GAGAL ${label}`);
    console.error(error?.stack ?? error);
  }
}

await vite.close();

if (failed > 0) {
  console.error(`\n${failed} halaman gagal dirender.`);
  process.exit(1);
}
console.log('\nSemua halaman berhasil dirender tanpa error.');
