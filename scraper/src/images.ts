/**
 * =====================================================================
 *  Dopuna slika artikala  ->  npm run images:enrich
 * =====================================================================
 *  Prvi izvor slika je sam KaufDA: scraper vadi `image_url` iz ponude.
 *  Ali dio artikala nema sliku, a i URL-ovi izvora zive samo dok traje
 *  letak. Ova skripta popunjava praznine iz OPEN FOOD FACTS-a - otvorene
 *  baze proizvoda (odprt podatki, ODbL), koja ima fotografije skoro svih
 *  njemackih prehrambenih artikala.
 *
 *  Kako radi:
 *    1. uzme distinct nazive artikala koji nemaju sliku
 *    2. ocisti naziv (izbaci gramaturu, pakovanje, brojeve)
 *    3. pita Open Food Facts i uzme fotografiju najboljeg poklapanja
 *    4. upise `image_url` u sve redove sa tim nazivom
 *    5. sve zapamti u data/image-cache.json, pa sljedeci dnevni scrape
 *       odmah ima slike bez ijednog novog zahtjeva
 *
 *  Open Food Facts tolerise ~10 upita u minuti za pretragu, pa je pauza
 *  namjerno velika (6.5s). Pusti je da radi u pozadini jednom, poslije
 *  ide iz cachea.
 *
 *  Napomena o pravima: Open Food Facts fotografije su pod otvorenom
 *  licencom, sto je za javnu aplikaciju cistije od hotlinkanja slika sa
 *  CDN-a prodavnice. Za artikle koji nisu hrana (alat, tehnika) najbolje
 *  je koristiti slike iz izvora ili svoje.
 * =====================================================================
 */
import { config, parseArgs } from './config.js';
import { closePool, pool } from './db.js';
import {
  cachedValue,
  imageKey,
  imageKeyLoose,
  readRawCache,
  saveRawCache,
  type CachedImage,
  type RawImageCache,
} from './imageCache.js';
import { pickBestImage, type OffProduct } from './imageMatch.js';

export { pickBestImage, type OffProduct };

const OFF_BASE = process.env.OFF_BASE_URL ?? 'https://world.openfoodfacts.org';
const DELAY_MS = Number(process.env.OFF_DELAY_MS ?? 6500);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function log(message: string): void {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${message}`);
}

/** Vrati URL fotografije za dati naziv, ili null ako nema dovoljno dobrog poklapanja. */
export async function findImage(terms: string): Promise<string | null> {
  const url = new URL('/cgi/search.pl', OFF_BASE);
  url.searchParams.set('search_terms', terms);
  url.searchParams.set('search_simple', '1');
  url.searchParams.set('action', 'process');
  url.searchParams.set('json', '1');
  url.searchParams.set('page_size', '8');
  url.searchParams.set('fields', 'code,product_name,brands,image_front_url,image_url');

  const response = await fetch(url, {
    headers: {
      // Open Food Facts zahtijeva jasan User-Agent sa kontaktom
      'user-agent': config.userAgent,
      accept: 'application/json',
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Open Food Facts HTTP ${response.status}`);

  const body = (await response.json()) as { products?: OffProduct[] };
  return pickBestImage(body.products ?? [], terms);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const limit = Number(
    process.argv.find((a) => a.startsWith('--limit='))?.slice(8) ?? 200,
  );

  const noFallback = process.argv.includes('--no-fallback');
  if (noFallback) log('--no-fallback: samo tacna pakovanja, bez "Abbildung ähnlich"');

  const cache: RawImageCache = await readRawCache();
  log(`Cache ima ${Object.keys(cache).length} zapisa`);

  const { rows } = await pool.query<{ product_name: string; broj: string }>(
    `select product_name, count(*)::text as broj
       from ak_discounts
      where image_url is null
      group by product_name
      order by count(*) desc
      limit $1`,
    [limit],
  );
  log(`Artikala bez slike: ${rows.length}`);

  let fromCache = 0;
  let fetched = 0;
  let missing = 0;
  let updated = 0;
  let approx = 0;

  for (const row of rows) {
    const exactKey = imageKey(row.product_name);
    const looseKey = imageKeyLoose(row.product_name);
    if (!exactKey) {
      missing += 1;
      continue;
    }

    let found: CachedImage | undefined = cachedValue(cache, exactKey);
    // Prolazna greška (429/timeout/5xx) se NE SMIJE keširati: keš se čuva
    // između pokretanja (GitHub Actions cache), pa bi jedan loš dan OFF-a
    // artikal ZAUVIJEK obilježio kao "nema slike" — nerazlučivo od pravog
    // "nema". Zato: greška → bez upisa u keš → sutra se pita ponovo.
    let prolaznaGreska = false;
    if (found) {
      fromCache += 1;
    } else {
      // 1. pokusaj: TACNA velicina pakovanja ("nutella 750g")
      try {
        const url = await findImage(exactKey);
        found = { url, exact: true };
        fetched += 1;
        log(`${url ? 'OK   ' : 'nema '} "${row.product_name}" -> ${exactKey}${url ? ` -> ${url}` : ''}`);
      } catch (error) {
        log(`GRESKA za "${exactKey}": ${error instanceof Error ? error.message : String(error)}`);
        found = { url: null, exact: true };
        prolaznaGreska = true;
      }
      await sleep(DELAY_MS);

      // 2. pokusaj: bez velicine ("nutella") - slika je onda PRIBLIZNA.
      // Sa --no-fallback se preskace: bolje ilustracija nego pogresno pakovanje.
      // Kod prolazne greske se preskace i ovo: OFF je vec posrnuo, ne kucaj opet.
      if (!noFallback && !prolaznaGreska && !found.url && looseKey && looseKey !== exactKey) {
        const looseHit = cachedValue(cache, looseKey);
        if (looseHit?.url) {
          found = { url: looseHit.url, exact: false };
          approx += 1;
          log(`~    "${row.product_name}" -> priblizno preko "${looseKey}"`);
        } else {
          try {
            const url = await findImage(looseKey);
            cache[looseKey] = { url, exact: true };
            await saveRawCache(cache);
            if (url) {
              found = { url, exact: false };
              approx += 1;
              log(`~    "${row.product_name}" -> priblizno "${looseKey}" -> ${url}`);
            }
          } catch {
            /* ostavi bez slike */
          }
          await sleep(DELAY_MS);
        }
      }

      if (prolaznaGreska) {
        log(`   (ne keširam "${exactKey}" — prolazna greška, pita se ponovo u sljedećem prolazu)`);
      } else {
        cache[exactKey] = found;
        await saveRawCache(cache);
      }
    }

    if (!found?.url) {
      missing += 1;
      continue;
    }
    if (args.dryRun) continue;

    const result = await pool.query(
      `update ak_discounts
          set image_url = $1, image_exact = $2, image_source = 'off'
        where product_name = $3 and image_url is null`,
      [found.url, found.exact, row.product_name],
    );
    updated += result.rowCount ?? 0;
  }

  log(
    `Gotovo. iz cachea: ${fromCache}, novih upita: ${fetched}, priblizno: ${approx}, ` +
      `bez slike: ${missing}, azurirano redova: ${updated}` +
      `${args.dryRun ? ' (dry-run, baza nedirana)' : ''}`,
  );
  await closePool();
}

if (process.argv[1] && /images\.ts|images\.js/.test(process.argv[1])) {
  main().catch(async (error) => {
    console.error('images:enrich je pao:', error);
    await closePool().catch(() => {});
    process.exit(1);
  });
}
