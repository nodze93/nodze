// ============================================================
// JAVNI DATA SLOJ — sajt čita OBJAVLJENE članke iz Supabase
// ============================================================
// Ako baza nije konfigurisana ili je prazna, funkcije vraćaju []
// i frontend prikazuje fallback (statične primjere).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface DbClanak {
  id: string;
  slug: string;
  naslov: string;
  excerpt: string | null;
  sadrzaj: string;
  kategorija: string;
  status: string;
  izvor: string | null;
  min_citanja: number;
  broj_pregleda: number;
  tip: string;
  slika: string | null;
  slika_autor: string | null;
  datum_objave: string | null;
  created_at: string;
}

function klijent(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("your-project")) return null;
  return createClient(url, key);
}

/** Najnoviji objavljeni članci (sve kategorije) */
export async function dajNajnovije(limit = 6): Promise<DbClanak[]> {
  const db = klijent();
  if (!db) return [];
  const { data, error } = await db
    .from("clanci")
    .select("id,slug,naslov,excerpt,sadrzaj,kategorija,status,izvor,min_citanja,broj_pregleda,tip,slika,slika_autor,datum_objave,created_at")
    .eq("status", "published")
    .order("datum_objave", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) return [];
  return (data as DbClanak[]) || [];
}

/** Objavljeni članci iz rubrike SVIJET */
export async function dajSvijet(limit = 4): Promise<DbClanak[]> {
  const db = klijent();
  if (!db) return [];
  const { data, error } = await db
    .from("clanci")
    .select("id,slug,naslov,excerpt,sadrzaj,kategorija,status,izvor,min_citanja,broj_pregleda,tip,slika,slika_autor,datum_objave,created_at")
    .eq("status", "published")
    .or("kategorija.eq.svijet,tip.eq.svjetske")
    .order("datum_objave", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) return [];
  return (data as DbClanak[]) || [];
}

/** Objavljeni članci po kategoriji */
export async function dajPoKategoriji(kategorija: string, limit = 20): Promise<DbClanak[]> {
  const db = klijent();
  if (!db) return [];
  const { data, error } = await db
    .from("clanci")
    .select("id,slug,naslov,excerpt,sadrzaj,kategorija,status,izvor,min_citanja,broj_pregleda,tip,slika,slika_autor,datum_objave,created_at")
    .eq("status", "published")
    .eq("kategorija", kategorija)
    .order("datum_objave", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) return [];
  return (data as DbClanak[]) || [];
}

/** Jedan objavljeni članak po slugu */
export async function dajClanak(slug: string): Promise<DbClanak | null> {
  const db = klijent();
  if (!db) return null;
  const { data } = await db
    .from("clanci")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return (data as DbClanak) || null;
}

/** Najčitaniji objavljeni članci */
export async function dajNajcitanije(limit = 5): Promise<DbClanak[]> {
  const db = klijent();
  if (!db) return [];
  const { data, error } = await db
    .from("clanci")
    .select("id,slug,naslov,excerpt,sadrzaj,kategorija,status,izvor,min_citanja,broj_pregleda,tip,slika,slika_autor,datum_objave,created_at")
    .eq("status", "published")
    .order("broj_pregleda", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data as DbClanak[]) || [];
}

/** Meta linija: "1. jul · 4 min · 1.2k pročitano" */
export function formatirajMeta(c: DbClanak): string {
  const dijelovi: string[] = [];
  const datum = c.datum_objave || c.created_at;
  if (datum) {
    const d = new Date(datum);
    const danas = new Date();
    const razlika = Math.floor((danas.getTime() - d.getTime()) / 86400000);
    if (razlika === 0) dijelovi.push("Danas");
    else if (razlika === 1) dijelovi.push("Jučer");
    else dijelovi.push(d.toLocaleDateString("bs-BA", { day: "numeric", month: "short" }));
  }
  dijelovi.push(`${c.min_citanja} min`);
  if (c.broj_pregleda > 0) {
    const p = c.broj_pregleda >= 1000 ? `${(c.broj_pregleda / 1000).toFixed(1)}k` : `${c.broj_pregleda}`;
    dijelovi.push(`${p} pročitano`);
  }
  return dijelovi.join(" · ");
}
