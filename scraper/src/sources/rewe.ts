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
  /** ISO sedmica sa same ponude ("2026/45") — primarni izvor roka */
  sedmica: string;
  /** tekst taba te sedmice ("Diese Woche27.7. bis 2.8.") — rezerva ako sedmice nema */
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
/**
 * REWE od novembra 2026. piše sedmicu NA SAMOJ PONUDI: `data-offer-week="2026/45"`.
 * To je ISO sedmica, pa se rok računa tačno i bez čitanja teksta taba —
 * važno jer tab sljedeće sedmice piše samo „Ab Samstag", bez datuma.
 *
 * ISO pravilo: 4. januar je uvijek u sedmici 1.
 * Provjereno na njihovoj stranici: 2026/45 → 2.11. do 8.11., tačno kako
 * i sami pišu u tabu „Diese Woche 2.11. bis 8.11.".
 */
export function periodIzSedmice(
  sedmica: string | null,
): { validFrom: string | null; validTo: string | null } {
  const m = (sedmica ?? '').match(/^(\d{4})\/(\d{1,2})$/);
  if (!m) return { validFrom: null, validTo: null };
  const godina = Number(m[1]);
  const broj = Number(m[2]);
  if (broj < 1 || broj > 53) return { validFrom: null, validTo: null };

  const cetvrti = new Date(Date.UTC(godina, 0, 4));
  const dan = cetvrti.getUTCDay() || 7; // pon=1 … ned=7
  const ponedjeljak = new Date(cetvrti);
  ponedjeljak.setUTCDate(cetvrti.getUTCDate() - (dan - 1) + (broj - 1) * 7);
  const nedjelja = new Date(ponedjeljak);
  nedjelja.setUTCDate(ponedjeljak.getUTCDate() + 6);

  return {
    validFrom: ponedjeljak.toISOString().slice(0, 10),
    validTo: nedjelja.toISOString().slice(0, 10),
  };
}

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
    let palihKategorija = 0; // greške (timeout/mreža), NE legitimno prazne
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
          // ⚠️ STRUKTURA PROMIJENJENA — REWE, novembar 2026.
          // Ranije su pločice stajale u `div[data-week="current"]` /
          // `div[data-week="next"]`, a rok se čitao iz teksta taba iznad.
          // Ti okviri VIŠE NE POSTOJE. Pločice su ostale iste
          // (`article.cor-offer-renderer-tile`), ali sada svaka sjedi u
          // `div.sos-offer` koji nosi ISO sedmicu: data-offer-week="2026/45".
          //
          // Zato je scraper od 30.10. vraćao NULU i rušio alarm svaki dan:
          // querySelector('div[data-week="current"]') je bio null, pa se
          // nijedna pločica nije ni pogledala — bez ijedne greške u logu.
          //
          // Obje sedmice i dalje čitamo: sve ponude su u HTML-u, a sljedeća
          // ima validFrom u budućnosti pa je filter po datumu krije dok ne
          // počne. Tab sljedeće sedmice piše samo „Ab Samstag", bez datuma —
          // još jedan razlog da rok računamo iz sedmice, a ne iz teksta.
          //
          // ⚠️ Ovdje smiju SAMO anonimne funkcije (unutar .map i sl.).
          // Strelica pridružena konstanti bi je tsx/esbuild umotao u pomoćnik
          // __name, kojeg u stranici nema → ReferenceError u browseru.
          const izlaz: Array<{ sedmica: string; tab: string; naziv: string; cijena: string; slika: string }> = [];

          // Tekst taba ostaje samo kao rezerva ako ponuda nema sedmicu.
          const tabTekst = (document.querySelector('[class*="week-tab"] button, [role="tab"]')?.textContent ?? '').trim();

          const ponude = Array.from(document.querySelectorAll('div.sos-offer[data-offer-week]'));
          for (const o of ponude) {
            const t = o.querySelector('article.cor-offer-renderer-tile');
            if (!t) continue;

            // ⚠️ Slika: `src` ne postoji (lijeno učitavanje), pravi URL je u
            // data-src. Uzimamo SAMO iz `.cor-offer-image` — prva <img> u
            // pločici je REWE Bonus logo, a u istom bloku stoji i prozirni
            // placeholder SVG; oba se odbacuju po imenu fajla.
            const im = t.querySelector('.cor-offer-image img');
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
              if (!url || !/^https?:\/\//.test(url)) continue;
              if (/placeholder|loyalty-icon/i.test(url)) continue;
              slika = url;
              break;
            }

            izlaz.push({
              sedmica: o.getAttribute('data-offer-week') ?? '',
              tab: tabTekst,
              naziv: (t.querySelector('.cor-offer-information__title')?.textContent ?? '').trim(),
              cijena: (t.querySelector('.cor-offer-price__tag-price')?.textContent ?? '').trim(),
              slika,
            });
          }
          return izlaz;
        })) as SirovaPlocica[];

        if (podaci.length === 0) praznihKategorija += 1;

        for (const a of podaci) {
          // Rok ide iz ISO sedmice same ponude (data-offer-week), a tekst
          // taba ostaje samo kao rezerva za slučaj da sedmica nedostaje.
          const izSedmice = periodIzSedmice(a.sedmica);
          const { validFrom, validTo } = izSedmice.validTo ? izSedmice : periodIzTaba(a.tab);
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
        palihKategorija += 1;
      } finally {
        await page.close();
      }
    }

    // Par kategorija smije zakazati (upozorenje kroz alarm-pad), ali kad
    // padne ČETVRTINA i više, snapshot bi bio ozbiljno okrnjen a status
    // svejedno "ok" — bolje baciti grešku i pustiti retry u index.ts.
    if (palihKategorija >= 4) {
      throw new Error(`REWE: ${palihKategorija}/${Object.keys(KATEGORIJE).length} kategorija palo — probaj ponovo`);
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
