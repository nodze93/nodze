import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Lokalno: pokupi .env iz scraper/ ili iz korijena kodnas repozitorija.
// Na GitHub Actions varijable dolaze iz secrets, pa ovo prođe bez efekta.
for (const candidate of ['.env', '../.env', '../.env.local']) {
  const path = resolve(process.cwd(), candidate);
  if (existsSync(path)) loadDotenv({ path });
}

export interface Args {
  source: 'retailers' | 'kaufda' | 'mock';
  plz: string[] | null;
  dryRun: boolean;
  keepDays: number;
}

export function parseArgs(argv: string[]): Args {
  const get = (name: string): string | undefined => {
    const hit = argv.find((a) => a.startsWith(`--${name}=`));
    return hit ? hit.slice(name.length + 3) : undefined;
  };
  const has = (name: string) => argv.includes(`--${name}`);

  const source = (get('source') ?? process.env.SCRAPER_SOURCE ?? 'mock') as Args['source'];
  if (source !== 'retailers' && source !== 'kaufda' && source !== 'mock') {
    throw new Error(`Nepoznat --source=${source} (dozvoljeno: retailers, kaufda, mock)`);
  }

  const plzArg = get('plz');
  return {
    source,
    plz: plzArg ? plzArg.split(',').map((p) => p.trim()).filter(Boolean) : null,
    dryRun: has('dry-run'),
    keepDays: Number(get('keep-days') ?? process.env.SCRAPER_KEEP_DAYS ?? 14),
  };
}

/**
 * Veza na Supabase Postgres.
 * Supabase → Project Settings → Database → Connection string → "Session pooler".
 * Bez ovoga ne radimo ništa — bolje pasti odmah nego pola sata pokušavati
 * spojiti se na localhost koji na GitHub Actions ne postoji.
 */
function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'Nedostaje DATABASE_URL. Uzmi ga u Supabase → Settings → Database → ' +
        'Connection string (Session pooler) i dodaj ga kao GitHub secret DATABASE_URL.'
    );
  }
  return url;
}

export const config = {
  get databaseUrl(): string {
    return requireDatabaseUrl();
  },
  plzFile: process.env.PLZ_FILE ?? './data/plz.txt',
  concurrency: Math.max(1, Number(process.env.SCRAPER_CONCURRENCY ?? 1)),
  delayMs: Math.max(0, Number(process.env.SCRAPER_DELAY_MS ?? 2500)),
  maxRetries: Math.max(0, Number(process.env.SCRAPER_MAX_RETRIES ?? 3)),
  respectRobots: (process.env.SCRAPER_RESPECT_ROBOTS ?? 'true') !== 'false',
  userAgent:
    process.env.SCRAPER_USER_AGENT ??
    'kodnas-bot/1.0 (+kontakt: info@kodnas.de)',
  timeoutMs: Number(process.env.SCRAPER_TIMEOUT_MS ?? 30_000),

  kaufda: {
    baseUrl: 'https://www.kaufda.de',
    // Rute i selektori su na jednom mjestu - kad se sajt promijeni,
    // mijenja se SAMO ovaj blok, ne i logika scrapera.
    // VAZNO: provjeri ih u browseru prije prvog pravog pokretanja.
    storeListPath: (plz: string) => `/Umgebung/${encodeURIComponent(plz)}`,
    selectors: {
      storeCard: '[data-testid="publisher-card"], a[href*="/Prospekte/"]',
      storeName: '[data-testid="publisher-name"], img[alt]',
      storeLink: 'a[href]',
      offerCard: '[data-testid="offer-card"], article[class*="offer"]',
      offerName: '[data-testid="offer-title"], h3, h2',
      offerNewPrice: '[data-testid="offer-price"], [class*="price"]:not([class*="old"])',
      offerOldPrice: '[data-testid="offer-old-price"], [class*="oldPrice"], s, del',
      offerCategory: '[data-testid="offer-category"], [class*="category"]',
      offerImage: 'img',
      loadMoreButton: 'button[data-testid="load-more"]',
    },
  },
};
