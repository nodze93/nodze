/**
 * =====================================================================
 *  Vlastita historija cijena + izracun popusta  ->  npm run prices:apply
 * =====================================================================
 *  Zasto: kad letak NE da staru cijenu (npr. REWE), popust se ne moze
 *  pokazati iz letka. Ali ako mi sami pratimo redovnu cijenu TE prodavnice
 *  kroz vrijeme, mozemo posteno izracunati popust.
 *
 *  Dva zeljezna pravila (vidi docs/pravno.md):
 *
 *  1. REFERENCA PO PRODAVNICI. Cijena REWE-a NIJE cijena Lidla. Referenca
 *     za popust jednog artikla dolazi iskljucivo iz istorije TE prodavnice.
 *     Ovdje je to strukturno: sve ide preko (store_id, product_key), pa se
 *     cijena jedne prodavnice fizicki ne moze upotrijebiti za drugu.
 *
 *  2. REFERENCA = najniza cijena u zadnjih 30 dana (§ 11 PAngV / presuda
 *     Suda EU). Ne "cijena od proslog petka" - to bi naduvalo popust.
 *
 *  Popust koji tako nastane oznacava se `rabatt_quelle = 'berechnet'`, a
 *  frontend to posteno kaze - za razliku od `rabatt_quelle = 'prospekt'`,
 *  gdje je staru cijenu dao sam letak.
 *
 *  Pokretanje (nakon dnevnog scrapea):
 *    npm run prices:apply                 # popuni izracunate popuste
 *    npm run prices:apply -- --dry-run
 *    npm run prices:apply -- --window=30  # velicina prozora u danima
 * =====================================================================
 */
import { closePool, pool } from './db.js';
import { imageKey } from './imageCache.js';

const log = (m: string) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${m}`);

export interface Observation {
  price: number;
  date: string; // 'YYYY-MM-DD'
}

/**
 * Najniza cijena u prozoru [asOf - windowDays, asOf]. Cista funkcija - lako
 * se testira, i ovdje se vidi da je pravilo bas "najniza u zadnjih N dana",
 * a ne prosjek ni zadnja cijena.
 */
export function lowestInWindow(
  observations: Observation[],
  asOf: string,
  windowDays: number,
): number | null {
  const end = new Date(`${asOf}T00:00:00Z`).getTime();
  const start = end - windowDays * 86_400_000;
  let min: number | null = null;
  for (const o of observations) {
    const t = new Date(`${o.date}T00:00:00Z`).getTime();
    if (t < start || t > end) continue; // van prozora
    if (min === null || o.price < min) min = o.price;
  }
  return min;
}

/** Kljuc artikla za spajanje ponude sa istorijom: naziv + velicina pakovanja. */
export const productKey = (productName: string): string => imageKey(productName);

/**
 * Upisi dnevna posmatranja redovne cijene. Poziva ih izvor redovnih cijena
 * (webshop prodavnice ili affiliate feed) jednom dnevno. Jedna cijena po
 * (prodavnica, artikal, dan) - ponovni upis istog dana samo osvjezi.
 */
export async function recordObservations(
  rows: Array<{ storeId: number; productKey: string; ean?: string | null; price: number; date: string }>,
): Promise<number> {
  if (rows.length === 0) return 0;
  const values: unknown[] = [];
  const ph = rows.map((r, i) => {
    const b = i * 5;
    values.push(r.storeId, r.productKey, r.ean ?? null, r.price, r.date);
    return `($${b + 1}, $${b + 2}, $${b + 3}, $${b + 4}, $${b + 5})`;
  });
  const result = await pool.query(
    `insert into ak_price_observations (store_id, product_key, ean, price, date)
     values ${ph.join(', ')}
     on conflict (store_id, product_key, date) do update set price = excluded.price`,
    values,
  );
  return result.rowCount ?? 0;
}

/** Referentna cijena = 30-dnevni minimum, ISKLJUCIVO iz iste prodavnice. */
export async function referencePrice(
  storeId: number,
  key: string,
  asOf: string,
  windowDays: number,
): Promise<number | null> {
  const { rows } = await pool.query<{ min: string | null }>(
    `select min(price)::text as min
       from ak_price_observations
      where store_id = $1
        and product_key = $2
        and date >  ($3::date - $4::int)
        and date <= $3::date`,
    [storeId, key, asOf, windowDays],
  );
  const m = rows[0]?.min;
  return m === null || m === undefined ? null : Number(m);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const windowDays = Number(argv.find((a) => a.startsWith('--window='))?.slice(9) ?? 30);
  const asOf = new Date().toISOString().slice(0, 10);

  // Ponude iz zadnjeg snapshota kojima letak NIJE dao staru cijenu.
  // (image_exact/rabatt_quelle ostaju NULL dok ne odlucimo.)
  const { rows } = await pool.query<{
    id: string;
    product_name: string;
    new_price: string;
    store_id: number;
  }>(
    `with snap as (select plz, max(date) as date from ak_discounts group by plz)
     select d.id::text, d.product_name, d.new_price::text, d.store_id
       from ak_discounts d
       join snap on snap.plz = d.plz and snap.date = d.date
      where d.old_price is null and d.rabatt_quelle is null`,
  );
  log(`Ponuda bez stare cijene iz letka: ${rows.length} (prozor ${windowDays} dana)`);

  let filled = 0;
  let noHistory = 0;
  let notCheaper = 0;

  for (const row of rows) {
    const key = productKey(row.product_name);
    const ref = await referencePrice(row.store_id, key, asOf, windowDays);
    const newPrice = Number(row.new_price);

    if (ref === null) {
      noHistory += 1;
      continue;
    }
    // Referenca mora biti STROGO veca od akcijske - inace nema popusta.
    if (ref <= newPrice) {
      notCheaper += 1;
      continue;
    }
    filled += 1;
    if (dryRun) continue;

    // old_price = referenca -> baza sama izracuna discount_percent i savings.
    await pool.query(
      `update ak_discounts set old_price = $1, rabatt_quelle = 'berechnet' where id = $2`,
      [ref, row.id],
    );
  }

  log(
    `Gotovo. izracunato popusta: ${filled}, nema istorije: ${noHistory}, ` +
      `nije jeftinije od reference: ${notCheaper}${dryRun ? ' (dry-run)' : ''}`,
  );
  await closePool();
}

if (process.argv[1] && /prices\.(ts|js)$/.test(process.argv[1])) {
  main().catch(async (error) => {
    console.error('prices:apply je pao:', error);
    await closePool().catch(() => {});
    process.exit(1);
  });
}
