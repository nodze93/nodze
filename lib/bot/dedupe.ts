// ============================================================
// DEDUPE PO TEMI — hvata istu priču s različitih izvora/linkova
// ============================================================
// Dedupe po linku ne uhvati kad isti događaj dođe s dva portala
// (različit link). Ovdje poredimo NASLOVE po ključnim riječima:
// ako se dva naslova dovoljno preklapaju → ista priča → preskoči.

// Kratke/opšte riječi koje ne nose temu (da ne prave lažne poklapanja).
// Namjerno izbacujemo česte GLAGOLE i punila — da ostanu samo teme
// (imenice, imena, pojmovi) koje stvarno određuju o čemu je vijest.
const STOP = new Set([
  // bosanski — mjesta/punila
  "njemačka", "njemačke", "njemačkoj", "njemačku", "bosna", "bosne", "bosni",
  "godine", "poslije", "nakon", "danas", "jučer", "sutra", "ovako", "kako",
  "zbog", "protiv", "između", "prema", "vijesti", "novo", "novi", "nova", "nove",
  "svaki", "svih", "ovdje", "tebe", "mijenja", "mijenju",
  // bosanski — česti glagoli u naslovima
  "usvojio", "usvojila", "usvojili", "donio", "donijela", "donijeli", "najavio",
  "najavila", "planira", "uvodi", "ukida", "povećava", "smanjuje", "objavio",
  "objavila", "potvrdio", "potvrdila", "odlučio", "odlučila", "predložio",
  // njemački — mjesta/punila
  "deutschland", "deutsche", "deutschen", "werden", "wurde", "gegen", "nach",
  "über", "zwischen", "eine", "einen", "einem", "immer", "mehr", "schon",
  "jahr", "jahre", "prozent", "neue", "neuen", "neuer",
  // njemački — česti glagoli u naslovima
  "beschließt", "beschlossen", "stimmt", "stimmen", "plant", "planen", "kündigt",
  "fordert", "sollen", "kommt", "bringt", "steht", "will", "gibt",
]);

// Generički KORIJENI koji znaju procuriti (deklinirani oblici stop-riječi).
const STOP_KORIJEN = new Set(["njemač", "bosanс", "godine", "godina", "mjesec"]);

// Izvuci KORIJENE tema iz naslova (prvih 6 slova značajnih riječi).
// Korijen umjesto cijele riječi — da padeži ne razbiju poklapanje
// ("zdravstvena"/"zdravstvenog" → oba "zdravs"; "osiguranje"/"osiguranja" → "osigur").
export function temaTokeni(naslov: string): Set<string> {
  const rijeci = (naslov || "")
    .toLowerCase()
    .replace(/[^0-9a-zà-ÿčćžšđß ]/gi, " ")
    .split(/\s+/);
  const out = new Set<string>();
  for (const w of rijeci) {
    if (w.length < 5 || STOP.has(w)) continue;
    const korijen = w.slice(0, 6);
    if (STOP_KORIJEN.has(korijen)) continue;
    out.add(korijen);
  }
  return out;
}

// Da li su dva skupa tokena "ista priča"?
// Pošto su glagoli/punila izbačeni, ostaju uglavnom teme (imenice/imena):
// ≥2 zajedničke teme ILI Jaccard ≥ 0.4 → tretiramo kao istu priču.
// (Koristi se za dedupe UNUTAR jednog pokretanja.)
export function istaTema(a: Set<string>, b: Set<string>): boolean {
  if (a.size === 0 || b.size === 0) return false;
  let shared = 0;
  for (const w of a) if (b.has(w)) shared++;
  if (shared === 0) return false;
  const jaccard = shared / (a.size + b.size - shared);
  return shared >= 2 || jaccard >= 0.4;
}

// STROGA verzija — za dedupe PREKO pokretanja (protiv istog članka drugi dan).
// Viši prag namjerno: hvata SKORO IDENTIČNE naslove, ali NE "novi razvoj iste
// teme" (npr. rezolucija štrajka ima druge ključne riječi pa prolazi).
export function istaTemaStrogo(a: Set<string>, b: Set<string>): boolean {
  if (a.size === 0 || b.size === 0) return false;
  let shared = 0;
  for (const w of a) if (b.has(w)) shared++;
  if (shared === 0) return false;
  const jaccard = shared / (a.size + b.size - shared);
  return shared >= 3 || jaccard >= 0.55;
}

// Normalizuj link za dedupe: skini query/fragment i trailing slash, mala slova.
// Tako isti članak s različitim tracking parametrima ne prođe dvaput.
export function normLink(link: string): string {
  if (!link) return "";
  try {
    const u = new URL(link);
    return (u.origin + u.pathname).replace(/\/+$/, "").toLowerCase();
  } catch {
    return link.split(/[?#]/)[0].replace(/\/+$/, "").toLowerCase();
  }
}
