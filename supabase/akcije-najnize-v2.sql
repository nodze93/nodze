-- =====================================================================
--  „NAJNIŽE DO SADA" v2 — TRAJNO PAMĆENJE CIJENA
-- =====================================================================
--  ŠTA JE BIO PROBLEM
--  ------------------
--  v1 je historiju čitala iz `ak_discounts`. A `ak_discounts` se svaku noć
--  reže: scraper zove `ak_prune_old_snapshots(31)`, što je bukvalno
--  `delete from ak_discounts where date < current_date - 31`.
--
--  Znači: kafa koju smo u maju vidjeli za 3,49 € u junu više ne postoji
--  nigdje. „Najniže do sada" je u praksi značilo „najniže u zadnjih
--  mjesec dana" — a naslov obećava više od toga.
--
--  RJEŠENJE
--  --------
--  U bazi već stoji tabela `ak_price_observations` napravljena baš za ovo
--  (akcije.sql:101): samo prodavnica, product_key, EAN, cijena, datum.
--  Jedan red po artiklu po danu, bez naziva, slike i kategorije — pa je
--  višestruko manja od snapshota. Nikad je ne brišemo.
--
--  Ovaj fajl:
--    1) puni tu tabelu svaki dan (funkcija `ak_zapisi_posmatranja`),
--    2) prepiše zaostalih 31 dan iz `ak_discounts` da pamćenje ne krene
--       od nule,
--    3) prepravi `ak_najnize_ikad` da historiju čita ODATLE, a artikle
--       spaja po `product_key` umjesto po malim slovima naziva — pa su
--       „Jacobs Krönung 500g" i „Jacobs Krönung, 500 g" konačno isti
--       artikal.
--
--  ⚠️ NE ZOVI `ak_prune_price_history` — ona briše baš ovo pamćenje.
--     Trenutno je ne zove niko i tako treba da ostane.
--
--  ⚠️ ŽELJEZNO PRAVILO OSTAJE: cijene se ne miješaju između lanaca.
--     Poređenje ide po (store_id + product_key).
--
--  Supabase → SQL Editor → Run. Bezopasno je pokrenuti više puta.
--  Zahtijeva: akcije.sql, akcije-datumi.sql (zbog `ak_danas()`),
--             akcije-najblizi.sql (zbog `ak_discounts_search`).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) INDEKS ZA ČITANJE HISTORIJE
-- ---------------------------------------------------------------------
create index if not exists ak_price_obs_lookup_idx
    on ak_price_observations (store_id, product_key, date desc);

-- ---------------------------------------------------------------------
-- 2) UPIS DNEVNIH POSMATRANJA
--    Uzima snapshot za jedan dan i od njega pravi trajni zapis:
--    najniža cijena po (prodavnica, artikal) tog dana.
--
--    Zašto min(), a ne cijena po PLZ-u: isti lanac ima istu cijenu u
--    cijeloj svojoj regiji, a mi isti artikal imamo upisan pod više PLZ-a.
--    Uzimamo najnižu — jer nas i zanima najniža.
--
--    on conflict → least(): ako se isti dan uveze još jedan set (npr.
--    ručni uvoz poslije scrapera), pamti se niža od dvije, nikad viša.
-- ---------------------------------------------------------------------
create or replace function ak_zapisi_posmatranja(p_date date default null)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
    v_date date := coalesce(p_date, ak_danas());
    n      bigint;
begin
    insert into ak_price_observations (store_id, product_key, ean, price, date)
    select d.store_id,
           d.product_key,
           min(d.ean),
           min(d.new_price),
           v_date
      from ak_discounts d
     where d.date       = v_date
       and d.store_id   is not null
       and d.product_key is not null
       and d.product_key <> ''
       and d.new_price  is not null
     group by d.store_id, d.product_key
    on conflict (store_id, product_key, date) do update
       set price = least(ak_price_observations.price, excluded.price),
           ean   = coalesce(ak_price_observations.ean, excluded.ean);
    get diagnostics n = row_count;
    return n;
end;
$$;

revoke execute on function ak_zapisi_posmatranja(date) from anon, authenticated;

-- ---------------------------------------------------------------------
-- 3) PREPIS ZAOSTALOG — da pamćenje ne krene od nule
--    Sve što danas imamo u `ak_discounts` (zadnjih 31 dan) prebacujemo u
--    trajnu tabelu. Starije od toga je već obrisano i ne može se vratiti.
--    Prvog dana dakle imaš 31 dan pamćenja, a odatle raste dan po dan.
-- ---------------------------------------------------------------------
do $$
declare
    d   date;
    uk  bigint := 0;
begin
    for d in select distinct date from ak_discounts order by date loop
        uk := uk + ak_zapisi_posmatranja(d);
    end loop;
    raise notice 'Prepisano % posmatranja iz snapshota.', uk;
end;
$$;

-- ---------------------------------------------------------------------
-- 4) NOVA `ak_najnize_ikad`
--    p_dana = 3650 (10 godina) → praktično „otkad pamtimo".
--    Prozor je i dalje parametar, da se može suziti bez diranja koda.
--
--    Nova kolona `prvi_put`: datum od kojeg taj artikal pratimo. Sajt time
--    može reći „pratimo od 12.07.2026." umjesto da izmišlja jačinu tvrdnje.
-- ---------------------------------------------------------------------
drop function if exists ak_najnize_ikad(text, int, int, int);

create function ak_najnize_ikad(
    p_plz      text,
    p_dana     int default 3650,  -- koliko dana unazad gledamo (10 god. = sve)
    p_min_dana int default 3,     -- koliko dana artikal mora biti viđen ranije
    p_limit    int default 24
)
returns table (
    id               text,
    product_name     text,
    old_price        numeric,
    new_price        numeric,
    discount_percent numeric,
    savings          numeric,
    store            text,
    store_slug       text,
    category         text,
    plz              text,
    date             text,
    image_url        text,
    image_exact      boolean,
    valid_from       text,
    valid_to         text,
    is_angebot       boolean,
    rabatt_quelle    text,
    dana_pracenja    int,      -- koliko RAZLIČITIH dana smo ga vidjeli ranije
    ranije_najnize   numeric,  -- najniža ranija cijena koju smo zabilježili
    prvi_put         text      -- datum prvog zapisa (otkad pratimo)
)
language sql
stable
security definer
set search_path = public
as $fn$
    with danas as (
        -- Postojeća pretraga već zna za regije, najbliži grad, rokove
        -- važenja, skrivene redove i lance van zida — ne diramo je.
        select *
          from ak_discounts_search(p_plz, null, null, null, null, null, 'percent', 500, 0)
    ),
    kljucevi as (
        -- Pretraga ne vraća product_key, pa ga dovlačimo iz reda po ID-u.
        select danas.*, d.product_key, d.store_id
          from danas
          join ak_discounts d on d.id = danas.id::bigint
         where d.product_key is not null and d.product_key <> ''
    ),
    hist as (
        -- TRAJNO pamćenje. Današnji dan se NE broji — inače bi svaki
        -- artikal bio „jednak najnižem", sam sebi.
        select o.store_id,
               o.product_key,
               min(o.price)           as min_cijena,
               count(distinct o.date) as dana,
               min(o.date)            as prvi
          from ak_price_observations o
         where o.date >= ak_danas() - p_dana
           and o.date <  ak_danas()
         group by o.store_id, o.product_key
    )
    select k.id, k.product_name, k.old_price, k.new_price,
           k.discount_percent, k.savings, k.store, k.store_slug,
           k.category, k.plz, k.date, k.image_url,
           k.image_exact, k.valid_from, k.valid_to,
           k.is_angebot, k.rabatt_quelle,
           h.dana::int,
           h.min_cijena,
           to_char(h.prvi, 'YYYY-MM-DD')
      from kljucevi k
      join hist h
        on h.store_id    = k.store_id
       and h.product_key = k.product_key
     where h.dana >= p_min_dana
       -- danas je najniže ikad (ili izjednačeno s najnižim)
       and k.new_price <= h.min_cijena
     -- najveći pad u odnosu na raniji minimum ide gore; pa duža historija
     order by (h.min_cijena - k.new_price) desc, h.dana desc
     limit p_limit
$fn$;

revoke execute on function ak_najnize_ikad(text, int, int, int) from anon, authenticated;

-- ---------------------------------------------------------------------
-- 5) PROVJERA — pokreni odmah poslije, da vidiš da radi
-- ---------------------------------------------------------------------
-- Koliko dana pamćenja sada imamo i koliko redova:
select count(distinct date) as dana_pamcenja,
       min(date)            as pratimo_od,
       max(date)            as zadnji_zapis,
       count(*)             as redova,
       pg_size_pretty(pg_total_relation_size('ak_price_observations')) as velicina
  from ak_price_observations;

-- Koliko artikala ispunjava uslov, i koliko ih je STVARNO palo:
select count(*)                                            as ukupno_kandidata,
       count(*) filter (where new_price <  ranije_najnize)  as stvarni_pad,
       count(*) filter (where new_price = ranije_najnize)   as ista_cijena
  from ak_najnize_ikad('80331');

-- Prvih 10:
select store, product_name, ranije_najnize, new_price, dana_pracenja, prvi_put
  from ak_najnize_ikad('80331')
 limit 10;
