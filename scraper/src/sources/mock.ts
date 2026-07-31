import { slugify } from '../normalize.js';
import type { ScrapedOffer, ScrapedStore, Source } from '../types.js';

/**
 * Mock izvor - identican interfejs kao pravi scraper, ali bez mreze.
 * Sluzi za razvoj i testiranje cijelog pipeline-a (scraper -> baza -> API -> UI).
 *   npm run scrape:mock
 */
const STORES = [
  'Lidl',
  'Aldi Sued',
  'REWE',
  'Edeka',
  'Penny',
  'Netto',
  'Kaufland',
  'dm',
] as const;

// Prodavnice koje NE daju staru cijenu -> sve njihove ponude su "Angebot"
const NO_OLD_PRICE = new Set(['rewe']);

const PRODUCTS: Array<[string, string, number]> = [
  ['Rinderhackfleisch 500g', 'Fleisch', 4.99],
  ['Schweineschnitzel 1kg', 'Fleisch', 10.99],
  ['Haehnchenbrust 600g', 'Fleisch', 7.49],
  ['Lachsfilet 250g', 'Fisch', 6.99],
  ['Butter 250g', 'Molkerei', 2.49],
  ['Bio Vollmilch 1L', 'Molkerei', 1.59],
  ['Gouda jung 400g', 'Molkerei', 3.29],
  ['Erdbeeren 500g', 'Obst', 3.99],
  ['Bananen 1kg', 'Obst', 2.29],
  ['Kartoffeln 2,5kg', 'Gemuese', 3.49],
  ['Paprika rot 500g', 'Gemuese', 2.99],
  ['Vollkornbrot 750g', 'Backwaren', 2.79],
  ['Coca-Cola 1,25L', 'Getraenke', 1.99],
  ['Kaffee gemahlen 500g', 'Getraenke', 6.49],
  ['Bier Kiste 20x0,5L', 'Getraenke', 17.99],
  ['Pizza Salami 350g', 'Tiefkuehl', 3.49],
  ['Eis 900ml', 'Tiefkuehl', 4.49],
  ['Zahnpasta 75ml', 'Drogerie', 2.99],
  ['Duschgel 250ml', 'Drogerie', 3.45],
  ['Waschmittel 40WL', 'Haushalt', 12.99],
  ['Toilettenpapier 10 Rollen', 'Haushalt', 6.99],
  ['Katzenfutter 12x100g', 'Tierbedarf', 9.99],
];

/** Deterministicni "random" - isti PLZ uvijek daje iste podatke. */
function seeded(seed: string): () => number {
  let h = 2166136261;
  for (const char of seed) {
    h ^= char.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export class MockSource implements Source {
  readonly name = 'mock';

  async listStores(plz: string): Promise<ScrapedStore[]> {
    const random = seeded(plz);
    return STORES.filter(() => random() > 0.15).map((name) => ({
      name,
      slug: slugify(name),
      url: null,
      logoUrl: null,
    }));
  }

  async listOffers(store: ScrapedStore, plz: string): Promise<ScrapedOffer[]> {
    const random = seeded(`${plz}-${store.slug}`);
    const today = new Date().toISOString().slice(0, 10);
    const validTo = new Date(Date.now() + 5 * 86_400_000).toISOString().slice(0, 10);

    return PRODUCTS.filter(() => random() > 0.45).map(([productName, category, basePrice]) => {
      const cut = 0.15 + random() * 0.5;                        // 15% - 65% popusta
      const newPrice = Math.max(0.19, Math.round(basePrice * (1 - cut) * 100) / 100);
      const hasOldPrice = !NO_OLD_PRICE.has(store.slug);
      return {
        productName,
        oldPrice: hasOldPrice ? basePrice : null,
        newPrice: hasOldPrice ? newPrice : basePrice,
        category,
        imageUrl: null,
        validFrom: today,
        validTo,
        sourceUrl: null,
        externalId: `mock-${store.slug}-${slugify(productName)}`,
      };
    });
  }
}
