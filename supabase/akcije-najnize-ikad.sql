-- =====================================================================
--  „NAJNIŽE DO SADA" — artikli na najnižoj cijeni koju smo ikad vidjeli
-- =====================================================================
--  PROBLEM KOJI RJEŠAVA
--  --------------------
--  Traka „U pola cijene i više" radi samo za lance koji OBJAVE staru
--  cijenu. REWE, PENNY, Netto, REWE Center i Trinkgut je ne objavljuju
--  (marktguru je nema), pa im procenat ne postoji i nikad se ne pojave —
--  oko 1.360 ponuda nevidljivo, iako među njima ima odličnih cijena.
--
--  Njihov popust NE MOŽEMO pošteno izračunati: ne znamo im redovnu
--  cijenu s police. Ali znamo nešto što jeste istina i što vrijedi
--  jednako za SVE lance:
--
--      „ovo je najniža cijena koju smo za taj artikal ikad vidjeli
--       kod baš tog lanca"
--
--  Za to ne treba njihova stara cijena — samo naša historija snapshota.
--
--  ⚠️ ŽELJEZNO PRAVILO: cijene se NE MIJEŠAJU između lanaca. Poređenje
--  ide po (prodavnica + naziv artikla). REWE-ova cijena nije Lidlova.
--
--  ⚠️ NE TVRDIMO DA JE TO POPUST. Nigdje se ne piše procenat ni „staro →
--  novo". Piše se samo da je najniže što smo vidjeli, i kroz koliko dana
--  gledamo — da korisnik zna koliko je tvrdnja jaka.
--
--  ZAŠTITA OD LAŽNOG REKORDA: artikal mora biti viđen bar `p_min_dana`
--  različitih dana prije današnjeg. Bez toga bi SVAKI novi artikal bio
--  „najniži ikad" — jer je viđen samo jednom.
--
--  Pokrenuti u Supabase → SQL Editor. Bezopasno je pokrenuti više puta.
--  Zahtijeva `akcije-najblizi.sql` (zbog ak_discounts_search i ak_danas).
-- =====================================================================

drop function if exists ak_najnize_ikad(text, int, int, int);

create function ak_najnize_ikad(
    p_plz      text,
    p_dana     int default 31,  -- koliko dana historije gledamo
    p_min_dana int default 3,   -- koliko dana artikal mora biti viđen ranije
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
    -- koliko RAZLIČITIH dana smo taj artikal vidjeli prije danas
    dana_pracenja    int,
    -- najniža ranija cijena (da se može reći "ranije najmanje X")
    ranije_najnize   numeric
)
language sql
stable
security definer
set search_path = public
as $fn$
    with danas as (
        -- Kroz postojeću pretragu: ona već zna regije, najbliži grad,
        -- datume važenja, skrivene redove i lance koji su van zida.
        select *
          from ak_discounts_search(p_plz, null, null, null, null, null, 'percent', 500, 0)
    ),
    hist as (
        -- Historija ISKLJUČIVO iz ranijih dana (danas se ne broji, inače bi
        -- svaki artikal bio "jednak najnižem" — sam sebi).
        select s.slug                      as slug,
               lower(trim(d.product_name)) as naziv,
               min(d.new_price)            as min_cijena,
               count(distinct d.date)      as dana
          from ak_discounts d
          join ak_stores s on s.id = d.store_id
         where d.date >= ak_danas() - p_dana
           and d.date <  ak_danas()
           and d.new_price is not null
         group by 1, 2
    )
    select danas.id, danas.product_name, danas.old_price, danas.new_price,
           danas.discount_percent, danas.savings, danas.store, danas.store_slug,
           danas.category, danas.plz, danas.date, danas.image_url,
           danas.image_exact, danas.valid_from, danas.valid_to,
           danas.is_angebot, danas.rabatt_quelle,
           hist.dana::int, hist.min_cijena
      from danas
      join hist
        on hist.slug  = danas.store_slug
       and hist.naziv = lower(trim(danas.product_name))
     where hist.dana >= p_min_dana
       -- danas je najniže ikad (ili izjednačeno s najnižim)
       and danas.new_price <= hist.min_cijena
     -- najveći pad u odnosu na raniji minimum ide gore; pa duža historija
     order by (hist.min_cijena - danas.new_price) desc, hist.dana desc
     limit p_limit
$fn$;

-- Proba:
--   select store, product_name, new_price, ranije_najnize, dana_pracenja
--     from ak_najnize_ikad('80331');
