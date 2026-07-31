-- =====================================================================
--  AKCIJE — TRAJNI SLOJ  (odluke koje preživljavaju dnevni snapshot)
--  Pokreni POSLIJE akcije.sql:  Supabase → SQL Editor → Run.
--  Sve je "if not exists" / "create or replace", pa je ponovno
--  pokretanje bezbjedno.
--
--  Problem koji rješava:
--    ak_discounts je dnevni snapshot (scraper radi delete+insert po danu).
--    Ako bi odluka o slici ili skrivanju stajala NA TOM REDU, nestala bi
--    već sljedeći dan. Zato se odluke vežu za PROIZVOD (product_key),
--    ne za ponudu — ponuda traje dan, proizvod traje.
--
--  Ključno: product_key računa scraper (imageKey/productKeyOf u TS-u) i
--  UPISUJE ga u kolonu. SQL ga nikad ne računa sam — inače bi se dvije
--  implementacije razišle i spajanje bi tiho prestalo raditi.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Dopune na ak_discounts
-- ---------------------------------------------------------------------
alter table ak_discounts add column if not exists product_key text;
-- skrivanje je POVRATNO: ne brišemo red, samo ga ne prikazujemo
alter table ak_discounts add column if not exists hidden boolean not null default false;

create index if not exists ak_discounts_product_key_idx on ak_discounts (product_key);

-- prošireni izvori slike (dodano: obf, manufacturer)
alter table ak_discounts drop constraint if exists ak_discounts_image_source_check;
alter table ak_discounts add constraint ak_discounts_image_source_check
    check (image_source in ('source','off','obf','icecat','stock','manual','manufacturer'));

-- ---------------------------------------------------------------------
-- 2) SLIKE PO PROIZVODU — srce trajnog sloja
--    Ovdje admin (kad se sagradi) potvrđuje/odbija slike; scraper i
--    apply funkcija to onda prelijevaju na svaki novi snapshot.
-- ---------------------------------------------------------------------
create table if not exists ak_product_images (
    id           bigserial primary key,
    product_key  text not null,
    ean          text,

    image_url         text not null,
    image_source      text not null
        check (image_source in ('source','off','obf','icecat','stock','manual','manufacturer')),
    image_attribution text,
    image_licence     text,          -- osnov korištenja (dokaz zašto smijemo)
    image_exact       boolean not null default true,

    -- 'auto'      = sistem sam postavio (siguran slučaj)
    -- 'confirmed' = čovjek potvrdio
    -- 'rejected'  = čovjek odbio; ta slika se više nikad ne nudi
    -- 'review'    = čeka čovjeka
    status text not null default 'auto'
        check (status in ('auto','confirmed','rejected','review')),

    match_kind    text check (match_kind in ('ean','name+size','name','manual')),
    match_score   numeric(4,3),
    quality_score numeric(4,3),

    decided_by text,
    decided_at timestamptz,
    created_at timestamptz not null default now(),

    unique (product_key)
);
create index if not exists ak_product_images_ean_idx    on ak_product_images (ean) where ean is not null;
create index if not exists ak_product_images_status_idx on ak_product_images (status);

-- ---------------------------------------------------------------------
-- 3) MODERACIJA — trajno skrivanje artikla
--    Ključ je (prodavnica, product_key), a NE id ponude: inače bi se
--    isti artikal vratio sutradan s novim id-em. store_id NULL = sakrij
--    taj artikal u svim prodavnicama.
-- ---------------------------------------------------------------------
create table if not exists ak_moderation (
    id          bigserial primary key,
    store_id    integer references ak_stores(id) on delete cascade,
    product_key text not null,
    hidden      boolean not null default true,
    reason      text,
    created_by  text,
    created_at  timestamptz not null default now()
);
create unique index if not exists ak_moderation_key_idx
    on ak_moderation (coalesce(store_id, 0), product_key);

-- ---------------------------------------------------------------------
-- 4) ZDRAVLJE SCRAPEA — bez ovoga alarm/admin nemaju odakle "juče"
--    Scraper upisuje jedan red po (PLZ, prodavnica, dan).
-- ---------------------------------------------------------------------
create table if not exists ak_scrape_runs (
    id          bigserial primary key,
    plz         char(5) not null,
    store_id    integer references ak_stores(id) on delete set null,
    date        date not null default current_date,
    items       integer not null default 0,
    duration_ms integer,
    status      text not null default 'ok' check (status in ('ok','empty','error')),
    error       text,
    started_at  timestamptz not null default now(),
    unique (plz, store_id, date)
);
create index if not exists ak_scrape_runs_lookup_idx on ak_scrape_runs (plz, date desc);

-- ---------------------------------------------------------------------
-- 5) ADMIN KORISNICI — temelj za budući admin panel (još se ne koristi)
-- ---------------------------------------------------------------------
create table if not exists ak_admin_users (
    id            serial primary key,
    username      text not null unique,
    password_hash text not null,
    created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 6) SIGURNOST — RLS uključen, bez policy-ja (samo service_role).
-- ---------------------------------------------------------------------
alter table ak_product_images enable row level security;
alter table ak_moderation     enable row level security;
alter table ak_scrape_runs    enable row level security;
alter table ak_admin_users    enable row level security;

-- ---------------------------------------------------------------------
-- 7) PRELIJEVANJE trajnog sloja na najnoviji snapshot
--    Poziva se poslije scrapea:  select * from ak_apply_product_layer();
--    Radi samo nad zadnjim danom po PLZ-u i ne dira već popunjene slike.
-- ---------------------------------------------------------------------
create or replace function ak_apply_product_layer(target_plz char(5) default null)
returns table (by_ean bigint, by_key bigint, hidden_rows bigint)
language plpgsql
security definer set search_path = public as $$
declare
    n_ean bigint := 0;
    n_key bigint := 0;
    n_hid bigint := 0;
begin
    -- 7a) slike po EAN-u (pouzdanije, ide prvo)
    update ak_discounts d
       set image_url         = p.image_url,
           image_source      = p.image_source,
           image_attribution = p.image_attribution,
           image_exact       = p.image_exact
      from ak_product_images p
     where p.ean is not null
       and d.ean = p.ean
       and p.status in ('auto','confirmed')
       and d.image_url is null
       and (target_plz is null or d.plz = target_plz)
       and d.date = (select max(x.date) from ak_discounts x where x.plz = d.plz);
    get diagnostics n_ean = row_count;

    -- 7b) slike po product_key (za sve bez EAN-a)
    update ak_discounts d
       set image_url         = p.image_url,
           image_source      = p.image_source,
           image_attribution = p.image_attribution,
           image_exact       = p.image_exact
      from ak_product_images p
     where d.product_key is not null
       and p.product_key = d.product_key
       and p.status in ('auto','confirmed')
       and d.image_url is null
       and (target_plz is null or d.plz = target_plz)
       and d.date = (select max(x.date) from ak_discounts x where x.plz = d.plz);
    get diagnostics n_key = row_count;

    -- 7c) skrivanje — POVRATNO (samo zastavica, red ostaje u bazi)
    update ak_discounts d
       set hidden = true
      from ak_moderation m
     where m.hidden
       and d.product_key is not null
       and m.product_key = d.product_key
       and (m.store_id is null or m.store_id = d.store_id)
       and not d.hidden
       and (target_plz is null or d.plz = target_plz)
       and d.date = (select max(x.date) from ak_discounts x where x.plz = d.plz);
    get diagnostics n_hid = row_count;

    return query select n_ean, n_key, n_hid;
end; $$;

revoke execute on function ak_apply_product_layer(char) from anon, authenticated;

-- =====================================================================
--  RPC FUNKCIJE — osvježene tako da SKRIVENI artikli ne izlaze javno.
--  Jedina izmjena u odnosu na akcije.sql je dodato "and not d.hidden".
-- =====================================================================

-- 8.1) Pretraga ponuda (skriveni ispadaju)
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
          and not d.hidden
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

-- 8.2) Jedna ponuda po id-u (skrivena vraća prazno)
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
      and not d.hidden
$fn$;

-- 8.3) Prodavnice u PLZ-u + broj ponuda (skriveni se ne broje)
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
          and not d.hidden
    where sp.plz = p_plz
    group by s.id, s.name, s.slug, s.logo_url
    order by count(d.id) desc, s.name asc
$fn$;

-- 8.4) Kategorije koje danas postoje (skriveni se ne broje)
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
      and not d.hidden
      and d.category is not null
      and (p_store is null or s.slug = lower(p_store) or lower(s.name) = lower(p_store))
    group by d.category
    order by count(*) desc, d.category asc
$fn$;

-- 8.5) Kratki pregled (skriveni se ne broje)
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
    left join ak_discounts d on d.plz = p_plz and d.date = snap.date and not d.hidden
    group by snap.date
$fn$;

-- Samo server (service_role) smije zvati ove funkcije.
revoke execute on function ak_discounts_search(text, text, text, numeric, numeric, text, text, int, int) from anon, authenticated;
revoke execute on function ak_discount_by_id(bigint)      from anon, authenticated;
revoke execute on function ak_stores_list(text)           from anon, authenticated;
revoke execute on function ak_categories_list(text, text) from anon, authenticated;
revoke execute on function ak_meta(text)                  from anon, authenticated;
