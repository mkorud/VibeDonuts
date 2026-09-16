-- ============================================================
-- VibeDonuts — Dukungan Supabase Auth (hari ke-3)
-- 1. Pesanan dikaitkan ke akun: kolom orders.user_id (FK ke auth.users)
-- 2. vd_create_order diisi ulang agar mencatat auth.uid() otomatis
-- 3. (OPSIONAL) Perketat RLS tulis produk hanya untuk email admin
--
-- Jalankan di SQL Editor SETELAH 01-05.
-- ============================================================

-- ---------- 1. Kolom pemilik pesanan ----------
alter table public.orders
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists orders_user_idx on public.orders (user_id, dibuat_pada desc);

-- ---------- 2. vd_create_order (versi dengan user_id) ----------
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

  -- Kaitkan pesanan dengan akun yang login (null bila tamu)
  v_user_id := auth.uid();

  v_ongkos := greatest(0, coalesce(p_ongkos_kirim, 0));
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

-- ---------- 3. (OPSIONAL) Perketat RLS tulis produk hanya untuk admin ----------
-- Nyalakan SETELAH akun admin dibuat (Login -> tab Daftar, dengan email yang
-- sama dengan daftar admin). Ganti email di bawah bila berbeda.
-- Tanpa blok ini, pengguna yang sudah login pun masih bisa menulis produk
-- lewat API secara langsung — penjagaan peran di frontend saja belum cukup.
-- ============================================================
-- drop policy if exists "produk bisa ditambah admin" on public.products;
-- create policy "produk bisa ditambah admin"
--   on public.products for insert
--   to authenticated
--   with check (auth.email() in ('admin@vibedonuts.id'));
--
-- drop policy if exists "produk bisa diubah admin" on public.products;
-- create policy "produk bisa diubah admin"
--   on public.products for update
--   to authenticated
--   using (auth.email() in ('admin@vibedonuts.id'))
--   with check (auth.email() in ('admin@vibedonuts.id'));
--
-- drop policy if exists "produk bisa dihapus admin" on public.products;
-- create policy "produk bisa dihapus admin"
--   on public.products for delete
--   to authenticated
--   using (auth.email() in ('admin@vibedonuts.id'));
-- ============================================================

grant execute on function public.vd_create_order(jsonb, text, text, text, text, integer) to anon, authenticated;
