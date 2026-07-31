/**
 * Spajanje naziva artikla sa fotografijom - cista logika, bez mreze i baze.
 * Zbog ovoga se moze testirati direktno, a i import iz testa ne pokrece
 * nikakvu skriptu.
 */
export interface OffProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  image_front_url?: string;
  image_url?: string;
}

/**
 * Iz liste proizvoda izabere fotografiju koja NAJBOLJE odgovara nazivu.
 * Pravilo: mora se poklopiti barem jedna znacajna rijec, inace vraca null.
 * Ovo je kapija koja spasava od pogresnih slika (npr. "Butter" -> Buttermilch).
 */
export function pickBestImage(products: OffProduct[], terms: string): string | null {
  const wanted = new Set(terms.split(' ').filter((t) => t.length > 2));
  let best: { url: string; score: number } | null = null;

  for (const product of products) {
    const image = product.image_front_url ?? product.image_url;
    if (!image) continue;
    const haystack = `${product.product_name ?? ''} ${product.brands ?? ''}`.toLowerCase();
    let score = 0;
    for (const token of wanted) if (haystack.includes(token)) score += 1;
    if (score === 0) continue;
    if (!best || score > best.score) best = { url: image, score };
  }
  return best?.url ?? null;
}
