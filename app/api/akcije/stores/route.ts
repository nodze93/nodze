// ============================================================
// GET /api/akcije/stores?plz=85737
// Prodavnice u tom PLZ-u + koliko ponuda svaka ima danas.
// ============================================================

import { db, jsonCached, jsonError, plzOf } from "@/lib/akcije-server";

export const revalidate = 120;

export async function GET(req: Request) {
  const plz = plzOf(new URL(req.url).searchParams);
  if (!plz) return jsonError("PLZ mora biti 5 cifara");

  try {
    const { data, error } = await db().rpc("ak_stores_list", { p_plz: plz });
    if (error) throw error;
    return jsonCached({ plz, items: data ?? [] });
  } catch {
    return jsonCached({ plz, items: [] }, "no-store");
  }
}
