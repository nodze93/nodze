import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { derivedToken, safeEqual } from "@/lib/security";

export async function POST(req: Request) {
  let lozinka = "";
  try {
    const body = await req.json();
    lozinka = typeof body?.lozinka === "string" ? body.lozinka : "";
  } catch {
    return NextResponse.json({ error: "Neispravan zahtjev" }, { status: 400 });
  }

  const expectedSecret = process.env.ADMIN_SECRET;

  // Bez postavljenog ADMIN_SECRET niko ne može ući — nema default lozinke!
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "ADMIN_SECRET nije konfigurisan na serveru. Postavi ga u env varijablama." },
      { status: 500 }
    );
  }

  // Konstantno-vremensko poređenje (otporno na timing napade).
  if (!safeEqual(lozinka, expectedSecret)) {
    return NextResponse.json({ error: "Pogrešna lozinka" }, { status: 401 });
  }

  // U cookie ide IZVEDENI token (hash), NE sirova admin lozinka.
  const token = await derivedToken(expectedSecret);
  const cookieStore = await cookies();
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 dana
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
