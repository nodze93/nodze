-- =====================================================================
--  TRAKA PRODAVNICA — samo namirnice + ROSSMANN + OBI
-- =====================================================================
--  SAM SE POSLAŽE. Ne traži da je išta ranije pokrenuto:
--    • napravi `ak_store_sporedni` ako je nema i popuni je
--    • izbaci OBI i ROSSMANN iz nje (oni OSTAJU na traci)
--    • prepiše `ak_stores_list` tako da traku filtrira
--
--  ⚠️ ZAŠTO PRETHODNA VERZIJA NIJE RADILA: pozivala je `ak_najblizi_plz`,
--  koje u ovoj bazi nema. `drop function` je prošao, `create` pao — pa je
--  funkcija NESTALA i traka je ostala prazna. Zato ovdje NEMA nijednog
--  poziva koji nije siguran: koristi se samo `ak_aldi_scope` i `ak_danas`,
--  a oni postoje otkad radi regionalna podjela Aldija.
--
--  ⚠️ NIŠTA SE NE BRIŠE. Ponude sklonjenih lanaca ostaju u bazi i bot ih
--  i dalje skuplja — samo se ne prikazuju. Vraćanje je jedan red, na dnu.
--
--  Pokrenuti u Supabase → SQL Editor. Bezopasno je pokrenuti više puta.
-- =====================================================================

-- 1) Popis lanaca koji NISU za namirnice ------------------------------
create table if not exists ak_store_sporedni (
    slug   text primary key,
    razlog text
);

insert into ak_store_sporedni (slug, razlog) values
    -- namještaj: najveći zagađivač naslovne (XXXLutz sam ima 1203 ponude)
    ('xxxlutz','namještaj'), ('segmueller','namještaj'),
    ('moemax','namještaj'),  ('moebel-inhofer','namještaj'),
    ('opti-wohnwelt','namještaj'), ('porta','namještaj'),
    ('schaffrath','namještaj'), ('trends-by-ostermann','namještaj'),
    ('ostermann','namještaj'), ('sb-moebel-boss','namještaj'),
    ('kabs-polsterwelt','namještaj'),
    -- alat i gradnja (OBI je IZUZET — korisnik ga hoće na traci)
    ('toom','alat, baumarkt'), ('hagebaumarkt','alat, baumarkt'),
    ('b1-discount-baumarkt','alat, baumarkt'),
    -- ljubimci
    ('fressnapf','ljubimci'), ('das-futterhaus','ljubimci'),
    -- robne kuće, uglavnom neprehrana
    ('thomas-philipps','razno'), ('woolworth','razno'),
    -- veleprodaja: cijene su BEZ PDV-a, pa varaju kupca
    ('handelshof','veleprodaja (cijene bez PDV-a)'),
    ('edeka-foodservice','veleprodaja (cijene bez PDV-a)'),
    -- ostalo
    ('bosch-car-service','auto servis'), ('ran-tankstelle','benzinska'),
    ('budni','drogerija')
on conflict (slug) do nothing;

-- 2) OBI i ROSSMANN OSTAJU na traci ------------------------------------
delete from ak_store_sporedni where slug in ('obi', 'rossmann');

-- 3) Traka prodavnica poštuje taj popis ---------------------------------
drop function if exists ak_stores_list(text);

create function ak_stores_list(p_plz text)
returns table (
    id       int,
    name     text,
    slug     text,
    logo_url text,
    offers   int,
    offers_with_percent int
)
language sql
stable
security definer
set search_path = public
as $fn$
    with snap as (
        select max(d.date) as date
          from ak_discounts d
         where d.source <> 'manual'
           and (d.scope = 'DE' or d.plz = p_plz or d.scope = ak_aldi_scope(p_plz))
    )
    select s.id, s.name, s.slug, s.logo_url,
           count(d.id)::int, count(d.discount_percent)::int
    from ak_discounts d
    join ak_stores s on s.id = d.store_id
    cross join snap
    where not d.hidden
      and (d.scope = 'DE' or d.plz = p_plz or d.scope = ak_aldi_scope(p_plz))
      -- lanci koji nisu namirnice se ne prikazuju na traci
      and not exists (select 1 from ak_store_sporedni z where z.slug = s.slug)
      and ( (d.source <> 'manual' and d.date = snap.date)
         or (d.source  = 'manual' and d.valid_to is not null) )
      and (d.valid_from is null or d.valid_from <= ak_danas())
      and (d.valid_to   is null or d.valid_to   >= ak_danas())
    group by s.id, s.name, s.slug, s.logo_url
    order by count(d.id) desc, s.name asc
$fn$;

revoke execute on function ak_stores_list(text) from anon, authenticated;

-- 4) Provjera — mora vratiti listu, NE prazno --------------------------
select name, offers from ak_stores_list('80331');

-- Vraćanje nekog lanca na traku:
--   delete from ak_store_sporedni where slug = 'toom';
-- Sklanjanje novog:
--   insert into ak_store_sporedni (slug, razlog) values ('woolworth','razno')
--   on conflict (slug) do nothing;
