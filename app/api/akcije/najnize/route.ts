// ============================================================
// GET /api/akcije/najnize?plz=80331
// ============================================================
// „Najniže do sada": artikli koji su DANAS na najnižoj cijeni koju smo
// za njih ikad zabilježili kod TOG lanca.
//
// Zašto uopšte postoji: traka „U pola cijene i više" radi samo za lance
// koji objave staru cijenu. REWE, PENNY, Netto, REWE Center i Trinkgut je
// ne objavljuju, pa im procenat ne postoji — oko 1.360 ponuda nikad se ne
// pojavi. Njihov popust ne možemo pošteno izračunati (ne znamo redovnu
// cijenu s police), ali OVO možemo: najniže što smo vidjeli, po lancu.
//
// Sav posao radi baza (`ak_najnize_ikad`), jer bi dovlačenje 31 dana
// snapshota u Node bilo ~145.000 redova po zahtjevu.

import { db, jsonCached, jsonError, plzOf } from "@/lib/akcije-server";

export const revalidate = 300;

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const plz = plzOf(sp);
  if (!plz) return jsonError("PLZ mora biti 5 cifara");

  try {
    const { data, error } = await db().rpc("ak_najnize_ikad", {
      p_plz: plz,
      // 3650 dana = „otkad pamtimo". Historija se od v2 čita iz
      // `ak_price_observations`, koja se NIKAD ne briše — a ne iz
      // `ak_discounts`, koju scraper svake noći reže na 31 dan.
      // (supabase/akcije-najnize-v2.sql)
      p_dana: 3650,
      p_min_dana: 3,
      p_limit: 24,
    });
    if (error) throw error;

    const items = (data ?? []) as Array<Record<string, unknown>>;
    return jsonCached({ plz, count: items.length, items });
  } catch {
    // Funkcija još nije pokrenuta u bazi ili baza ne odgovara — traka se
    // jednostavno ne prikaže. Naslovna se NE ruši zbog dodatka.
    return jsonCached({ plz, count: 0, items: [] }, "no-store");
  }
}
