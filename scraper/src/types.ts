/**
 * Gdje ponude nekog lanca vrijede.
 *  'DE'         = cijela Njemačka (Kaufland, Lidl, Netto, Penny, dm, OBI…)
 *  'aldi-sued'  / 'aldi-nord' = dvije polovine Njemačke
 *  (kasnije)    rewe-<regija>, edeka-<regija> po Bundeslandu
 * Umjesto 8.200 kopija istih podataka čuvamo ih jednom po regiji.
 */
export type Scope = 'DE' | 'aldi-sued' | 'aldi-nord';

export interface ScrapedStore {
  name: string;
  slug: string;
  url: string | null;
  logoUrl?: string | null;
  /** regija u kojoj ponude ovog lanca vrijede */
  scope?: Scope;
}

export interface ScrapedOffer {
  productName: string;
  /** null kad izvor ne daje staru cijenu (npr. REWE) -> artikal je "Angebot" */
  oldPrice: number | null;
  newPrice: number;
  category: string | null;
  imageUrl?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
  sourceUrl?: string | null;
  externalId?: string | null;
  /** barkod kad ga izvor da (danas: nijedan; ostavljeno za buduce izvore) */
  ean?: string | null;
}

/**
 * Svaki izvor podataka implementira ovaj interfejs.
 * Danas: kaufda + mock. Sutra se doda novi izvor bez diranja ostatka koda.
 */
export interface Source {
  readonly name: string;
  listStores(plz: string): Promise<ScrapedStore[]>;
  listOffers(store: ScrapedStore, plz: string): Promise<ScrapedOffer[]>;
  close?(): Promise<void>;
}
