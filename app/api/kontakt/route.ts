import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { validEmail } from "@/lib/security";

export const runtime = "nodejs";

const MAX_IME = 100;
const MAX_PORUKA = 5000;

export async function POST(req: NextRequest) {
  // Rate limit: 3 poruke / minuti po IP (protiv spama)
  const ip = clientIp(req);
  const rl = rateLimit(`kontakt:${ip}`, 3, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { greska: "Previše poruka. Sačekaj malo." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  try {
    let body: { ime?: unknown; email?: unknown; poruka?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ greska: "Neispravan zahtjev" }, { status: 400 });
    }

    const ime = typeof body.ime === "string" ? body.ime.trim() : "";
    const poruka = typeof body.poruka === "string" ? body.poruka.trim() : "";

    if (!ime || !validEmail(body.email) || !poruka) {
      return NextResponse.json({ greska: "Sva polja su obavezna i email mora biti ispravan." }, { status: 400 });
    }
    if (ime.length > MAX_IME || poruka.length > MAX_PORUKA) {
      return NextResponse.json({ greska: "Ime ili poruka su predugački." }, { status: 400 });
    }

    const db = createServerClient();
    const { error } = await db.from("kontakt_poruke").insert({
      ime,
      email: body.email.trim().toLowerCase(),
      poruka,
    });
    if (error) throw new Error(error.message);

    return NextResponse.json({ uspjeh: true });
  } catch (error) {
    console.error("Kontakt error:", error);
    return NextResponse.json({ greska: "Greška servera" }, { status: 500 });
  }
}
