-- ============================================================
-- VibeDonuts — Policy RLS untuk tabel `products`
-- Tujuan: INSERT/DELETE dari dashboard admin (anon key) berfungsi,
--         sambil tetap mengaktifkan RLS sebagai pengaman dasar.
--
-- CATATAN PENTING (MVP):
-- Policy di bawah sengaja longgar karena login admin MVP masih
-- berbasis sesi frontend (belum Supabase Auth). Saat Supabase Auth
-- dipasang, ganti `to anon, authenticated` menjadi hanya
-- `to authenticated` + cek peran admin.
-- ============================================================

alter table public.products enable row level security;

-- Semua orang boleh MELIHAT produk (katalog publik P-2, lacak P-7)
drop policy if exists "produk bisa dibaca publik" on public.products;
create policy "produk bisa dibaca publik"
  on public.products
  for select
  to anon, authenticated
  using (true);

-- INSERT: tombol "Simpan Produk" di dashboard admin (A-3)
drop policy if exists "produk bisa ditambah admin" on public.products;
create policy "produk bisa ditambah admin"
  on public.products
  for insert
  to anon, authenticated
  with check (true);

-- UPDATE: ubah produk / aktif-nonaktif / ubah stok (A-3, A-4)
drop policy if exists "produk bisa diubah admin" on public.products;
create policy "produk bisa diubah admin"
  on public.products
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- DELETE: tombol "Hapus Produk" (A-3) — penghapusan permanen
drop policy if exists "produk bisa dihapus admin" on public.products;
create policy "produk bisa dihapus admin"
  on public.products
  for delete
  to anon, authenticated
  using (true);

-- ============================================================
-- (Opsional) Supabase Realtime — data produk ikut berubah otomatis
-- di semua browser yang terbuka tanpa refresh:
-- alter publication supabase_realtime add table public.products;
-- ============================================================
