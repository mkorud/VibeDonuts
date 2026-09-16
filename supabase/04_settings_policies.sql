-- ============================================================
-- VibeDonuts — Policy tambahan untuk tabel `settings`
-- Tujuan: halaman "Pengaturan Toko" (PRD A-7) bisa MENYIMPAN perubahan
--         (ongkos kirim, rekening tujuan, WhatsApp) dari dashboard admin.
-- Jalankan SETELAH 03_orders.sql (tabel settings dibuat di sana).
-- ============================================================

drop policy if exists "pengaturan bisa ditambah" on public.settings;
create policy "pengaturan bisa ditambah"
  on public.settings for insert
  to anon, authenticated
  with check (true);

drop policy if exists "pengaturan bisa diubah" on public.settings;
create policy "pengaturan bisa diubah"
  on public.settings for update
  to anon, authenticated
  using (true)
  with check (true);

-- Catatan: policy SELECT ("pengaturan bisa dibaca") sudah dibuat oleh 03_orders.sql.
-- Saat Supabase Auth dipasang, batasi insert/update hanya untuk role admin.
