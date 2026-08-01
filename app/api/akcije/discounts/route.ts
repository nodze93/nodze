// ============================================================
// GET /api/akcije/discounts?plz=85737&store=lidl&category=Fleisch
//                          &percent=30&savings=2&q=kaffee
//                          &sort=percent&limit=100&offset=0
// ============================================================
// Vraća ponude iz ZADNJEG snapshota za taj PLZ.
// Artikli bez stare cijene ("Angebot") automatski ispadaju iz
// filtera po procentu/uštedi — to radi baza (GENERATED kolone).

import { db, jsonCached, jsonError, plzOf, textOf, numOf, intOf, sortOf } from "@/lib/akcije-server";

export const revalidate = 120;

/**
 * DUPLIKATI: Kaufland (i drugi lanci) isti artikal znaju staviti na stranicu
 * više puta — jednom u "Top", jednom u kategoriji, jednom u letku. U snapshotu
 * to postanu 2-3 identična reda, pa se na sajtu vide dvije iste kartice jedna
 * do druge (primjer: DENVER Beamer x2, KINDER Choco x3).
 *
 * Scraper od sada ne upisuje duplikate, ali OVDJE ih ipak izbacujemo iz odgovora:
 *  - današnji snapshot je već u bazi s duplikatima (čisti se tek sljedećim runom),
 *  - i ubuduće nas štiti ako neki novi izvor propusti duplikat.
 *
 * Isti artikal = ista prodavnica + isti naziv + ista nova cijena.
 */
function bezDuplikata(items: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  const vidjeno = new Set<string>();
  return items.filter((item) => {
    const naziv = String(item.product_name ?? "").trim().toLowerCase().replace(/\s+/g, " ");
    const kljuc = `${String(item.store_slug ?? item.store ?? "")}|${naziv}|${String(item.new_price ?? "")}`;
    if (vidjeno.has(kljuc)) return false;
    vidjeno.add(kljuc);
    return true;
  });
}

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
    const totalIzBaze = rows.length > 0 ? Number(rows[0].total_count) : 0;

    const svi = rows.map(({ total_count: _drop, ...item }) => item);
    const items = bezDuplikata(svi);
    // Umanji i ukupan broj za izbačene (inače bi pisalo "72 artikala", a vidjelo
    // bi se 60). Tačno je dok sve stane u jednu stranicu (limit 300 > broj ponuda).
    const total = Math.max(0, totalIzBaze - (svi.length - items.length));

    return jsonCached({
      plz,
      date: (rows[0]?.date as string | undefined) ?? null,
      total,
      count: items.length,
      limit,
      offset,
      items,
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
