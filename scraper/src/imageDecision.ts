/**
 * =====================================================================
 *  Kad slika ide sama, a kad ide čovjeku na pregled
 * =====================================================================
 *  Pravilo koje smo dogovorili: sve što je sigurno postavlja se
 *  AUTOMATSKI, a u red za pregled ide samo ono što je stvarno sporno.
 *  Cilj je da admin otvaraš samo kad te alarm pozove.
 *
 *  Ovdje se NE odlučuje o legalnosti — to je riješeno po izvoru
 *  (OFF, Icecat, stock su unaprijed čisti). Ovdje se odlučuje samo
 *  je li slika TAČNA i dovoljno lijepa.
 *
 *  Namjerno čista funkcija, bez baze i mreže, da se može testirati.
 * =====================================================================
 */
import { imageKey, imageKeyLoose, sizeToken } from './imageCache.js';

export type MatchKind = 'ean' | 'name+size' | 'name' | 'manual';
export type Action = 'auto' | 'review' | 'skip';

export interface Candidate {
  imageUrl: string | null;
  /** EAN slike, ako ga izvor da */
  ean?: string | null;
  /** naziv artikla kod izvora (za poređenje s našim nazivom) */
  title?: string | null;
  source: 'off' | 'obf' | 'icecat' | 'stock' | 'manual' | 'manufacturer' | 'source';
  /** ocjena obrade (maske) 0..1; undefined = obrada nije rađena */
  quality?: number;
}

export interface Decision {
  action: Action;
  /** false => prikazujemo uz "Abbildung ähnlich" */
  exact: boolean;
  matchKind: MatchKind | null;
  matchScore: number;
  reason: string;
}

/** Prag ispod kojeg obrada nije uspjela (rub raščupan, predmet premali...). */
export const MIN_QUALITY = 0.35;
/** Ispod ovoga poklapanje naziva je preslabo da bismo išta postavili. */
export const MIN_NAME_SCORE = 0.6;
/** Od ovoga naviše naziv smatramo pouzdanim. */
export const STRONG_NAME_SCORE = 0.85;

const words = (s: string): string[] =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(' ')
    .filter((w) => w.length > 1);

/** Jaccard po riječima — grubo ali stabilno i lako se objasni. */
export function nameScore(a: string, b: string): number {
  const A = new Set(words(a));
  const B = new Set(words(b));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter += 1;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : Number((inter / union).toFixed(3));
}

/**
 * Odluka za jednog kandidata.
 *
 *   EAN se poklapa                  -> auto, tačno
 *   naziv + ista veličina pakovanja -> auto, tačno
 *   naziv, veličina DRUGA           -> auto, ali "Abbildung ähnlich"
 *   slabo poklapanje / nema slike   -> pregled
 *   obrada pala                     -> pregled
 */
export function decideImage(
  productName: string,
  productEan: string | null | undefined,
  candidate: Candidate,
): Decision {
  if (!candidate.imageUrl) {
    return { action: 'review', exact: false, matchKind: null, matchScore: 0, reason: 'nema slike' };
  }

  // Ručno okačena slika je uvijek mjerodavna.
  if (candidate.source === 'manual') {
    return { action: 'auto', exact: true, matchKind: 'manual', matchScore: 1, reason: 'ručno okačeno' };
  }

  if (candidate.quality !== undefined && candidate.quality < MIN_QUALITY) {
    return {
      action: 'review',
      exact: false,
      matchKind: null,
      matchScore: 0,
      reason: `obrada pala (${candidate.quality})`,
    };
  }

  // 1) EAN — barkod je barkod, nema šta da se odlučuje
  if (productEan && candidate.ean && normalizeEan(productEan) === normalizeEan(candidate.ean)) {
    return { action: 'auto', exact: true, matchKind: 'ean', matchScore: 1, reason: 'EAN se poklapa' };
  }

  // 2) poređenje naziva
  const title = candidate.title ?? '';
  if (!title) {
    return { action: 'review', exact: false, matchKind: null, matchScore: 0, reason: 'izvor nema naziv' };
  }

  const score = nameScore(imageKeyLoose(productName), imageKeyLoose(title));
  if (score < MIN_NAME_SCORE) {
    return {
      action: 'review',
      exact: false,
      matchKind: 'name',
      matchScore: score,
      reason: `slabo poklapanje naziva (${score})`,
    };
  }

  const ourSize = sizeToken(productName);
  const theirSize = sizeToken(title);
  const sameSize = ourSize !== null && theirSize !== null && ourSize === theirSize;

  if (sameSize && score >= STRONG_NAME_SCORE) {
    return {
      action: 'auto',
      exact: true,
      matchKind: 'name+size',
      matchScore: score,
      reason: 'naziv i veličina pakovanja se poklapaju',
    };
  }

  // Naziv jeste, ali veličina nije ista (ili nije poznata) -> "Abbildung ähnlich"
  return {
    action: 'auto',
    exact: false,
    matchKind: sameSize ? 'name+size' : 'name',
    matchScore: score,
    reason: sameSize ? 'naziv slabije siguran' : 'druga veličina pakovanja',
  };
}

/** EAN se poredi bez razmaka i vodećih nula (GTIN-13 vs GTIN-14). */
export function normalizeEan(ean: string): string {
  return ean.replace(/\D/g, '').replace(/^0+/, '');
}

/** Ključ proizvoda koji se UPISUJE u bazu — jedini izvor istine. */
export const productKeyOf = (productName: string): string => imageKey(productName);
