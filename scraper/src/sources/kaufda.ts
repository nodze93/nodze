import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { config } from '../config.js';
import { cleanProductName, normalizeCategory, parsePrice, slugify } from '../normalize.js';
import { fetchRobots, isAllowed, type RobotsRules } from '../robots.js';
import type { ScrapedOffer, ScrapedStore, Source } from '../types.js';

/**
 * =====================================================================
 *  KaufDA izvor
 * =====================================================================
 *  PROCITAJ PRIJE PRVOG PRAVOG POKRETANJA:
 *
 *  1) Rute i CSS selektori se nalaze u src/config.ts (config.kaufda).
 *     Sajtovi mijenjaju markup - kad se nesto pokvari, provjeri prvo tamo.
 *     Selektore obavezno provjeri u browseru (DevTools) i podesi.
 *
 *  2) Scraper prvo trazi STRUKTURIRANE podatke na strani
 *     (JSON-LD <script type="application/ld+json"> i __NEXT_DATA__),
 *     jer su stabilniji od CSS klasa. CSS selektori su samo fallback.
 *
 *  3) robots.txt se provjerava prije svakog zahtjeva. Pravni dio
 *     (uslovi koristenja, § 87b UrhG - zastita baza podataka) je na tebi:
 *     provjeri smijes li podatke koristiti javno. Bonial/KaufDA imaju
 *     partnerski/API program - to je cist i stabilan put ako projekat
 *     ide u produkciju. Ovaj kod je pisan tako da se izvor podataka
 *     mijenja na jednom mjestu (interfejs Source), pa prelazak na
 *     zvanicni API ne dira ni bazu, ni API, ni frontend.
 * =====================================================================
 */
export class KaufdaSource implements Source {
  readonly name = 'kaufda';
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private robots: RobotsRules | null = null;
  private robotsLoaded = false;

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
    // Slike i fontovi nam ne trebaju - manje prometa i za nas i za njih
    await this.context.route('**/*', (route) => {
      const type = route.request().resourceType();
      if (type === 'image' || type === 'font' || type === 'media') return route.abort();
      return route.continue();
    });
    return this.context;
  }

  private async guardPath(path: string): Promise<void> {
    if (!config.respectRobots) return;
    if (!this.robotsLoaded) {
      this.robots = await fetchRobots(config.kaufda.baseUrl, config.userAgent);
      this.robotsLoaded = true;
    }
    if (!isAllowed(this.robots, path)) {
      throw new Error(
        `robots.txt zabranjuje putanju ${path}. Scraper se zaustavlja. ` +
          `Ako imas dozvolu izvora, postavi SCRAPER_RESPECT_ROBOTS=false.`,
      );
    }
  }

  private async openPage(url: string, path: string): Promise<Page> {
    await this.guardPath(path);
    const context = await this.ensureBrowser();
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: config.timeoutMs });
    await dismissCookieBanner(page);
    return page;
  }

  // -------------------------------------------------------------------
  // 1) Lista prodavnica za jedan PLZ
  // -------------------------------------------------------------------
  async listStores(plz: string): Promise<ScrapedStore[]> {
    const path = config.kaufda.storeListPath(plz);
    const page = await this.openPage(new URL(path, config.kaufda.baseUrl).toString(), path);
    try {
      await autoScroll(page);

      const raw = await page.$$eval(
        config.kaufda.selectors.storeCard,
        (cards) =>
          cards.map((card) => {
            const anchor = card.matches('a[href]')
              ? (card as HTMLAnchorElement)
              : card.querySelector<HTMLAnchorElement>('a[href]');
            const image = card.querySelector<HTMLImageElement>('img[alt]');
            const text =
              card.querySelector('[data-testid="publisher-name"]')?.textContent ??
              image?.alt ??
              anchor?.getAttribute('title') ??
              card.textContent ??
              '';
            return {
              name: text.trim(),
              href: anchor?.href ?? null,
              logo: image?.getAttribute('src') ?? null,
            };
          }),
      );

      const seen = new Set<string>();
      const stores: ScrapedStore[] = [];
      for (const entry of raw) {
        const name = cleanStoreName(entry.name);
        if (!name) continue;
        const slug = slugify(name);
        if (!slug || seen.has(slug)) continue;
        seen.add(slug);
        stores.push({ name, slug, url: entry.href, logoUrl: entry.logo });
      }
      return stores;
    } finally {
      await page.close();
    }
  }

  // -------------------------------------------------------------------
  // 2) Ponude za jednu prodavnicu
  // -------------------------------------------------------------------
  async listOffers(store: ScrapedStore, plz: string): Promise<ScrapedOffer[]> {
    if (!store.url) return [];
    const url = new URL(store.url, config.kaufda.baseUrl);
    const page = await this.openPage(url.toString(), url.pathname);

    try {
      await autoScroll(page);
      await clickLoadMore(page);

      // a) Strukturirani podaci - najstabilniji put
      const structured = await extractStructuredOffers(page);
      if (structured.length > 0) {
        return structured.map((offer) => finalizeOffer(offer, store, url.toString()));
      }

      // b) Fallback: CSS selektori iz config.ts
      const sel = config.kaufda.selectors;
      const dom = await page.$$eval(
        sel.offerCard,
        (cards, selectors) =>
          cards.map((card) => {
            const pick = (selector: string) =>
              card.querySelector(selector)?.textContent?.trim() ?? null;
            return {
              name: pick(selectors.offerName),
              newPriceText: pick(selectors.offerNewPrice),
              oldPriceText: pick(selectors.offerOldPrice),
              categoryText: pick(selectors.offerCategory),
              image:
                card.querySelector<HTMLImageElement>(selectors.offerImage)?.getAttribute('src') ??
                null,
              id: card.getAttribute('data-id') ?? card.getAttribute('id'),
            };
          }),
        sel,
      );

      return dom
        .map((row) =>
          finalizeOffer(
            {
              productName: row.name,
              newPrice: parsePrice(row.newPriceText),
              oldPrice: parsePrice(row.oldPriceText),
              category: row.categoryText,
              imageUrl: row.image,
              externalId: row.id,
            },
            store,
            url.toString(),
          ),
        )
        .filter((offer): offer is ScrapedOffer => offer !== null) as ScrapedOffer[];
    } finally {
      await page.close();
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
// Pomocne funkcije
// ---------------------------------------------------------------------
interface RawOffer {
  productName: string | null;
  newPrice: number | null;
  oldPrice: number | null;
  category: string | null;
  imageUrl?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
  externalId?: string | null;
}

function finalizeOffer(raw: RawOffer, store: ScrapedStore, sourceUrl: string): ScrapedOffer {
  const productName = cleanProductName(raw.productName) ?? '';
  return {
    productName,
    newPrice: raw.newPrice ?? 0,
    // Stara cijena se uzima SAMO ako je veca od nove. Inace null -> "Angebot".
    oldPrice:
      raw.oldPrice !== null && raw.newPrice !== null && raw.oldPrice > raw.newPrice
        ? raw.oldPrice
        : null,
    category: normalizeCategory(raw.category, productName),
    imageUrl: raw.imageUrl ?? null,
    validFrom: raw.validFrom ?? null,
    validTo: raw.validTo ?? null,
    sourceUrl,
    externalId: raw.externalId ? `${store.slug}-${raw.externalId}` : null,
  };
}

function cleanStoreName(raw: string): string | null {
  const name = raw
    .replace(/\s+/g, ' ')
    .replace(/(prospekt|prospekte|angebote|aktuelle|logo)/gi, '')
    .replace(/[|·–-]\s*$/, '')
    .trim();
  return name.length >= 2 && name.length <= 60 ? name : null;
}

async function dismissCookieBanner(page: Page): Promise<void> {
  const candidates = [
    'button:has-text("Alle akzeptieren")',
    'button:has-text("Akzeptieren")',
    'button:has-text("Zustimmen")',
    'button:has-text("Einverstanden")',
    '#onetrust-accept-btn-handler',
    '[data-testid="uc-accept-all-button"]',
  ];
  for (const selector of candidates) {
    try {
      const button = page.locator(selector).first();
      if (await button.isVisible({ timeout: 1500 })) {
        await button.click({ timeout: 2000 });
        return;
      }
    } catch {
      /* nema banera - nastavi */
    }
  }
}

async function autoScroll(page: Page, maxSteps = 12): Promise<void> {
  for (let step = 0; step < maxSteps; step += 1) {
    const before = await page.evaluate(() => document.body.scrollHeight);
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => document.body.scrollHeight);
    if (after === before) return;
  }
}

async function clickLoadMore(page: Page, maxClicks = 10): Promise<void> {
  for (let click = 0; click < maxClicks; click += 1) {
    try {
      const button = page.locator(config.kaufda.selectors.loadMoreButton).first();
      if (!(await button.isVisible({ timeout: 1000 }))) return;
      await button.click({ timeout: 2000 });
      await page.waitForTimeout(600);
    } catch {
      return;
    }
  }
}

/**
 * Trazi ponude u JSON-LD i u __NEXT_DATA__ / __INITIAL_STATE__.
 * Ide rekurzivno kroz cijeli objekat i hvata sve sto ima naziv + cijenu.
 */
async function extractStructuredOffers(page: Page): Promise<RawOffer[]> {
  const payloads = await page.evaluate(() => {
    const out: unknown[] = [];
    for (const script of Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    )) {
      try {
        out.push(JSON.parse(script.textContent ?? ''));
      } catch {
        /* neispravan JSON - preskoci */
      }
    }
    const nextData = document.getElementById('__NEXT_DATA__')?.textContent;
    if (nextData) {
      try {
        out.push(JSON.parse(nextData));
      } catch {
        /* preskoci */
      }
    }
    const globalState = (window as unknown as Record<string, unknown>)['__INITIAL_STATE__'];
    if (globalState) out.push(globalState);
    return out;
  });

  const found: RawOffer[] = [];
  const NAME_KEYS = ['name', 'title', 'productName', 'product_name', 'description'];
  const NEW_KEYS = ['price', 'currentPrice', 'newPrice', 'salePrice', 'lowPrice'];
  const OLD_KEYS = ['oldPrice', 'previousPrice', 'regularPrice', 'listPrice', 'strikePrice', 'highPrice'];

  const readString = (node: Record<string, unknown>, keys: string[]): string | null => {
    for (const key of keys) {
      const value = node[key];
      if (typeof value === 'string' && value.trim()) return value;
    }
    return null;
  };
  const readPrice = (node: Record<string, unknown>, keys: string[]): number | null => {
    for (const key of keys) {
      const value = node[key];
      if (typeof value === 'number') return parsePrice(String(value));
      if (typeof value === 'string') {
        const parsed = parsePrice(value);
        if (parsed !== null) return parsed;
      }
      if (value && typeof value === 'object') {
        const nested = readPrice(value as Record<string, unknown>, [...keys, 'value', 'amount']);
        if (nested !== null) return nested;
      }
    }
    return null;
  };

  const walk = (node: unknown, depth = 0): void => {
    if (!node || typeof node !== 'object' || depth > 12) return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1);
      return;
    }
    const object = node as Record<string, unknown>;

    const name = readString(object, NAME_KEYS);
    const newPrice = readPrice(object, NEW_KEYS);
    if (name && newPrice !== null) {
      found.push({
        productName: name,
        newPrice,
        oldPrice: readPrice(object, OLD_KEYS),
        category: readString(object, ['category', 'categoryName', 'industry']),
        imageUrl: readString(object, ['image', 'imageUrl', 'imageURL', 'thumbnail']),
        validFrom: readString(object, ['validFrom', 'startDate', 'valid_from']),
        validTo: readString(object, ['validThrough', 'validTo', 'endDate', 'valid_to']),
        externalId: readString(object, ['id', 'offerId', 'sku', 'uuid']),
      });
    }
    for (const value of Object.values(object)) walk(value, depth + 1);
  };

  for (const payload of payloads) walk(payload);

  // dedupe po nazivu + cijeni
  const seen = new Set<string>();
  return found.filter((offer) => {
    const key = `${offer.productName}|${offer.newPrice}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
