import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { derivedToken, safeEqual } from "@/lib/security";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
