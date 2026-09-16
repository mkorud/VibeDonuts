-- ============================================================
-- VibeDonuts — Penguatan keamanan (hasil audit hari ke-3)
-- S1: tulis produk & kategori khusus admin (sebelumnya terbuka untuk anon)
-- S3: pembatas laju anti-spam di vd_create_order
-- P0-2: eksekusi vd_reset_demo_data khusus authenticated
-- Jalankan di SQL Editor SETELAH 01-08.
-- ============================================================

-- ---------- 1) Tabel pembatas laju ----------
create table if not exists public.order_throttle (
  kunci         text primary key,
  jendela_mulai timestamptz not null default now(),
  jumlah        integer not null default 0
);

alter table public.order_throttle enable row level security;
-- Tanpa policy: hanya fungsi security definer yang menyentuh tabel ini.

-- ---------- 2) Fungsi hitungan laju ----------
create or replace function public.vd_throttle_hit(p_kunci text, p_maks integer, p_jendela interval)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hit integer;
begin
  insert into public.order_throttle as t (kunci, jendela_mulai, jumlah)
  values (p_kunci, now(), 1)
  on conflict (kunci) do update
    set jumlah = case when t.jendela_mulai < now() - p_jendela then 1 else t.jumlah + 1 end,
        jendela_mulai = case when t.jendela_mulai < now() - p_jendela then now() else t.jendela_mulai end
  returning t.jumlah into v_hit;

  -- Bersihkan entri yang sudah lama tidak aktif
  delete from public.order_throttle where jendela_mulai < now() - interval '2 days';

  return v_hit;
end;
$$;

revoke execute on function public.vd_throttle_hit(text, integer, interval) from public, anon, authenticated;

-- ---------- 3) Tulis produk: hanya admin (S1) ----------
drop policy if exists "produk bisa ditambah admin" on public.products;
create policy "produk hanya bisa ditambah admin"
  on public.products for insert
  to authenticated
  with check (public.vd_is_admin());

drop policy if exists "produk bisa diubah admin" on public.products;
create policy "produk hanya bisa diubah admin"
  on public.products for update
  to authenticated
  using (public.vd_is_admin())
  with check (public.vd_is_admin());

drop policy if exists "produk bisa dihapus admin" on public.products;
create policy "produk hanya bisa dihapus admin"
  on public.products for delete
  to authenticated
  using (public.vd_is_admin());

-- Kategori: tulis juga khusus admin (PRD A-5)
drop policy if exists "kategori hanya bisa ditambah admin" on public.categories;
create policy "kategori hanya bisa ditambah admin"
  on public.categories for insert
  to authenticated
  with check (public.vd_is_admin());

drop policy if exists "kategori hanya bisa diubah admin" on public.categories;
create policy "kategori hanya bisa diubah admin"
  on public.categories for update
  to authenticated
  using (public.vd_is_admin())
  with check (public.vd_is_admin());

drop policy if exists "kategori hanya bisa dihapus admin" on public.categories;
create policy "kategori hanya bisa dihapus admin"
  on public.categories for delete
  to authenticated
  using (public.vd_is_admin());

-- ---------- 4) vd_create_order v3 (pembatas laju + kaitan akun) ----------
create or replace function public.vd_create_order(
  p_items          jsonb,
  p_nama_pelanggan text,
  p_no_hp          text,
  p_alamat         text,
  p_catatan        text default '',
  p_ongkos_kirim   integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id     bigint;
  v_kode         text;
  v_ongkos       integer;
  v_total_barang integer := 0;
  v_user_id      uuid;
  v_item         jsonb;
  v_product      public.products%rowtype;
  v_jumlah       integer;
  v_sumber       text;
  v_maks         integer;
  v_hit          integer;
begin
  if p_items is null or jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Keranjang masih kosong.';
  end if;
  if char_length(btrim(coalesce(p_nama_pelanggan, ''))) < 3 then
    raise exception 'Nama penerima wajib diisi (minimal 3 karakter).';
  end if;
  if coalesce(p_no_hp, '') !~ '^[0-9]{10,15}$' then
    raise exception 'Nomor HP wajib diisi, minimal 10 angka.';
  end if;
  if char_length(btrim(coalesce(p_alamat, ''))) < 10 then
    raise exception 'Alamat pengiriman wajib diisi (minimal 10 karakter).';
  end if;

  -- QA (S3): pembatas laju anti-spam — maks pesanan per jam per sumber
  -- (akun yang login, atau alamat IP untuk pengunjung).
  v_sumber := coalesce(
    auth.uid()::text,
    coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', 'tanpa-sumber')
  );

  begin
    select nullif(btrim(nilai), '')::integer into v_maks
    from public.settings
    where kunci = 'maks_order_per_jam'
    limit 1;
  exception when undefined_table or undefined_column or invalid_text_representation then
    null; -- tabel/kunci belum ada: pakai ambang bawaan
  end;
  v_maks := coalesce(v_maks, 5);

  v_hit := public.vd_throttle_hit('order:' || left(v_sumber, 120), v_maks, interval '1 hour');
  if v_hit > v_maks then
    raise exception 'Terlalu banyak pesanan dari sumber ini. Tunggu sekitar satu jam ke depan.';
  end if;

  -- Kaitkan pesanan dengan akun yang login (null bila tamu)
  v_user_id := auth.uid();

  begin
    select nullif(btrim(nilai), '')::integer into v_ongkos
    from public.settings
    where kunci = 'ongkos_kirim'
    limit 1;
    if v_ongkos is null then
      v_ongkos := greatest(0, coalesce(p_ongkos_kirim, 0));
    end if;
  exception when undefined_table or undefined_column or invalid_text_representation then
    null;
  end;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_jumlah := greatest(1, coalesce((v_item ->> 'jumlah')::integer, 1));

    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::bigint
    for update;

    if not found then
      raise exception 'Ada produk di keranjang yang sudah tidak tersedia.';
    end if;
    if v_product.aktif = false then
      raise exception 'Maaf, % sedang tidak dijual.', v_product.nama;
    end if;
    if v_product.stok < v_jumlah then
      raise exception 'Maaf, stok % tinggal %. Silakan sesuaikan jumlahnya.', v_product.nama, v_product.stok;
    end if;
  end loop;

  insert into public.orders (kode_pesanan, nama_pelanggan, no_hp, alamat, catatan, ongkos_kirim, status, user_id)
  values ('', p_nama_pelanggan, p_no_hp, p_alamat, coalesce(p_catatan, ''), v_ongkos, 'Menunggu Pembayaran', v_user_id)
  returning id into v_order_id;

  v_kode := 'VD-' || to_char(now(), 'YYMM') || '-' || lpad(v_order_id::text, 4, '0');
  update public.orders set kode_pesanan = v_kode where id = v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_jumlah := greatest(1, coalesce((v_item ->> 'jumlah')::integer, 1));

    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::bigint
    for update;

    insert into public.order_items (order_id, product_id, nama_produk, harga_satuan, jumlah, subtotal)
    values (v_order_id, v_product.id, v_product.nama, v_product.harga, v_jumlah, v_product.harga * v_jumlah);

    update public.products
    set stok = stok - v_jumlah, diubah_pada = now()
    where id = v_product.id;

    insert into public.stock_logs (product_id, perubahan, stok_sebelum, stok_sesudah, alasan, user_id)
    values (v_product.id, -v_jumlah, v_product.stok, v_product.stok - v_jumlah, 'Pesanan ' || v_kode, null);

    v_total_barang := v_total_barang + (v_product.harga * v_jumlah);
  end loop;

  update public.orders
  set total_barang = v_total_barang,
      total_bayar  = v_total_barang + v_ongkos
  where id = v_order_id;

  return public.vd_order_jsonb(v_order_id);
end;
$$;

-- ---------- 5) Reset demo: khusus authenticated (P0-2) ----------
-- Fungsi ini memuat cek vd_is_admin() di dalamnya (lihat 05_reset_demo.sql);
-- kombinasi revoke + grant memastikan tamu tidak bisa memicunya sama sekali.
revoke execute on function public.vd_reset_demo_data() from public, anon;
grant execute on function public.vd_reset_demo_data() to authenticated;

-- ---------- 6) Ambang spam bisa diatur dari Pengaturan Toko ----------
insert into public.settings (kunci, nilai) values ('maks_order_per_jam', '5')
on conflict (kunci) do nothing;


