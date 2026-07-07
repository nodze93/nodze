// ============================================================
// ADMIN API — raspored bota (čitaj/snimi)
// ============================================================
import { NextResponse } from "next/server";
import { dajBotConfig, snimiBotConfig, type BotConfig } from "@/lib/bot-config";

export const dynamic = "force-dynamic";

// GET — trenutni raspored
export async function GET() {
  try {
    const config = await dajBotConfig();
    return NextResponse.json({ config });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST — snimi raspored
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<BotConfig>;
    const config = await snimiBotConfig(body);
    return NextResponse.json({ ok: true, config });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
