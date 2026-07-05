import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { ime, email, poruka } = await req.json();

    if (!ime || !email || !poruka) {
      return NextResponse.json({ greska: "Sva polja su obavezna" }, { status: 400 });
    }

    const db = createServerClient();
    const { error } = await db.from("kontakt_poruke").insert({ ime, email, poruka });
    if (error) throw new Error(error.message);

    return NextResponse.json({ uspjeh: true });
  } catch (error) {
    console.error("Kontakt error:", error);
    return NextResponse.json({ greska: "Greška servera" }, { status: 500 });
  }
}
