-- =====================================================================
--  VRATI ROSSMANN I NETTO NA NASLOVNU  (9.8.2026., izričit zahtjev)
--  Supabase → SQL Editor → Run. Bezbjedno pokrenuti i više puta.
--
--  ROSSMANN: bio je sklonjen kao "drogerija" (28 parfema mu je bila
--  najjača kategorija). Sad se vraća — deterdženti, higijena i bebi
--  program su potrebniji od toga što uz njih ide i parfem.
--
--  NETTO: nikad nije ni bio na spisku za sklanjanje. Ako ga nema,
--  problem je u podacima (uvoz), ne u filteru — zato dio 3) i 4).
--
--  ⚠️ Uz ovaj SQL ide i izmjena u kodu (app/api/admin/akcije/route.ts,
--  lista UVIJEK_NA_NASLOVNOJ). Bez nje bi sljedeći uvoz Rossmann opet
--  sklonio, jer se branša "Drogerie & Gesundheit" prepoznaje automatski.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) VRATI IH NA NASLOVNU
-- ---------------------------------------------------------------------
delete from ak_store_sporedni
 where slug in ('rossmann', 'netto', 'netto-marken-discount');

-- ---------------------------------------------------------------------
-- 2) PROVJERA — ko je ostao sklonjen (Rossmanna i Netta NE smije biti)
-- ---------------------------------------------------------------------
select slug, razlog from ak_store_sporedni order by slug;

-- ---------------------------------------------------------------------
-- 3) DIJAGNOZA NETTA — postoji li uopšte kao prodavnica
--    Ako ovo ne vrati NIJEDAN red: Netto nikad nije uvezen.
--    Ako vrati red ali `zadnji_uvoz` nije današnji: zadnji uvoz ga je
--    preskočio (scraper ili ručni uvoz), pa ga ni naslovna ne vidi.
-- ---------------------------------------------------------------------
select s.slug,
       s.name,
       count(d.id)                          as ponuda_ukupno,
       max(d.date)                          as zadnji_uvoz,
       (select max(date) from ak_discounts) as zadnji_uvoz_uopste
  from ak_stores s
  left join ak_discounts d on d.store_id = s.id
 where s.slug ilike '%netto%' or s.name ilike '%netto%'
 group by s.slug, s.name;

-- ---------------------------------------------------------------------
-- 4) ŠTA JE STVARNO U ZADNJEM UVOZU — top 25 lanaca
--    Ovdje se vidi da li Netto fali samo on, ili fali još pola spiska
--    (što bi značilo da zadnji uvoz uopšte nije prošao kako treba).
-- ---------------------------------------------------------------------
select s.slug,
       count(*) as ponuda_danas,
       case when s.slug in (select slug from ak_store_sporedni)
            then 'sklonjen s naslovne' else 'na naslovnoj' end as status
  from ak_discounts d
  join ak_stores s on s.id = d.store_id
 where d.date = (select max(date) from ak_discounts)
 group by s.slug
 order by ponuda_danas desc
 limit 25;
