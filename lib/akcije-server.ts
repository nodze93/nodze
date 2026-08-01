// ============================================================
// AKCIJE — zajednička logika za /api/akcije/* rute
// ============================================================
// Podaci se osvježavaju jednom dnevno (scraper u 06:00), pa sve
// ide kroz Vercel CDN keš. Tako Vercel CPU ostaje nizak čak i kad
// korisnik klikće filtere — odgovor dolazi sa ivice, ne iz baze.

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const SORTS = ["percent", "savings", "price", "name"] as const;
export type SortKey = (typeof SORTS)[number];

/**
 * 2 min na CDN-u, još 5 min "stale" dok se u pozadini osvježi. Podaci se
 * mijenjaju 1× dnevno (scraper), ali kratak keš znači da se izmjene (nove
 * slike, novi artikli) vide skoro odmah — ranije je bilo 30 min + dan
 * "stale", pa je stara verzija znala visjeti satima (i razlikovati se
 * telefon/kompjuter). Promet je mali pa Vercel CPU ostaje nizak.
 */
export const AK_CACHE = "public, s-maxage=120, stale-while-revalidate=300";

export function jsonCached(data: unknown, maxAge = AK_CACHE) {
  return NextResponse.json(data, { headers: { "Cache-Control": maxAge } });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

// ---------- validacija parametara ----------

export function plzOf(sp: URLSearchParams): string | null {
  const plz = (sp.get("plz") ?? "").trim();
  return /^\d{5}$/.test(plz) ? plz : null;
}

export function textOf(sp: URLSearchParams, key: string, max = 60): string | null {
  const v = (sp.get(key) ?? "").trim();
  if (!v) return null;
  return v.slice(0, max);
}

export function numOf(
  sp: URLSearchParams,
  key: string,
  min: number,
  max: number
): number | null {
  const raw = sp.get(key);
  if (raw === null || raw.trim() === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  if (n <= min) return null; // 0 = "bez filtera"
  return Math.min(n, max);
}

export function intOf(
  sp: URLSearchParams,
  key: string,
  def: number,
  min: number,
  max: number
): number {
  const raw = sp.get(key);
  // Number(null) je 0, a 0 je "konačan broj" — bez ove provjere bi
  // izostavljen ?limit= davao 0 → stegnuto na min (1 artikal).
  if (raw === null || raw.trim() === "") return def;
  const n = Number(raw);
  if (!Number.isFinite(n)) return def;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

export function sortOf(sp: URLSearchParams): SortKey {
  const s = sp.get("sort") as SortKey | null;
  return s && (SORTS as readonly string[]).includes(s) ? s : "percent";
}

/** Supabase klijent sa service_role — ak_ tabele imaju RLS bez policy-ja. */
export function db() {
  return createServerClient();
}
