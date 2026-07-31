// ============================================================
// GET /api/akcije/discounts/:id — jedna ponuda (stranica detalja)
// ============================================================

import { db, jsonCached, jsonError } from "@/lib/akcije-server";

export const revalidate = 1800;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d{1,18}$/.test(id)) return jsonError("Neispravan id");

  try {
    const { data, error } = await db().rpc("ak_discount_by_id", { p_id: Number(id) });
    if (error) throw error;

    const item = Array.isArray(data) ? data[0] : data;
    if (!item) return jsonError("Ponuda nije pronađena", 404);

    return jsonCached(item);
  } catch {
    return jsonError("Greška pri čitanju ponude", 503);
  }
}
