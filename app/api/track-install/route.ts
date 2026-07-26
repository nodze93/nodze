// ============================================================
// TRACK INSTALL — bilježi kad neko instalira PWA (za brojač u adminu)
// ============================================================
// Poziva se iz InstallPrompt komponente na "appinstalled" događaj.
// Otporno: ako tabela "app_instalacije" ne postoji, tiho preskoči.

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let platforma = "unknown";
    try {
      const b = await req.json();
      if (b && typeof b.platforma === "string") platforma = b.platforma.slice(0, 40);
    } catch {
      /* prazan body je ok */
    }
    const db = createServerClient();
    await db.from("app_instalacije").insert({ platforma });
    return NextResponse.json({ ok: true });
  } catch {
    // Ne rušimo ništa ako tabela ne postoji ili baza ne odgovara.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
