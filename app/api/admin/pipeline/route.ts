// ============================================================
// ADMIN PIPELINE — pravi logovi iz baze + ručno pokretanje bota
// ============================================================
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { pokreniPipeline } from "@/lib/bot/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET — zadnjih 20 pravih logova
export async function GET() {
  try {
    const db = createServerClient();
    const { data, error } = await db
      .from("pipeline_logovi")
      .select("*")
      .order("datum", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);

    const logs = (data || []).map((l, i) => ({
      id: l.id || i,
      datum: l.datum,
      status: l.status,
      clanci_napisano: l.clanci_napisano || 0,
      rss_vijesti: l.rss_vijesti || 0,
      trending_tema: l.trending_tema,
      greska: l.greska,
      trajanje_sekundi: l.trajanje_sekundi || 0,
    }));
    return NextResponse.json({ logs });
  } catch (err) {
    return NextResponse.json({ logs: [], greska: (err as Error).message });
  }
}

// POST — ručno pokreni bota ODMAH (dugme u adminu)
export async function POST() {
  try {
    const rezultat = await pokreniPipeline();
    return NextResponse.json({
      ok: true,
      poruka: `Pipeline završen: ${rezultat.napisano} novih draftova. Osvježi listu članaka.`,
      ...rezultat,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
