import { NextResponse } from "next/server";
import { dajHero } from "@/lib/data";

// KEŠ 2 MINUTE NA CDN-u — isti kompromis kao /api/akcije/* (s-maxage=120).
//
// Ranije: `no-store` + poziv sa skoro svake stranice + rotator koji ispituje
// svakih 10 min = svaki posjetilac je svakim pozivom pogađao bazu i trošio
// Vercel CPU (a Hobby plan na 100% CPU-a PAUZIRA sajt). Sa s-maxage CDN
// odgovara umjesto nas, a origin se budi najviše jednom u 2 minute.
// Objava novog članka se na heroju vidi za najviše 2 min — isto kašnjenje
// koje je već prihvaćeno za akcije.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await dajHero(12);
    return NextResponse.json(
      { clanci: data },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=120" } }
    );
  } catch {
    return NextResponse.json({ clanci: [] }, { status: 200 });
  }
}
