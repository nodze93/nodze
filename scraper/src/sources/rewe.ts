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
 *  Zato prvo pročitamo tab, pa tek onda artikle ispod njega. Stranica
 *  pokazuje i SLJEDEĆU sedmicu (data-week="next") — nju namjerno preskačemo.
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
  naziv: string;
  cijena: string;
  slika: string;
}

/** REWE sedmicu piše kao "Diese Woche27.7. bis 2.8." — pretvori u period. */
export function periodIzTaba(tekst: string | null): { validFrom: string | null; validTo: string | null } {
  if (!tekst) return { validFrom: null, validTo: null };
  const m = tekst.replace(/\s+/g, ' ').match(/(\d{1,2}\.\d{1,2}\.?)\s*bis\s*(\d{1,2}\.\d{1,2}\.?)/i);
  if (!m) return { validFrom: null, validTo: null };
  // `procitajPeriod` traži najavu perioda u tekstu — "Angebote" je zadovoljava,
  // a ostalo (godina, prelaz Nove godine) rješava ista logika kao kod Aldija.
  return procitajPeriod(`Angebote ${m[1]} bis ${m[2]}`, null);
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
          const tab = document.querySelector('button[data-week="current"]');
          const kutija = document.querySelector('div[data-week="current"]');
          const plocice = kutija ? Array.from(kutija.querySelectorAll('.cor-offer-renderer-tile')) : [];
          return {
            tab: (tab?.textContent ?? '').trim(),
            artikli: plocice.map((t) => ({
              naziv: (t.querySelector('.cor-offer-information__title')?.textContent ?? '').trim(),
              cijena: (t.querySelector('.cor-offer-price__tag-price')?.textContent ?? '').trim(),
              slika: t.querySelector('img')?.getAttribute('src') ?? '',
            })),
          };
        })) as { tab: string; artikli: SirovaPlocica[] };

        const { validFrom, validTo } = periodIzTaba(podaci.tab);
        if (podaci.tab) period = podaci.tab.replace(/\s+/g, ' ');

        // Bez roka ponuda se ne bi prikazala — nema smisla je upisivati.
        if (!validTo) {
          praznihKategorija += 1;
          continue;
        }

        for (const a of podaci.artikli) {
          const naziv = cleanProductName(a.naziv);
          const cijena = parsePrice(a.cijena);
          if (!naziv || cijena === null) continue;

          const kljuc = `${naziv.toLowerCase()}|${cijena}`;
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
            externalId: `rewe-${validTo.replace(/-/g, '')}-${kljuc.slice(0, 60)}`,
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
