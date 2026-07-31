/**
 * =====================================================================
 *  Slike i podaci sa Icecat-a po EAN-u  ->  npm run images:icecat
 * =====================================================================
 *  Icecat je otvoreni katalog proizvoda (slike + podaci) koji koriste
 *  hiljade shopova. Pristup je ZVANICAN i licenciran - ne skrejpamo, nego
 *  pitamo njihov API sa svojim nalogom. Zato je ovo pravno cist put za
 *  brendiranu robu (tehnika, drogerija, pakovana hrana).
 *
 *  Kljuc je EAN (barkod): svako pakovanje ima svoj EAN, pa Nutella 250 g i
 *  750 g dobijaju TACNO svoju sliku - nema pogadjanja po nazivu.
 *
 *  Sta ti treba (ti otvaras nalog, ja ne mogu umjesto tebe):
 *    ICECAT_USERNAME   - tvoj Icecat shop-username
 *    ICECAT_APP_KEY    - API kljuc (za JSON API)
 *  Bez toga skripta samo javi da fali nalog i stane.
 *
 *  Open Icecat sadrzaj je besplatan uz navodjenje izvora; Full Icecat je
 *  pretplata. Skripta cuva `image_attribution` da atribucija bude uz sliku.
 *
 *  Pokretanje:
 *    npm run images:icecat                 # popuni slike za artikle sa EAN-om
 *    npm run images:icecat -- --dry-run    # samo pokazi sta bi naslo
 *    npm run images:icecat -- --limit=50
 * =====================================================================
 */
import { config } from './config.js';
import { closePool, pool } from './db.js';

const BASE_URL = process.env.ICECAT_BASE_URL ?? 'https://live.icecat.biz/api/';
const USERNAME = process.env.ICECAT_USERNAME ?? '';
const APP_KEY = process.env.ICECAT_APP_KEY ?? '';
const LANG = process.env.ICECAT_LANG ?? 'DE';
const DELAY_MS = Number(process.env.ICECAT_DELAY_MS ?? 700);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const log = (m: string) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${m}`);

export interface IcecatImage {
  imageUrl: string;
  title: string | null;
  brand: string | null;
  gtin: string | null;
  attribution: string;
}

/**
 * Iz Icecat JSON odgovora izvuce sliku i osnovne podatke.
 * Cista funkcija - bez mreze, pa se testira direktno (icecat.test.ts).
 * Tolerantna je na oblik: Icecat vremenom mijenja strukturu, pa gledamo
 * vise mogucih polja za sliku.
 */
export function parseIcecat(json: unknown): IcecatImage | null {
  if (!json || typeof json !== 'object') return null;
  const root = json as Record<string, unknown>;
  const data = (root.data ?? root.Data ?? root) as Record<string, unknown>;
  if (!data || typeof data !== 'object') return null;

  const general = (data.GeneralInfo ?? data.generalInfo ?? {}) as Record<string, unknown>;
  const image = (data.Image ?? data.image ?? {}) as Record<string, unknown>;
  const gallery = (data.Gallery ?? data.gallery ?? []) as Array<Record<string, unknown>>;

  const str = (v: unknown): string | null =>
    typeof v === 'string' && v.trim() ? v.trim() : null;

  // Slika: prvo velika, pa iz galerije, pa mala
  const imageUrl =
    str(image.HighPic) ??
    str(image.Pic) ??
    (Array.isArray(gallery) ? str(gallery[0]?.Pic) ?? str(gallery[0]?.LowPic) : null) ??
    str(image.LowPic);
  if (!imageUrl) return null;

  const gtin = (() => {
    const g = general.GTIN ?? general.gtin;
    if (Array.isArray(g)) return str(g[0]);
    return str(g);
  })();

  return {
    imageUrl,
    title: str(general.Title) ?? str(general.ProductName),
    brand: str(general.Brand) ?? str((general.Brand as Record<string, unknown>)?.Value),
    gtin,
    // Open Icecat trazi navodjenje izvora uz sliku
    attribution: 'Bild: Icecat',
  };
}

/** Pita Icecat za jedan EAN. Vraca sliku+podatke ili null. */
export async function fetchByEan(ean: string): Promise<IcecatImage | null> {
  const url = new URL(BASE_URL);
  url.searchParams.set('UserName', USERNAME);
  url.searchParams.set('Language', LANG);
  url.searchParams.set('GTIN', ean);
  url.searchParams.set('Content', 'Image,GeneralInfo');
  if (APP_KEY) url.searchParams.set('app_key', APP_KEY);

  const response = await fetch(url, {
    headers: { 'user-agent': config.userAgent, accept: 'application/json' },
    signal: AbortSignal.timeout(20_000),
  });
  if (response.status === 404) return null; // Icecat nema taj proizvod
  if (!response.ok) throw new Error(`Icecat HTTP ${response.status}`);
  return parseIcecat(await response.json());
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const limit = Number(argv.find((a) => a.startsWith('--limit='))?.slice(8) ?? 500);

  if (!USERNAME) {
    log('FALI NALOG: postavi ICECAT_USERNAME (i ICECAT_APP_KEY) u .env - vidi icecat.ts');
    log('Bez naloga se Icecat ne moze pitati. Otvori nalog na icecat.biz.');
    await closePool();
    process.exitCode = 1;
    return;
  }

  // Samo artikli koji imaju EAN a nemaju jos sliku
  const { rows } = await pool.query<{ ean: string; product_name: string; broj: string }>(
    `select ean, min(product_name) as product_name, count(*)::text as broj
       from ak_discounts
      where ean is not null and image_url is null
      group by ean
      order by count(*) desc
      limit $1`,
    [limit],
  );
  log(`Artikala sa EAN-om bez slike: ${rows.length}`);

  let found = 0;
  let missing = 0;
  let updated = 0;

  for (const row of rows) {
    let hit: IcecatImage | null = null;
    try {
      hit = await fetchByEan(row.ean);
    } catch (error) {
      log(`GRESKA EAN ${row.ean}: ${error instanceof Error ? error.message : String(error)}`);
    }
    await sleep(DELAY_MS);

    if (!hit) {
      missing += 1;
      log(`nema  ${row.ean}  ${row.product_name}`);
      continue;
    }
    found += 1;
    log(`OK    ${row.ean}  -> ${hit.imageUrl}`);
    if (dryRun) continue;

    const result = await pool.query(
      `update ak_discounts
          set image_url = $1, image_exact = true, image_source = 'icecat', image_attribution = $2
        where ean = $3 and image_url is null`,
      [hit.imageUrl, hit.attribution, row.ean],
    );
    updated += result.rowCount ?? 0;
  }

  log(
    `Gotovo. nadjeno: ${found}, bez slike: ${missing}, redova azurirano: ${updated}` +
      `${dryRun ? ' (dry-run)' : ''}`,
  );
  await closePool();
}

if (process.argv[1] && /icecat\.(ts|js)$/.test(process.argv[1])) {
  main().catch(async (error) => {
    console.error('images:icecat je pao:', error);
    await closePool().catch(() => {});
    process.exit(1);
  });
}
