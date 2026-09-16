/**
 * Mock database berbasis localStorage.
 *
 * Tujuan: seluruh komponen React hanya bicara lewat `src/services/*.js`,
 * sehingga saat backend sungguhan siap (hari ke-2), cukup ganti isi service
 * dengan `fetch('/api/...')` dan file ini bisa dihapus tanpa menyentuh UI.
 */

import { STORAGE_KEYS, readStorage, writeStorage, removeStorage } from '../lib/storage';
import { seedCategories, seedProducts, seedOrders, seedStockLogs } from '../data/seed';

/** Latensi buatan agar state "Loading" di UI teruji seperti memanggil API nyata. */
const SIMULATED_LATENCY_MS = 300;

export function delay(ms = SIMULATED_LATENCY_MS) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Daftar tabel yang ditiru beserta data awalnya. */
const TABLES = {
  categories: { key: STORAGE_KEYS.categories, seed: seedCategories },
  products: { key: STORAGE_KEYS.products, seed: seedProducts },
  orders: { key: STORAGE_KEYS.orders, seed: seedOrders },
  stockLogs: { key: STORAGE_KEYS.stockLogs, seed: seedStockLogs },
};

/** Baca seluruh isi tabel (otomatis mengisi seed saat pertama kali dibuka). */
export function readTable(tableName) {
  const table = TABLES[tableName];
  if (!table) throw new Error(`Tabel "${tableName}" tidak dikenal.`);

  const stored = readStorage(table.key, null);
  if (!Array.isArray(stored)) {
    writeStorage(table.key, table.seed);
    return structuredClone(table.seed);
  }
  return stored;
}

/** Simpan seluruh isi tabel. */
export function writeTable(tableName, rows) {
  const table = TABLES[tableName];
  if (!table) throw new Error(`Tabel "${tableName}" tidak dikenal.`);
  writeStorage(table.key, rows);
  return rows;
}

/** Nomor unik berikutnya untuk sebuah tabel (pengganti AUTO_INCREMENT). */
export function nextId(rows) {
  return rows.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
}

/** Kembalikan seluruh data contoh ke kondisi awal (dipakai tombol reset di admin). */
export function resetMockDatabase() {
  Object.values(TABLES).forEach((table) => removeStorage(table.key));
  removeStorage(STORAGE_KEYS.settings);
}

/** Utilitas paginasi generik yang dipakai DataTable & service. */
export function paginate(rows, page = 1, perPage = 10) {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;
  return {
    data: rows.slice(start, start + perPage),
    meta: { page: safePage, perPage, total, totalPages },
  };
}
