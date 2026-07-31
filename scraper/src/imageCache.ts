/**
 * Cache slika artikala: kljuc -> fotografija.
 *
 * VAZNO o velicini pakovanja:
 * "Nutella 250g", "Nutella 500g" i "Nutella 750g" su TRI RAZLICITA proizvoda
 * sa tri razlicite tegle i tri razlicita barkoda. Zato gramatura ULAZI u kljuc:
 *
 *   "Nutella 750 g"   -> "nutella 750g"
 *   "Nutella 250g"    -> "nutella 250g"
 *   "Coca-Cola 6x1,5L"-> "coca-cola 6x1.5l"
 *
 * `imageKeyLoose` je isti kljuc BEZ velicine i koristi se samo kao druga sansa
 * kad za tacnu velicinu nema fotografije. Tada je slika "priblizna" i to se
 * biljezi (`exact: false`), pa aplikacija moze napisati "Abbildung ähnlich" -
 * isto kako pisu i pravi njemacki letci.
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export interface CachedImage {
  url: string | null;
  /** true = fotografija je za tacno tu velicinu pakovanja */
  exact: boolean;
}

/** Na disku dopustamo i stari format (samo string), pa se cita oboje. */
export type RawImageCache = Record<string, CachedImage | string | null>;

export const CACHE_FILE = resolve(
  process.cwd(),
  process.env.IMAGE_CACHE_FILE ?? './data/image-cache.json',
);

const UNIT = 'kg|g|ml|cl|l|stk|stück|stueck|st|rollen|wl|wäschen|waeschen|pranja|zoll|blatt|beutel';

/**
 * Izvuce oznaku velicine iz naziva: "750g", "1.25l", "6x1.5l", "40st".
 * Vraca null kad naziv ne kaze velicinu (npr. "Parkside Aku Bohrmaschine 20V"
 * -> "20v" je napon, ne pakovanje, ali nam i to razlikuje modele pa je ok).
 */
export function sizeToken(productName: string): string | null {
  const text = productName.toLowerCase().replace(/\s+/g, ' ');

  // multipack: "6x1,5L", "12x100g", "20x0,5L"
  const multi = text.match(new RegExp(`(\\d+)\\s?x\\s?(\\d+(?:[.,]\\d+)?)\\s?(${UNIT})?\\b`));
  if (multi) {
    const unit = multi[3] ?? '';
    return `${multi[1]}x${multi[2]!.replace(',', '.')}${unit}`;
  }

  // pojedinacno: "750 g", "1,25L", "40St", "55 Zoll", "20V"
  const single = text.match(new RegExp(`(\\d+(?:[.,]\\d+)?)\\s?(${UNIT}|v)\\b`));
  if (single) return `${single[1]!.replace(',', '.')}${single[2]}`;

  return null;
}

/** Naziv bez velicine i bez marketinskih rijeci: "nutella", "milbona sir gouda". */
export function imageKeyLoose(productName: string): string {
  return productName
    .toLowerCase()
    .replace(new RegExp(`\\d+\\s?x\\s?\\d+(?:[.,]\\d+)?\\s?(?:${UNIT})?`, 'g'), ' ')
    .replace(new RegExp(`\\d+(?:[.,]\\d+)?\\s?(?:${UNIT}|v)\\b`, 'g'), ' ')
    .replace(/\b(gr|gramm|packung|pack|giant|xxl|big|family)\b/g, ' ')
    .replace(/[^a-zäöüßčćžšđ\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 4)
    .join(' ');
}

/** Pun kljuc: naziv + velicina pakovanja. Ovo je ono cime trazimo fotografiju. */
export function imageKey(productName: string): string {
  const base = imageKeyLoose(productName);
  const size = sizeToken(productName);
  if (!base) return size ?? '';
  return size ? `${base} ${size}` : base;
}

// ---------------------------------------------------------------------
// Citanje / pisanje cachea
// ---------------------------------------------------------------------
const normalize = (value: CachedImage | string | null): CachedImage =>
  typeof value === 'string' ? { url: value, exact: true } : (value ?? { url: null, exact: true });

export async function readRawCache(): Promise<RawImageCache> {
  if (!existsSync(CACHE_FILE)) return {};
  try {
    return JSON.parse(await readFile(CACHE_FILE, 'utf8')) as RawImageCache;
  } catch {
    return {};
  }
}

export async function saveRawCache(cache: RawImageCache): Promise<void> {
  await mkdir(dirname(CACHE_FILE), { recursive: true });
  await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

export const cachedValue = (cache: RawImageCache, key: string): CachedImage | undefined =>
  key in cache ? normalize(cache[key]!) : undefined;

/** Samo zapisi koji imaju sliku - spremno za dnevni scraper. */
export async function loadImageCache(): Promise<Map<string, CachedImage>> {
  const raw = await readRawCache();
  const map = new Map<string, CachedImage>();
  for (const [key, value] of Object.entries(raw)) {
    const entry = normalize(value);
    if (entry.url) map.set(key, entry);
  }
  return map;
}
