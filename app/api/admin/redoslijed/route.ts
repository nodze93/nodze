// ============================================================
// ADMIN — snimi ručni redoslijed članaka
// ============================================================
// Prima { ids: [...] } — poziciju u nizu upisuje kao redoslijed.
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: "ids (niz) je obavezan" }, { status: 400 });
    }
    const db = createServerClient();
    let i = 0;
    for (const id of ids) {
      if (typeof id !== "string") continue;
      await db.from("clanci").update({ redoslijed: i }).eq("id", id);
      i++;
    }
    return NextResponse.json({ ok: true, azurirano: i });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
