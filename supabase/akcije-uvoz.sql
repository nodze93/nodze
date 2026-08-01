-- =====================================================================
--  AKCIJE — RUČNI UVOZ (JSON) DA RADI I DA OSTANE
-- =====================================================================
--  Tri problema koja ovo rješava:
--
--  1) Kolone `source` NEMA u bazi, a admin importer je upisuje →
--     svaki red iz JSON-a bi bio odbijen ("column source does not exist").
--
--  2) Noćni scraper radi "obriši pa upiši" za (plz, datum) BEZ obzira na
--     izvor → obrisao bi i ručno uvezene ponude. Poslije ove migracije
--     scraper briše samo SVOJE redove (izmjena je i u scraper/src/db.ts).
--
--  3) Sajt prikazuje samo NAJNOVIJI snapshot (max(date)). Ručni uvoz je
--     označen danom uvoza, pa bi nestao čim scraper upiše sljedeći dan.
--     Zato ručni redovi od sada idu po DATUMU VAŽENJA (valid_from/valid_to),
--     ne po snapshotu — Lidl ostaje na sajtu dok ponuda traje.
--
--  ⚠️ Ručni red MORA imati `valid_to`, inače se ne prikazuje. Namjerno:
--     bez roka bi ponuda visjela na sajtu zauvijek.
--
--  Ovaj fajl SADRŽI i filter po datumu iz `akcije-datumi.sql` — ako si
--  taj već pokrenuo, nema veze, ovo ga samo prepiše istim + novim.
--
--  Pokrenuti U SUPABASE → SQL Editor. Bezopasno više puta.
--  ⚠️ Pokrenuti PRIJE nego se novi kod deploya.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0) Kolona koja je falila + današnji dan po Berlinu
-- ---------------------------------------------------------------------
alter table ak_discounts
    add column if not exists source text not null default 'scraper';

-- Stari redovi su svi od scrapera — default ih je već tako označio.
comment on column ak_discounts.source is
    'scraper = noćni scraper (briše i upisuje sam sebe) | manual = ručni JSON uvoz iz admina';

create index if not exists ak_discounts_source_idx on ak_discounts (source, plz, valid_to);

create or replace function ak_danas()
returns date
language sql
stable
as $$ select (now() at time zone 'Europe/Berlin')::date $$;

-- ---------------------------------------------------------------------
-- 1) Pretraga ponuda
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
             where plz = $1 and source <> 'manual'
        )
        select
            d.id::text,
            d.product_name,
            d.old_price,
            d.new_price,
            d.discount_percent,
            d.savings,
            s.name,
            s.slug,
            d.category,
            d.plz,
            d.date::text,
            d.image_url,
            d.image_exact,
            d.valid_from::text,
            d.valid_to::text,
            (d.old_price is null),
            d.rabatt_quelle,
            count(*) over ()
        from ak_discounts d
        join ak_stores s on s.id = d.store_id
        cross join snap
        where d.plz = $1
          and not d.hidden
          -- scraper: samo najsvježiji snapshot | ručni uvoz: dok traje ponuda
          and ( (d.source <> 'manual' and d.date = snap.date)
             or (d.source  = 'manual' and d.valid_to is not null) )
          -- mora važiti DANAS
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
    using p_plz, p_store, p_category, p_percent, p_savings, p_q, p_limit, p_offset;
end;
$fn$;

-- ---------------------------------------------------------------------
-- 2) Prodavnice u PLZ-u (brojevi na čipovima moraju pratiti isti filter)
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
        select max(date) as date from ak_discounts where plz = p_plz and source <> 'manual'
    )
    select
        s.id, s.name, s.slug, s.logo_url,
        count(d.id)::int,
        count(d.discount_percent)::int
    from ak_stores_by_plz sp
    join ak_stores s on s.id = sp.store_id
    cross join snap
    left join ak_discounts d
           on d.store_id = s.id
          and d.plz = sp.plz
          and not d.hidden
          and ( (d.source <> 'manual' and d.date = snap.date)
             or (d.source  = 'manual' and d.valid_to is not null) )
          and (d.valid_from is null or d.valid_from <= ak_danas())
          and (d.valid_to   is null or d.valid_to   >= ak_danas())
    where sp.plz = p_plz
    group by s.id, s.name, s.slug, s.logo_url
    order by count(d.id) desc, s.name asc
$fn$;

-- ---------------------------------------------------------------------
-- 3) Kategorije
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
        select max(date) as date from ak_discounts where plz = p_plz and source <> 'manual'
    )
    select d.category, count(*)::int
    from ak_discounts d
    join ak_stores s on s.id = d.store_id
    cross join snap
    where d.plz = p_plz
      and not d.hidden
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
-- 4) Kratki pregled
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
        select max(date) as date from ak_discounts where plz = p_plz and source <> 'manual'
    )
    select
        p_plz,
        snap.date::text,
        count(d.id)::int,
        count(d.discount_percent)::int,
        (count(d.id) - count(d.discount_percent))::int,
        count(distinct d.store_id)::int,
        max(d.discount_percent),
        max(d.savings)
    from snap
    left join ak_discounts d
           on d.plz = p_plz
          and not d.hidden
          and ( (d.source <> 'manual' and d.date = snap.date)
             or (d.source  = 'manual' and d.valid_to is not null) )
          and (d.valid_from is null or d.valid_from <= ak_danas())
          and (d.valid_to   is null or d.valid_to   >= ak_danas())
    group by snap.date
$fn$;

create index if not exists ak_discounts_valid_idx
    on ak_discounts (plz, date, valid_from, valid_to);

-- Samo server (service_role) smije zvati ove funkcije.
revoke execute on function ak_discounts_search(text, text, text, numeric, numeric, text, text, int, int) from anon, authenticated;
revoke execute on function ak_stores_list(text)            from anon, authenticated;
revoke execute on function ak_categories_list(text, text)  from anon, authenticated;
revoke execute on function ak_meta(text)                   from anon, authenticated;
revoke execute on function ak_danas()                      from anon, authenticated;
