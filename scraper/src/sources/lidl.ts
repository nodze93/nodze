/**
 * =====================================================================
 *  IZVOR: LIDL  (otvoreni Lidl Plus API)
 * =====================================================================
 *  Lidlove NAMIRNICE se ne mogu čitati sa sajta — njihov Prospekt je
 *  flipbook od ~70 SLIKA, u tekstu nema ničega (provjereno). ALI Lidl Plus
 *  ima otvoren API, bez logina, ključa i posebnih headera:
 *
 *    GET https://stores.lidlplus.com/api/v4/DE                  → 3.269 filijala
 *    GET https://offers.lidlplus.com/app/api/v4/DE/{key}/offers → akcije te filijale
 *
 *  ⚠️ ZAMKA U CIJENAMA (ovdje se lako pogriješi 1000×):
 *      priceBox.largePartNumeric = NOVA cijena        (3.79)
 *      priceBox.smallPartNumeric = STARA cijena       (4.98)  ← NISU CENTI!
 *      priceBox.strikethrough    = boolean, ne iznos
 *  Ako se smallPartNumeric shvati kao centi, dobiješ "3.79 + 0.498".
 *  Stara cijena vrijedi SAMO kad je strikethrough = true.
 *
 *  Akcije su NACIONALNE — iste u cijeloj Njemačkoj. Zato uzimamo uzorak
 *  filijala (par po pokrajini) i sve spojimo u jednu nacionalnu listu
 *  (scope 'DE'), umjesto da prepisujemo isto po gradovima.
 *
 *  Zasluge: logika mapiranja preuzeta iz korisnikovog `prospekt-bot`
 *  (Python) i prevedena da radi kao i ostali lanci u ovom scraperu.
 * =====================================================================
 */
import { config } from '../config.js';
import { cleanProductName, normalizeCategory } from '../normalize.js';
import type { ScrapedOffer, ScrapedStore, Source } from '../types.js';
import { NACIONALNI_PLZ } from './retailers.js';

const STORES_URL = 'https://stores.lidlplus.com/api/v4/DE';
const OFFERS_URL = (key: string) => `https://offers.lidlplus.com/app/api/v4/DE/${key}/offers`;

/** Koliko filijala ispitati. Ponude su nacionalne — uzorak je dovoljan. */
const PO_POKRAJINI = 2;
const MAX_FILIJALA = 40;
const PAUZA_MS = 400;

interface LidlStore {
  storeKey?: string;
  postalCode?: string;
  state?: string;
}

interface LidlPriceBox {
  largePartNumeric?: unknown;
  smallPartNumeric?: unknown;
  strikethrough?: unknown;
}

interface LidlOffer {
  id?: string;
  title?: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
  priceBox?: LidlPriceBox;
  startValidityDate?: string;
  endValidityDate?: string;
}

function pauza(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function json<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': config.userAgent, 'Accept-Language': 'de-DE,de;q=0.9' },
      signal: AbortSignal.timeout(config.timeoutMs),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Uzorak filijala: par po pokrajini, da pokrijemo cijelu zemlju. */
export function uzorakFilijala(
  stores: LidlStore[],
  poPokrajini = PO_POKRAJINI,
  najvise = MAX_FILIJALA,
): LidlStore[] {
  const poDrzavi = new Map<string, LidlStore[]>();
  for (const s of stores) {
    const kljuc = s.state ?? '?';
    const lista = poDrzavi.get(kljuc) ?? [];
    if (lista.length < poPokrajini) {
      lista.push(s);
      poDrzavi.set(kljuc, lista);
    }
  }
  return [...poDrzavi.values()].flat().slice(0, najvise);
}

/**
 * Nova i stara cijena iz priceBoxa. Vidi upozorenje na vrhu fajla —
 * smallPartNumeric je STARA CIJENA, ne centi, i vrijedi samo uz strikethrough.
 */
export function cijeneIzBoxa(box: LidlPriceBox | undefined): {
  nova: number | null;
  stara: number | null;
} {
  if (!box) return { nova: null, stara: null };
  const nova = typeof box.largePartNumeric === 'number' ? box.largePartNumeric : null;
  const stara =
    box.strikethrough === true && typeof box.smallPartNumeric === 'number'
      ? box.smallPartNumeric
      : null;
  return { nova, stara };
}

/** "WAGNER" + "Wagner Flammkuchen…" → ne dupliraj marku u nazivu. */
export function spojiMarku(brand: string, title: string): string {
  const t = title.trim();
  const b = brand.trim();
  if (!b) return t;
  const golo = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const prvaRijec = b.split(/\s+/)[0] ?? '';
  return golo(t).startsWith(golo(prvaRijec)) ? t : `${b} ${t}`;
}

export class LidlSource implements Source {
  readonly name = 'lidl';
  private kes: ScrapedOffer[] | null = null;

  async listStores(plz: string): Promise<ScrapedStore[]> {
    // Lidl je nacionalan → ide samo u nacionalnu "kantu".
    if (plz !== NACIONALNI_PLZ) return [];
    return [
      {
        name: 'Lidl',
        slug: 'lidl',
        url: 'https://www.lidl.de/',
        logoUrl: null,
        scope: 'DE',
      },
    ];
  }

  async listOffers(): Promise<ScrapedOffer[]> {
    if (this.kes) return this.kes;

    const filijale = await json<LidlStore[]>(STORES_URL);
    if (!filijale || filijale.length === 0) {
      console.log('    [lidl] API filijala nije odgovorio — 0 ponuda');
      this.kes = [];
      return [];
    }

    const uzorak = uzorakFilijala(filijale);
    console.log(`    [lidl] ${filijale.length} filijala ukupno, ispitujem ${uzorak.length}`);

    // Ista ponuda se pojavi u mnogo filijala — spajamo po id-u ponude.
    const poId = new Map<string, ScrapedOffer>();
    let pali = 0;

    for (const f of uzorak) {
      const key = f.storeKey;
      if (!key) continue;

      const odgovor = await json<{ offers?: LidlOffer[] }>(OFFERS_URL(key));
      if (!odgovor) {
        pali += 1;
        await pauza(PAUZA_MS);
        continue;
      }

      for (const o of odgovor.offers ?? []) {
        if (!o.id || poId.has(o.id)) continue;

        const { nova, stara } = cijeneIzBoxa(o.priceBox);
        if (nova === null || nova <= 0) continue; // kampanje bez cijene

        const validTo = (o.endValidityDate ?? '').slice(0, 10);
        if (validTo.length !== 10) continue; // bez roka se ne prikazuje
        const validFrom = (o.startValidityDate ?? '').slice(0, 10);

        const naziv = cleanProductName(spojiMarku(o.brand ?? '', o.title ?? ''));
        if (!naziv) continue;

        poId.set(o.id, {
          productName: naziv,
          newPrice: Math.round(nova * 100) / 100,
          oldPrice: stara !== null && stara > nova ? Math.round(stara * 100) / 100 : null,
          category: normalizeCategory(o.category ?? null, naziv),
          imageUrl: o.imageUrl ?? null,
          validFrom: validFrom.length === 10 ? validFrom : null,
          validTo,
          sourceUrl: 'https://www.lidl.de/',
          externalId: `lidl-${o.id}`,
          ean: null,
        });
      }

      await pauza(PAUZA_MS);
    }

    const ponude = [...poId.values()];
    const saDatumom = ponude.filter((p) => p.validTo).length;
    const saSlikom = ponude.filter((p) => p.imageUrl).length;
    const saStarom = ponude.filter((p) => p.oldPrice !== null).length;
    console.log(
      `    [slike] Lidl: ${ponude.length} artikala, ${saSlikom} sa slikom` +
        (pali ? ` | ${pali} filijala nije odgovorilo` : ''),
    );
    console.log(
      `    [datumi] Lidl: ${saDatumom}/${ponude.length} sa datumom | ${saStarom} sa starom cijenom`,
    );

    this.kes = ponude;
    return ponude;
  }
}
