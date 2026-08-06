-- =====================================================================
--  TRAKA PRODAVNICA — i ona sada poštuje `ak_store_sporedni`
-- =====================================================================
--  ŠTA SE MIJENJA I ZAŠTO
--  ----------------------
--  Dosad su lanci van zida (namještaj, baumarkt, veleprodaja…) NESTALI iz
--  lista ponuda, ali su OSTALI kao pločica u traci prodavnica. To je bila
--  namjerna odluka: pločica je bila jedini način da se do njih dođe.
--
--  Korisnik traži da ih nema ni tamo — XXXLutz je s 1203 ponude i dalje
--  stajao prvi u traci i izgledao kao glavni lanac sajta.
--
--  ⚠️ POSLJEDICA KOJU TREBA ZNATI: nakon ovoga se do sklonjenih lanaca
--  VIŠE NE MOŽE doći kroz sučelje. Podaci OSTAJU u bazi i dalje se skupljaju
--  — samo se nigdje ne prikazuju. Vraćanje je i dalje jedan red:
--      delete from ak_store_sporedni where slug = 'toom';
--
--  Sve ostalo u funkciji je 1:1 iz `akcije-najblizi.sql` (regije, najbliži
--  grad, datumi važenja, skriveni redovi). Postgres ne zna „zakrpiti"
--  tijelo funkcije, pa se piše cijela iznova.
--
--  Pokrenuti POSLIJE `akcije-najblizi.sql` i `akcije-zid.sql`.
--  Bezopasno je pokrenuti više puta.
-- =====================================================================

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
    with izvor as (
        select ak_aldi_scope(p_plz) as regija, ak_najblizi_plz(p_plz) as blizu
    ),
    snap as (
        select max(d.date) as date
          from ak_discounts d, izvor i
         where d.source <> 'manual'
           and (d.scope = 'DE' or d.plz = p_plz or d.scope = i.regija)
    )
    select s.id, s.name, s.slug, s.logo_url,
           count(d.id)::int, count(d.discount_percent)::int
    from ak_discounts d
    join ak_stores s on s.id = d.store_id
    cross join snap
    cross join izvor i
    where not d.hidden
      and (d.scope = 'DE' or d.plz = p_plz or d.scope = i.regija or d.plz = i.blizu)
      -- NOVO: lanci van zida se ne prikazuju ni u traci
      and not exists (select 1 from ak_store_sporedni z where z.slug = s.slug)
      and ( (d.source <> 'manual' and d.date = snap.date)
         or (d.source  = 'manual' and d.valid_to is not null) )
      and (d.valid_from is null or d.valid_from <= ak_danas())
      and (d.valid_to   is null or d.valid_to   >= ak_danas())
    group by s.id, s.name, s.slug, s.logo_url
    order by count(d.id) desc, s.name asc
$fn$;

revoke execute on function ak_stores_list(text) from anon, authenticated;

-- Provjera poslije pokretanja — u traci smiju ostati samo namirnice,
-- Trinkgut, ROSSMANN i OBI:
--   select name, offers from ak_stores_list('80331');
