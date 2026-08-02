-- =====================================================================
--  AKCIJE — FAZA 2: ALDI ZA SVE PLZ-ove (regije) + OBI SAMO NA KLIK
-- =====================================================================
--  POKREĆE SE POSLIJE `akcije-regije.sql`. Bezopasno više puta.
--  ⚠️ NIKAD poslije ovoga ne pokretati stari `akcije-rucni-unos.sql`
--     (vratio bi funkcije bez scope-a i sve nacionalne ponude bi nestale).
--
--  1) ALDI REGIJE
--     Aldi Süd i Aldi Nord dijele Njemačku „Aldi-ekvatorom". Scraper od
--     sada povlači SVAKI Aldi JEDNOM i upisuje ga pod PLZ '00000' sa
--     scope = 'aldi-sued' / 'aldi-nord'. Ova migracija dodaje mapu
--     PLZ → regija (po RASPONIMA, ~30 redova umjesto 8.200) i uči
--     pretragu da svakom PLZ-u doda i ponude njegove Aldi regije.
--     Granica je izvedena iz zvaničnog Aldi Süd imenika filijala
--     (filialen.aldi-sued.de) po gradovima; uz samu granicu (pojedina
--     sela) moguća je sitna greška — ispravka je jedan UPDATE ovdje.
--
--  2) OBI SAMO NA KLIK (odluka korisnika, 2.8.2026)
--     OBI-jevi „−77% UVP" artikli su gušili Top ponude i sve liste.
--     OBI se više NE pojavljuje u opštim listama (naslovna, /ponude,
--     kategorije) — pojavi se SAMO kad je izričito izabran
--     (p_store = 'obi': njegova pločica ili filter). Pločica s brojem
--     ostaje u traci (ak_stores_list ga i dalje vraća).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Mapa PLZ → Aldi regija (rasponi; svaki PLZ upada u tačno jedan)
-- ---------------------------------------------------------------------
create table if not exists ak_plz_region (
    od   char(5) not null,
    dou  char(5) not null,
    aldi text    not null check (aldi in ('aldi-sued', 'aldi-nord')),
    primary key (od, dou)
);

comment on table ak_plz_region is
    'Aldi-ekvator po PLZ rasponima. Izvor: filialen.aldi-sued.de (gradovi po pokrajinama), 2.8.2026.';

-- idempotentno: očisti pa upiši
truncate ak_plz_region;
insert into ak_plz_region (od, dou, aldi) values
    ('01000', '34999', 'aldi-nord'),  -- istok, sjever, Hannover, Kassel
    ('35000', '35349', 'aldi-nord'),  -- Marburg, Biedenkopf
    ('35350', '35649', 'aldi-sued'),  -- Gießen, Wetzlar, Lahn-Dill jug
    ('35650', '35779', 'aldi-nord'),  -- Dillenburg, Herborn, Haiger
    ('35780', '35799', 'aldi-sued'),  -- Weilburg
    ('35800', '36369', 'aldi-nord'),  -- Fulda, Bad Hersfeld, Alsfeld
    ('36370', '36399', 'aldi-sued'),  -- Schlüchtern (Main-Kinzig)
    ('36400', '39999', 'aldi-nord'),  -- Thüringen zapad, Göttingen, Magdeburg
    ('40000', '41999', 'aldi-sued'),  -- Düsseldorf, Mönchengladbach, Neuss
    ('42000', '42798', 'aldi-nord'),  -- Wuppertal, Solingen, Velbert, Remscheid
    ('42799', '42799', 'aldi-sued'),  -- Leichlingen
    ('42800', '44999', 'aldi-nord'),  -- Dortmund, Bochum
    ('45000', '45467', 'aldi-nord'),  -- Essen, Gelsenkirchen
    ('45468', '45481', 'aldi-sued'),  -- Mülheim an der Ruhr (sjedište Süd!)
    ('45482', '45999', 'aldi-nord'),  -- Recklinghausen, Herne, Gladbeck
    ('46000', '46269', 'aldi-sued'),  -- Oberhausen, Bottrop
    ('46270', '46389', 'aldi-nord'),  -- Dorsten, Borken
    ('46390', '47999', 'aldi-sued'),  -- Bocholt, Wesel, Dinslaken, Duisburg, Krefeld, Niederrhein
    ('48000', '49999', 'aldi-nord'),  -- Münster, Osnabrück
    ('50000', '56999', 'aldi-sued'),  -- Köln, Bonn, Aachen, RLP (cijeli)
    ('57000', '57299', 'aldi-sued'),  -- Siegen, Siegerland
    ('57300', '57489', 'aldi-nord'),  -- Olpe, Lennestadt, Wittgenstein
    ('57490', '57999', 'aldi-sued'),  -- Betzdorf, Wissen (RLP dio)
    ('58000', '59999', 'aldi-nord'),  -- Hagen, Sauerland, Hamm, Soest
    ('60000', '97999', 'aldi-sued'),  -- Rhein-Main, BW, Bayern, Saarland
    ('98000', '99999', 'aldi-nord');  -- Thüringen

-- ---------------------------------------------------------------------
-- 2) PLZ → scope regije ('aldi-sued' / 'aldi-nord' / null)
-- ---------------------------------------------------------------------
create or replace function ak_aldi_scope(p_plz text)
returns text
language sql
stable
as $$
    select aldi
      from ak_plz_region
     where p_plz >= od and p_plz <= dou
     limit 1
$$;

-- ---------------------------------------------------------------------
-- 3) Pretraga ponuda — regija + OBI samo na klik
--    (ista funkcija kao u akcije-regije.sql, promjene označene NOVO)
-- ---------------------------------------------------------------------
drop function if exists ak_discounts_search(text, text, text, numeric, numeric, text, text, int, int);
create function ak_discounts_search(
    p_plz      text,
    p_store    text    default null,
    p_category text    default null,
    p_percent  numeric default null,
    p_savings  numeric default null,
    p_q        text    default null,
    p_sort     text    default 'percent',
    p_limit    int     default 100,
    p_offset   int     default 0
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
    total_count      bigint
)
language plpgsql
stable
security definer
set search_path = public
as $fn$
declare
    v_order text;
    v_regija text := ak_aldi_scope(p_plz);  -- NOVO: Aldi regija ovog PLZ-a
begin
    v_order := case p_sort
        when 'savings' then 'd.savings desc nulls last, d.discount_percent desc nulls last, d.product_name asc'
        when 'price'   then 'd.new_price asc, d.product_name asc'
        when 'name'    then 'd.product_name asc'
        else                'd.discount_percent desc nulls last, d.savings desc nulls last, d.product_name asc'
    end;

    return query execute format($q$
        with snap as (
            select max(date) as date
              from ak_discounts
             where source <> 'manual'
               and (scope = 'DE' or plz = $1 or scope = $9)
        )
        select
            d.id::text, d.product_name, d.old_price, d.new_price,
            d.discount_percent, d.savings, s.name, s.slug, d.category,
            d.plz, d.date::text, d.image_url, d.image_exact,
            d.valid_from::text, d.valid_to::text,
            (d.old_price is null), d.rabatt_quelle,
            count(*) over ()
        from ak_discounts d
        join ak_stores s on s.id = d.store_id
        cross join snap
        where not d.hidden
          -- nacionalno + tačan PLZ + NOVO: Aldi regija ovog PLZ-a
          and (d.scope = 'DE' or d.plz = $1 or d.scope = $9)
          -- NOVO: OBI samo kad je izričito izabran
          and ($2 is not null or s.slug <> 'obi')
          and ( (d.source <> 'manual' and d.date = snap.date)
             or (d.source  = 'manual' and d.valid_to is not null) )
          and (d.valid_from is null or d.valid_from <= ak_danas())
          and (d.valid_to   is null or d.valid_to   >= ak_danas())
          and ($2 is null or s.slug = lower($2) or lower(s.name) = lower($2))
          and ($3 is null or lower(d.category) = lower($3))
          and ($4 is null or d.discount_percent >= $4)
          and ($5 is null or d.savings >= $5)
          and ($6 is null or d.product_name ilike '%%' || $6 || '%%')
        order by %s
        limit $7 offset $8
    $q$, v_order)
    using p_plz, p_store, p_category, p_percent, p_savings, p_q, p_limit, p_offset, v_regija;
end;
$fn$;

-- ---------------------------------------------------------------------
-- 4) Prodavnice — regija (OBI NAMJERNO OSTAJE: pločica s brojem u traci)
-- ---------------------------------------------------------------------
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
        select max(date) as date
          from ak_discounts
         where source <> 'manual'
           and (scope = 'DE' or plz = p_plz or scope = ak_aldi_scope(p_plz))
    )
    select s.id, s.name, s.slug, s.logo_url,
           count(d.id)::int, count(d.discount_percent)::int
    from ak_discounts d
    join ak_stores s on s.id = d.store_id
    cross join snap
    where not d.hidden
      and (d.scope = 'DE' or d.plz = p_plz or d.scope = ak_aldi_scope(p_plz))
      and ( (d.source <> 'manual' and d.date = snap.date)
         or (d.source  = 'manual' and d.valid_to is not null) )
      and (d.valid_from is null or d.valid_from <= ak_danas())
      and (d.valid_to   is null or d.valid_to   >= ak_danas())
    group by s.id, s.name, s.slug, s.logo_url
    order by count(d.id) desc, s.name asc
$fn$;

-- ---------------------------------------------------------------------
-- 5) Kategorije — regija + OBI samo na klik
-- ---------------------------------------------------------------------
drop function if exists ak_categories_list(text, text);
create function ak_categories_list(p_plz text, p_store text default null)
returns table (
    category text,
    offers   int
)
language sql
stable
security definer
set search_path = public
as $fn$
    with snap as (
        select max(date) as date
          from ak_discounts
         where source <> 'manual'
           and (scope = 'DE' or plz = p_plz or scope = ak_aldi_scope(p_plz))
    )
    select d.category, count(*)::int
    from ak_discounts d
    join ak_stores s on s.id = d.store_id
    cross join snap
    where not d.hidden
      and (d.scope = 'DE' or d.plz = p_plz or d.scope = ak_aldi_scope(p_plz))
      and (p_store is not null or s.slug <> 'obi')  -- NOVO: OBI samo na klik
      and ( (d.source <> 'manual' and d.date = snap.date)
         or (d.source  = 'manual' and d.valid_to is not null) )
      and (d.valid_from is null or d.valid_from <= ak_danas())
      and (d.valid_to   is null or d.valid_to   >= ak_danas())
      and d.category is not null
      and (p_store is null or s.slug = lower(p_store) or lower(s.name) = lower(p_store))
    group by d.category
    order by count(*) desc, d.category asc
$fn$;

-- ---------------------------------------------------------------------
-- 6) Kratki pregled — regija (namjerno BEZ izbacivanja OBI-ja:
--    admin treba prave ukupne brojeve)
-- ---------------------------------------------------------------------
drop function if exists ak_meta(text);
create function ak_meta(p_plz text)
returns table (
    plz          text,
    date         text,
    total        int,
    with_percent int,
    angebot_only int,
    stores       int,
    max_percent  numeric,
    max_savings  numeric
)
language sql
stable
security definer
set search_path = public
as $fn$
    with snap as (
        select max(date) as date
          from ak_discounts
         where source <> 'manual'
           and (scope = 'DE' or plz = p_plz or scope = ak_aldi_scope(p_plz))
    )
    select p_plz,
           snap.date::text,
           count(d.id)::int,
           count(d.discount_percent)::int,
           (count(d.id) - count(d.discount_percent))::int,
           count(distinct d.store_id)::int,
           max(d.discount_percent),
           max(d.savings)
    from snap
    left join ak_discounts d
           on not d.hidden
          and (d.scope = 'DE' or d.plz = p_plz or d.scope = ak_aldi_scope(p_plz))
          and ( (d.source <> 'manual' and d.date = snap.date)
             or (d.source  = 'manual' and d.valid_to is not null) )
          and (d.valid_from is null or d.valid_from <= ak_danas())
          and (d.valid_to   is null or d.valid_to   >= ak_danas())
    group by snap.date
$fn$;

-- ---------------------------------------------------------------------
-- Prava: samo server (service_role)
-- ---------------------------------------------------------------------
revoke execute on function ak_discounts_search(text, text, text, numeric, numeric, text, text, int, int) from anon, authenticated;
revoke execute on function ak_stores_list(text)            from anon, authenticated;
revoke execute on function ak_categories_list(text, text)  from anon, authenticated;
revoke execute on function ak_meta(text)                   from anon, authenticated;
revoke execute on function ak_aldi_scope(text)             from anon, authenticated;
revoke all on table ak_plz_region from anon, authenticated;
