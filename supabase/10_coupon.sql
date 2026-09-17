-- ============================================================
-- VibeDonuts — Kupon Diskon (Mini-Challenge Kelulusan)
-- Kupon "VIBE20" = potongan 20% dari total biaya belanja.
--
-- Desain (PRD 4.4 — total dihitung ulang di server):
--   1. Tabel `coupons` (kode, persen, aktif) — admin bisa kelola lewat SQL.
--   2. Kolom `orders.kode_kupon` + `orders.diskon` (harga tidak bisa dipalsukan).
--   3. `vd_create_order` v4: validasi kupon di server + hitung diskon di dalam
--      transaksi atomik, sebelum total_bayar dikunci.
-- Jalankan di SQL Editor SETELAH 01-09.
-- ============================================================

-- ---------- 1) Tabel kupon ----------
create table if not exists public.coupons (
  kode        text primary key,
  persen      integer not null check (persen between 1 and 100),
  aktif       boolean not null default true,
  dibuat_pada timestamptz not null default now()
);

alter table public.coupons enable row level security;
-- Tanpa policy: kupon hanya dibaca/divalidasi lewat fungsi security definer.

insert into public.coupons (kode, persen) values ('VIBE20', 20)
on conflict (kode) do nothing;

-- ---------- 2) Kolom pesanan ----------
alter table public.orders
  add column if not exists kode_kupon text,
  add column if not exists diskon integer not null default 0;

alter table public.orders drop constraint if exists orders_diskon_check;
alter table public.orders
  add constraint orders_diskon_check check (diskon >= 0);

-- ---------- 3) vd_create_order v4 (kupon + diskon dihitung server) ----------
-- PENTING: fungsi versi lama (6 parameter) dibuang lebih dulu. `create or replace`
-- TIDAK mengganti fungsi yang daftar parameternya berbeda — tanpa drop ini akan
-- tertinggal DUA versi (overload) dan PostgREST gagal memilih salah satunya.
drop function if exists public.vd_create_order(jsonb, text, text, text, text, integer);

create or replace function public.vd_create_order(
  p_items          jsonb,
  p_nama_pelanggan text,
  p_no_hp          text,
  p_alamat         text,
  p_catatan        text default '',
  p_ongkos_kirim   integer default 0,
  p_kupon          text default ''
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
  v_diskon       integer := 0;
  v_kupon_kode   text;
  v_persen       integer;
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

  -- Pembatas laju anti-spam (maks pesanan per jam per sumber)
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
    null;
  end;
  v_maks := coalesce(v_maks, 5);

  v_hit := public.vd_throttle_hit('order:' || left(v_sumber, 120), v_maks, interval '1 hour');
  if v_hit > v_maks then
    raise exception 'Terlalu banyak pesanan dari sumber ini. Tunggu sekitar satu jam ke depan.';
  end if;

  -- Kupon promo (mini-challenge): divalidasi DI SERVER, gagal = seluruh
  -- pesanan ditolak (fail-closed) — tidak bisa dipalsukan dari browser.
  if coalesce(btrim(p_kupon), '') <> '' then
    begin
      select c.kode, c.persen into v_kupon_kode, v_persen
      from public.coupons c
      where upper(btrim(c.kode)) = upper(btrim(p_kupon))
        and c.aktif = true
      limit 1;
    exception when undefined_table or undefined_column then
      v_kupon_kode := null;
    end;

    if v_kupon_kode is null then
      raise exception 'Kupon "%" tidak valid atau sudah tidak aktif.', btrim(p_kupon);
    end if;
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

  -- Kupon: potongan dihitung dari total barang (pembulatan ke bawah),
  -- dibatasi maksimal sebesar total barang agar total bayar tak pernah minus.
  if v_kupon_kode is not null then
    v_diskon := least((v_total_barang * coalesce(v_persen, 0)) / 100, v_total_barang);
  end if;

  update public.orders
  set total_barang = v_total_barang,
      kode_kupon   = v_kupon_kode,
      diskon       = v_diskon,
      total_bayar  = v_total_barang - v_diskon + v_ongkos
  where id = v_order_id;

  return public.vd_order_jsonb(v_order_id);
end;
$$;

-- ---------- 4) Nota JSON: ikut sertakan info kupon ----------
create or replace function public.vd_order_jsonb(p_order_id bigint)
returns jsonb
language sql
security definer
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'id',                 o.id,
    'kode_pesanan',       o.kode_pesanan,
    'nama_pelanggan',     o.nama_pelanggan,
    'no_hp',              o.no_hp,
    'alamat',             o.alamat,
    'catatan',            o.catatan,
    'total_barang',       o.total_barang,
    'ongkos_kirim',       o.ongkos_kirim,
    'total_bayar',        o.total_bayar,
    'status',             o.status,
    'url_bukti_transfer', o.url_bukti_transfer,
    'kode_kupon',         o.kode_kupon,
    'diskon',             o.diskon,
    'dibuat_pada',        o.dibuat_pada,
    'diubah_pada',        o.diubah_pada,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id',           oi.id,
        'order_id',     oi.order_id,
        'product_id',   oi.product_id,
        'nama_produk',  oi.nama_produk,
        'harga_satuan', oi.harga_satuan,
        'jumlah',       oi.jumlah,
        'subtotal',     oi.subtotal
      ) order by oi.id)
      from public.order_items oi
      where oi.order_id = o.id
    ), '[]'::jsonb)
  )
  from public.orders o
  where o.id = p_order_id;
$$;


-- ---------- 5) Cek cepat (opsional, jalankan manual apa adanya) ----------
-- select kode, persen, aktif from public.coupons;
-- select id, kode_pesanan, total_barang, kode_kupon, diskon, total_bayar
--   from public.orders order by id desc limit 5;
-- select p.proname, pg_get_function_arguments(p.oid) as argumen
--   from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname = 'public' and p.proname = 'vd_create_order';

