/**
 * =====================================================================
 *  KO IDE NA TRAKU PRODAVNICA
 * =====================================================================
 *  Namjerno u KODU, ne u SQL-u. Dva pokušaja da se ovo riješi funkcijom
 *  `ak_stores_list` su završila praznom trakom: `drop function` prođe,
 *  `create` padne zbog nečega što u toj bazi ne postoji, i pločice
 *  nestanu sasvim. Ovdje je vidljivo, provjerljivo i ne može srušiti
 *  bazu — a promjena je jedan red u listi ispod.
 *
 *  ⚠️ NIŠTA SE NE BRIŠE. Ponude ovih lanaca ostaju u bazi, bot ih i dalje
 *  skuplja, i dalje su dostupne preko direktnog linka `/akcije/prodavnica/<slug>`.
 *  Samo ih nema na traci na naslovnoj.
 * =====================================================================
 */

/** Lanci koji NISU za namirnice — ne prikazuju se na traci. */
export const VAN_TRAKE = new Set<string>([
  // namještaj — najveći zagađivač: XXXLutz sam ima preko 1200 ponuda
  'xxxlutz',
  'segmueller',
  'moemax',
  'moebel-inhofer',
  'opti-wohnwelt',
  'porta',
  'schaffrath',
  'trends-by-ostermann',
  'ostermann',
  'sb-moebel-boss',
  'kabs-polsterwelt',
  // alat i gradnja — OBI je NAMJERNO izuzet, korisnik ga hoće na traci
  'toom',
  'hagebaumarkt',
  'b1-discount-baumarkt',
  // ljubimci
  'fressnapf',
  'das-futterhaus',
  // robne kuće, uglavnom neprehrana
  'thomas-philipps',
  'woolworth',
  // veleprodaja — cijene su BEZ PDV-a pa varaju kupca
  'handelshof',
  'edeka-foodservice',
  // ostalo
  'bosch-car-service',
  'ran-tankstelle',
  'budni',
]);

/**
 * OSTAJU: sve namirnice + `rossmann` (deterdženti, higijena, bebi program)
 * + `obi` + `trinkgut` — izričita odluka korisnika.
 */
export function naTraci<T extends { slug: string }>(prodavnice: T[]): T[] {
  return prodavnice.filter((p) => !VAN_TRAKE.has(p.slug));
}
