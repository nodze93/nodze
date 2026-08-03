-- =====================================================================
--  AKCIJE — Fressnapf se ponaša ISTO KAO OBI: samo kad se izričito klikne
-- =====================================================================
--  Zašto: /akcije je stranica za NAMIRNICE. Fressnapf (kućni ljubimci)
--  i OBI (baumarkt) su specijalizovani lanci — na "Sve akcije" i u
--  "Preporuci ove sedmice" gutaju listu (141 artikal sa -50%), pa
--  paradajz i kafa ispadnu ispod hrane za mačke.
--
--  OBI je to već imao (supabase/akcije-regije-2.sql). Ovdje se MIJENJA
--  SAMO taj jedan uslov — `<> 'obi'` postaje `not in ('obi','fressnapf')`
--  u dvije funkcije. Sve ostalo je 1:1 prepisano iz akcije-regije-2.sql,
--  jer Postgres ne zna "zakrpiti" tijelo funkcije — mora cijela iznova.
--
--  Gdje se lanci I DALJE VIDE (namjerno, ne dirati):
--    • ak_stores_list  — pločica s brojem u traci prodavnica
--    • ak_meta         — kratki pregled / brojači
--  Klik na pločicu prosljeđuje p_store, pa se sve njihove ponude otvore.
--
--  Pokrenuti JEDNOM u Supabase → SQL Editor. Bezopasno je pokrenuti
--  više puta (drop + create).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 3) Pretraga ponuda — regija + OBI i FRESSNAPF samo na klik
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
          -- OBI + FRESSNAPF samo kad su izričito izabrani
          and ($2 is not null or s.slug not in ('obi','fressnapf'))
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
-- 5) Kategorije — regija + OBI i FRESSNAPF samo na klik
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
      and (p_store is not null or s.slug not in ('obi','fressnapf'))  -- OBI + FRESSNAPF samo na klik
      and ( (d.source <> 'manual' and d.date = snap.date)
         or (d.source  = 'manual' and d.valid_to is not null) )
      and (d.valid_from is null or d.valid_from <= ak_danas())
      and (d.valid_to   is null or d.valid_to   >= ak_danas())
      and d.category is not null
      and (p_store is null or s.slug = lower(p_store) or lower(s.name) = lower(p_store))
    group by d.category
    order by count(*) desc, d.category asc
$fn$;
