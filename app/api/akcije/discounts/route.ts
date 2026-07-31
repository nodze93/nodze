// ============================================================
// GET /api/akcije/discounts?plz=85737&store=lidl&category=Fleisch
//                          &percent=30&savings=2&q=kaffee
//                          &sort=percent&limit=100&offset=0
// ============================================================
// Vraća ponude iz ZADNJEG snapshota za taj PLZ.
// Artikli bez stare cijene ("Angebot") automatski ispadaju iz
// filtera po procentu/uštedi — to radi baza (GENERATED kolone).

import { db, jsonCached, jsonError, plzOf, textOf, numOf, intOf, sortOf } from "@/lib/akcije-server";

export const revalidate = 1800;

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;

  const plz = plzOf(sp);
  if (!plz) return jsonError("PLZ mora biti 5 cifara");

  const limit = intOf(sp, "limit", 100, 1, 500);
  const offset = intOf(sp, "offset", 0, 0, 10_000);

  const q = textOf(sp, "q");

  try {
    const { data, error } = await db().rpc("ak_discounts_search", {
      p_plz: plz,
      p_store: textOf(sp, "store"),
      p_category: textOf(sp, "category"),
      p_percent: numOf(sp, "percent", 0, 100),
      p_savings: numOf(sp, "savings", 0, 10_000),
      p_q: q && q.length >= 2 ? q : null,
      p_sort: sortOf(sp),
      p_limit: limit,
      p_offset: offset,
    });

    if (error) throw error;

    const rows = (data ?? []) as Array<Record<string, unknown>>;
    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

    return jsonCached({
      plz,
      date: (rows[0]?.date as string | undefined) ?? null,
      total,
      count: rows.length,
      limit,
      offset,
      items: rows.map(({ total_count: _drop, ...item }) => item),
    });
  } catch {
    // Ako baza ne odgovara ili šema još nije postavljena — prazna lista,
    // stranica se ne ruši.
    return jsonCached(
      { plz, date: null, total: 0, count: 0, limit, offset, items: [] },
      "no-store"
    );
  }
}
