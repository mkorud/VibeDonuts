-- ============================================================
-- VibeDonuts — Penetapan peran admin (hari ke-3)
--
-- Masalah yang diatasi: identitas admin sebelumnya terpecah dua tempat
-- (.env untuk frontend vs settings.admin_emails/app_metadata untuk database),
-- sehingga admin bisa membuka dashboard tapi RLS menyaring datanya menjadi
-- kosong (pesanan tidak muncul).
--
-- Setelah file ini, SATU perintah menetapkan admin di database:
--   select public.vd_grant_admin('email-anda@gmail.com');
-- (fungsi ini otomatis menyetel app_metadata.role + menyinkronkan daftar email)
--
-- PERINGATAN: eksekusi vd_grant_admin / vd_revoke_admin dicabut dari
-- anon & authenticated — hanya pemilik proyek via SQL Editor.
-- Jalankan SETELAH 01-07.
-- ============================================================

-- ---------- 1) Fungsi penetapan admin ----------
create or replace function public.vd_grant_admin(p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_clean_email text := lower(btrim(coalesce(p_email, '')));
begin
  if v_clean_email = '' or v_clean_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Email admin tidak valid. Contoh: nama@gmail.com';
  end if;

  -- Tandai peran di app_metadata (klaim JWT — tidak bisa diubah oleh pengguna)
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
  where lower(email) = v_clean_email;

  if not found then
    raise exception 'Akun "%" belum terdaftar. Daftar dulu lewat menu Login -> Daftar Akun Baru, lalu jalankan perintah ini lagi.', v_clean_email;
  end if;

  -- Sinkronkan daftar email admin (fallback RLS) agar dua lapis konsisten
  insert into public.settings (kunci, nilai)
  values ('admin_emails', v_clean_email)
  on conflict (kunci) do update set nilai = v_clean_email;
end;
$$;

-- ---------- 2) Fungsi pencabutan peran ----------
create or replace function public.vd_revoke_admin(p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_clean_email text := lower(btrim(coalesce(p_email, '')));
begin
  if v_clean_email = '' then
    raise exception 'Email admin wajib diisi.';
  end if;

  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) - 'role'
  where lower(email) = v_clean_email;

  update public.settings
  set nilai = (
    select string_agg(btrim(lower(x)), ',')
    from unnest(string_to_array(coalesce(nilai, ''), ',')) as x
    where btrim(lower(x)) <> v_clean_email
  )
  where kunci = 'admin_emails';
end;
$$;

-- Eksekusi kedua fungsi di atas HANYA untuk pemilik proyek (SQL Editor):
revoke execute on function public.vd_grant_admin(text)  from public, anon, authenticated;
revoke execute on function public.vd_revoke_admin(text) from public, anon, authenticated;

-- ---------- 3) Perketat penulisan settings: hanya admin ----------
-- Sebelumnya setiap pengguna yang login bisa mengubah ongkir/rekening/WhatsApp
-- (berdampak uang). Sekarang hanya admin yang diizinkan.
drop policy if exists "pengaturan bisa ditambah" on public.settings;
create policy "pengaturan bisa ditambah"
  on public.settings for insert
  to authenticated
  with check (public.vd_is_admin());

drop policy if exists "pengaturan bisa diubah" on public.settings;
create policy "pengaturan bisa diubah"
  on public.settings for update
  to authenticated
  using (public.vd_is_admin())
  with check (public.vd_is_admin());

-- ============================================================
-- CARA PAKAI (setelah akun admin didaftar lewat menu Login -> Daftar):
--   select public.vd_grant_admin('email-anda@gmail.com');
-- lalu keluar & masuk kembali di aplikasi (agar JWT diperbarui).
-- ============================================================

-- ---------- 4) Hardening tambahan (QA) ----------
-- Reset demo bersifat destruktif: cabang akses dari pengguna TANPA login.
-- (Pembatasan penuh ke admin ditangani oleh pengecekan di dalam fungsi
--  05_reset_demo.sql — jalankan ulang 05 untuk menerapkannya.)
revoke execute on function public.vd_reset_demo_data() from anon;
