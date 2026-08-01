import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { config } from '../config.js';
import { cleanProductName, normalizeCategory, parsePrice } from '../normalize.js';
import { fetchRobots, isAllowed, type RobotsRules } from '../robots.js';
import type { ScrapedOffer, ScrapedStore, Source } from '../types.js';

/**
 * =====================================================================
 *  IZVOR: pojedinačni lanci (Aldi Süd, Kaufland)
 * =====================================================================
 *  Za razliku od KaufDA, ovi lanci akcije drže kao TEKST na svojoj
 *  stranici (provjereno u browseru), i njihov robots.txt to dozvoljava.
 *  Akcije su NACIONALNE — jedna stranica po lancu vrijedi za sve PLZ-ove,
 *  pa je povučemo jednom i podijelimo na sve gradove.
 *
 *  Selektori su nađeni gledanjem prave stranice (DevTools). Kad se sajt
 *  promijeni i broj artikala padne na 0 → prvo provjeri OVDJE selektore
 *  (dry-run snimi i out/_debug-<lanac>.html da se vidi kako izgleda).
 * =====================================================================
 */
interface RetailerDef {
  name: string;
  slug: string;
  offersUrl: string;
  /** kontejner jedne kartice artikla */
  tile: string;
  /** naziv unutar kartice (rezerva; primarno se uzima img alt) */
  nameSel: string;
  newPrice: string;
  oldPrice: string;
  /** Kaufland cijenu piše kao "1.99" (tačka) → prebacimo u "1,99" prije parsiranja */
  dotDecimal: boolean;
}

const RETAILERS: RetailerDef[] = [
  {
    name: 'Aldi Süd',
    slug: 'aldi-sued',
    offersUrl: 'https://www.aldi-sued.de/de/angebote.html',
    tile: 'div.product-tile',
    nameSel: '.product-tile__name',
    newPrice: 'ins.base-price__discounted',
    oldPrice: 'del',
    dotDecimal: false,
  },
  {
    name: 'Kaufland',
    slug: 'kaufland',
    offersUrl: 'https://filiale.kaufland.de/angebote.html',
    tile: 'a.k-product-tile',
    nameSel: '.k-product-tile__title',
    newPrice: '.k-price-tag__price',
    oldPrice: '.k-price-tag__old-price-line-through',
    dotDecimal: true,
  },
];

interface RawTile {
  name: string;
  np: string;
  op: string;
  src: string;
}

export class RetailersSource implements Source {
  readonly name = 'retailers';
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private robots = new Map<string, RobotsRules | null>();
  // Nacionalno → povučemo jednom po lancu, pa isti rezultat vrijedi za sve PLZ-ove.
  private offersCache = new Map<string, ScrapedOffer[]>();
  private debugDumped = new Set<string>();
  private readonly dryRun: boolean;

  constructor(opts: { dryRun: boolean }) {
    this.dryRun = opts.dryRun;
  }

  async listStores(_plz: string): Promise<ScrapedStore[]> {
    return RETAILERS.map((r) => ({ name: r.name, slug: r.slug, url: r.offersUrl, logoUrl: null }));
  }

  async listOffers(store: ScrapedStore, _plz: string): Promise<ScrapedOffer[]> {
    if (!store.url) return [];
    const cached = this.offersCache.get(store.url);
    if (cached) return cached;

    const def = RETAILERS.find((r) => r.slug === store.slug);
    if (!def) return [];

    const url = new URL(store.url);
    if (config.respectRobots && !(await this.allowed(url.origin, url.pathname))) {
      return [];
    }

    const page = await this.open(store.url);
    try {
      await autoScroll(page);
      // Natjeraj lijene slike da povuku PRAVI src prije čitanja. Inače dio
      // ostane na placeholderu → prazna slika → ilustracija na sajtu.
      await page.evaluate(() => {
        document.querySelectorAll('img').forEach((im) => {
          im.setAttribute('loading', 'eager');
          const ds = im.getAttribute('data-src');
          if (ds && !im.getAttribute('src')?.includes(ds)) im.setAttribute('src', ds);
        });
      });
      await page.waitForTimeout(2500);
      await autoScroll(page);

      const raw = (await page.$$eval(
        def.tile,
        (tiles, sel) =>
          tiles.map((t) => {
            const img = t.querySelector('img');
            const nameEl = sel.nameSel ? t.querySelector(sel.nameSel) : null;
            const alt = (img?.getAttribute('alt') ?? '').trim();
            const name = alt || (nameEl?.textContent ?? '').trim();
            const np = (t.querySelector(sel.newPrice)?.textContent ?? '').trim();
            const op = (t.querySelector(sel.oldPrice)?.textContent ?? '').trim();
            // PRAVA slika je u data-src / srcset (lijeno učitavanje); "src" je
            // često placeholder (kod Kauflanda njihov sivi "fallback" logo).
            // Gledamo prvo data-src/srcset, uzimamo zadnji (najveći) URL, i
            // preskačemo očite placeholdere.
            const cands = [
              img?.getAttribute('data-src'),
              img?.getAttribute('data-srcset'),
              img?.getAttribute('srcset'),
              img?.getAttribute('src'),
            ];
            let src = '';
            for (const c of cands) {
              if (!c) continue;
              const url = /[, ]/.test(c)
                ? (c.split(',').pop() ?? '').trim().split(/\s+/)[0]
                : c.trim();
              if (!url || url.startsWith('data:')) continue;
              if (/fallback|placeholder|blank|spacer|1x1|loading|lazy/i.test(url)) continue;
              src = url;
              break;
            }
            return { name, np, op, src };
          }),
        { nameSel: def.nameSel, newPrice: def.newPrice, oldPrice: def.oldPrice },
      )) as RawTile[];

      // Ako je 0 artikala u pravom radu — u dry-runu snimi stranicu da se vidi
      // je li lanac promijenio raspored (ili nas dočekao drugačijom stranicom).
      if (this.dryRun && raw.length === 0) await this.dumpDebug(def.slug, page);

      const offers = raw
        .map((row) => toOffer(row, def, store.url!))
        .filter((o): o is ScrapedOffer => o !== null);

      this.offersCache.set(store.url, offers);
      return offers;
    } finally {
      await page.close();
    }
  }

  private async allowed(origin: string, path: string): Promise<boolean> {
    if (!this.robots.has(origin)) {
      this.robots.set(origin, await fetchRobots(origin, config.userAgent));
    }
    return isAllowed(this.robots.get(origin) ?? null, path);
  }

  private async ensureBrowser(): Promise<BrowserContext> {
    if (this.context) return this.context;
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext({
      userAgent: config.userAgent,
      locale: 'de-DE',
      timezoneId: 'Europe/Berlin',
      viewport: { width: 1366, height: 900 },
    });
    this.context.setDefaultTimeout(config.timeoutMs);
    // Slike i fontovi nam u DOM-u ne trebaju — manje prometa za obje strane.
    await this.context.route('**/*', (route) => {
      const type = route.request().resourceType();
      if (type === 'image' || type === 'font' || type === 'media') return route.abort();
      return route.continue();
    });
    return this.context;
  }

  private async open(url: string): Promise<Page> {
    const ctx = await this.ensureBrowser();
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: config.timeoutMs });
    await dismissCookieBanner(page);
    return page;
  }

  private async dumpDebug(slug: string, page: Page): Promise<void> {
    if (this.debugDumped.has(slug)) return;
    this.debugDumped.add(slug);
    try {
      await mkdir('out', { recursive: true });
      await writeFile(`out/_debug-${slug}.html`, await page.content(), 'utf8');
    } catch {
      /* dump nije kritičan */
    }
  }

  async close(): Promise<void> {
    await this.context?.close();
    await this.browser?.close();
    this.context = null;
    this.browser = null;
  }
}

// ---------------------------------------------------------------------
// Pomoćne funkcije
// ---------------------------------------------------------------------

/** "1.99" (Kaufland) → "1,99" da parsePrice tačku ne shvati kao hiljade. */
export function normPriceText(text: string, dotDecimal: boolean): string {
  if (!dotDecimal) return text;
  return text.replace(/^(\s*\d+)\.(\d{2})\s*$/, '$1,$2');
}

function toOffer(row: RawTile, def: RetailerDef, sourceUrl: string): ScrapedOffer | null {
  const productName = cleanProductName(row.name);
  if (!productName) return null;

  const newPrice = parsePrice(normPriceText(row.np, def.dotDecimal));
  if (newPrice === null) return null;

  const oldPriceRaw = parsePrice(normPriceText(row.op, def.dotDecimal));
  const oldPrice = oldPriceRaw !== null && oldPriceRaw > newPrice ? oldPriceRaw : null;

  return {
    productName,
    newPrice,
    oldPrice,
    category: normalizeCategory(null, productName),
    imageUrl: row.src ? absoluteUrl(row.src, sourceUrl) : null,
    validFrom: null,
    validTo: null,
    sourceUrl,
    externalId: null,
    ean: null,
  };
}

function absoluteUrl(src: string, base: string): string | null {
  try {
    return new URL(src, base).toString();
  } catch {
    return null;
  }
}

async function dismissCookieBanner(page: Page): Promise<void> {
  const candidates = [
    'button:has-text("Alle akzeptieren")',
    'button:has-text("Akzeptieren")',
    'button:has-text("Zustimmen")',
    'button:has-text("Ablehnen")',
    '#onetrust-accept-btn-handler',
    '[data-testid="uc-accept-all-button"]',
  ];
  for (const selector of candidates) {
    try {
      const button = page.locator(selector).first();
      if (await button.isVisible({ timeout: 1200 })) {
        await button.click({ timeout: 2000 });
        return;
      }
    } catch {
      /* nema banera - nastavi */
    }
  }
}

async function autoScroll(page: Page, maxSteps = 15): Promise<void> {
  for (let step = 0; step < maxSteps; step += 1) {
    const before = await page.evaluate(() => document.body.scrollHeight);
    await page.mouse.wheel(0, 2200);
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => document.body.scrollHeight);
    if (after === before) return;
  }
}
