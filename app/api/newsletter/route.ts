import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ greska: "Nevažeća email adresa" }, { status: 400 });
    }

    const db = createServerClient();
    const { error } = await db.from("newsletter_subscribers").insert({ email });
    // 23505 = već prijavljen (duplikat) — tretiramo kao uspjeh
    if (error && error.code !== "23505") throw new Error(error.message);

    return NextResponse.json({ uspjeh: true });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ greska: "Greška servera" }, { status: 500 });
  }
}
