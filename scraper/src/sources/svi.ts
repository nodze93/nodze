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
 *    ReweSource       REWE                              (HTML BEZ JS-a)
 *    ObiSource        OBI                               (HTML SA JS-om + Nuxt payload)
 *    FressnapfSource  Fressnapf                         (server HTML, bez browsera)
 *
 *  Ko gdje ide, odlučuje `listStores(plz)` svakog izvora:
 *  nacionalni lanci se javljaju samo za NACIONALNI_PLZ, regionalni za svoje
 *  gradove. Zato se Lidl i REWE povuku JEDNOM, a ne po svakom gradu.
 * =====================================================================
 */
import type { ScrapedOffer, ScrapedStore, Source } from '../types.js';
import { FressnapfSource } from './fressnapf.js';
import { LidlSource } from './lidl.js';
import { ObiSource } from './obi.js';
import { RetailersSource } from './retailers.js';
import { ReweSource } from './rewe.js';

export class SviLanciSource implements Source {
  readonly name = 'svi';
  private readonly retailers: RetailersSource;
  private readonly lidl: LidlSource;
  private readonly rewe: ReweSource;
  private readonly obi: ObiSource;
  private readonly fressnapf: FressnapfSource;

  constructor(opts: { dryRun: boolean }) {
    this.retailers = new RetailersSource(opts);
    this.lidl = new LidlSource();
    // REWE dijeli browser sa RetailersSource, ali BEZ JavaScripta:
    // njihov sadržaj je već u HTML-u, a kad se skripta izvrši pregazi listu
    // (traži izbor marketa) pa ostane prazno — zato `true`.
    this.rewe = new ReweSource(() => this.retailers.novaStranica({ bezJs: true }));
    // OBI obrnuto od REWE-a: listing se BEZ JavaScripta uopšte ne prikaže
    // (Baqend Speed Kit kroz Service Worker), pa mu treba pun browser.
    // `browserUa` jer njihov keš sloj ne renderuje sadržaj za `kodnas-bot` UA
    // — prvi pokušaj je zato istekao na waitForSelector sa 0 artikala.
    this.obi = new ObiSource(() => this.retailers.novaStranica({ browserUa: true }));
    // Fressnapf ne treba browser — sve je u server HTML-u.
    this.fressnapf = new FressnapfSource();
  }

  async listStores(plz: string): Promise<ScrapedStore[]> {
    const grupe = await Promise.all([
      this.retailers.listStores(plz),
      this.lidl.listStores(plz),
      this.rewe.listStores(plz),
      this.obi.listStores(plz),
      this.fressnapf.listStores(plz),
    ]);
    return grupe.flat();
  }

  async listOffers(store: ScrapedStore, plz: string): Promise<ScrapedOffer[]> {
    if (store.slug === 'lidl') return this.lidl.listOffers();
    if (store.slug === 'rewe') return this.rewe.listOffers();
    if (store.slug === 'obi') return this.obi.listOffers();
    if (store.slug === 'fressnapf') return this.fressnapf.listOffers();
    return this.retailers.listOffers(store, plz);
  }

  async close(): Promise<void> {
    await this.retailers.close();
  }
}
