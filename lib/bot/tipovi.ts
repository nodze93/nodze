// ============================================================
// BOT TIPOVI
// ============================================================

export type IzvorTip = "dijaspora" | "svjetske" | "sport";

export interface FeedIzvor {
  ime: string;
  url: string;
  jezik: "bs" | "de" | "en";
  tip: IzvorTip;
  // Za dijaspora izvore: na koju stranu ide sadržaj.
  // "de" = Vijesti iz Njemačke, "bih" = Vijesti iz BiH.
  // Npr. DW Bosanski je na bosanskom ALI piše o Njemačkoj → "de".
  strana?: "de" | "bih";
}

// Sirova vijest iz RSS-a
export interface Vijest {
  naslov: string;
  link: string;
  excerpt: string;
  datum: string;
  izvor: string;
  jezik: "bs" | "de" | "en";
  tip: IzvorTip;
  strana?: "de" | "bih";
  // popunjava Filter agent:
  score?: number;
  razlogFiltera?: string;
  kategorija?: string;
  // ── NOVI LIJEVAK (pipeline2) — sve opcionalno, ne dira stari pipeline ──
  tier?: TierIzvora;      // sloj izvora (sluzbeni, mediji, lokalno...)
  predScore?: number;     // bodovi iz jeftinog (bez-AI) keyword/tier filtera
  triaza?: TriazaOcjena;  // ocjena AI triaže (title+desc)
}

// ── NOVI LIJEVAK: slojevi izvora (tier) ──────────────────────
// Sluzbeni = najviše povjerenje (vlada, ministarstva, policija, DWD...).
export type TierIzvora =
  | "sluzbeni"
  | "mediji"
  | "lokalno"
  | "poslovi"
  | "vrijeme"
  | "saobracaj"
  | "finansije"
  | "eu";

// Prošireni izvor sa slojem (tier). Nasljeđuje sve iz FeedIzvor.
export interface FeedIzvorPro extends FeedIzvor {
  tier: TierIzvora;
}

// Rezultat AI triaže za jednu vijest (ocjena samo na naslov+opis).
export interface TriazaOcjena {
  index: number;
  relevantnost_de: number;      // 0-100: koliko je bitno za život u Njemačkoj
  relevantnost_dijaspora: number; // 0-100: koliko baš za NAŠU dijasporu
  hitnost: number;              // 0-100: koliko je hitno/vremenski osjetljivo
  klik: number;                 // 0-100: hoće li čitalac kliknuti
  vec_poznato: boolean;         // da li je ovo već poznata/objavljena priča danas
  kategorija: string;
  ukupno: number;               // izračunato u kodu (težinska suma) — ne od modela
  razlog?: string;              // opciono (izbačeno iz sheme radi uštede tokena)
}

// Rezultat Writer agenta
export interface GeneriraniClanak {
  naslov: string;
  excerpt: string;
  kategorija: string;
  sadrzaj: string; // HTML
  min_citanja: number;
  izvori: string[];
  slika_pojmovi?: string; // engleski pojmovi za Unsplash pretragu
}

// Rezultat Fact-check agenta
export interface FactcheckRezultat {
  ukupni_status: "zeleno" | "zuto" | "crveno";
  mozeSeObjaviti: boolean;
  tvrdnje: { tekst: string; status: "ok" | "upozorenje" | "greska"; napomena: string }[];
  preporuka: string;
}

// Rezultat Context agenta
export interface ContextRezultat {
  ton_ok: boolean;
  dijaspora_kontekst: boolean;
  ima_linkove: boolean;
  naslov_ok: boolean;
  excerpt_ok: boolean;
  sugestije: string[];
}

// Rezultat Jezik agenta
export interface JezikRezultat {
  ispravljen_naslov: string;
  ispravljen_excerpt: string;
  ispravljen_sadrzaj: string;
  broj_ispravki: number;
  ispravke: { original: string; ispravljeno: string; razlog: string }[];
  ocjena: "cisto" | "sitne_greske" | "puno_gresaka";
  komentar: string;
}

export interface PipelineRezultat {
  procitanoRss: number;
  prosloFilter: number;
  napisano: number;
  greske: number;
  trajanjeSekundi: number;
  trendingTema: string | null;
  clanciZaPregled: { naslov: string; status: string; slug: string; kategorija?: string }[];
}
