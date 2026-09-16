/**
 * Kelas Tailwind bersama untuk semua kontrol formulir
 * (PRD 3.2: Input / Select / TextArea) agar tampilannya seragam.
 * File ini sengaja bebas JSX supaya bisa diimpor dari mana saja.
 */

/** Kelas dasar kontrol formulir. */
export const fieldBaseClass =
  'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-cocoa-900 placeholder:text-cocoa-300 transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-cocoa-50';

/** Warna border mengikuti kondisi error. */
export function fieldStateClass(hasError, extra = '') {
  const state = hasError
    ? `${fieldBaseClass} border-rose-300 focus:border-rose-400 focus:ring-rose-100`
    : `${fieldBaseClass} border-cocoa-200 focus:border-cocoa-400 focus:ring-cocoa-100`;
  return extra ? `${state} ${extra}` : state;
}

/** Versi select dari fieldStateClass. */
export function selectStateClass(hasError) {
  return fieldStateClass(hasError, 'appearance-none pr-10');
}
