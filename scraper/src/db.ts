import pg from 'pg';
import { config } from './config.js';
import { productKeyOf } from './imageDecision.js';
import { slugify } from './normalize.js';
import type { ScrapedOffer, ScrapedStore } from './types.js';

// ---------------------------------------------------------------------
// Veza na bazu se pravi tek pri prvom upitu.
// Tako `npm test` i `--help` rade i bez DATABASE_URL-a, a kad veza zaista
// zatreba, greška je jasna i dolazi odmah.
// ---------------------------------------------------------------------
let poolInstance: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (poolInstance) return poolInstance;
  const connectionString = config.databaseUrl;
  poolInstance = new pg.Pool({
    connectionString,
    max: 4,
    // Supabase traži TLS. Ako korisnik zalijepi connection string bez
    // ?sslmode=require, uključujemo TLS sami da veza ne padne.
    ssl: /sslmode=/.test(connectionString) ? undefined : { rejectUnauthorized: false },
  });
  return poolInstance;
}

/** Isti API kao pg.Pool, samo lijen — ostatak scrapera ne mora ništa mijenjati. */
export const pool = {
  query: ((text: unknown, values?: unknown) =>
    (getPool().query as (a: unknown, b?: unknown) => unknown)(text, values)) as pg.Pool['query'],
  connect: () => getPool().connect(),
  end: async () => {
    if (!poolInstance) return;
    await poolInstance.end();
    poolInstance = null;
  },
};

export async function ensureStore(store: ScrapedStore): Promise<number> {
  const slug = store.slug || slugify(store.name);
  const { rows } = await pool.query<{ id: number }>(
    `insert into ak_stores (name, slug, logo_url)
     values ($1, $2, $3)
     on conflict (slug) do update
        set name     = excluded.name,
            logo_url = coalesce(excluded.logo_url, ak_stores.logo_url)
     returning id`,
    [store.name, slug, store.logoUrl ?? null],
  );
  return rows[0]!.id;
}

export async function linkStoreToPlz(storeId: number, plz: string): Promise<void> {
  await pool.query(
    `insert into ak_stores_by_plz (store_id, plz)
     values ($1, $2)
     on conflict (store_id, plz) do nothing`,
    [storeId, plz],
  );
}

export interface SnapshotRow extends ScrapedOffer {
  storeId: number;
  /** 'DE' = vrijedi u cijeloj Njemačkoj; inače regija lanca (aldi-sued/aldi-nord) */
  scope?: string | null;
  /** false kad je slika od drugog pakovanja istog artikla */
  imageExact?: boolean;
  /** odakle je slika; trajni sloj kasnije moze ovo dopuniti */
  imageSource?: 'source' | 'off' | 'obf' | 'icecat' | 'stock' | 'manual' | 'manufacturer' | null;
  /** barkod kad ga izvor da - najpouzdaniji nacin da se nadje slika */
  ean?: string | null;
}

/** Zapis o jednom prolazu scrapera - bez ovoga admin/alarm nemaju odakle "juce". */
export async function recordScrapeRun(run: {
  plz: string;
  storeId: number | null;
  items: number;
  durationMs: number;
  status: 'ok' | 'empty' | 'error';
  error?: string | null;
}): Promise<void> {
  await pool.query(
    `insert into ak_scrape_runs (plz, store_id, items, duration_ms, status, error)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (plz, store_id, date) do update
        set items = excluded.items,
            duration_ms = excluded.duration_ms,
            status = excluded.status,
            error = excluded.error,
            started_at = now()`,
    [run.plz, run.storeId, run.items, run.durationMs, run.status, run.error ?? null],
  );
}

/**
 * Poredjenje sa jucerasnjim danom - ovo puni "Zdravlje scrapera" i okida
 * alarm. Pad preko `dropPct` posto se smatra kvarom (najcesce znaci da je
 * izvor promijenio izgled stranice).
 */
export interface HealthRow {
  plz: string;
  store: string | null;
  today: number;
  yesterday: number;
  changePct: number | null;
  status: 'ok' | 'empty' | 'error';
  broken: boolean;
}

export async function scrapeHealth(dropPct = 40): Promise<HealthRow[]> {
  const { rows } = await pool.query<{
    plz: string;
    store: string | null;
    today: string;
    yesterday: string;
    status: HealthRow['status'];
  }>(
    `select r.plz,
            s.name as store,
            r.items::text  as today,
            coalesce(y.items, 0)::text as yesterday,
            r.status
       from ak_scrape_runs r
       left join ak_stores s on s.id = r.store_id
       left join ak_scrape_runs y
              on y.plz = r.plz
             and y.store_id is not distinct from r.store_id
             and y.date = r.date - 1
      where r.date = (select max(date) from ak_scrape_runs)
      order by s.name nulls first`,
  );

  return rows.map((r) => {
    const today = Number(r.today);
    const yesterday = Number(r.yesterday);
    const changePct = yesterday > 0 ? Number((((today - yesterday) / yesterday) * 100).toFixed(1)) : null;
    const broken =
      r.status === 'error' ||
      today === 0 ||
      (changePct !== null && changePct <= -dropPct);
    return { plz: r.plz, store: r.store, today, yesterday, changePct, status: r.status, broken };
  });
}

/**
 * Isti artikal dvaput u istom prolazu (dva OBI listinga s različitim URL-om,
 * ista ponuda u dvije sekcije…) pravi duple redove u snapshotu. Posljedica
 * na sajtu: traka piše „OBI 131 akcija", a stranica pokaže 118 — lista
 * duplikate očisti, brojači u bazi ne. Zato se čisti OVDJE, na zadnjoj
 * kapiji, istim ključem kojim i sajt čisti prikaz (prodavnica + naziv +
 * cijena), plus rok važenja — da REWE-ove dvije sedmice istog artikla
 * ostanu obje.
 */
export function bezDuplihRedova(rows: SnapshotRow[]): { ciste: SnapshotRow[]; duplih: number } {
  const vidjeno = new Set<string>();
  const ciste: SnapshotRow[] = [];
  for (const row of rows) {
    const naziv = row.productName.trim().toLowerCase().replace(/\s+/g, ' ');
    const kljuc = `${row.storeId}|${naziv}|${row.newPrice}|${row.validTo ?? ''}`;
    if (vidjeno.has(kljuc)) continue;
    vidjeno.add(kljuc);
    ciste.push(row);
  }
  return { ciste, duplih: rows.length - ciste.length };
}

/**
 * Koliko dana unazad smijemo posuditi ponude za lanac koji danas nije dao
 * ništa. Namjerno kratko: ako lanac ne radi 4+ dana, treba da NESTANE sa
 * sajta — to je onda pravi kvar, a ne prolazna greška.
 */
const MAX_PRENOS_DANA = 3;

/** Jedinstveni store_id-evi koji su danas STVARNO nešto dali. */
export function idPrisutnihLanaca(rows: SnapshotRow[]): number[] {
  return [...new Set(rows.map((r) => r.storeId))];
}

/**
 * =====================================================================
 *  ZAŠTITA: jedan loš dohvat NE briše lanac sa sajta
 * =====================================================================
 *  Šta se dogodilo (03.08.2026): Aldi Nord je 4× zaredom istekao na
 *  `waitForSelector` — stranica se otvorila, ali kartice se nisu
 *  pojavile u 30 s. `withRetry` je vratio null, lanac je preskočen, a
 *  `replaceSnapshot` je svejedno upisao NOVI snapshot bez njega. Rezultat:
 *  243 ponude nestale sa sajta, iako su jučerašnje mirno stajale u bazi.
 *  Sat kasnije je isti bot, isti kod, prošao normalno.
 *
 *  Rješenje: lancu koji danas nije dao NIJEDAN red prepiši jučerašnje
 *  redove u današnji snapshot.
 *
 *  Zašto ovo ne laže korisnika:
 *   - svaki red nosi valid_from/valid_to, a sajt i baza filtriraju po
 *     danu → istekle ponude ionako ispadnu same od sebe;
 *   - prepisuje se najviše MAX_PRENOS_DANA dana unazad;
 *   - alarm i „Zdravlje scrapera" čitaju ak_scrape_runs (gdje i dalje
 *     piše 0 i status 'error'), NE ak_discounts — dakle kvar se i dalje
 *     prijavi, samo sajt ne ostane prazan dok ga ne popravimo.
 *
 *  Isključivanje: SCRAPER_CARRY_FORWARD=0
 */
async function prenesiZaostale(
  client: pg.PoolClient,
  plz: string,
  date: string,
  prisutni: number[],
): Promise<number> {
  const res = await client.query(
    `insert into ak_discounts
       (product_name, old_price, new_price, store_id, category, plz, date,
        image_url, valid_from, valid_to, source_url, external_id, image_exact,
        image_source, product_key, ean, scope)
     select product_name, old_price, new_price, store_id, category, plz, $2::date,
            image_url, valid_from, valid_to, source_url, external_id, image_exact,
            image_source, product_key, ean, scope
       from ak_discounts
      where plz = $1
        and source = 'scraper'
        and store_id is not null
        -- lanci koji su danas nešto dali se NE diraju
        and store_id <> all($3::bigint[])
        -- samo zadnji snapshot prije današnjeg, i to ne stariji od N dana
        and date = (
              select max(date) from ak_discounts
               where plz = $1 and source = 'scraper'
                 and date < $2::date
                 and date >= $2::date - $4::int
            )`,
    [plz, date, prisutni, MAX_PRENOS_DANA],
  );
  return res.rowCount ?? 0;
}

/**
 * Snapshot pristup: za jedan (plz, datum) prvo obrisemo sve, pa upisemo iznova.
 * Sve u jednoj transakciji, pa je ponovno pokretanje scrapera bezbjedno
 * (idempotentno) i nikad nema duplikata ni pola upisanih podataka.
 */
export async function replaceSnapshot(
  plz: string,
  date: string,
  sviRedovi: SnapshotRow[],
): Promise<number> {
  const { ciste: rows, duplih } = bezDuplihRedova(sviRedovi);
  if (duplih > 0) {
    console.log(`    [dupli] ${plz}: ${duplih} duplih redova odbačeno prije upisa`);
  }

  const client = await pool.connect();
  try {
    await client.query('begin');
    // VAŽNO: brišemo SAMO svoje redove. Ručno uvezene ponude (JSON uvoz iz
    // admina, source='manual') ostaju — inače bi ih scraper svako jutro
    // pobrisao. Kolonu `source` uvodi supabase/akcije-uvoz.sql.
    await client.query(
      "delete from ak_discounts where plz = $1 and date = $2 and source = 'scraper'",
      [plz, date],
    );

    let inserted = 0;
    const CHUNK = 500;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK);
      const values: unknown[] = [];
      const placeholders = chunk.map((row, idx) => {
        const b = idx * 17;
        values.push(
          row.productName,
          row.oldPrice,
          row.newPrice,
          row.storeId,
          row.category,
          plz,
          date,
          row.imageUrl ?? null,
          row.validFrom ?? null,
          row.validTo ?? null,
          row.sourceUrl ?? null,
          row.externalId ?? null,
          row.imageExact ?? true,
          row.imageSource ?? null,
          // product_key racuna TypeScript i UPISUJE ga - SQL ga nikad ne
          // racuna sam, inace bi se dvije implementacije razisle i trajni
          // sloj bi tiho prestao da se spaja.
          productKeyOf(row.productName),
          row.ean ?? null,
          row.scope ?? null,
        );
        return `(${Array.from({ length: 17 }, (_, k) => `$${b + k + 1}`).join(', ')})`;
      });

      // discount_percent i savings NE upisujemo - baza ih racuna sama
      const result = await client.query(
        `insert into ak_discounts
           (product_name, old_price, new_price, store_id, category, plz, date,
            image_url, valid_from, valid_to, source_url, external_id, image_exact,
            image_source, product_key, ean, scope)
         values ${placeholders.join(', ')}`,
        values,
      );
      inserted += result.rowCount ?? 0;
    }

    // Tek SADA, kad znamo ko je danas stvarno nešto dao, popuni rupe
    // jučerašnjim redovima — vidi objašnjenje uz `prenesiZaostale`.
    if ((process.env.SCRAPER_CARRY_FORWARD ?? 'true') !== 'false') {
      const preneseno = await prenesiZaostale(client, plz, date, idPrisutnihLanaca(rows));
      if (preneseno > 0) {
        console.log(
          `    [prenos] ${plz}: ${preneseno} redova prepisano od ranije ` +
            `— lanac danas nije odgovorio, ne brišem ga sa sajta`,
        );
        inserted += preneseno;
      }
    }

    await client.query('commit');
    return inserted;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * TRAJNO PAMCENJE CIJENA.
 *
 * `ak_discounts` se svake noci rezao na keepDays (31) — pa je „najnize do
 * sada" u praksi znacilo „najnize u zadnjih mjesec dana". Ovo prepise
 * danasnji snapshot u `ak_price_observations`: jedan red po (prodavnica,
 * artikal, dan), bez naziva/slike/kategorije, pa je visestruko manji i
 * moze da stoji zauvijek.
 *
 * MORA se zvati PRIJE `pruneOldSnapshots` — inace bi rezanje moglo odnijeti
 * dan koji jos nismo zapisali.
 *
 * SQL: supabase/akcije-najnize-v2.sql
 */
export async function zapisiPosmatranja(date: string): Promise<number> {
  const { rows } = await pool.query<{ ak_zapisi_posmatranja: string }>(
    'select ak_zapisi_posmatranja($1::date)',
    [date],
  );
  return Number(rows[0]?.ak_zapisi_posmatranja ?? 0);
}

export async function pruneOldSnapshots(keepDays: number): Promise<number> {
  const { rows } = await pool.query<{ ak_prune_old_snapshots: string }>(
    'select ak_prune_old_snapshots($1)',
    [keepDays],
  );
  return Number(rows[0]?.ak_prune_old_snapshots ?? 0);
}

export async function closePool(): Promise<void> {
  await pool.end();
}
