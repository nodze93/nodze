// ============================================================
// ADMIN — SLIKE (moderacija)  ·  /api/admin/akcije/slike
//   GET  ?tab=nesigurno|bez-slike|odbaceno|potvrdjene
//        → liste + brojači po tabu + "Pokrivenost slikama"
//   POST { product_key, action: 'confirm'|'reject' }
//        → ak_product_images.status = confirmed|rejected
//   POST { product_key, image_url, store?, attribution? }  (Okači svoju: URL)
//        → ručno postavi sliku (manual, odmah potvrđena)
// Zaštićeno middleware-om (/api/admin/*).
// ============================================================
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ProdInfo {
  name: string;
  store: string;
  ean: string | null;
  imageUrl: string | null;
  source: string | null;
}

// Napravi mapu product_key -> {naziv, prodavnica, ean, slika, izvor} iz
// najnovijeg snapshota (za prikaz imena/prodavnice uz slike-prijedloge).
async function latestProductMap(db: any): Promise<{ map: Map<string, ProdInfo>; date: string | null }> {
  const { data: dRow } = await db
    .from("ak_discounts")
    .select("date")
    .order("date", { ascending: false })
    .limit(1);
  const date = dRow?.[0]?.date ?? null;
  if (!date) return { map: new Map(), date: null };

  const { data: rows } = await db
    .from("ak_discounts")
    .select("product_key, product_name, ean, image_url, image_source, ak_stores(name)")
    .eq("date", date)
    .limit(5000);

  const map = new Map<string, ProdInfo>();
  for (const r of rows || []) {
    const key = r.product_key as string | null;
    if (!key || map.has(key)) continue;
    map.set(key, {
      name: r.product_name ?? "—",
      store: (r.ak_stores as any)?.name ?? "—",
      ean: r.ean ?? null,
      imageUrl: r.image_url ?? null,
      source: r.image_source ?? null,
    });
  }
  return { map, date };
}

const SOURCE_LABEL: Record<string, { name: string; licence: string }> = {
  source: { name: "Letak (izvor)", licence: "iz letka trgovine" },
  off: { name: "Open Food Facts", licence: "CC BY-SA 3.0 — atribucija" },
  obf: { name: "Open Beauty Facts", licence: "CC BY-SA — atribucija" },
  icecat: { name: "Open Icecat", licence: "Open Icecat licenca" },
  stock: { name: "Stock (Pexels)", licence: "Pexels — komercijalno slobodno" },
  manual: { name: "Vlastita", licence: "naše — bez ograničenja" },
  manufacturer: { name: "Proizvođač", licence: "proizvođačka slika" },
};

export async function GET(req: Request) {
  const tab = new URL(req.url).searchParams.get("tab") || "nesigurno";
  const db = createServerClient();

  try {
    const { map, date } = await latestProductMap(db);

    // Pokrivenost slikama — po izvoru, na nivou artikla (distinct product_key)
    const cover = new Map<string, number>();
    let ukupno = 0;
    for (const info of map.values()) {
      ukupno += 1;
      const src = info.imageUrl ? info.source || "manual" : "ilustracija";
      cover.set(src, (cover.get(src) || 0) + 1);
    }
    const pokrivenost = [...cover.entries()]
      .map(([src, n]) => ({
        source: src === "ilustracija" ? "Ilustracija (rezerva)" : SOURCE_LABEL[src]?.name || src,
        licence: src === "ilustracija" ? "naše — bez ograničenja" : SOURCE_LABEL[src]?.licence || "—",
        broj: n,
        udio: ukupno > 0 ? Math.round((100 * n) / ukupno) : 0,
      }))
      .sort((a, b) => b.broj - a.broj);

    // Brojači po tabu (ak_product_images + "bez slike" iz snapshota)
    const cnt = async (build: (q: any) => any) => {
      const { count } = await build(
        db.from("ak_product_images").select("id", { count: "exact", head: true }),
      );
      return count || 0;
    };
    const bezSlike = [...map.values()].filter((i) => !i.imageUrl).length;
    const [nesigurnoN, odbacenoN, potvrdjeneN] = await Promise.all([
      cnt((q) => q.in("status", ["auto", "review"]).neq("match_kind", "ean")),
      cnt((q) => q.eq("status", "rejected")),
      cnt((q) => q.eq("status", "confirmed")),
    ]);

    // Lista za traženi tab
    let items: any[] = [];
    if (tab === "bez-slike") {
      items = [...map.entries()]
        .filter(([, i]) => !i.imageUrl)
        .slice(0, 200)
        .map(([key, i]) => ({
          product_key: key,
          artikal: i.name,
          prodavnica: i.store,
          ean: i.ean,
          image_url: null,
          izvor: "nema izvora",
          licenca: "—",
          poklapanje: "ništa nije nađeno",
          bezSlike: true,
        }));
    } else {
      let q = db
        .from("ak_product_images")
        .select("product_key, ean, image_url, image_source, image_attribution, image_licence, status, match_kind, match_score, quality_score")
        .order("created_at", { ascending: false })
        .limit(200);
      if (tab === "odbaceno") q = q.eq("status", "rejected");
      else if (tab === "potvrdjene") q = q.eq("status", "confirmed");
      else q = q.in("status", ["auto", "review"]).neq("match_kind", "ean");
      const { data: imgs } = await q;
      items = (imgs || []).map((r: any) => {
        const info = map.get(r.product_key);
        const lab = SOURCE_LABEL[r.image_source] || { name: r.image_source, licence: r.image_licence || "—" };
        const score = r.match_score != null ? Number(r.match_score) : null;
        return {
          product_key: r.product_key,
          artikal: info?.name ?? r.product_key,
          prodavnica: info?.store ?? "—",
          ean: r.ean ?? info?.ean ?? null,
          image_url: r.image_url,
          izvor: lab.name,
          licenca: r.image_licence || lab.licence,
          poklapanje:
            r.match_kind === "ean"
              ? "EAN, tačno"
              : r.match_kind === "name+size"
                ? `naziv + veličina${score != null ? ` · ${score.toFixed(2)}` : ""}`
                : r.match_kind === "manual"
                  ? "ručno"
                  : `naziv, bez EAN-a${score != null ? ` · ${score.toFixed(2)}` : ""}`,
          score,
          status: r.status,
        };
      });
    }

    return NextResponse.json({
      tab,
      datum: date,
      brojaci: { nesigurno: nesigurnoN, bezSlike, odbaceno: odbacenoN, potvrdjene: potvrdjeneN },
      items,
      pokrivenost,
      ukupno,
    });
  } catch (err) {
    return NextResponse.json({
      tab,
      datum: null,
      brojaci: { nesigurno: 0, bezSlike: 0, odbaceno: 0, potvrdjene: 0 },
      items: [],
      pokrivenost: [],
      ukupno: 0,
      greska: (err as Error).message,
    });
  }
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neispravan JSON" }, { status: 400 });
  }
  const productKey = String(body.product_key || "").trim();
  if (!productKey) return NextResponse.json({ error: "Fali product_key" }, { status: 400 });

  const db = createServerClient();

  // Ručno postavljanje slike (paste URL) → manual + confirmed
  if (body.image_url) {
    const url = String(body.image_url).trim();
    if (!/^https?:\/\//i.test(url)) return NextResponse.json({ error: "Neispravan URL slike" }, { status: 400 });
    const { error } = await db.from("ak_product_images").upsert(
      {
        product_key: productKey,
        image_url: url.slice(0, 500),
        image_source: "manual",
        image_attribution: body.attribution ? String(body.attribution).slice(0, 200) : null,
        image_licence: "naše — bez ograničenja",
        image_exact: true,
        status: "confirmed",
        match_kind: "manual",
        decided_by: "admin",
        decided_at: new Date().toISOString(),
      },
      { onConflict: "product_key" },
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, set: true });
  }

  // Potvrdi / Odbaci
  const action = String(body.action || "");
  const status = action === "confirm" ? "confirmed" : action === "reject" ? "rejected" : null;
  if (!status) return NextResponse.json({ error: "action mora biti confirm|reject" }, { status: 400 });

  const { error } = await db
    .from("ak_product_images")
    .update({ status, decided_by: "admin", decided_at: new Date().toISOString() })
    .eq("product_key", productKey);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status });
}
