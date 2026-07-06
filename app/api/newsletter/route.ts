import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { validEmail } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Rate limit: 5 prijava / minuti po IP (protiv spama)
  const ip = clientIp(req);
  const rl = rateLimit(`nl:${ip}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { greska: "Previše pokušaja. Sačekaj malo." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  try {
    let email: unknown;
    try {
      ({ email } = await req.json());
    } catch {
      return NextResponse.json({ greska: "Neispravan zahtjev" }, { status: 400 });
    }

    if (!validEmail(email)) {
      return NextResponse.json({ greska: "Nevažeća email adresa" }, { status: 400 });
    }
    const cistEmail = email.trim().toLowerCase();

    const db = createServerClient();
    const { error } = await db.from("newsletter_subscribers").insert({ email: cistEmail });
    // 23505 = već prijavljen (duplikat) — tretiramo kao uspjeh
    if (error && error.code !== "23505") throw new Error(error.message);

    return NextResponse.json({ uspjeh: true });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ greska: "Greška servera" }, { status: 500 });
  }
}
