-- =====================================================================
--  AKCIJE (Angebote) — šema za kodnas.de
--  Zalijepi cijeli ovaj fajl u Supabase → SQL Editor → Run.
--  Sve tabele imaju prefiks "ak_" da se ne sudaraju sa postojećim.
--
--  Struktura:  ak_stores → ak_stores_by_plz → ak_discounts
--              + ak_price_observations (istorija cijena)
--              + 5 RPC funkcija koje čita /api/akcije/*
-- =====================================================================

create extension if not exists pg_trgm;   -- brza pretraga po nazivu artikla

-- ---------------------------------------------------------------------
-- 1) PRODAVNICE
-- ---------------------------------------------------------------------
create table if not exists ak_stores (
    id       serial primary key,
    name     text not null,          -- "Lidl", "REWE", "Aldi Süd"
    slug     text not null unique,   -- "lidl", "rewe", "aldi-sued"
    logo_url text
);

create unique index if not exists ak_stores_name_lower_uq on ak_stores (lower(name));

-- ---------------------------------------------------------------------
-- 2) KOJE PRODAVNICE POSTOJE U KOJEM PLZ-u
-- ---------------------------------------------------------------------
create table if not exists ak_stores_by_plz (
    id       serial primary key,
    store_id integer not null references ak_stores(id) on delete cascade,
    plz      text not null check (plz ~ '^[0-9]{5}$'),
    unique (store_id, plz)
);

create index if not exists ak_stores_by_plz_plz_idx on ak_stores_by_plz (plz);

-- ---------------------------------------------------------------------
-- 3) POPUSTI
--
--  discount_percent i savings su GENERATED kolone — baza ih računa sama.
--  Posljedica (i to je namjerno):
--    * nema stare cijene  ->  oba polja su NULL
--    * NULL nikada ne prolazi kroz  ">= X"  uslov
--    * dakle artikal bez stare cijene ("Angebot") automatski ISPADA
--      iz filtera po procentu i po uštedi, bez ijedne linije if-a u kodu
-- ---------------------------------------------------------------------
create table if not exists ak_discounts (
    id           bigserial primary key,

    product_name text          not null,
    old_price    numeric(10,2)          check (old_price is null or old_price > 0),
    new_price    numeric(10,2) not null check (new_price >= 0),

    discount_percent numeric(5,2) generated always as (
        case
            when old_price is not null and old_price > new_price
            then round(((old_price - new_price) / old_price) * 100, 2)
        end
    ) stored,

    savings numeric(10,2) generated always as (
        case
            when old_price is not null and old_price > new_price
            then round(old_price - new_price, 2)
        end
    ) stored,

    store_id integer not null references ak_stores(id) on delete cascade,
    category text,
    plz      text not null check (plz ~ '^[0-9]{5}$'),
    date     date not null default current_date,   -- dan skrejpanja (snapshot)

    image_url   text,
    -- false = fotografija je od drugog pakovanja istog artikla ("Abbildung ähnlich")
    image_exact boolean not null default true,
    ean         text,
    -- 'prospekt' (staru cijenu dao letak) ili 'berechnet' (naš izračun iz istorije)
    rabatt_quelle text check (rabatt_quelle in ('prospekt', 'berechnet')),
    image_source  text check (image_source in ('source', 'off', 'icecat', 'stock', 'manual')),
    image_attribution text,
    valid_from  date,
    valid_to    date,
    source_url  text,
    external_id text,

    created_at timestamptz not null default now()
);

create index if not exists ak_discounts_plz_date_idx       on ak_discounts (plz, date desc);
create index if not exists ak_discounts_plz_date_store_idx on ak_discounts (plz, date, store_id);
create index if not exists ak_discounts_plz_date_cat_idx   on ak_discounts (plz, date, lower(category));
create index if not exists ak_discounts_percent_idx        on ak_discounts (plz, date, discount_percent desc)
    where discount_percent is not null;
create index if not exists ak_discounts_savings_idx        on ak_discounts (plz, date, savings desc)
    where savings is not null;
create index if not exists ak_discounts_name_trgm_idx      on ak_discounts using gin (product_name gin_trgm_ops);

-- ---------------------------------------------------------------------
-- 3b) ISTORIJA REDOVNIH CIJENA (kad letak ne da staru cijenu)
-- ---------------------------------------------------------------------
create table if not exists ak_price_observations (
    id          bigserial primary key,
    store_id    integer not null references ak_stores(id) on delete cascade,
    product_key text    not null,
    ean         text,
    price       numeric(10,2) not null check (price >= 0),
    date        date    not null default current_date,
    unique (store_id, product_key, date)
);
create index if not exists ak_price_obs_lookup_idx on ak_price_observations (store_id, product_key, date desc);

-- ---------------------------------------------------------------------
-- 4) SIGURNOST — RLS uključen, bez policy-ja.
--    Znači: anon ključ ne može ništa. Samo server (service_role) čita/piše.
-- ---------------------------------------------------------------------
alter table ak_stores            enable row level security;
alter table ak_stores_by_plz     enable row level security;
alter table ak_discounts         enable row level security;
alter table ak_price_observations enable row level security;

-- =====================================================================
--  RPC FUNKCIJE — ovo zove /api/akcije/*
-- =====================================================================

-- 5.1) Pretraga ponuda za jedan PLZ, iz zadnjeg snapshota tog PLZ-a.
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
    -- nulls last => artikli bez stare cijene ("Angebot") idu na kraj liste
    v_order := case p_sort
        when 'savings' then 'd.savings desc nulls last, d.discount_percent desc nulls last, d.product_name asc'
        when 'price'   then 'd.new_price asc, d.product_name asc'
        when 'name'    then 'd.product_name asc'
        else                'd.discount_percent desc nulls last, d.savings desc nulls last, d.product_name asc'
    end;

    return query execute format($q$
        with snap as (
            select max(date) as date from ak_discounts where plz = $1
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
            d.valid_to::text,
            (d.old_price is null),
            d.rabatt_quelle,
            count(*) over ()
        from ak_discounts d
        join ak_stores s on s.id = d.store_id
        cross join snap
        where d.plz = $1
          and d.date = snap.date
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

-- 5.2) Jedna ponuda po id-u — stranica detalja.
drop function if exists ak_discount_by_id(bigint);
create function ak_discount_by_id(p_id bigint)
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
    image_attribution text,
    valid_from       text,
    valid_to         text,
    source_url       text,
    rabatt_quelle    text,
    is_angebot       boolean
)
language sql
stable
security definer
set search_path = public
as $fn$
    select
        d.id::text, d.product_name, d.old_price, d.new_price,
        d.discount_percent, d.savings, s.name, s.slug, d.category,
        d.plz, d.date::text, d.image_url, d.image_exact, d.image_attribution,
        d.valid_from::text, d.valid_to::text, d.source_url, d.rabatt_quelle,
        (d.old_price is null)
    from ak_discounts d
    join ak_stores s on s.id = d.store_id
    where d.id = p_id
$fn$;

-- 5.3) Prodavnice u datom PLZ-u + koliko ponuda svaka ima danas.
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
        select max(date) as date from ak_discounts where plz = p_plz
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
          and d.date = snap.date
    where sp.plz = p_plz
    group by s.id, s.name, s.slug, s.logo_url
    order by count(d.id) desc, s.name asc
$fn$;

-- 5.4) Kategorije koje danas postoje u datom PLZ-u.
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
        select max(date) as date from ak_discounts where plz = p_plz
    )
    select d.category, count(*)::int
    from ak_discounts d
    join ak_stores s on s.id = d.store_id
    cross join snap
    where d.plz = p_plz
      and d.date = snap.date
      and d.category is not null
      and (p_store is null or s.slug = lower(p_store) or lower(s.name) = lower(p_store))
    group by d.category
    order by count(*) desc, d.category asc
$fn$;

-- 5.5) Kratki pregled: ima li uopšte podataka za taj PLZ i od kada su.
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
        select max(date) as date from ak_discounts where plz = p_plz
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
    left join ak_discounts d on d.plz = p_plz and d.date = snap.date
    group by snap.date
$fn$;

-- Samo server (service_role) smije zvati ove funkcije.
revoke execute on function ak_discounts_search(text, text, text, numeric, numeric, text, text, int, int) from anon, authenticated;
revoke execute on function ak_discount_by_id(bigint)     from anon, authenticated;
revoke execute on function ak_stores_list(text)          from anon, authenticated;
revoke execute on function ak_categories_list(text, text) from anon, authenticated;
revoke execute on function ak_meta(text)                 from anon, authenticated;

-- =====================================================================
--  ČIŠĆENJE — pozovi iz scrapera nakon uspješnog upisa
-- =====================================================================
create or replace function ak_prune_old_snapshots(keep_days integer default 14)
returns bigint language plpgsql
security definer set search_path = public as $$
declare removed bigint;
begin
    delete from ak_discounts where date < current_date - keep_days;
    get diagnostics removed = row_count;
    return removed;
end; $$;

create or replace function ak_prune_price_history(keep_days integer default 60)
returns bigint language plpgsql
security definer set search_path = public as $$
declare removed bigint;
begin
    delete from ak_price_observations where date < current_date - keep_days;
    get diagnostics removed = row_count;
    return removed;
end; $$;

revoke execute on function ak_prune_old_snapshots(integer) from anon, authenticated;
revoke execute on function ak_prune_price_history(integer) from anon, authenticated;
