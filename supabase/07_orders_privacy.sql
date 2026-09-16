-- ============================================================
-- VibeDonuts — Privasi pesanan (standar industri / OWASP A01)
--
-- SEBELUM: policy orders `using (true)` membuat SIAPA PUN dengan anon key
--          (yang memang publik) bisa membaca seluruh pesanan: nama, nomor
--          HP, alamat, dan status pembayaran pelanggan lain (IDOR).
--
-- SESUDAH file ini:
--   anon (belum login)  : tidak bisa membaca/mengubah pesanan sama sekali
--   pembeli             : hanya pesanan MILIKNYA (auth.uid() = user_id)
--   admin               : semua pesanan (app_metadata.role='admin' ATAU
--                         email terdaftar di settings.admin_emails)
--   lacak pesanan tamu  : lewat RPC vd_track_order (wajib kode + nomor HP)
--   unggah bukti        : lewat RPC vd_attach_transfer_proof (pemilik saja)
--
-- Jalankan di SQL Editor SETELAH 01-06 (aman dijalankan berulang).
-- ============================================================

-- ---------- Daftar email admin (pelengkap app_metadata.role) ----------
insert into public.settings (kunci, nilai)
values ('admin_emails', 'ganti-dengan-email-anda@gmail.com')
on conflict (kunci) do nothing;

-- Ganti nilainya agar sama dengan VITE_ADMIN_EMAILS di .env:
-- update public.settings set nilai = 'email-anda@gmail.com' where kunci = 'admin_emails';

-- ---------- Helper: apakah pemanggil admin? ----------
create or replace function public.vd_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
    or coalesce(auth.jwt() ->> 'email', '') in (
      select btrim(lower(x))
      from unnest(
        string_to_array(
          coalesce((select nilai from public.settings where kunci = 'admin_emails'), ''),
          ','
        )
      ) as x
      where btrim(x) <> ''
    );
$$;

grant execute on function public.vd_is_admin() to anon, authenticated;

-- ---------- RLS orders & order_items ----------
drop policy if exists "pesanan bisa dibaca" on public.orders;
drop policy if exists "pesanan bisa diubah" on public.orders;
drop policy if exists "rincian pesanan bisa dibaca" on public.order_items;

create policy "pesanan milik sendiri atau admin"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id or public.vd_is_admin());

create policy "pesanan bisa diubah admin"
  on public.orders for update
  to authenticated
  using (public.vd_is_admin())
  with check (public.vd_is_admin());

create policy "rincian pesanan milik sendiri atau admin"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.vd_is_admin())
    )
  );

-- ---------- RPC: lacak pesanan (kode + nomor HP, PRD P-7) ----------
-- Standar industri: tabel tidak boleh dibaca langsung oleh tamu;
-- akses hanya melalui fungsi terbatas yang menuntut pasangan
-- KODE PESANAN + NOMOR HP sebagai "kunci kedua".
create or replace function public.vd_track_order(p_kode text, p_no_hp text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_order_id bigint;
begin
  select o.id into v_order_id
  from public.orders o
  where upper(btrim(o.kode_pesanan)) = upper(btrim(coalesce(p_kode, '')))
    and regexp_replace(o.no_hp, '\D', '', 'g') = regexp_replace(coalesce(p_no_hp, ''), '\D', '', 'g')
  limit 1;

  if v_order_id is null then
    raise exception 'Pesanan tidak ditemukan. Periksa kembali kode pesanan dan nomor HP Anda.';
  end if;

  return public.vd_order_jsonb(v_order_id);
end;
$$;

-- ---------- RPC: unggah bukti transfer (hanya PEMILIK pesanan / admin) ----------
-- Kolom yang boleh diubah dibatasi (url bukti + status) sehingga pembeli
-- tidak bisa mengubah total/harga dari sisi klien.
create or replace function public.vd_attach_transfer_proof(p_order_id bigint, p_url text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;

  if not found then
    raise exception 'Pesanan tidak ditemukan.';
  end if;
  if not (v_order.user_id = auth.uid() or public.vd_is_admin()) then
    raise exception 'Anda tidak berhak mengubah pesanan ini.';
  end if;
  if v_order.status in ('Selesai', 'Dibatalkan') then
    raise exception 'Pesanan berstatus "%" tidak menerima bukti transfer.', v_order.status;
  end if;
  if coalesce(btrim(p_url), '') = '' then
    raise exception 'Tautan bukti transfer wajib diisi.';
  end if;

  update public.orders
  set url_bukti_transfer = btrim(p_url),
      status = case
                 when v_order.status = 'Menunggu Pembayaran' then 'Menunggu Verifikasi'
                 else v_order.status
               end
  where id = v_order.id;

  return public.vd_order_jsonb(v_order.id);
end;
$$;

grant execute on function public.vd_track_order(text, text)                 to anon, authenticated;
grant execute on function public.vd_attach_transfer_proof(bigint, text)     to anon, authenticated;

