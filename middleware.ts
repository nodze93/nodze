import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { derivedToken, safeEqual } from "@/lib/security";

// ============================================================
//  NASLOVNA NA TELEFONU → AKCIJE (26.8.2026.)
// ------------------------------------------------------------
//  Ko na telefonu ukuca kodnas.de, dobije odmah Akcije. Na računaru
//  ostaje naslovna kakva jeste.
//
//  Preusmjerenje je PRIVREMENO (307), namjerno: da se ovo može ugasiti
//  jednim redom, bez da Google zapamti promjenu kao trajnu.
//
//  Hvata se SAMO telefon. Tablet i računar idu na naslovnu. iPad se
//  namjerno ne hvata — na njemu naslovna lijepo stane.
//
//  Da se ugasi: postavi TELEFON_NA_AKCIJE = false.
// ============================================================
const TELEFON_NA_AKCIJE = true;
const JE_TELEFON = /Android.*Mobile|iPhone|iPod|Windows Phone|IEMobile|BlackBerry|Opera Mini/i;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (TELEFON_NA_AKCIJE && pathname === "/") {
    if (JE_TELEFON.test(request.headers.get("user-agent") ?? "")) {
      const cilj = request.nextUrl.clone();
      cilj.pathname = "/akcije";
      return NextResponse.redirect(cilj, 307);
    }
    return NextResponse.next();
  }

  // Login stranica i login API su slobodni
  if (pathname === "/admin/login" || pathname === "/api/admin/auth") {
    return NextResponse.next();
  }

  const jeAdminStranica = pathname.startsWith("/admin");
  const jeAdminApi = pathname.startsWith("/api/admin");

  if (jeAdminStranica || jeAdminApi) {
    const adminToken = request.cookies.get("admin_token")?.value || "";
    const secret = process.env.ADMIN_SECRET;

    // ADMIN_SECRET MORA biti postavljen — nema default lozinke!
    // Cookie sadrži IZVEDENI token (hash), ne sirovu tajnu; poređenje
    // je konstantno-vremensko (otporno na timing napade).
    let validno = false;
    if (secret) {
      const expected = await derivedToken(secret);
      validno = safeEqual(adminToken, expected);
    }

    if (!validno) {
      if (jeAdminApi) {
        // API rute vraćaju 401 JSON (ne redirect)
        return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // "/" je dodan zbog preusmjerenja telefona na Akcije (vidi gore).
  matcher: ["/", "/admin/:path*", "/api/admin/:path*"],
};
