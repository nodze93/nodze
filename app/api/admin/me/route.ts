import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Ako je middleware pustio zahtjev do ovdje, cookie je validan → korisnik je admin.
// Klijent (admin traka) zove ovo: 200 = admin, 401 = nije.
export async function GET() {
  return NextResponse.json({ admin: true });
}
