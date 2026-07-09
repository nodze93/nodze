// ============================================================
// LIVE VIJESTI — sada iz NAŠE baze (objavljeni članci)
// ============================================================
// Prikazuje NAŠE objavljene članke. Badge = originalni izvor
// (npr. "N1 BiH", "Spiegel") iz kojeg je članak nastao; klik
// vodi na NAŠ članak (/clanak/slug). Podjela: DE/svjetsko lijevo,
// BiH desno — po izvoru iz kojeg je članak nastao.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface LiveStavka {
  naslov: string;
  link: string;
  izvor: string;
  vrijemeAgo: string;
  datum: number; // timestamp za sortiranje
  slika?: string | null; // naslovna slika članka (za mobilne kutije)
}

function klijent(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("your-project")) return null;
  return createClient(url, key);
}

function vrijemeAgo(ts: number): string {
  const min = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ${String(min % 60).padStart(2, "0")}min`;
  return `${Math.floor(h / 24)}d`;
}

// Bosanski izvori → rubrika "Vijesti iz BiH" (desno).
const BIH_IZVORI = ["klix", "n1", "slobodna", "avaz", "sportsport"];
// Njemački izvori → UVIJEK rubrika "Vijesti iz Njemačke" (lijevo), čak i ako
// im je kategorija greškom "bih". (DW piše o Njemačkoj → njemačka strana.)
const DE_IZVORI = ["spiegel", "tagesschau", "dw", "kicker"];

function ocistiIzvor(izvor: string | null): string {
  return (izvor || "kodnas.de").replace(/^🤖\s*/, "").trim();
}

function jeBih(izvor: string, kategorija: string): boolean {
  const s = izvor.toLowerCase();
  // Njemački izvor NIKAD ne ide na bosansku stranu (izvor pobjeđuje kategoriju).
  if (DE_IZVORI.some((k) => s.includes(k))) return false;
  // Bosanski izvor uvijek ide na bosansku stranu.
  if (BIH_IZVORI.some((k) => s.includes(k))) return true;
  // Inače se oslanjamo na kategoriju.
  return kategorija === "bih";
}

interface Red {
  slug: string;
  naslov: string;
  izvor: string | null;
  kategorija: string;
  tip: string | null;
  slika: string | null;
  min_citanja: number | null;
  datum_objave: string | null;
  created_at: string;
}

async function dajObjavljene(): Promise<Red[]> {
  const db = klijent();
  if (!db) return [];
  const { data, error } = await db
    .from("clanci")
    .select("slug,naslov,izvor,kategorija,tip,slika,min_citanja,datum_objave,created_at")
    .eq("status", "published")
    .order("datum_objave", { ascending: false, nullsFirst: false })
    .limit(40);
  if (error || !data) return [];
  return data as Red[];
}

function uStavku(r: Red): LiveStavka {
  const ts = Date.parse(r.datum_objave || r.created_at || "") || Date.now();
  return {
    naslov: r.naslov,
    link: `/clanak/${r.slug}`,
    izvor: ocistiIzvor(r.izvor),
    vrijemeAgo: vrijemeAgo(ts),
    datum: ts,
    slika: r.slika,
  };
}

// ── Bogatiji oblik za /de i /bih stranice (kartice sa slikom) ──
export interface KarticaVijest {
  slug: string;
  naslov: string;
  izvor: string;
  slika: string | null;
  minCitanja: number;
  datum: string; // "6. jul"
}

function uKarticu(r: Red): KarticaVijest {
  const ts = Date.parse(r.datum_objave || r.created_at || "") || Date.now();
  return {
    slug: r.slug,
    naslov: r.naslov,
    izvor: ocistiIzvor(r.izvor),
    slika: r.slika,
    minCitanja: r.min_citanja || 4,
    datum: new Date(ts).toLocaleDateString("bs-BA", { day: "numeric", month: "short" }),
  };
}

/** 🇩🇪 Njemački članci — za /de stranicu (kartice sa slikom) */
export async function dajDE(limit = 20): Promise<KarticaVijest[]> {
  const svi = await dajObjavljene();
  return svi
    .filter((r) => (r.tip || "dijaspora") === "dijaspora" && !jeBih(ocistiIzvor(r.izvor), r.kategorija))
    .slice(0, limit)
    .map(uKarticu);
}

/** 🇧🇦 Bosanski članci — za /bih stranicu (kartice sa slikom) */
export async function dajBIH(limit = 20): Promise<KarticaVijest[]> {
  const svi = await dajObjavljene();
  return svi
    .filter((r) => (r.tip || "dijaspora") === "dijaspora" && jeBih(ocistiIzvor(r.izvor), r.kategorija))
    .slice(0, limit)
    .map(uKarticu);
}

// Widgeti pokazuju SAMO dijaspora članke (ne svjetske ni sport).
// Unutar dijaspore: njemački izvori → DE, bosanski izvori → BiH.
function jeDijaspora(r: Red): boolean {
  return (r.tip || "dijaspora") === "dijaspora";
}

/** 🇩🇪 Naši objavljeni članci — SAMO njemački izvori (Tagesschau, Spiegel...) */
export async function dajLiveDE(limit = 6): Promise<LiveStavka[]> {
  const svi = await dajObjavljene();
  return svi
    .filter((r) => jeDijaspora(r) && !jeBih(ocistiIzvor(r.izvor), r.kategorija))
    .slice(0, limit)
    .map(uStavku);
}

/** 🇧🇦 Naši objavljeni članci — SAMO bosanski izvori (Klix, N1...) */
export async function dajLiveBIH(limit = 6): Promise<LiveStavka[]> {
  const svi = await dajObjavljene();
  return svi
    .filter((r) => jeDijaspora(r) && jeBih(ocistiIzvor(r.izvor), r.kategorija))
    .slice(0, limit)
    .map(uStavku);
}

/** 🌍 Naši objavljeni svjetski članci (za widget na naslovnoj) */
export async function dajLiveSvijet(limit = 8): Promise<LiveStavka[]> {
  const svi = await dajObjavljene();
  return svi
    .filter((r) => (r.tip || "") === "svjetske" || r.kategorija === "svijet")
    .slice(0, limit)
    .map(uStavku);
}

/** ⚽ Naši objavljeni sportski članci (za widget na naslovnoj) */
export async function dajLiveSport(limit = 8): Promise<LiveStavka[]> {
  const svi = await dajObjavljene();
  return svi
    .filter((r) => (r.tip || "") === "sport" || r.kategorija === "sport")
    .slice(0, limit)
    .map(uStavku);
}

export const MOCK_SVIJET: LiveStavka[] = [
  { naslov: "Šokantan potez u Bruxellesu — EU mijenja pravila za strance", link: "/kategorija/svijet", izvor: "Svijet", vrijemeAgo: "danas", datum: 0 },
  { naslov: "Inflacija ponovo raste — šta to znači za tvoju plaću i uštedu", link: "/kategorija/svijet", izvor: "Svijet", vrijemeAgo: "danas", datum: 0 },
  { naslov: "Napetosti na Bliskom istoku — posljedice za Evropu i dijasporu", link: "/kategorija/svijet", izvor: "Svijet", vrijemeAgo: "danas", datum: 0 },
];

export const MOCK_SPORT: LiveStavka[] = [
  { naslov: "Džeko se vraća u Bundesligu? Glasine o transferu tresu dijasporu", link: "/kategorija/sport", izvor: "Sport", vrijemeAgo: "danas", datum: 0 },
  { naslov: "Zmajevi saznali protivnike — evo puta do EURO-a", link: "/kategorija/sport", izvor: "Sport", vrijemeAgo: "danas", datum: 0 },
  { naslov: "Transfer koji trese region: naš reprezentativac pred potpisom", link: "/kategorija/sport", izvor: "Sport", vrijemeAgo: "danas", datum: 0 },
];

// Fallback dok baza nema dovoljno objavljenih članaka na toj strani.
// Linkovi vode na /vijesti (naš sajt), ne na vanjske portale.
export const MOCK_DE: LiveStavka[] = [
  { naslov: "Nova pravila za radnu vizu u Njemačkoj — šta se mijenja za Bosance", link: "/vijesti", izvor: "kodnas.de", vrijemeAgo: "danas", datum: 0 },
  { naslov: "Kindergeld i Elterngeld — koliko para dobijaš u 2026.", link: "/vijesti", izvor: "kodnas.de", vrijemeAgo: "danas", datum: 0 },
  { naslov: "Kako naći stan u Njemačkoj bez Schufe — provjeren vodič", link: "/vijesti", izvor: "kodnas.de", vrijemeAgo: "danas", datum: 0 },
];

export const MOCK_BIH: LiveStavka[] = [
  { naslov: "Nostrifikacija diploma: novi sporazum BiH–Njemačka", link: "/vijesti", izvor: "kodnas.de", vrijemeAgo: "danas", datum: 0 },
  { naslov: "Ambasada BiH: elektronski sistem zakazivanja termina", link: "/vijesti", izvor: "kodnas.de", vrijemeAgo: "danas", datum: 0 },
  { naslov: "Sedmični pregled iz BiH — najvažnije za dijasporu", link: "/vijesti", izvor: "kodnas.de", vrijemeAgo: "danas", datum: 0 },
];
