/**
 * =====================================================================
 *  SVI LANCI ZAJEDNO
 * =====================================================================
 *  Spaja tri izvora u jedan, da ostatak scrapera (index.ts) ne mora znati
 *  koji lanac odakle dolazi — svi prolaze kroz isti snapshot, iste datume,
 *  isto čišćenje duplikata i istu provjeru slika:
 *
 *    RetailersSource  Aldi Süd · Aldi Nord · Kaufland   (HTML, Playwright)
 *    LidlSource       Lidl                              (otvoreni Lidl Plus API)
 *    ReweSource       REWE                              (HTML, dijeli browser)
 *
 *  Ko gdje ide, odlučuje `listStores(plz)` svakog izvora:
 *  nacionalni lanci se javljaju samo za NACIONALNI_PLZ, regionalni za svoje
 *  gradove. Zato se Lidl i REWE povuku JEDNOM, a ne po svakom gradu.
 * =====================================================================
 */
import type { ScrapedOffer, ScrapedStore, Source } from '../types.js';
import { LidlSource } from './lidl.js';
import { RetailersSource } from './retailers.js';
import { ReweSource } from './rewe.js';

export class SviLanciSource implements Source {
  readonly name = 'svi';
  private readonly retailers: RetailersSource;
  private readonly lidl: LidlSource;
  private readonly rewe: ReweSource;

  constructor(opts: { dryRun: boolean }) {
    this.retailers = new RetailersSource(opts);
    this.lidl = new LidlSource();
    // REWE dijeli browser sa RetailersSource — nema smisla dizati drugi Chromium.
    this.rewe = new ReweSource(() => this.retailers.novaStranica());
  }

  async listStores(plz: string): Promise<ScrapedStore[]> {
    const grupe = await Promise.all([
      this.retailers.listStores(plz),
      this.lidl.listStores(plz),
      this.rewe.listStores(plz),
    ]);
    return grupe.flat();
  }

  async listOffers(store: ScrapedStore, plz: string): Promise<ScrapedOffer[]> {
    if (store.slug === 'lidl') return this.lidl.listOffers();
    if (store.slug === 'rewe') return this.rewe.listOffers();
    return this.retailers.listOffers(store, plz);
  }

  async close(): Promise<void> {
    await this.retailers.close();
  }
}
