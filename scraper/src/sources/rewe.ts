/**
 * =====================================================================
 *  IZVOR: REWE  (nacionalne akcije, server-rendered HTML)
 * =====================================================================
 *  REWE-ov robots.txt ove stranice IZRIČITO dozvoljava (`Allow:`, ne samo
 *  odsustvo zabrane). Zabranjeni su query parametri `search=`, `sorting=`,
 *  `objectsPerPage=`, `merchant=`, `merchantType=` — ovaj izvor ih ne koristi.
 *
 *  ⚠️ Rok važenja NIJE na pločici artikla nego u tabu IZNAD liste:
 *      <button data-week="current">Diese Woche 27.7. bis 2.8.</button>
 *      <div    data-week="current"> …pločice… </div>
 *  Zato svaka pločica nosi tekst SVOG taba, pa se rok računa po artiklu.
 *
 *  ⚠️ ČITAMO OBJE SEDMICE. U NEDJELJU REWE isprazni "current" (tab i dalje
 *  piše stari period, ali pločica nema NIJEDNE) i sve prebaci u "next".
 *  Sljedeća sedmica ima validFrom u budućnosti → filter po datumu je krije
 *  dok ne počne, pa se u ponedjeljak sama upali.
 *
 *  OGRANIČENJE IZVORA: REWE ne objavljuje staru cijenu. Svi artikli zato
 *  ispadnu kao „Angebot" bez procenta i ne ulaze u „Top ponude". To nije
 *  greška scrapera nego to što izvor daje.
 *
 *  ⚠️ ČITA SE BEZ JAVASCRIPTA. Sav sadržaj je već u HTML-u (server-rendered),
 *  a kad se njihova skripta izvrši, pregazi listu (traži izbor marketa) i
 *  ostane prazno — tako je prvi put prošla samo 1 od 16 kategorija.
 *
 *  Zasluge: kategorije i logika perioda preuzete iz korisnikovog
 *  `prospekt-bot` (Python); ovdje dodane i SLIKE, koje on ne skuplja.
 * =====================================================================
 */
import type { Page } from 'playwright';
import { config } from '../config.js';
import { procitajPeriod } from '../datumi.js';
import { cleanProductName, normalizeCategory, parsePrice } from '../normalize.js';
import type { ScrapedOffer, ScrapedStore, Source } from '../types.js';
import { NACIONALNI_PLZ } from './retailers.js';

const BASE = 'https://www.rewe.de/angebote/nationale-angebote/';

/** Tačno one kategorije koje robots.txt navodi pod `Allow:`. */
const KATEGORIJE: Record<string, string> = {
  topangebote: 'Top-Angebote',
  getraenke: 'Getraenke',
  'obst-und-gemuese': 'Obst',
  'frische-und-convenience': 'Frische',
  kuehlung: 'Molkerei',
  tiefkuehl: 'Tiefkuehl',
  fruehstueck: 'Fruehstueck',
  'kochen-und-backen': 'Kochen',
  'suesses-und-salziges': 'Suesses',
  'alkoholfreie-getraenke': 'Getraenke',
  bier: 'Getraenke',
  'wein-und-spirituosen': 'Getraenke',
  haushalt: 'Haushalt',
  drogerie: 'Drogerie',
  tier: 'Tier',
  'freizeit-und-mode': 'Freizeit',
};

interface SirovaPlocica {
  /** tekst taba te sedmice ("Diese Woche27.7. bis 2.8.") — rok je po artiklu */
  tab: string;
  naziv: string;
  cijena: string;
  slika: string;
}

/**
 * REWE sedmicu piše kao "Diese Woche27.7. bis 2.8." — pretvori u period.
 * Regex namjerno prihvata i datum BEZ završne tačke ("27.7 bis 2.8") —
 * i parser u datumi.ts to sada zna pročitati (ranije nije → REWE = 0).
 * `danas` postoji samo radi determinističkih testova.
 */
export function periodIzTaba(
  tekst: string | null,
  danas: Date = new Date(),
): { validFrom: string | null; validTo: string | null } {
  if (!tekst) return { validFrom: null, validTo: null };
  const m = tekst.replace(/\s+/g, ' ').match(/(\d{1,2}\.\d{1,2}\.?)\s*bis\s*(\d{1,2}\.\d{1,2}\.?)/i);
  if (!m) return { validFrom: null, validTo: null };
  // `procitajPeriod` traži najavu perioda u tekstu — "Angebote" je zadovoljava,
  // a ostalo (godina, prelaz Nove godine) rješava ista logika kao kod Aldija.
  return procitajPeriod(`Angebote ${m[1]} bis ${m[2]}`, null, danas);
}

export class ReweSource implements Source {
  readonly name = 'rewe';
  private kes: ScrapedOffer[] | null = null;
  private readonly dajStranicu: () => Promise<Page>;

  constructor(dajStranicu: () => Promise<Page>) {
    this.dajStranicu = dajStranicu;
  }

  async listStores(plz: string): Promise<ScrapedStore[]> {
    // REWE-ove nacionalne akcije vrijede svugdje → samo nacionalna "kanta".
    if (plz !== NACIONALNI_PLZ) return [];
    return [{ name: 'REWE', slug: 'rewe', url: BASE, logoUrl: null, scope: 'DE' }];
  }

  async listOffers(): Promise<ScrapedOffer[]> {
    if (this.kes) return this.kes;

    const poKljucu = new Map<string, ScrapedOffer>();
    let praznihKategorija = 0;
    let period = '';

    for (const [slug, kategorija] of Object.entries(KATEGORIJE)) {
      const page = await this.dajStranicu();
      try {
        await page.goto(`${BASE}${slug}/`, {
          waitUntil: 'domcontentloaded',
          timeout: config.timeoutMs,
        });
        // Bez JS-a nema ni cookie-banera ni čekanja — sadržaj je već u HTML-u.

        const podaci = (await page.evaluate(() => {
          // ⚠️ ČITAMO OBJE SEDMICE, ne samo tekuću.
          // REWE u NEDJELJU (zadnji dan sedmice) isprazni "current" — tab i
          // dalje piše "27.7. bis 2.8.", ali pločica ima NULA; sve je već
          // prebačeno u "next" (3.8. bis 9.8.). Bez ovoga nedjeljom dobijemo 0.
          // Sljedeća sedmica ima validFrom u budućnosti, pa je filter po datumu
          // drži skrivenu dok ne počne — i tada se sama upali.
          // ⚠️ Ovdje smiju SAMO anonimne funkcije (unutar .map i sl.).
          // Strelica pridružena konstanti bi je tsx/esbuild umotao u pomoćnik
          // __name, kojeg u stranici nema → ReferenceError u browseru.
          const sedmice = ['current', 'next'];
          const izlaz: Array<{ tab: string; naziv: string; cijena: string; slika: string }> = [];

          for (const w of sedmice) {
            const tab = document.querySelector(`button[data-week="${w}"]`);
            const kutija = document.querySelector(`div[data-week="${w}"]`);
            const plocice = kutija ? Array.from(kutija.querySelectorAll('.cor-offer-renderer-tile')) : [];
            const tabTekst = (tab?.textContent ?? '').trim();

            izlaz.push(...plocice.map((t) => {
              // ⚠️ PRVA <img> u pločici je često REWE Bonus logo (24×24), a ne
              // proizvod — na 10 od 23 pločice. Prava slika ima data-testid.
              const im = t.querySelector('img[data-testid="offer-image"]');
              // ⚠️ Bez JS-a slike su lijene: pravi URL je u data-src/srcset,
              // a `src` uopšte ne postoji (13 od 23 pločice).
              const kandidati = [
                im?.getAttribute('data-src'),
                im?.getAttribute('data-srcset'),
                im?.getAttribute('srcset'),
                im?.getAttribute('src'),
              ];
              let slika = '';
              for (const k of kandidati) {
                if (!k) continue;
                // srcset je "url 1x, url2 2x" → uzmi prvi URL
                const url = k.split(',')[0]?.trim().split(/\s+/)[0] ?? '';
                if (url && /^https?:\/\//.test(url)) {
                  slika = url;
                  break;
                }
              }
              return {
                tab: tabTekst,
                naziv: (t.querySelector('.cor-offer-information__title')?.textContent ?? '').trim(),
                cijena: (t.querySelector('.cor-offer-price__tag-price')?.textContent ?? '').trim(),
                slika,
              };
            }));
          }
          return izlaz;
        })) as SirovaPlocica[];

        if (podaci.length === 0) praznihKategorija += 1;

        for (const a of podaci) {
          // Svaka pločica nosi tekst SVOG taba — tekuća i sljedeća sedmica
          // imaju različit period, pa se rok računa po artiklu, ne po stranici.
          const { validFrom, validTo } = periodIzTaba(a.tab);
          if (!validTo) continue; // bez roka se ponuda ne bi ni prikazala
          if (a.tab) period = a.tab.replace(/\s+/g, ' ');

          const naziv = cleanProductName(a.naziv);
          const cijena = parsePrice(a.cijena);
          if (!naziv || cijena === null) continue;

          // Ključ nosi i rok: isti artikal može biti i ove i sljedeće sedmice.
          const kljuc = `${naziv.toLowerCase()}|${cijena}|${validTo}`;
          if (poKljucu.has(kljuc)) continue;

          poKljucu.set(kljuc, {
            productName: naziv,
            newPrice: cijena,
            oldPrice: null, // REWE ne objavljuje staru cijenu
            category: normalizeCategory(kategorija, naziv),
            imageUrl: a.slika && /^https?:\/\//.test(a.slika) ? a.slika : null,
            validFrom,
            validTo,
            sourceUrl: `${BASE}${slug}/`,
            externalId: `rewe-${validTo.replace(/-/g, '')}-${kljuc.slice(0, 50)}`,
            ean: null,
          });
        }
      } catch {
        praznihKategorija += 1;
      } finally {
        await page.close();
      }
    }

    const ponude = [...poKljucu.values()];
    const saSlikom = ponude.filter((p) => p.imageUrl).length;
    console.log(
      `    [slike] REWE: ${ponude.length} artikala, ${saSlikom} sa slikom` +
        (praznihKategorija ? ` | ${praznihKategorija} kategorija bez rezultata` : ''),
    );
    console.log(
      `    [datumi] REWE: ${ponude.length}/${ponude.length} sa datumom | sekcije: ${period || '—'}` +
        ' | (REWE nema stare cijene → sve su „Angebot")',
    );

    this.kes = ponude;
    return ponude;
  }
}
