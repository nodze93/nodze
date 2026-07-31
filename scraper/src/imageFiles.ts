/**
 * Ciste pomocne funkcije za slike - bez baze i bez mreze,
 * pa se mogu testirati direktno (i test se ne zadrzava na pg konekciji).
 */
import { createHash } from 'node:crypto';

/** Da li URL pokazuje na tudji server (pa ga treba skinuti k nama). */
export const isRemote = (url: string): boolean => /^https?:\/\//i.test(url);

/** Isti URL -> uvijek isto ime fajla, pa se slika ne skida dvaput. */
export const fileNameFor = (url: string, ext: string): string =>
  `${createHash('sha1').update(url).digest('hex').slice(0, 20)}.${ext}`;

/**
 * Ime fajla iz SADRZAJA slike, ne iz URL-a.
 *
 * Vazno za storage: izvor istu fotografiju artikla cesto servira sa razlicitih
 * URL-ova (po prodavnici, po letku, sa razlicitim query parametrima). Hash
 * sadrzaja znaci da se ista slika na disku cuva SAMO JEDNOM, bez obzira koliko
 * URL-ova i koliko redova u bazi na nju pokazuje.
 */
export const contentNameFor = (data: Buffer | Uint8Array, ext: string): string =>
  `${createHash('sha1').update(data).digest('hex').slice(0, 20)}.${ext}`;

export interface ProcessOptions {
  /** duza strana u pikselima */
  maxSize: number;
  format: 'webp' | 'jpeg' | 'avif' | 'original';
  quality: number;
}

export interface ProcessResult {
  data: Buffer;
  ext: string;
  width: number | null;
  height: number | null;
  /** true ako je slika stvarno obradjena (sharp dostupan i slika ispravna) */
  processed: boolean;
}

/**
 * Smanji sliku i pretvori u WebP.
 *
 * Ovo je najveca usteda na storage-u. Izmjereno na testnim slikama:
 *   original 1000px JPEG:  284 KB (jednostavan artikal) - 602 KB (puna tekstura)
 *   400px WebP q80:        3.7 KB                       -  42 KB
 * Dakle 10-20x manje, a kartici treba slika od ~110px (retina ~330px).
 *
 * Ako `sharp` nije dostupan ili je slika neispravna, vraca original nedirnut -
 * pipeline i dalje radi, samo bez ustede.
 */
export async function processImage(
  input: Buffer,
  options: ProcessOptions,
  fallbackExt: string,
): Promise<ProcessResult> {
  if (options.format === 'original') {
    return { data: input, ext: fallbackExt, width: null, height: null, processed: false };
  }
  try {
    const { default: sharp } = await import('sharp');
    const pipeline = sharp(input, { failOn: 'none' })
      .rotate()
      .resize(options.maxSize, options.maxSize, { fit: 'inside', withoutEnlargement: true });

    const encoded =
      options.format === 'webp'
        ? pipeline.webp({ quality: options.quality })
        : options.format === 'avif'
          ? pipeline.avif({ quality: options.quality })
          : pipeline.jpeg({ quality: options.quality, mozjpeg: true });

    const { data, info } = await encoded.toBuffer({ resolveWithObject: true });
    return {
      data,
      ext: options.format === 'jpeg' ? 'jpg' : options.format,
      width: info.width,
      height: info.height,
      processed: true,
    };
  } catch {
    return { data: input, ext: fallbackExt, width: null, height: null, processed: false };
  }
}
