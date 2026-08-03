/**
 * Sve "prljave" stringove sa sajta prevodimo u ciste podatke ovdje.
 * Njemacki format: zapeta je decimalni separator, tacka je hiljade.
 *   "2,99 €"      -> 2.99
 *   "1.299,00 €"  -> 1299
 *   "-,99 €"      -> 0.99   (cesto na letcima)
 *   "statt 4,99"  -> 4.99
 *   "ab 1,99"     -> 1.99
 */
export function parsePrice(raw: string | null | undefined): number | null {
  if (!raw) return null;

  let text = String(raw)
    .replace(/\u00a0/g, ' ')
    .replace(/statt|nur|ab|je|uvp|€|eur/gi, ' ')
    .trim();

  // "-,99" ili "–.99" => 0,99
  text = text.replace(/^[-–—]\s*[.,]/, '0,');

  const match = text.match(/\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?/);
  if (!match) return null;

  let num = match[0];
  if (num.includes(',')) {
    num = num.replace(/\./g, '').replace(',', '.');       // 1.299,00 -> 1299.00
  } else if (/\.\d{3}$/.test(num)) {
    num = num.replace(/\./g, '');                          // 1.299 -> 1299
  }

  const value = Number.parseFloat(num);
  if (!Number.isFinite(value) || value < 0 || value > 100_000) return null;
  return Math.round(value * 100) / 100;
}

/** "  Rinderhackfleisch   500g\n(je kg 5,98)" -> "Rinderhackfleisch 500g" */
/**
 * =====================================================================
 *  HTML ENTITETI \u2192 pravi znakovi
 * =====================================================================
 *  Izvori koje \u010ditamo REGEXOM iz sirovog HTML-a (Fressnapf, Trinkgut)
 *  dobiju naziv onako kako stoji u kodu stranice, pa se na sajtu vidjelo:
 *
 *      DOG&#39;S LOVE Adult Lamm      umjesto  DOG'S LOVE Adult Lamm
 *      N&amp;D Farmina                umjesto  N&D Farmina
 *      Adult Maxi &gt;25kg            umjesto  Adult Maxi >25kg
 *
 *  Izvori koji idu kroz browser (`textContent`) ovo nemaju \u2014 tamo entitete
 *  dekodira sam browser. Zato stoji OVDJE, u `cleanProductName`: jedno
 *  mjesto kroz koje prolazi SVAKI naziv, iz svakog izvora i iz JSON uvoza.
 *
 *  Radi se u JEDNOM prolazu (replacer funkcija), ne lan\u010dano \u2014 ina\u010de bi
 *  \u201e&amp;lt;" postalo \u201e<" umjesto \u201e&lt;" (dvostruko dekodiranje).
 */
const ENTITETI: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  auml: '\u00e4', ouml: '\u00f6', uuml: '\u00fc', Auml: '\u00c4', Ouml: '\u00d6', Uuml: '\u00dc',
  szlig: '\u00df', euro: '\u20ac', reg: '\u00ae', copy: '\u00a9', trade: '\u2122',
  ndash: '\u2013', mdash: '\u2014', hellip: '\u2026', deg: '\u00b0',
};

export function dekodirajEntitete(raw: string): string {
  return raw.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (cijeli, tijelo: string) => {
    if (tijelo.startsWith('#x') || tijelo.startsWith('#X')) {
      const broj = Number.parseInt(tijelo.slice(2), 16);
      return Number.isFinite(broj) && broj > 0 ? String.fromCodePoint(broj) : cijeli;
    }
    if (tijelo.startsWith('#')) {
      const broj = Number.parseInt(tijelo.slice(1), 10);
      return Number.isFinite(broj) && broj > 0 ? String.fromCodePoint(broj) : cijeli;
    }
    return ENTITETI[tijelo] ?? cijeli; // nepoznat entitet ostaje kakav jeste
  });
}

export function cleanProductName(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const name = dekodirajEntitete(String(raw))
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^(angebot|aktion|neu)[:\s-]+/i, '')
    .trim();
  return name.length >= 2 ? name.slice(0, 200) : null;
}

export function slugify(raw: string): string {
  return raw
    .toLowerCase()
    // Umlauti PRVI - inace ih NFD razbije na "u + kvacica" pa ostane samo "u",
    // i onda bi "Aldi Sued" i "Aldi Süd" dobili razlicite slugove.
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Kategorije sa sajta svodimo na nas mali fiksni set. */
const CATEGORY_MAP: Array<[RegExp, string]> = [
  [/fleisch|wurst|hack|steak|schnitzel|haehnchen|hähnchen|salami|schinken|grill/i, 'Fleisch'],
  [/fisch|lachs|garnel|thunfisch|shrimp|forelle/i, 'Fisch'],
  [/milch|kaese|käse|joghurt|butter|quark|sahne|molkerei|mozzarella|gouda/i, 'Molkerei'],
  [/obst|apfel|banane|beere|erdbeer|orange|trauben|melone|zitrus/i, 'Obst'],
  [/gemuese|gemüse|kartoffel|tomate|salat|gurke|paprika|zwiebel|rucola/i, 'Gemuese'],
  [/brot|backwaren|broetchen|brötchen|croissant|kuchen|toast/i, 'Backwaren'],
  [/getraenk|getränk|wasser|cola|saft|bier|wein|kaffee|tee|limonade|espresso/i, 'Getraenke'],
  [/tiefkuehl|tiefkühl|pizza|eis|frost/i, 'Tiefkuehl'],
  [/drogerie|shampoo|zahnpasta|duschgel|creme|deo|kosmetik/i, 'Drogerie'],
  [/haushalt|reiniger|waschmittel|papier|spuel|spül|muellbeutel/i, 'Haushalt'],
  [/baby|windel|brei/i, 'Baby'],
  [/tier|hunde|katzen|futter/i, 'Tierbedarf'],
  [/elektro|technik|tv|fernseher|handy|laptop|kopfhoerer|kopfhörer/i, 'Elektronik'],
  [/spielzeug|garten|moebel|möbel|textil|kleidung|schuhe/i, 'Sonstiges'],
];

export function normalizeCategory(raw: string | null | undefined, fallbackFrom?: string | null): string | null {
  const candidates = [raw, fallbackFrom].filter(Boolean) as string[];
  for (const text of candidates) {
    for (const [pattern, label] of CATEGORY_MAP) {
      if (pattern.test(text)) return label;
    }
  }
  if (raw) {
    const cleaned = cleanProductName(raw);
    if (cleaned) return cleaned.slice(0, 60);
  }
  return null;
}

/**
 * Zadnja kapija prije baze. Vraca null za sve sto ne treba upisivati.
 * Pravilo iz specifikacije: ako stara cijena nije veca od nove,
 * tretiramo je kao da je nema (artikal ide kao "Angebot").
 */
export function sanitizeOffer<T extends { productName: string | null; oldPrice: number | null; newPrice: number | null }>(
  offer: T,
): (T & { productName: string; newPrice: number }) | null {
  const productName = cleanProductName(offer.productName);
  if (!productName) return null;
  if (offer.newPrice === null || !Number.isFinite(offer.newPrice)) return null;

  let oldPrice =
    offer.oldPrice !== null && offer.oldPrice > offer.newPrice ? offer.oldPrice : null;

  // ZAŠTITA OD PARSERA HILJADA. Njemački zapis "1.249,00" znači 1249, a ne
  // 1,24 — ko to pogriješi, dobije popust od 99,9% umjesto ispravnog. Takva
  // greška je tiha: cijena izgleda uredno, samo je 1000× manja.
  // Popust preko 95% je gotovo uvijek znak da je parser pukao, pa staru
  // cijenu bacamo (artikal ostaje kao "Angebot") i glasno javljamo.
  if (oldPrice !== null && offer.newPrice > 0) {
    const postotak = (1 - offer.newPrice / oldPrice) * 100;
    if (postotak > 95) {
      console.log(
        `    [sumnjivo] ${productName.slice(0, 50)}: ${oldPrice} → ${offer.newPrice} ` +
          `(${postotak.toFixed(0)}%) — stara cijena odbačena, provjeri parser hiljada`,
      );
      oldPrice = null;
    }
  }

  return { ...offer, productName, newPrice: offer.newPrice, oldPrice };
}
