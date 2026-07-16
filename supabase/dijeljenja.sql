-- ============================================================
-- BROJ DIJELJENJA — pokreni JEDNOM u Supabase SQL editoru
-- ============================================================
-- (Supabase → SQL Editor → New query → nalijepi ovo → Run)

-- 1) Kolona koja pamti koliko je puta članak podijeljen.
alter table clanci
  add column if not exists broj_dijeljenja integer not null default 0;

-- 2) Atomično +1 — sajt ovo zove svaki put kad neko podijeli članak.
--    security definer = smije upisati i kad ga zove anonimni posjetilac.
create or replace function increment_dijeljenja(p_slug text)
returns void
language sql
security definer
as $$
  update clanci
     set broj_dijeljenja = coalesce(broj_dijeljenja, 0) + 1
   where slug = p_slug;
$$;
