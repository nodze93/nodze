/**
 * =====================================================================
 *  IZVOR: OBI  (Baumarkt)
 * =====================================================================
 *  robots.txt OBI-ja je najpermisivniji od svih lanaca — čak i putanje pod
 *  /api/ su izričito dozvoljene; nijedna koju koristimo nije zabranjena.
 *
 *  ⚠️ LISTING MORA KROZ BROWSER. OBI vrti Baqend Speed Kit (keš sloj preko
 *  Service Workera): server pošalje 316 KB HTML-a sa NULA proizvoda, a
 *  podaci se ne vide ni u jednom XHR-u. Zato Playwright, SA JavaScriptom
 *  (obrnuto od REWE-a, koji se čita baš bez njega).
 *
 *  ⚠️ STRANICE PROIZVODA su izuzetak — one JESU server-rendered, pa rok
 *  važenja vadimo običnim `fetch`-om iz Nuxt payloada, bez browsera.
 *
 *  ⚠️ DVIJE ZAMKE U CIJENAMA:
 *   1. Nova cijena je `.disc-product-price__base`, NE prvi iznos u
 *      kontejneru — prvi je precrtana stara.
 *   2. OBI stavlja cente u <sup>, ISTO kao markere fusnota:
 *        <span class="…__crossed-out">1.249,00 €<sup>10</sup></span>  ← fusnota
 *        <span class="…__base">1.099,<sup>00</sup> €</span>           ← centi
 *      Zato brišemo <sup> koji NISU dvocifreni.
 *
 *  ⚠️ STARA CIJENA JE ČESTO "UVP" (preporučena cijena proizvođača), a ne
 *  ranija OBI-jeva cijena. Popust u odnosu na UVP nije isto što i popust u
 *  odnosu na vlastitu raniju cijenu — vrijedi znati kad se prikazuje.
 *
 *  Zasluge: selektori, zamke i logika rokova preuzeti iz korisnikovog
 *  `obi-bot` (Python); ovdje dodane i SLIKE + naziv iz `img alt`.
 * =====================================================================
 */
import type { Page } from 'playwright';
import { config } from '../config.js';
import { cleanProductName, parsePrice } from '../normalize.js';
import type { ScrapedOffer, ScrapedStore, Source } from '../types.js';
import { NACIONALNI_PLZ } from './retailers.js';

const LISTINGS: Array<{ url: string; oznaka: string }> = [
  { url: 'https://www.obi.de/promo/produkte/sale', oznaka: 'Sale' },
  { url: 'https://www.obi.de/angebote', oznaka: 'Angebote' },
];

const PAUZA_MS = 300;
const ISTOVREMENO_ROKOVA = 4;

interface SirovaKartica {
  naziv: string;
  nova: string;
  stara: string;
  href: string;
  slika: string;
}

/** "03.08.2026" → "2026-08-03" */
export function njemackiDatumUIso(d: string): string | null {
  const m = d.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2]!.padStart(2, '0')}-${m[1]!.padStart(2, '0')}`;
}

/**
 * Rok iz Nuxt payloada stranice proizvoda:
 *   {"type":"ONLINE_DEALS","to":"03.08.2026"}              → konkretna akcija
 *   {"type":"NONE","from":"01.08.2026","to":"31.08.2026"}  → mjesečni period cijene
 * ONLINE_DEALS ima prednost jer je precizniji.
 */
export function rokIzPayloada(html: string): { validFrom: string | null; validTo: string | null } {
  const akcija = html.match(/"ONLINE_DEALS"\s*,\s*"(\d{1,2}\.\d{1,2}\.\d{4})"/);
  if (akcija) return { validFrom: null, validTo: njemackiDatumUIso(akcija[1]!) };

  const period = html.match(/"NONE","(\d{1,2}\.\d{1,2}\.\d{4})","(\d{1,2}\.\d{1,2}\.\d{4})"/);
  if (period) {
    return { validFrom: njemackiDatumUIso(period[1]!), validTo: njemackiDatumUIso(period[2]!) };
  }
  return { validFrom: null, validTo: null };
}

function pauza(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * OBI-jeve VLASTITE grupe (njemačke, kao i sve kategorije na sajtu).
 *
 * Zašto ne normalizeCategory: ona je pisana za PREHRANU, pa je "Gasgrill"
 * slala pod "Fleisch" (meso), a "Kühlschrank" pod "Gemuese" — majstorski
 * dućan je na sajtu imao meso, povrće i bebe. OBI zato dobija svoj mali
 * klasifikator: prvi pogodak pobjeđuje, redoslijed je bitan (npr.
 * "LED-Sonnensegel" mora u Garten prije nego što "LED" povuče u Elektro,
 * a "Gartenstuhl" u Garten prije nego što "Stuhl" povuče u Möbel).
 * Sve što ne pogodi nijedno pravilo ostaje "Baumarkt".
 */
const OBI_GRUPE: Array<[RegExp, string]> = [
  [/kühlschrank|kuehlschrank|gefrier|waschmaschine|trockner|geschirrspül|staubsauger|mikrowelle|kaffeemaschine|heizlüfter|heizung|ventilator|klimagerät|klimaanlage|luftentfeuchter/i, 'Haushaltsgeräte'],
  [/grill|smoker|bbq/i, 'Grill'],
  [/zelt|camping|luftbett|schlafsack|laterne|gästebett|gaestebett|isomatte|kühlbox|kuehlbox|feldbett/i, 'Camping'],
  [/garten|pflanz|rasen|mäh|maeh|sonnensegel|sonnenschirm|markise|terrass|balkon|beet|hecke|teich|pool|bewässer|bewaesser|gieß|giess|blumen|kompost|zaun|pavillon|gewächshaus|gewaechshaus|outdoor|abspannlein|balkonbespannung/i, 'Garten'],
  [/werkzeug|bohr|schraub|säge|saege|schleif|akku|hochdruckreiniger|leiter\b|fräse|fraese|kompressor|zange|messgerät|messgeraet/i, 'Werkzeug & Maschinen'],
  [/led|lampe|leuchte|strahler|kabel|steckdose|batterie|beamer|kopfhörer|kopfhoerer|lautsprecher|steuerung/i, 'Elektro & Licht'],
  [/schrank|regal|tisch\b|stuhl|sessel|sofa|matratze|bett\b|kommode/i, 'Möbel & Wohnen'],
  [/dusch|badewanne|\bwc\b|armatur|waschbecken|spiegel/i, 'Bad & Sanitär'],
  [/farbe|lack|tapete|fliese|laminat|parkett|zement|dämm|daemm|silikon/i, 'Farben & Bauen'],
];

export function kategorijaObi(naziv: string): string {
  for (const [pattern, grupa] of OBI_GRUPE) {
    if (pattern.test(naziv)) return grupa;
  }
  return 'Baumarkt';
}

export class ObiSource implements Source {
  readonly name = 'obi';
  private kes: ScrapedOffer[] | null = null;
  private readonly dajStranicu: () => Promise<Page>;

  constructor(dajStranicu: () => Promise<Page>) {
    this.dajStranicu = dajStranicu;
  }

  async listStores(plz: string): Promise<ScrapedStore[]> {
    if (plz !== NACIONALNI_PLZ) return [];
    return [
      { name: 'OBI', slug: 'obi', url: 'https://www.obi.de/angebote', logoUrl: null, scope: 'DE' },
    ];
  }

  async listOffers(): Promise<ScrapedOffer[]> {
    if (this.kes) return this.kes;

    // 1) LISTING kroz browser — po URL-u proizvoda, da se dvije stranice ne dupliraju
    const poUrlu = new Map<string, SirovaKartica>();
    let ukupnoKartica = 0;
    const paliListinzi: string[] = [];

    for (const { url, oznaka } of LISTINGS) {
      const page = await this.dajStranicu();
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: config.timeoutMs });
        await page.waitForSelector('.disc-product-price-container', { timeout: 25_000 });

        // Lijeno učitavanje: skrolaj dok broj pločica raste.
        let prosli = -1;
        for (let i = 0; i < 12; i += 1) {
          const n = await page.locator('.disc-product-price-container').count();
          if (n === prosli) break;
          prosli = n;
          await page.mouse.wheel(0, 20_000);
          await page.waitForTimeout(900);
        }

        const kartice = (await page.evaluate(() => {
          // ⚠️ NE definisati IMENOVANE funkcije unutar `evaluate`
          // (`const f = () => {}` ili `function f() {}`). `tsx`/esbuild ih
          // umota u pomoćnik `__name`, koji u stranici ne postoji → padne s
          // "ReferenceError: __name is not defined". Zato je sve pisano
          // ravno, a jedine funkcije su anonimne (unutar `.map`).
          return Array.from(document.querySelectorAll('.disc-product-price-container')).map((c) => {
            // popni se do kartice koja ima i link na proizvod i sliku
            let p: Element | null = c;
            let kartica: Element | null = null;
            for (let i = 0; i < 8 && p; i += 1) {
              p = p.parentElement;
              if (!p) break;
              if (p.querySelector('a[href*="/p/"]') && p.querySelector('img')) {
                kartica = p;
                break;
              }
            }
            const img = kartica?.querySelector('img') ?? null;

            // Cente ostavi (dvocifreni <sup>), markere fusnota izbaci — inače
            // "1.249,00 €" + marker "10" postane besmislica (greška 1000×).
            const cijene = ['.disc-product-price__base', '.disc-product-price__crossed-out'].map(
              (sel) => {
                const el = c.querySelector(sel);
                if (!el) return '';
                const kopija = el.cloneNode(true) as Element;
                kopija.querySelectorAll('sup').forEach((s) => {
                  if (!/^\d{2}$/.test((s.textContent ?? '').trim())) s.remove();
                });
                return (kopija.textContent ?? '').replace(/\s+/g, ' ').trim();
              },
            );

            return {
              // `alt` je pun naziv proizvoda — čistije nego vaditi ga iz teksta
              // kartice, gdje se miješa "Verkäufer:", "Online verfügbar" i sl.
              naziv: (img?.getAttribute('alt') ?? '').trim(),
              nova: cijene[0] ?? '',
              stara: cijene[1] ?? '',
              href: (kartica?.querySelector('a[href*="/p/"]')?.getAttribute('href') ?? '').split('?')[0] ?? '',
              slika: img?.getAttribute('src') ?? '',
            };
          });
        })) as SirovaKartica[];

        ukupnoKartica += kartice.length;
        let sPopustom = 0;
        for (const k of kartice) {
          if (!k.href || !k.naziv) continue;
          // Bez stare cijene nema popusta → nema razloga da bude u akcijama.
          if (!k.stara) continue;
          const puni = k.href.startsWith('/') ? `https://www.obi.de${k.href}` : k.href;
          if (!poUrlu.has(puni)) {
            poUrlu.set(puni, k);
            sPopustom += 1;
          }
        }
        console.log(`    [obi] ${oznaka}: ${kartice.length} pločica, ${sPopustom} s popustom`);
      } catch (greska) {
        console.log(`    [obi] ${oznaka} nije prošao: ${(greska as Error).message.slice(0, 80)}`);
        paliListinzi.push(oznaka);
      } finally {
        await page.close();
      }
    }

    // Pad listinga NE SMIJE proći kao "ok s upola manje artikala" — ranije
    // se upisivao okrnjen snapshot bez retry-ja i bez alarma (ispod praga
    // od 40%). Bačena greška pušta withRetry u index.ts da pokuša ponovo.
    if (paliListinzi.length > 0) {
      throw new Error(`OBI: listing ${paliListinzi.join(' i ')} nije prošao — probaj ponovo`);
    }

    // 2) ROKOVI sa stranica proizvoda — običan fetch, bez browsera
    const ponude: ScrapedOffer[] = [];
    let bezRoka = 0;
    const stavke = [...poUrlu.entries()];

    for (let i = 0; i < stavke.length; i += ISTOVREMENO_ROKOVA) {
      const grupa = stavke.slice(i, i + ISTOVREMENO_ROKOVA);
      const rezultati = await Promise.all(
        grupa.map(async ([url, k]) => {
          try {
            // Isti UA kao listing — OBI ne renderuje za nepoznate UA-ove.
            const res = await fetch(url, {
              headers: {
                'User-Agent': config.browserUserAgent,
                'Accept-Language': 'de-DE,de;q=0.9',
              },
              signal: AbortSignal.timeout(config.timeoutMs),
            });
            if (!res.ok) return null;
            return { url, k, rok: rokIzPayloada(await res.text()) };
          } catch {
            return null;
          }
        }),
      );

      for (const r of rezultati) {
        if (!r || !r.rok.validTo) {
          bezRoka += 1;
          continue;
        }
        const naziv = cleanProductName(r.k.naziv);
        const nova = parsePrice(r.k.nova);
        const stara = parsePrice(r.k.stara);
        if (!naziv || nova === null) continue;

        ponude.push({
          productName: naziv,
          newPrice: nova,
          oldPrice: stara !== null && stara > nova ? stara : null,
          category: kategorijaObi(naziv),
          imageUrl: r.k.slika && /^https?:\/\//.test(r.k.slika) ? r.k.slika : null,
          validFrom: r.rok.validFrom,
          validTo: r.rok.validTo,
          sourceUrl: r.url,
          externalId: `obi-${r.url.split('/p/')[1]?.split('/')[0] ?? ''}`,
          ean: null,
        });
      }
      await pauza(PAUZA_MS);
    }

    const saSlikom = ponude.filter((p) => p.imageUrl).length;
    const saStarom = ponude.filter((p) => p.oldPrice !== null).length;
    console.log(
      `    [slike] OBI: ${ponude.length} artikala, ${saSlikom} sa slikom | ${ukupnoKartica} pločica pregledano`,
    );
    console.log(
      `    [datumi] OBI: ${ponude.length}/${ponude.length} sa datumom | ${saStarom} sa starom cijenom` +
        (bezRoka ? ` | ${bezRoka} bez roka (preskočeno)` : '') +
        ' | (stara cijena je često UVP, ne ranija OBI cijena)',
    );

    this.kes = ponude;
    return ponude;
  }
}
