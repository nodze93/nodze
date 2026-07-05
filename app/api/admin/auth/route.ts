import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { lozinka } = await req.json();
  const expectedSecret = process.env.ADMIN_SECRET;

  // Bez postavljenog ADMIN_SECRET niko ne može ući — nema default lozinke!
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "ADMIN_SECRET nije konfigurisan na serveru. Postavi ga u env varijablama." },
      { status: 500 }
    );
  }

  if (lozinka !== expectedSecret) {
    return NextResponse.json({ error: "Pogrešna lozinka" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_token", expectedSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 dana
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
