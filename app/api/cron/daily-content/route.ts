// ============================================================
// CRON RUTA — Vercel Cron ovo poziva svaki dan (vercel.json)
// ============================================================
// Zaštita: Authorization: Bearer <CRON_SECRET>
// Vercel Cron automatski šalje taj header kad je CRON_SECRET postavljen.
//
// Ručni test:
//   curl -H "Authorization: Bearer TVOJ_SECRET" https://tvoj-sajt.vercel.app/api/cron/daily-content
import { NextRequest, NextResponse } from "next/server";
import { pokreniPipeline } from "@/lib/bot/pipeline";

export const dynamic = "force-dynamic";
// Vercel: na Hobby planu sa Fluid compute do 300s; klasično 60s.
// Pipeline sprema svaki članak čim je gotov, pa i prekid ne gubi urađeno.
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ greska: "Neautorizovano" }, { status: 401 });
  }

  try {
    const rezultat = await pokreniPipeline();
    return NextResponse.json({ ok: true, ...rezultat });
  } catch (err) {
    console.error("Pipeline greška:", err);
    return NextResponse.json({ ok: false, greska: (err as Error).message }, { status: 500 });
  }
}
