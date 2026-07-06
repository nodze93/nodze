import { NextResponse } from "next/server";
import { dajHero } from "@/lib/data";

// Uvijek svježe (bez keširanja) — rotator ovo zove svakih 10 min
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await dajHero(12);
    return NextResponse.json(
      { clanci: data },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch {
    return NextResponse.json({ clanci: [] }, { status: 200 });
  }
}
