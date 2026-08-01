import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config, parseArgs } from './config.js';
import {
  closePool,
  ensureStore,
  linkStoreToPlz,
  pruneOldSnapshots,
  recordScrapeRun,
  replaceSnapshot,
  type SnapshotRow,
} from './db.js';
import { imageKey, loadImageCache, type CachedImage } from './imageCache.js';
import { sanitizeOffer } from './normalize.js';
import { KaufdaSource } from './sources/kaufda.js';
import { MockSource } from './sources/mock.js';
import { RetailersSource } from './sources/retailers.js';
import { SviLanciSource } from './sources/svi.js';
import type { ScrapedStore, Source } from './types.js';

// ---------------------------------------------------------------------
// Pomocno
// ---------------------------------------------------------------------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function log(message: string, extra?: Record<string, unknown>): void {
  const time = new Date().toISOString().slice(11, 19);
  console.log(`[${time}] ${message}${extra ? ' ' + JSON.stringify(extra) : ''}`);
}

async function withRetry<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('robots.txt')) throw error;      // ovo ne ponavljamo
      if (attempt > config.maxRetries) {
        log(`GRESKA ${label} - odustajem nakon ${attempt} pokusaja: ${message}`);
        return null;
      }
      const backoff = config.delayMs * attempt * 2;
      log(`Pao ${label} (pokusaj ${attempt}): ${message} - ponavljam za ${backoff}ms`);
      await sleep(backoff);
    }
  }
  return null;
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]!, index);
    }
  });
  await Promise.all(runners);
  return results;
}

async function loadPlzList(explicit: string[] | null): Promise<string[]> {
  if (explicit?.length) return explicit;
  const path = resolve(process.cwd(), config.plzFile);
  if (!existsSync(path)) throw new Error(`Ne postoji PLZ fajl: ${path}`);
  const text = await readFile(path, 'utf8');
  const list = text
    .split(/\r?\n/)
    // Komentar smije stajati i iza PLZ-a ("80331   # München"), da se u
    // fajlu vidi koji je grad koji broj bez gledanja u mapu.
    .map((line) => line.split('#')[0]!.trim())
    .filter(Boolean);
  const invalid = list.filter((plz) => !/^\d{5}$/.test(plz));
  if (invalid.length) throw new Error(`Neispravni PLZ-ovi u ${config.plzFile}: ${invalid.join(', ')}`);
  return [...new Set(list)];
}

// ---------------------------------------------------------------------
// Glavni posao za jedan PLZ
// ---------------------------------------------------------------------
interface PlzResult {
  plz: string;
  stores: number;
  offers: number;
  withPercent: number;
  angebotOnly: number;
  skipped: number;
  imagesFromSource: number;
  imagesFromOff: number;
  imagesMissing: number;
  ok: boolean;
}

async function processPlz(
  source: Source,
  plz: string,
  date: string,
  dryRun: boolean,
  images: Map<string, CachedImage>,
): Promise<PlzResult> {
  const result: PlzResult = {
    plz,
    stores: 0,
    offers: 0,
    withPercent: 0,
    angebotOnly: 0,
    skipped: 0,
    imagesFromSource: 0,
    imagesFromOff: 0,
    imagesMissing: 0,
    ok: false,
  };

  const stores = await withRetry(`prodavnice ${plz}`, () => source.listStores(plz));
  if (!stores) return result;
  log(`PLZ ${plz}: ${stores.length} prodavnica`);

  const rows: SnapshotRow[] = [];
  const dryRows: Array<Record<string, unknown>> = [];

  for (const store of stores as ScrapedStore[]) {
    await sleep(config.delayMs);
    const storeStarted = Date.now();

    const offers = await withRetry(`ponude ${store.slug}@${plz}`, () =>
      source.listOffers(store, plz),
    );

    // Prodavnica ide u bazu i kad danas nema ponuda - lista prodavnica
    // po PLZ-u treba biti kompletna za dropdown na frontendu. Zato je
    // upisemo prije nego pogledamo ponude (treba nam i za zapis prolaza).
    const storeId = dryRun ? 0 : await ensureStore(store);
    if (!dryRun) await linkStoreToPlz(storeId, plz);

    if (!offers) {
      // Prolaz je pao (izvor promijenio stranicu / mreza) - zabiljezi kao
      // gresku da ga "Zdravlje scrapera" i alarm vide.
      if (!dryRun)
        await recordScrapeRun({
          plz,
          storeId,
          items: 0,
          durationMs: Date.now() - storeStarted,
          status: 'error',
          error: `listOffers nije uspio za ${store.slug}`,
        });
      continue;
    }
    result.stores += 1;

    let storeRows = 0;
    for (const offer of offers) {
      const clean = sanitizeOffer({
        ...offer,
        productName: offer.productName,
        newPrice: offer.newPrice,
        oldPrice: offer.oldPrice,
      });
      if (!clean) {
        result.skipped += 1;
        continue;
      }
      if (clean.oldPrice === null) result.angebotOnly += 1;
      else result.withPercent += 1;

      // Ako izvor nije dao sliku, uzmi je iz cachea (npm run images:enrich).
      // Slika iz izvora je uvijek za tacno to pakovanje -> exact = true.
      const cached = images.get(imageKey(clean.productName));
      const imageUrl = clean.imageUrl ?? cached?.url ?? null;
      const imageExact = clean.imageUrl ? true : (cached?.exact ?? true);
      // Slika iz letka je uvijek tacno to pakovanje - to je zeljeni slucaj.
      const imageSource = clean.imageUrl ? 'source' : imageUrl ? 'off' : null;
      if (imageSource === 'source') result.imagesFromSource += 1;
      else if (imageSource === 'off') result.imagesFromOff += 1;
      else result.imagesMissing += 1;

      // `scope` kaže GDJE ponuda vrijedi: 'DE' = cijela Njemačka (upisuje se
      // jednom, pod NACIONALNI_PLZ), inače regija lanca.
      const scope = store.scope ?? null;

      if (dryRun)
        dryRows.push({ ...clean, imageUrl, imageExact, imageSource, store: store.name, plz, date, scope });
      else rows.push({ ...clean, imageUrl, imageExact, imageSource, storeId, scope });
      storeRows += 1;
    }
    log(`  ${store.name}: ${offers.length} ponuda`);

    // Zapis o prolazu: koliko je artikala uslo za ovu prodavnicu danas.
    // Ovo puni ak_scrape_runs, iz cega applyLayer racuna "juce vs danas".
    if (!dryRun)
      await recordScrapeRun({
        plz,
        storeId,
        items: storeRows,
        durationMs: Date.now() - storeStarted,
        status: storeRows === 0 ? 'empty' : 'ok',
      });
  }

  result.offers = dryRun ? dryRows.length : rows.length;

  if (dryRun) {
    await mkdir('out', { recursive: true });
    await writeFile(`out/${plz}-${date}.json`, JSON.stringify(dryRows, null, 2), 'utf8');
    log(`DRY RUN: zapisano out/${plz}-${date}.json (${dryRows.length} artikala) - baza nije dirana`);
  } else {
    const inserted = await replaceSnapshot(plz, date, rows);
    log(`PLZ ${plz}: upisano ${inserted} artikala u bazu`);
  }

  result.ok = true;
  return result;
}

// ---------------------------------------------------------------------
// Ulazna tocka
// ---------------------------------------------------------------------
async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const date = new Date().toISOString().slice(0, 10);
  const plzList = await loadPlzList(args.plz);

  log('Scraper start', {
    izvor: args.source,
    plz: plzList.length,
    datum: date,
    dryRun: args.dryRun,
    concurrency: config.concurrency,
    delayMs: config.delayMs,
  });

  const source: Source =
    // 'retailers' = SVI lanci (Aldi x2, Kaufland, Lidl, REWE). Naziv je
    // ostao isti da workflow i stare komande i dalje rade.
    args.source === 'retailers' || args.source === 'svi'
      ? new SviLanciSource({ dryRun: args.dryRun })
      : args.source === 'samo-retailers'
      ? new RetailersSource({ dryRun: args.dryRun })
      : args.source === 'kaufda'
        ? new KaufdaSource()
        : new MockSource();
  const images = await loadImageCache();
  if (images.size > 0) log(`Cache slika: ${images.size} artikala`);
  const started = Date.now();

  try {
    const results = await mapLimit(plzList, config.concurrency, (plz) =>
      processPlz(source, plz, date, args.dryRun, images),
    );

    if (!args.dryRun && args.keepDays > 0) {
      const removed = await pruneOldSnapshots(args.keepDays);
      log(`Ocisceno ${removed} starih redova (starijih od ${args.keepDays} dana)`);
    }

    const total = results.reduce(
      (acc, r) => ({
        offers: acc.offers + r.offers,
        withPercent: acc.withPercent + r.withPercent,
        angebotOnly: acc.angebotOnly + r.angebotOnly,
        skipped: acc.skipped + r.skipped,
        fromSource: acc.fromSource + r.imagesFromSource,
        fromOff: acc.fromOff + r.imagesFromOff,
        noImage: acc.noImage + r.imagesMissing,
        failed: acc.failed + (r.ok ? 0 : 1),
      }),
      { offers: 0, withPercent: 0, angebotOnly: 0, skipped: 0, fromSource: 0, fromOff: 0, noImage: 0, failed: 0 },
    );

    log('=== ZAVRSENO ===', {
      trajanje_s: Math.round((Date.now() - started) / 1000),
      artikala: total.offers,
      sa_popustom: total.withPercent,
      samo_angebot: total.angebotOnly,
      preskoceno: total.skipped,
      plz_neuspjelih: total.failed,
    });
    log('=== SLIKE ===', {
      iz_letka: total.fromSource,
      iz_open_food_facts: total.fromOff,
      bez_slike: total.noImage,
      pokrivenost_iz_letka:
        total.offers > 0 ? `${Math.round((100 * total.fromSource) / total.offers)}%` : '-',
    });

    if (total.failed === plzList.length) process.exitCode = 1;
  } finally {
    await source.close?.();
    await closePool();
  }
}

main().catch((error) => {
  console.error('Scraper je pao:', error);
  process.exit(1);
});
