/**
 * =====================================================================
 *  IZVOR: TRINKGUT  (pića, EDEKA grupa)
 * =====================================================================
 *  Najjednostavniji izvor koji imamo — nema browsera, nema API-ja:
 *  jedan HTTP zahtjev na /angebote i sve je u tom HTML-u.
 *
 *  Shopware shop sa STABILNIM imenima klasa (.product-box, .product-name,
 *  .product-price), za razliku od CSS-in-JS hasheva koji pucaju svakim
 *  deployom. Zato se čita regexom, bez Playwrighta.
 *
 *  ⚠️ TRI ZAMKE (sve provjerene u pravom browseru 03.08.2026):
 *
 *  1) CIJENA JE RAZBIJENA TAGOM:
 *         <p class="product-price"> 11.<sup>99</sup> </p>
 *     Regex koji traži broj u tekstu vidi „11." i stane. Zato se iz bloka
 *     PRVO skinu tagovi, pa tek onda parsira.
 *
 *  2) CIJENA IMA TAČKU, NE ZAREZ ("11.99"), suprotno od ostatka Njemačke.
 *     Ide kroz `normPriceText(txt, true)` — isto kao Kaufland.
 *
 *  3) NEMA STARE CIJENE NI PROCENTA. Provjereno: 0 precrtanih elemenata,
 *     0 pojava „statt"/„UVP". Svi artikli su „Angebot", kao REWE — dakle
 *     NE ulaze u „Top ponude danas" ni u preporuku, samo u punu listu.
 *
 *  Rok važenja stoji JEDNOM za cijelu stranicu:
 *      „Gültig vom 03.08.2026 bis 08.08.2026 | Nur solange der Vorrat reicht."
 *  Bez njega se NE upisuje ništa — radije prazno nego izmišljen datum.
 *
 *  robots.txt dozvoljava /angebote. Zabranjuje SVE putanje sa upitnikom
 *  (pravilo „Disallow" na zvjezdica-kosa-crta-upitnik), pa paginaciju ne
 *  diramo — a i nema je: 57 ponuda na jednoj strani, „?p=2" vraća isto.
 *  (Napomena: to pravilo se ne smije doslovno prepisati u ovaj komentar
 *  jer njegova zvjezdica-kosa-crta zatvori blok-komentar prije vremena.)
 *
 *  Zasluge: logika preuzeta iz korisnikovog `trinkgut-bot` (Python) i
 *  prevedena da radi kao i ostali lanci u ovom scraperu.
 * =====================================================================
 */
import { config } from '../config.js';
import { cleanProductName, normalizeCategory, parsePrice } from '../normalize.js';
import { fetchRobots, isAllowed, type RobotsRules } from '../robots.js';
import type { ScrapedOffer, ScrapedStore, Source } from '../types.js';
import { NACIONALNI_PLZ, normPriceText } from './retailers.js';

const BASE = 'https://www.trinkgut.de';
const LISTA = '/angebote';

/**
 * „Gültig vom 03.08.2026 bis 08.08.2026".
 * „ü" se u njemačkom zna pisati i kao „ue" — bez te varijante regex promaši
 * „Gueltig" i scraper bi tiho vratio nula redova.
 */
const ROK_RE =
  /G(?:ü|ue|u)ltig\s+vom\s*(\d{1,2}\.\d{1,2}\.\d{4})\s*bis\s*(\d{1,2}\.\d{1,2}\.\d{4})/i;

function uIso(njemacki: string): string | null {
  const d = njemacki.split('.');
  if (d.length !== 3) return null;
  const [dd, mm, gggg] = d;
  if (!dd || !mm || !gggg) return null;
  return `${gggg}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

/** Skini HTML tagove i sabij razmake — „11.<sup>99</sup>" → „11.99". */
export function bezTagova(h: string): string {
  return h
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Rok važenja cijele stranice. Vraća null/null kad ga nema. */
export function procitajRok(tekst: string): { validFrom: string | null; validTo: string | null } {
  const m = ROK_RE.exec(tekst);
  if (!m?.[1] || !m[2]) return { validFrom: null, validTo: null };
  return { validFrom: uIso(m[1]), validTo: uIso(m[2]) };
}

/**
 * Razbij stranicu na blokove artikala. Zadnji blok nosi i podnožje
 * stranice, ali to ne smeta jer se iz svakog bloka uzima SAMO PRVA
 * pojava svakog polja.
 */
export function kutije(h: string): string[] {
  return h.split(/<div[^>]+class="[^"]*\bproduct-box\b/).slice(1);
}

/** Vrijednost prvog elementa sa datom klasom unutar bloka. */
function poljeIzBloka(blok: string, klasa: string): string | null {
  const re = new RegExp(`<[a-z]+[^>]+class="[^"]*\\b${klasa}\\b[^"]*"[^>]*>([\\s\\S]*?)</[a-z]+>`, 'i');
  const m = re.exec(blok);
  const txt = m?.[1] ? bezTagova(m[1]) : '';
  return txt.length > 0 ? txt : null;
}

/**
 * Slika: iz `srcset` uzmi NAJVEĆU (zadnji unos je products_xl 462w),
 * inače `src` (products_md). Trinkgut daje sliku za svih 57 artikala,
 * pa Open Food Facts ovdje uopšte ne treba.
 */
export function slikaIzKutije(blok: string): string | null {
  const ss = /<img[^>]+srcset="([^"]+)"/i.exec(blok);
  if (ss?.[1]) {
    const zadnji = ss[1].split(',').pop()?.trim().split(/\s+/)[0];
    if (zadnji?.startsWith('http')) return zadnji;
  }
  const src = /<img[^>]+src="(https?:\/\/[^"]+)"/i.exec(blok);
  return src?.[1] ?? null;
}

/** Link na artikal (a.product-image-link nosi i puni naziv u `title`). */
export function linkIzKutije(blok: string): string | null {
  const m = /<a[^>]+href="(https?:\/\/[^"]+)"/i.exec(blok);
  return m?.[1] ?? null;
}

/**
 * Naziv + pakovanje. Opis nosi korisnu informaciju („Kasten = 20 x 0,5 l"),
 * ali i šum („(1 l = € 1.98) zzgl. € 0.25 Pfand"). Zato se opis siječe na
 * prvoj zagradi i na „zzgl." — kod pića je pakovanje ključno za razumjeti
 * cijenu, pa ga vrijedi zadržati.
 */
export function nazivSaPakovanjem(naziv: string, opis: string | null): string {
  if (!opis) return naziv;
  const cist = opis.split('(')[0]?.split(/zzgl\./i)[0]?.trim().replace(/[,;]+$/, '') ?? '';
  if (!cist || cist.length < 3) return naziv;
  return `${naziv} — ${cist}`.slice(0, 140);
}

async function dohvati(putanja: string): Promise<string | null> {
  try {
    const res = await fetch(BASE + putanja, {
      headers: { 'User-Agent': config.userAgent, 'Accept-Language': 'de-DE,de;q=0.9' },
      signal: AbortSignal.timeout(config.timeoutMs),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export class TrinkgutSource implements Source {
  readonly name = 'trinkgut';
  private kes: ScrapedOffer[] | null = null;
  private robots: RobotsRules | null | undefined;

  async listStores(plz: string): Promise<ScrapedStore[]> {
    // Jedna nacionalna stranica, jedan rok za sve → ide u nacionalnu „kantu".
    if (plz !== NACIONALNI_PLZ) return [];
    return [
      { name: 'Trinkgut', slug: 'trinkgut', url: BASE + LISTA, logoUrl: null, scope: 'DE' },
    ];
  }

  async listOffers(): Promise<ScrapedOffer[]> {
    if (this.kes) return this.kes;

    if (config.respectRobots) {
      if (this.robots === undefined) this.robots = await fetchRobots(BASE, config.userAgent);
      if (!isAllowed(this.robots ?? null, LISTA)) {
        console.log('    [trinkgut] robots.txt ne dozvoljava /angebote — preskačem');
        this.kes = [];
        return [];
      }
    }

    const h = await dohvati(LISTA);
    if (!h) {
      console.log('    [trinkgut] stranica nedostupna — 0 ponuda');
      this.kes = [];
      return [];
    }

    const { validFrom, validTo } = procitajRok(bezTagova(h));
    if (!validTo) {
      // Bez roka bi svi artikli visjeli zauvijek. Radije ništa nego pogrešno.
      console.log(
        '    [trinkgut] nije nađen rok („Gültig vom … bis …") — stranica je vjerovatno' +
          ' promijenjena, NE upisujem ništa',
      );
      this.kes = [];
      return [];
    }

    const ponude: ScrapedOffer[] = [];
    const vidjeno = new Set<string>();

    for (const blok of kutije(h)) {
      const sirovNaziv = poljeIzBloka(blok, 'product-name');
      const sirovaCijena = poljeIzBloka(blok, 'product-price');
      if (!sirovNaziv || !sirovaCijena) continue;

      // ZAMKA 2: „11.99" je tačka kao decimalni zarez (kao Kaufland).
      const cijena = parsePrice(normPriceText(sirovaCijena, true));
      if (cijena === null || cijena <= 0) continue;

      const naziv = cleanProductName(
        nazivSaPakovanjem(sirovNaziv, poljeIzBloka(blok, 'product-description')),
      );
      if (!naziv) continue;

      const link = linkIzKutije(blok);
      // Isti artikal se zna ponoviti u više sekcija — ključ je link (stabilan)
      // ili naziv+cijena kad linka nema.
      const kljuc = link ?? `${naziv}|${cijena}`;
      if (vidjeno.has(kljuc)) continue;
      vidjeno.add(kljuc);

      ponude.push({
        productName: naziv,
        newPrice: cijena,
        oldPrice: null, // ZAMKA 3: Trinkgut ne objavljuje staru cijenu
        category: normalizeCategory('Getränke', naziv),
        imageUrl: slikaIzKutije(blok),
        validFrom,
        validTo,
        sourceUrl: link ?? BASE + LISTA,
        externalId: link ? `trinkgut-${link.split('/').pop()}` : null,
        ean: null,
      });
    }

    const saSlikom = ponude.filter((p) => p.imageUrl).length;
    console.log(`    [slike] Trinkgut: ${ponude.length} artikala, ${saSlikom} sa slikom`);
    console.log(
      `    [datumi] Trinkgut: ${validFrom ?? '—'} → ${validTo}` +
        ' | (Trinkgut nema stare cijene → sve su „Angebot")',
    );

    this.kes = ponude;
    return ponude;
  }
}
