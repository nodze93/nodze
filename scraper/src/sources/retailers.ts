import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { config } from '../config.js';
import { procitajPeriod } from '../datumi.js';
import { cleanProductName, normalizeCategory, parsePrice } from '../normalize.js';
import { fetchRobots, isAllowed, type RobotsRules } from '../robots.js';
import type { ScrapedOffer, ScrapedStore, Scope, Source } from '../types.js';

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
  /** Aldi Nord: puno ime = marka + h2, pa spajamo brand + naziv */
  brandSel?: string;
  newPrice: string;
  oldPrice: string;
  /** Kaufland/Aldi Nord cijenu pišu kao "1.99" (tačka) → prebacimo u "1,99" */
  dotDecimal: boolean;
  /**
   * Gdje ponude vrijede. Svi lanci se povlače JEDNOM i upisuju pod
   * NACIONALNI_PLZ: 'DE' vrijedi za sve PLZ-ove direktno, a
   * 'aldi-sued'/'aldi-nord' baza preslika na PLZ preko ak_plz_region
   * (supabase/akcije-regije-2.sql).
   */
  scope: Scope;
  /**
   * Zadnji dan prodajne sedmice (0=ned … 6=sub) — koristi se SAMO kad lanac
   * napiše početak bez kraja ("Angebote ab Donnerstag 30.7.").
   * Aldi: subota. Kaufland: srijeda (njihova sedmica ide čet–srijeda).
   */
  krajSedmice: number;
  /**
   * ⚠️ SAMO ALDI SÜD (2026-08-03).
   *
   * Aldi Nord na /angebote.html pokaže CIJELU ponudu (~250 kartica).
   * Aldi Süd na /de/angebote.html pokaže samo PREGLED: po sekciji 10-12
   * kartica i dugme „Alle Angebote ab Montag". Zato je Süd davao ~15, a
   * Nord ~250 — nije bio kvar, nego druga stranica.
   *
   * Ovaj obrazac bira KOJE linkove sa pregledne stranice treba još obići.
   * Prazan = lanac ima sve na jednoj stranici (Nord, Kaufland) → ne dira se.
   */
  podstranice?: RegExp;
  /** Gornja granica obilazaka — da run ne eksplodira ako lanac doda 40 linkova. */
  maxPodstranica?: number;
}

/**
 * Posebna "kanta" za NACIONALNE ponude. Nije pravi grad — samo mjesto u bazi
 * gdje stoje ponude koje vrijede svugdje (Kaufland, Lidl…). Sajt ih pokazuje
 * SVAKOM korisniku, koji god PLZ upisao.
 */
export const NACIONALNI_PLZ = '00000';

// REGIJE (faza 2): Aldi Süd i Aldi Nord se — kao i Kaufland — povlače
// JEDNOM i upisuju pod NACIONALNI_PLZ, ali sa scope-om svoje regije
// ('aldi-sued' / 'aldi-nord'). Koji PLZ pripada kojoj regiji zna baza
// (tabela ak_plz_region + ak_aldi_scope(), supabase/akcije-regije-2.sql),
// pa SVAKI grad u Njemačkoj dobija svoj Aldi — ne više samo 6 uzoraka.
// Ponude su unutar jedne Aldi regije iste svugdje (provjereno ranije:
// 33 filijale → identičnih 69 ponuda), pa je jedno povlačenje dovoljno.

const RETAILERS: RetailerDef[] = [
  {
    name: 'Aldi Süd',
    slug: 'aldi-sued',
    offersUrl: 'https://www.aldi-sued.de/de/angebote.html',
    tile: 'div.product-tile',
    nameSel: '.product-tile__name',
    newPrice: 'ins.base-price__discounted',
    oldPrice: 'del',
    scope: 'aldi-sued',
    dotDecimal: false,
    krajSedmice: 6, // Aldi: sedmica ide do subote
    // Prave liste: /angebote/2026-08-03 (po danu početka) i sedmične
    // ponude /produkte/wochenangebote/k/1588161426582123. Oba linka stoje
    // na preglednoj stranici, pa ih ne moramo pogađati.
    podstranice:
      /^https:\/\/www\.aldi-sued\.de\/(angebote\/\d{4}-\d{2}-\d{2}|produkte\/wochenangebote\/k\/\d+)$/,
    maxPodstranica: 8,
  },
  {
    name: 'Aldi Nord',
    slug: 'aldi-nord',
    offersUrl: 'https://www.aldi-nord.de/angebote.html',
    tile: 'div.product-tile',
    nameSel: 'h2',
    brandSel: '.product-tile__content__upper__brand-name',
    newPrice: '.tag__label--price',
    oldPrice: '.strike-price',
    scope: 'aldi-nord',
    dotDecimal: true,
    krajSedmice: 6,
  },
  {
    name: 'Kaufland',
    slug: 'kaufland',
    offersUrl: 'https://filiale.kaufland.de/angebote.html',
    tile: 'a.k-product-tile',
    nameSel: '.k-product-tile__title',
    newPrice: '.k-price-tag__price',
    oldPrice: '.k-price-tag__old-price-line-through',
    scope: 'DE', // Kaufland: iste cijene u cijeloj Njemačkoj
    dotDecimal: true,
    krajSedmice: 3, // Kaufland: sedmica ide čet–srijeda
  },
];

interface RawTile {
  name: string;
  np: string;
  op: string;
  src: string;
  /** sirovi naslov sekcije s periodom ("Gültig vom 30.07. bis 05.08.") */
  period: string;
}

/** Kratka pauza između podstranica — pristojno prema tuđem serveru. */
function pauza(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Sa pregledne stranice izvuci linkove koje vrijedi još obići.
 * Čisti sidra (#) i završnu kosu crtu, izbacuje ponovljene i reže na `najvise`.
 */
export function podstraniceIzLinkova(
  hrefs: string[],
  obrazac: RegExp,
  najvise: number,
): string[] {
  const ciste = hrefs
    .map((h) => (h.split('#')[0] ?? '').replace(/\/+$/, ''))
    .filter((h) => h.length > 0 && obrazac.test(h));
  return [...new Set(ciste)].slice(0, Math.max(0, najvise));
}

/**
 * Podstranica nosi datum početka u URL-u (/angebote/2026-08-03). Ako na njoj
 * nema naslova sa datumom, taj datum je pouzdan početak važenja — pretvorimo
 * ga u njemački zapis koji `procitajPeriod` (datumi.ts) već zna pročitati,
 * pa kraj sedmice popuni `krajSedmice` (Aldi = subota).
 */
export function periodIzUrla(url: string): string {
  const m = url.match(/\/(\d{4})-(\d{2})-(\d{2})(?:$|[/?#])/);
  if (!m) return '';
  return `Angebote ab ${m[3]}.${m[2]}.${m[1]}`;
}

export class RetailersSource implements Source {
  readonly name = 'retailers';
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  /** posebni konteksti (bez JS-a za REWE, browser-UA za OBI) — vidi `novaStranica` */
  private konteksti = new Map<string, BrowserContext>();
  private robots = new Map<string, RobotsRules | null>();
  // Nacionalno → povučemo jednom po lancu, pa isti rezultat vrijedi za sve PLZ-ove.
  private offersCache = new Map<string, ScrapedOffer[]>();
  private debugDumped = new Set<string>();
  private readonly dryRun: boolean;

  constructor(opts: { dryRun: boolean }) {
    this.dryRun = opts.dryRun;
  }

  async listStores(plz: string): Promise<ScrapedStore[]> {
    // SVE ide u nacionalnu "kantu" ('00000'): i pravi nacionalni lanci
    // (scope 'DE') i Aldi regije (scope 'aldi-sued'/'aldi-nord') — svaki
    // se povuče JEDNOM, a baza regionalne servira po ak_plz_region mapi.
    // Za obične PLZ-ove retailers više ne vraća ništa (nema po-gradskog
    // dupliranja).
    if (plz !== NACIONALNI_PLZ) return [];
    return RETAILERS.map((r) => ({
      name: r.name,
      slug: r.slug,
      url: r.offersUrl,
      logoUrl: null,
      scope: r.scope,
    }));
  }

  /**
   * Pročitaj JEDNU stranicu (preglednu ili podstranicu) i vrati sirove kartice.
   * Izdvojeno iz `listOffers` da bi Aldi Süd mogao obići i podstranice bez
   * kopiranja ovog istog koda.
   *
   * ⚠️ `waitForSelector` NAMJERNO bez .catch(): kad selektor istekne, greška
   * MORA izaći. Ranije je progutani timeout keširao PRAZNU listu za lanac, pa
   * je jedan zastoj brisao lanac iz svih gradova, a retry se nikad ne bi
   * okinuo (ništa nije bačeno).
   */
  private async citajStranicu(page: Page, def: RetailerDef): Promise<RawTile[]> {
    await page.waitForSelector(def.tile, { timeout: config.timeoutMs });
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
    // Pusti slike da se STVARNO ucitaju — tek tada se src ustali na pravoj
    // fotki (Kaufland/Aldi Süd inace na gresku vrate placeholder).
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await autoScroll(page);

    return (await page.evaluate((sel: {
      tile: string;
      nameSel: string;
      brandSel: string;
      newPrice: string;
      oldPrice: string;
    }) => {
      // PERIOD VAŽENJA: lanci ga pišu u naslovu SEKCIJE iznad artikala
      // ("Gültig vom 30.07. bis 05.08.", "Angebote ab Donnerstag 30.7.",
      // "Aktion Mo. 27.7."), NIKAD u samoj kartici. Zato prolazimo kroz
      // dokument REDOM: pamtimo zadnji viđeni naslov s datumom i lijepimo
      // ga na svaki artikal koji poslije njega naiđe.
      const IMA_DATUM = /\d{1,2}\.\s*\d{1,2}\./;
      const NAJAVA = /(g[üu]ltig|wochenangebot|angebot|aktion|wochenende|\bab\b|\bnur\b)/i;
      // "Dauerhaft günstige Produkte" nisu sedmična akcija — tu period
      // prestaje da važi, inače bi naslijedili tuđi datum.
      const RESET = /(dauerhaft|st[äa]ndig|immer\s+g[üu]nstig|preis-?hit)/i;

      const tiles = Array.from(document.querySelectorAll(sel.tile));
      const tileSet = new Set(tiles);
      let period = '';
      const out: Array<{ name: string; np: string; op: string; src: string; period: string }> = [];

      for (const el of Array.from(document.querySelectorAll('*'))) {
        if (!tileSet.has(el)) {
          // naslovi/labele: samo elementi bez djece i van kartica
          if (el.children.length === 0 && !el.closest(sel.tile)) {
            const txt = (el.textContent ?? '').trim().replace(/\s+/g, ' ');
            if (txt.length > 3 && txt.length < 140) {
              if (RESET.test(txt)) period = '';
              else if (IMA_DATUM.test(txt) && NAJAVA.test(txt)) period = txt;
            }
          }
          continue;
        }

        const t = el;
        {
          const img = t.querySelector('img');
          const nameEl = sel.nameSel ? t.querySelector(sel.nameSel) : null;
          const brandEl = sel.brandSel ? t.querySelector(sel.brandSel) : null;
          const alt = (img?.getAttribute('alt') ?? '').trim();
          const nm = (nameEl?.textContent ?? '').trim();
          const brand = (brandEl?.textContent ?? '').trim();
          // img alt je puno ime (Aldi Süd/Kaufland); Aldi Nord nema alt, pa
          // spajamo marku + naziv ("BIO Speisemöhren").
          const name = alt || [brand, nm].filter(Boolean).join(' ');
          // Aldi Nord lijepi fusnotu na cijenu ("1.49**") — skidamo zvjezdice.
          const np = (t.querySelector(sel.newPrice)?.textContent ?? '').replace(/\*+/g, '').trim();
          const op = (t.querySelector(sel.oldPrice)?.textContent ?? '').replace(/\*+/g, '').trim();
          // PRAVA slika je u data-src / srcset (lijeno učitavanje); "src" je
          // često placeholder (kod Kauflanda njihov sivi "fallback" logo).
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
          out.push({ name, np, op, src, period });
        }
      }
      return out;
    }, {
      tile: def.tile,
      nameSel: def.nameSel,
      brandSel: def.brandSel ?? '',
      newPrice: def.newPrice,
      oldPrice: def.oldPrice,
    })) as RawTile[];
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

    // 1) PREGLEDNA stranica. Ako OVDJE pukne, greška izlazi napolje i
    //    `withRetry` u index.ts ponavlja — tako i treba.
    const raw: RawTile[] = [];
    let linkovi: string[] = [];
    const page = await this.open(store.url);
    try {
      raw.push(...(await this.citajStranicu(page, def)));

      // Aldi Süd: pokupi linkove na PRAVE liste (vidi `podstranice` u defu).
      if (def.podstranice) {
        const obrazac = def.podstranice;
        const hrefs = (await page.evaluate(() =>
          Array.from(document.querySelectorAll('a[href]')).map(
            (a) => (a as HTMLAnchorElement).href,
          ),
        )) as string[];
        linkovi = podstraniceIzLinkova(hrefs, obrazac, def.maxPodstranica ?? 8);
      }

      // Ako je 0 artikala u pravom radu — u dry-runu snimi stranicu da se vidi
      // je li lanac promijenio raspored (ili nas dočekao drugačijom stranicom).
      if (this.dryRun && raw.length === 0) await this.dumpDebug(def.slug, page);
    } finally {
      await page.close();
    }

    // 2) PODSTRANICE (za sada samo Aldi Süd). Svaka se hvata ZASEBNO: jedna
    //    loša podstranica NE SMIJE oboriti cijeli lanac — to je tačno onaj
    //    kvar zbog kojeg je Aldi Nord jednom nestao sa sajta.
    if (linkovi.length > 0) {
      console.log(`    [podstranice] ${def.name}: ${linkovi.length} za obići`);
    }
    for (const link of linkovi) {
      const u = new URL(link);
      if (config.respectRobots && !(await this.allowed(u.origin, u.pathname))) {
        console.log(`    [podstranica] ${u.pathname}: robots.txt ne dozvoljava — preskačem`);
        continue;
      }
      await pauza(config.delayMs);
      const pod = await this.open(link);
      try {
        const dio = await this.citajStranicu(pod, def);
        // Podstranica zna biti bez naslova s datumom — tada datum iz URL-a.
        const zadano = periodIzUrla(link);
        for (const r of dio) raw.push(r.period ? r : { ...r, period: zadano });
        console.log(`    [podstranica] ${u.pathname}: ${dio.length} kartica`);
      } catch (error) {
        const poruka = error instanceof Error ? error.message : String(error);
        console.log(`    [podstranica] ${u.pathname}: PALA — ${poruka.slice(0, 80)}`);
      } finally {
        await pod.close();
      }
    }

    const svi = raw
      .map((row) => toOffer(row, def, store.url!))
      .filter((o): o is ScrapedOffer => o !== null);

    // DUPLIKATI: lanci isti artikal stave na stranicu više puta (jednom u
    // "Top ponude", jednom u kategoriji, jednom u letku). Bez ovoga u bazu
    // odu 2-3 identična reda, pa se na sajtu vide dvije iste kartice jedna
    // do druge. Isti artikal = isti naziv + ista nova cijena.
    const offers = dedup(svi);
    if (svi.length !== offers.length) {
      console.log(`    [dupli] ${def.name}: izbačeno ${svi.length - offers.length} duplikata`);
    }

    // DIJAGNOSTIKA (vidi se u GitHub Actions logu): koliko je artikala
    // dobilo PRAVU sliku. Ako je "sa slikom" ≈ 0 za neki lanac, znaci da
    // slika i dalje ne prolazi (pa gledaj primjer URL-a ispod).
    const withImg = offers.filter((o) => o.imageUrl).length;
    const sample = offers.find((o) => o.imageUrl)?.imageUrl ?? '—';
    console.log(
      `    [slike] ${def.name}: ${offers.length} artikala, ${withImg} sa slikom | primjer: ${sample.slice(0, 90)}`,
    );

    // DIJAGNOSTIKA DATUMA — ovo se ne može isprobati iz sandboxa (nema mreže
    // do lanaca), pa se prvi pravi run provjerava OVDJE u GitHub Actions logu.
    // Ako je "sa datumom" ≈ 0, lanac je promijenio naslove sekcija.
    const saDatumom = offers.filter((o) => o.validTo).length;
    const periodi = [...new Set(raw.map((r) => r.period).filter(Boolean))].slice(0, 4);
    console.log(
      `    [datumi] ${def.name}: ${saDatumom}/${offers.length} sa datumom | sekcije: ${
        periodi.join(' · ') || '—'
      }`,
    );

    this.offersCache.set(store.url, offers);
    return offers;
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
    // VAZNO: slike PUSTAMO da se ucitaju. Kaufland i Aldi Süd na gresku
    // ucitavanja slike (kad je abortiramo) zamijene <img src> sivim
    // placeholderom, pa bismo uhvatili prazno umjesto prave fotke — zato je
    // ranije bilo 0 slika kod ta dva lanca. Fontove i medij i dalje odbijamo
    // (ne trebaju nam u DOM-u, a stede promet).
    await this.context.route('**/*', (route) => {
      const type = route.request().resourceType();
      if (type === 'font' || type === 'media') return route.abort();
      return route.continue();
    });
    return this.context;
  }

  private async open(url: string): Promise<Page> {
    const ctx = await this.ensureBrowser();
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: config.timeoutMs });
      await dismissCookieBanner(page);
      return page;
    } catch (greska) {
      // Bez ovoga bi timeout na goto OSTAVIO otvorenu stranicu — uz retry
      // (do 4 pokušaja) po lancu, to je curilo memoriju do kraja prolaza.
      await page.close().catch(() => {});
      throw greska;
    }
  }

  /**
   * Prazna stranica u ISTOM browseru — koristi je REWE izvor.
   * Bolje nego drugi Chromium: manje memorije i jedno gašenje na kraju.
   *
   * `bezJs` = kontekst SA ISKLJUČENIM JavaScriptom. Treba REWE-u: njihove
   * stranice su server-rendered i sav sadržaj je već u HTML-u, ali kad se
   * JS izvrši, skripta pregazi listu (traži izbor marketa) pa ostane prazno.
   * Bez JS-a se čita čist HTML — isto što vidi i običan `curl`.
   */
  async novaStranica(opts: { bezJs?: boolean; browserUa?: boolean } = {}): Promise<Page> {
    const kljuc = `${opts.bezJs ? 'nojs' : 'js'}|${opts.browserUa ? 'chrome' : 'bot'}`;
    if (kljuc === 'js|bot') {
      const ctx = await this.ensureBrowser();
      return ctx.newPage();
    }

    let ctx = this.konteksti.get(kljuc);
    if (!ctx) {
      await this.ensureBrowser(); // podigni browser ako već nije
      ctx = await this.browser!.newContext({
        userAgent: opts.browserUa ? config.browserUserAgent : config.userAgent,
        locale: 'de-DE',
        timezoneId: 'Europe/Berlin',
        viewport: { width: 1440, height: 900 },
        javaScriptEnabled: !opts.bezJs,
      });
      ctx.setDefaultTimeout(config.timeoutMs);
      this.konteksti.set(kljuc, ctx);
    }
    return ctx.newPage();
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
    for (const ctx of this.konteksti.values()) await ctx.close();
    this.konteksti.clear();
    await this.context?.close();
    await this.browser?.close();
    this.context = null;
    this.browser = null;
  }
}

// ---------------------------------------------------------------------
// Pomoćne funkcije
// ---------------------------------------------------------------------

/**
 * Izbaci ponovljene artikle iz jednog lanca. Ključ: naziv (bez razlike u
 * velikim/malim slovima i razmacima) + nova cijena. Zadržava se PRVI —
 * redoslijed sa stranice ostaje netaknut.
 */
export function dedup(offers: ScrapedOffer[]): ScrapedOffer[] {
  const vidjeno = new Set<string>();
  return offers.filter((o) => {
    const kljuc = `${o.productName.trim().toLowerCase().replace(/\s+/g, ' ')}|${o.newPrice}`;
    if (vidjeno.has(kljuc)) return false;
    vidjeno.add(kljuc);
    return true;
  });
}

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

  // Period iz naslova sekcije ("Gültig vom …", "Angebote ab Donnerstag 30.7.").
  // Kad ga nema, oba datuma ostaju null = ponuda se tretira kao "uvijek važi".
  const { validFrom, validTo } = procitajPeriod(row.period, def.krajSedmice);

  return {
    productName,
    newPrice,
    oldPrice,
    category: normalizeCategory(null, productName),
    imageUrl: row.src ? absoluteUrl(row.src, sourceUrl) : null,
    validFrom,
    validTo,
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

export async function dismissCookieBanner(page: Page): Promise<void> {
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
