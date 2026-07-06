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

// Izvori koje smatramo "BiH stranom" (sve ostalo ide na DE/svjetsku stranu)
const BIH_IZVORI = ["klix", "n1", "slobodna", "dw bosanski", "avaz", "sportske"];

function ocistiIzvor(izvor: string | null): string {
  return (izvor || "Dijaspora.ba").replace(/^🤖\s*/, "").trim();
}

function jeBih(izvor: string, kategorija: string): boolean {
  if (kategorija === "bih") return true;
  const s = izvor.toLowerCase();
  return BIH_IZVORI.some((k) => s.includes(k));
}

interface Red {
  slug: string;
  naslov: string;
  izvor: string | null;
  kategorija: string;
  datum_objave: string | null;
  created_at: string;
}

async function dajObjavljene(): Promise<Red[]> {
  const db = klijent();
  if (!db) return [];
  const { data, error } = await db
    .from("clanci")
    .select("slug,naslov,izvor,kategorija,datum_objave,created_at")
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
  };
}

/** 🇩🇪 Naši objavljeni članci — njemačka/svjetska strana */
export async function dajLiveDE(limit = 6): Promise<LiveStavka[]> {
  const svi = await dajObjavljene();
  return svi
    .filter((r) => !jeBih(ocistiIzvor(r.izvor), r.kategorija))
    .slice(0, limit)
    .map(uStavku);
}

/** 🇧🇦 Naši objavljeni članci — BiH strana */
export async function dajLiveBIH(limit = 6): Promise<LiveStavka[]> {
  const svi = await dajObjavljene();
  return svi
    .filter((r) => jeBih(ocistiIzvor(r.izvor), r.kategorija))
    .slice(0, limit)
    .map(uStavku);
}

// Fallback dok baza nema dovoljno objavljenih članaka na toj strani.
// Linkovi vode na /vijesti (naš sajt), ne na vanjske portale.
export const MOCK_DE: LiveStavka[] = [
  { naslov: "Nova pravila za radnu vizu u Njemačkoj — šta se mijenja za Bosance", link: "/vijesti", izvor: "Dijaspora.ba", vrijemeAgo: "danas", datum: 0 },
  { naslov: "Kindergeld i Elterngeld — koliko para dobijaš u 2026.", link: "/vijesti", izvor: "Dijaspora.ba", vrijemeAgo: "danas", datum: 0 },
  { naslov: "Kako naći stan u Njemačkoj bez Schufe — provjeren vodič", link: "/vijesti", izvor: "Dijaspora.ba", vrijemeAgo: "danas", datum: 0 },
];

export const MOCK_BIH: LiveStavka[] = [
  { naslov: "Nostrifikacija diploma: novi sporazum BiH–Njemačka", link: "/vijesti", izvor: "Dijaspora.ba", vrijemeAgo: "danas", datum: 0 },
  { naslov: "Ambasada BiH: elektronski sistem zakazivanja termina", link: "/vijesti", izvor: "Dijaspora.ba", vrijemeAgo: "danas", datum: 0 },
  { naslov: "Sedmični pregled iz BiH — najvažnije za dijasporu", link: "/vijesti", izvor: "Dijaspora.ba", vrijemeAgo: "danas", datum: 0 },
];
