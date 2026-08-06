// ============================================================
// GET /api/akcije/stores?plz=85737
// Prodavnice u tom PLZ-u + koliko ponuda svaka ima danas.
// ============================================================

import { db, jsonCached, jsonError, plzOf } from "@/lib/akcije-server";
import { naTraci } from "@/lib/akcije/zid";

export const revalidate = 120;

export async function GET(req: Request) {
  const plz = plzOf(new URL(req.url).searchParams);
  if (!plz) return jsonError("PLZ mora biti 5 cifara");

  try {
    const { data, error } = await db().rpc("ak_stores_list", { p_plz: plz });
    if (error) throw error;
    // Namještaj, baumarkt (osim OBI-ja), ljubimci i veleprodaja se ne
    // prikazuju na traci — vidi lib/akcije/zid.ts. Filtrira se OVDJE, a ne
    // u bazi: SQL verzija je dvaput ostavila traku praznu.
    const svi = (data ?? []) as Array<{ slug: string }>;
    return jsonCached({ plz, items: naTraci(svi) });
  } catch {
    return jsonCached({ plz, items: [] }, "no-store");
  }
}
