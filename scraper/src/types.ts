export interface ScrapedStore {
  name: string;
  slug: string;
  url: string | null;
  logoUrl?: string | null;
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
