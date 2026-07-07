// ============================================================
// ADMIN PIPELINE — pravi logovi iz baze + ručno pokretanje bota
// ============================================================
// "Pokreni odmah" NE piše na Vercelu (60s limit ubija bota), nego
// pokreće GitHub Actions workflow (bez limita) preko GitHub API-ja.
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { dispatchBot } from "@/lib/github-dispatch";
import { dajBotConfig } from "@/lib/bot-config";

export const dynamic = "force-dynamic";

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

// POST — pokreni bota ODMAH preko GitHub Actions (koristi kvote iz admina)
export async function POST() {
  const cfg = await dajBotConfig();
  const rez = await dispatchBot({
    de: String(cfg.kvota_de),
    bih: String(cfg.kvota_bih),
    svijet: String(cfg.kvota_svijet),
    sport: String(cfg.kvota_sport),
  });

  if (rez.ok) {
    return NextResponse.json({
      ok: true,
      poruka:
        "✅ Bot je pokrenut na GitHub Actions. Članci se pišu 2–3 minute — pa osvježi listu članaka.",
    });
  }

  return NextResponse.json(
    { ok: false, error: rez.error || "Nije moguće pokrenuti bota." },
    { status: rez.status || 500 }
  );
}
