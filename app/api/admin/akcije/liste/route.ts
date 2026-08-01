// ============================================================
// ADMIN — proste liste za akcije-konzol  ·  /api/admin/akcije/liste?what=
//   what=prodavnice → sve prodavnice + broj ponuda danas + sa slikom
//   what=plz        → pokrivenost po PLZ-u (ponude, prodavnice)
//   what=kategorije → kategorije + broj artikala danas
// Zaštićeno middleware-om (/api/admin/*).
// ============================================================
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

async function latestDate(db: any): Promise<string | null> {
  const { data } = await db.from("ak_discounts").select("date").order("date", { ascending: false }).limit(1);
  return data?.[0]?.date ?? null;
}

export async function GET(req: Request) {
  const what = new URL(req.url).searchParams.get("what") || "prodavnice";
  const db = createServerClient();

  try {
    const date = await latestDate(db);
    // Današnji redovi (dovoljno kolona za sve tri liste)
    const { data: rows } = date
      ? await db
          .from("ak_discounts")
          .select("store_id, plz, category, image_url, ak_stores(name, slug, logo_url)")
          .eq("date", date)
          .limit(8000)
      : { data: [] as any[] };

    if (what === "kategorije") {
      const m = new Map<string, { n: number; slika: number }>();
      for (const r of rows || []) {
        const c = (r.category as string) || "(bez kategorije)";
        const e = m.get(c) || { n: 0, slika: 0 };
        e.n += 1;
        if (r.image_url) e.slika += 1;
        m.set(c, e);
      }
      const items = [...m.entries()]
        .map(([kategorija, v]) => ({ kategorija, broj: v.n, saSlikom: v.slika }))
        .sort((a, b) => b.broj - a.broj);
      return NextResponse.json({ what, datum: date, items });
    }

    if (what === "plz") {
      const m = new Map<string, { n: number; stores: Set<number>; slika: number }>();
      for (const r of rows || []) {
        const p = r.plz as string;
        const e = m.get(p) || { n: 0, stores: new Set<number>(), slika: 0 };
        e.n += 1;
        if (r.store_id) e.stores.add(r.store_id as number);
        if (r.image_url) e.slika += 1;
        m.set(p, e);
      }
      const items = [...m.entries()]
        .map(([plz, v]) => ({
          plz,
          ponuda: v.n,
          prodavnica: v.stores.size,
          saSlikomPct: v.n > 0 ? Math.round((100 * v.slika) / v.n) : 0,
        }))
        .sort((a, b) => a.plz.localeCompare(b.plz));
      return NextResponse.json({ what, datum: date, items });
    }

    // prodavnice — sve iz ak_stores + današnji brojevi
    const { data: stores } = await db.from("ak_stores").select("id, name, slug, logo_url").order("name");
    const perStore = new Map<number, { n: number; slika: number }>();
    for (const r of rows || []) {
      const id = r.store_id as number;
      const e = perStore.get(id) || { n: 0, slika: 0 };
      e.n += 1;
      if (r.image_url) e.slika += 1;
      perStore.set(id, e);
    }
    const items = (stores || []).map((s: any) => {
      const e = perStore.get(s.id) || { n: 0, slika: 0 };
      return {
        id: s.id,
        name: s.name,
        slug: s.slug,
        logo_url: s.logo_url,
        ponuda: e.n,
        saSlikomPct: e.n > 0 ? Math.round((100 * e.slika) / e.n) : 0,
      };
    });
    return NextResponse.json({ what, datum: date, items });
  } catch (err) {
    return NextResponse.json({ what, datum: null, items: [], greska: (err as Error).message });
  }
}
