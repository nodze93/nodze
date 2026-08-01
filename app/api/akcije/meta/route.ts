// ============================================================
// GET /api/akcije/meta?plz=85737
// Kratki pregled: ima li podataka za taj PLZ i od kada su.
// ============================================================

import { db, jsonCached, jsonError, plzOf } from "@/lib/akcije-server";

export const revalidate = 120;

const PRAZNO = {
  date: null,
  total: 0,
  with_percent: 0,
  angebot_only: 0,
  stores: 0,
  max_percent: null,
  max_savings: null,
};

export async function GET(req: Request) {
  const plz = plzOf(new URL(req.url).searchParams);
  if (!plz) return jsonError("PLZ mora biti 5 cifara");

  try {
    const { data, error } = await db().rpc("ak_meta", { p_plz: plz });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return jsonCached(row ?? { plz, ...PRAZNO });
  } catch {
    return jsonCached({ plz, ...PRAZNO }, "no-store");
  }
}
