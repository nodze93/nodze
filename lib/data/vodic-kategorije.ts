// ============================================================
// VODIČI — prikazne kategorije (grupisanje za app-stil)
// ============================================================
// Mapira interne "kategorija" vrijednosti (viza, stan, zdravstvo...)
// u lijepe grupe za filter-čipove. Čisto (bez server importa) — može
// se koristiti i u klijentskim komponentama.

export interface VodicKategorija {
  key: string;
  label: string;
  icon: string;
  cats: string[] | null; // interne kategorije koje spadaju ovdje; null = sve
}

export const VODIC_KATEGORIJE: VodicKategorija[] = [
  { key: "sve", label: "Sve", icon: "▦", cats: null },
  { key: "vize", label: "Vize i boravak", icon: "🛂", cats: ["viza"] },
  { key: "posao", label: "Posao", icon: "💼", cats: ["posao", "gastarbajter"] },
  { key: "stan", label: "Stanovanje", icon: "🏠", cats: ["stan"] },
  { key: "porodica", label: "Porodica i djeca", icon: "👨‍👩‍👧", cats: ["porodica"] },
  { key: "zdravstvo", label: "Zdravstvo", icon: "🏥", cats: ["zdravstvo"] },
  { key: "finansije", label: "Porezi i finansije", icon: "💶", cats: ["porez", "finansije", "penzija"] },
];

// Boje po grupi (za tagove i akcente).
export const KAT_BOJA: Record<string, { bg: string; tekst: string }> = {
  vize: { bg: "#EAF2FF", tekst: "#1D4ED8" },
  posao: { bg: "#FEF3E7", tekst: "#B45309" },
  stan: { bg: "#EAF7EE", tekst: "#15803D" },
  porodica: { bg: "#FCEEF3", tekst: "#BE185D" },
  zdravstvo: { bg: "#E7F6F6", tekst: "#0E7490" },
  finansije: { bg: "#EEF2FF", tekst: "#4338CA" },
  ostalo: { bg: "#F1F5F9", tekst: "#475569" },
};

/** Vrati prikaznu grupu za internu kategoriju vodiča. */
export function displejKategorija(kat: string): VodicKategorija {
  const nadjena = VODIC_KATEGORIJE.find((k) => k.cats?.includes(kat));
  return nadjena || { key: "ostalo", label: kat || "Ostalo", icon: "📄", cats: [kat] };
}
