// ============================================================
// ADMIN — postavi/skini naslovnu (hero) vijest
// ============================================================
// { id: "<uuid>" } postavlja tu naslovnu (i skida staru).
// { id: null } skida naslovnu sa svih.
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { osvjeziSajt } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    const db = createServerClient();

    // Uvijek prvo skini staru naslovnu.
    await db.from("clanci").update({ je_naslovna: false }).eq("je_naslovna", true);

    if (id === null || id === undefined) {
      osvjeziSajt();
      return NextResponse.json({ ok: true, naslovna: null });
    }
    if (typeof id !== "string") {
      return NextResponse.json({ error: "id mora biti string ili null" }, { status: 400 });
    }

    const { error } = await db.from("clanci").update({ je_naslovna: true }).eq("id", id);
    if (error) throw new Error(error.message);
    osvjeziSajt();
    return NextResponse.json({ ok: true, naslovna: id });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
