// ============================================================
// GET /api/akcije/categories?plz=85737&store=lidl
// Kategorije koje danas postoje (za chipove i filter).
// ============================================================

import { db, jsonCached, jsonError, plzOf, textOf } from "@/lib/akcije-server";

export const revalidate = 1800;

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const plz = plzOf(sp);
  if (!plz) return jsonError("PLZ mora biti 5 cifara");

  try {
    const { data, error } = await db().rpc("ak_categories_list", {
      p_plz: plz,
      p_store: textOf(sp, "store"),
    });
    if (error) throw error;
    return jsonCached({ plz, items: data ?? [] });
  } catch {
    return jsonCached({ plz, items: [] }, "no-store");
  }
}
