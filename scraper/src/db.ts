import pg from 'pg';
import { config } from './config.js';
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
  /** false kad je slika od drugog pakovanja istog artikla */
  imageExact?: boolean;
  /** 'source' = iz letka, 'off' = Open Food Facts, 'manual' = svoja */
  imageSource?: 'source' | 'off' | 'manual' | null;
}

/**
 * Snapshot pristup: za jedan (plz, datum) prvo obrisemo sve, pa upisemo iznova.
 * Sve u jednoj transakciji, pa je ponovno pokretanje scrapera bezbjedno
 * (idempotentno) i nikad nema duplikata ni pola upisanih podataka.
 */
export async function replaceSnapshot(
  plz: string,
  date: string,
  rows: SnapshotRow[],
): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query('delete from ak_discounts where plz = $1 and date = $2', [plz, date]);

    let inserted = 0;
    const CHUNK = 500;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK);
      const values: unknown[] = [];
      const placeholders = chunk.map((row, idx) => {
        const b = idx * 14;
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
        );
        return `($${b + 1}, $${b + 2}, $${b + 3}, $${b + 4}, $${b + 5}, $${b + 6}, $${b + 7}, $${b + 8}, $${b + 9}, $${b + 10}, $${b + 11}, $${b + 12}, $${b + 13}, $${b + 14})`;
      });

      // discount_percent i savings NE upisujemo - baza ih racuna sama
      const result = await client.query(
        `insert into ak_discounts
           (product_name, old_price, new_price, store_id, category, plz, date,
            image_url, valid_from, valid_to, source_url, external_id, image_exact,
            image_source)
         values ${placeholders.join(', ')}`,
        values,
      );
      inserted += result.rowCount ?? 0;
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
