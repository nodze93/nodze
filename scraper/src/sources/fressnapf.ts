/**
 * =====================================================================
 *  IZVOR: FRESSNAPF  (Tierbedarf — hrana i oprema za kućne ljubimce)
 * =====================================================================
 *  robots.txt zabranjuje samo cart/checkout/account te parametre `sort=`
 *  i `viewtype=` — ovaj izvor ne koristi nijedan od njih.
 *
 *  BEZ BROWSERA. Sve je u server HTML-u, dovoljan je običan `fetch`.
 *
 *  ⚠️ ROK VAŽENJA JE SENTINEL, NE SAMO DATUM. U schema.org Offer bloku:
 *      "priceValidUntil": "2026-08-05T21:59:59+0000"  → prava akcija
 *      "priceValidUntil": "9999-12-31T22:59:59+0000"  → NIJE na akciji
 *  Ona 9999 je rezervirana vrijednost. Artikal s njom se PRESKAČE — to je
 *  ujedno i filter za akcije i provjera da smo pročitali pravo polje.
 *
 *  ⚠️ STARA CIJENA JE IZVEDENA, NE IZVORNA. Fressnapf je renderuje tek u
 *  browseru, pa je u HTML-u nema. Računa se iz cijene i procenta:
 *      stara = cijena / (1 - procenat/100)
 *  Provjereno: 153,29 € uz −30% → 218,99 €, tačno kao na sajtu. Ako
 *  procenta nema, stara cijena se IZOSTAVLJA (artikal ide kao „Angebot")
 *  — bolje bez procenta nego s izmišljenim.
 *
 *  Cijena je po artiklu, pa je jedan zahtjev po artiklu neizbježan. Zato
 *  MAX_ARTIKALA i pauza: ~400 artikala × 0,35 s ≈ 3 minute.
 *
 *  Zasluge: izvor, sentinel i izvođenje stare cijene preuzeti iz
 *  korisnikovog `fressnapf-bot` (Python); ovdje dodane i SLIKE.
 * =====================================================================
 */
import { config } from '../config.js';
import { cleanProductName, normalizeCategory } from '../normalize.js';
import type { ScrapedOffer, ScrapedStore, Source } from '../types.js';
import { NACIONALNI_PLZ } from './retailers.js';

const BASE = 'https://www.fressnapf.de';

/** Sale kategorije — server-rendered, 48 artikala po stranici. */
const LISTE = [
  '/aktionen-angebote/summer-sale/',
  '/c/hund/sale/',
  '/c/katze/sale/',
  '/c/kleintier/sale/',
  '/c/vogel/sale/',
  '/c/fisch/sale/',
];

/** priceValidUntil kad artikal NIJE na akciji. */
const SENTINEL = '9999';
const MAX_ARTIKALA = 400;
const PAUZA_MS = 350;
const ISTOVREMENO = 4;

function pauza(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function html(putanja: string): Promise<string | null> {
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

/** Cijena i rok iz schema.org Offer bloka. */
export function offerIzHtml(h: string): { cijena: number | null; rok: string | null } {
  let cijena: number | null = null;
  let rok: string | null = null;
  for (const m of h.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
    const blok = m[1] ?? '';
    if (!blok.includes('"Offer"')) continue;
    if (cijena === null) {
      const p = blok.match(/"price"\s*:\s*"?([\d.]+)"?/);
      if (p) cijena = Number(p[1]);
    }
    if (rok === null) {
      const v = blok.match(/"priceValidUntil"\s*:\s*"([^"]+)"/);
      if (v) rok = v[1] ?? null;
    }
  }
  return { cijena: Number.isFinite(cijena) ? cijena : null, rok };
}

/**
 * Stara cijena iz procenta. Vraća null kad procenta nema ili je besmislen —
 * radije bez procenta nego s izmišljenom cijenom.
 */
export function staraIzProcenta(cijena: number, procenat: number | null): number | null {
  if (procenat === null || procenat <= 0 || procenat >= 95) return null;
  const stara = Math.round((cijena / (1 - procenat / 100)) * 100) / 100;
  return stara > cijena ? stara : null;
}

/** ID artikla je na kraju putanje: /p/…-1110837/ */
export function idIzPutanje(putanja: string): string | null {
  return putanja.match(/-(\d{5,9})\/?$/)?.[1] ?? null;
}

/**
 * Slika proizvoda.
 *
 * ⚠️ NE UZIMATI `og:image` — kod Fressnapfa je to GENERIČKI LOGO
 * (`/img/og-fressnapf.jpg`), isti na svakoj stranici.
 *
 * 1) schema.org `"image"` — ono što lanac SAM proglasi slikom proizvoda.
 *    Ovo je pravi izvor: pogodilo 12/12 u probi.
 * 2) rezerva: među 150+ slika na stranici (preporuke, logotipi marki)
 *    traži onu čija putanja sadrži ID artikla.
 *
 * Zašto rezerva uopšte treba: dio artikala ima ime fajla `hash_hash.jpg`
 * BEZ ID-a, pa je samo traženje po ID-u promašivalo 3 od 10 — zato je
 * schema.org sada prvi, a ID drugi.
 */
export function slikaIzHtml(h: string, id: string | null): string | null {
  for (const m of h.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
    const blok = m[1] ?? '';
    if (!blok.includes('"image"')) continue;
    const niz = blok.match(/"image"\s*:\s*\[\s*"([^"]+)"/);
    if (niz?.[1]) return niz[1];
    const jedan = blok.match(/"image"\s*:\s*"([^"]+)"/);
    if (jedan?.[1]) return jedan[1];
  }

  if (!id) return null;
  const sve = [
    ...new Set(
      [...h.matchAll(/https?:\/\/media\.os\.fressnapf\.com\/[^"'\s\\]+\.(?:jpg|jpeg|png|webp)/gi)].map(
        (m) => m[0],
      ),
    ),
  ];
  return sve.find((u) => u.includes(id)) ?? null; // radije ništa nego tuđa slika
}

export class FressnapfSource implements Source {
  readonly name = 'fressnapf';
  private kes: ScrapedOffer[] | null = null;

  async listStores(plz: string): Promise<ScrapedStore[]> {
    if (plz !== NACIONALNI_PLZ) return [];
    return [{ name: 'Fressnapf', slug: 'fressnapf', url: BASE, logoUrl: null, scope: 'DE' }];
  }

  async listOffers(): Promise<ScrapedOffer[]> {
    if (this.kes) return this.kes;

    // 1) skupi linkove na artikle sa sale listinga
    const putanje = new Set<string>();
    for (const lista of LISTE) {
      const h = await html(lista);
      if (!h) {
        console.log(`    [fressnapf] ${lista} nije odgovorio`);
        await pauza(PAUZA_MS);
        continue;
      }
      let nadjeno = 0;
      for (const m of h.matchAll(/href="(\/p\/[^"?#]+)"/g)) {
        const p = m[1];
        if (p && !putanje.has(p)) {
          putanje.add(p);
          nadjeno += 1;
        }
      }
      console.log(`    [fressnapf] ${lista}: ${nadjeno} artikala`);
      await pauza(PAUZA_MS);
    }

    const zaProvjeru = [...putanje].slice(0, MAX_ARTIKALA);
    console.log(`    [fressnapf] ${putanje.size} nađeno, provjeravam ${zaProvjeru.length}`);

    // 2) svaki artikal: cijena + rok iz Offer scheme (jedan zahtjev po artiklu)
    const ponude: ScrapedOffer[] = [];
    let nijeNaAkciji = 0;

    for (let i = 0; i < zaProvjeru.length; i += ISTOVREMENO) {
      const grupa = zaProvjeru.slice(i, i + ISTOVREMENO);
      const rezultati = await Promise.all(
        grupa.map(async (putanja) => {
          const h = await html(putanja);
          return h ? { putanja, h } : null;
        }),
      );

      for (const r of rezultati) {
        if (!r) continue;
        const { cijena, rok } = offerIzHtml(r.h);
        if (cijena === null || cijena <= 0 || !rok) continue;
        if (rok.startsWith(SENTINEL)) {
          nijeNaAkciji += 1;
          continue; // rezervirana vrijednost = nije na akciji
        }
        const validTo = rok.slice(0, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(validTo)) continue;

        const naslov = r.h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '';
        const naziv = cleanProductName(naslov.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
        if (!naziv) continue;

        const pct = r.h.match(/-\s?(\d{1,2})\s?%/)?.[1];
        const id = idIzPutanje(r.putanja);

        ponude.push({
          productName: naziv,
          newPrice: Math.round(cijena * 100) / 100,
          oldPrice: staraIzProcenta(cijena, pct ? Number(pct) : null),
          category: normalizeCategory('Tierbedarf', naziv),
          imageUrl: slikaIzHtml(r.h, id),
          validFrom: null, // Fressnapf ne objavljuje početak, samo rok
          validTo,
          sourceUrl: BASE + r.putanja,
          externalId: id ? `fressnapf-${id}` : null,
          ean: null,
        });
      }
      await pauza(PAUZA_MS);
    }

    const saSlikom = ponude.filter((p) => p.imageUrl).length;
    const saStarom = ponude.filter((p) => p.oldPrice !== null).length;
    console.log(
      `    [slike] Fressnapf: ${ponude.length} artikala, ${saSlikom} sa slikom | ` +
        `${nijeNaAkciji} preskočeno (nije na akciji)`,
    );
    console.log(
      `    [datumi] Fressnapf: ${ponude.length}/${ponude.length} sa datumom | ` +
        `${saStarom} sa starom cijenom (IZVEDENA iz procenta, ne izvorna)`,
    );

    this.kes = ponude;
    return ponude;
  }
}
