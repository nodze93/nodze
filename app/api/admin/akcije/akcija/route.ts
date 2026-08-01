// ============================================================
// ADMIN — ručne radnje  ·  POST /api/admin/akcije/akcija?do=apply-layer
//   apply-layer → pokreće ak_apply_product_layer() (popuni slike iz
//                 trajnog sloja gdje su prazne + primijeni skrivanja).
// Ostale skripte (images:enrich, gc, prune, sam scrape) žive u GitHub
// Actions cronu — njih ne pokrećemo odavde (vode na Actions dugmetom).
// Zaštićeno middleware-om (/api/admin/*).
// ============================================================
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const doWhat = new URL(req.url).searchParams.get("do");
  if (doWhat !== "apply-layer") {
    return NextResponse.json({ error: "Nepoznata radnja" }, { status: 400 });
  }
  const db = createServerClient();
  try {
    const { data, error } = await db.rpc("ak_apply_product_layer");
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({
      ok: true,
      by_ean: row?.by_ean ?? 0,
      by_key: row?.by_key ?? 0,
      hidden_rows: row?.hidden_rows ?? 0,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
