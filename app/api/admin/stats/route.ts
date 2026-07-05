// ============================================================
// ADMIN STATS — pravi brojevi iz Supabase
// ============================================================
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = createServerClient();

    const [objavljeno, naCekanju, ukupno, vodici, pregledi, logovi] = await Promise.all([
      db.from("clanci").select("id", { count: "exact", head: true }).eq("status", "published"),
      db.from("clanci").select("id", { count: "exact", head: true }).eq("status", "draft"),
      db.from("clanci").select("id", { count: "exact", head: true }),
      db.from("vodici").select("id", { count: "exact", head: true }),
      db.from("clanci").select("broj_pregleda").eq("status", "published"),
      db.from("pipeline_logovi").select("datum,status,clanci_napisano,greska").order("datum", { ascending: false }).limit(5),
    ]);

    const ukupnoPregleda = (pregledi.data || []).reduce(
      (sum: number, c: { broj_pregleda: number }) => sum + (c.broj_pregleda || 0), 0
    );

    return NextResponse.json({
      ukupnoClanci: ukupno.count || 0,
      objavljeno: objavljeno.count || 0,
      naČekanju: naCekanju.count || 0,
      ukupnoVodica: vodici.count || 0,
      ukupnoPregleda,
      pipelineLogs: (logovi.data || []).map((l) => ({
        datum: l.datum,
        status: l.status,
        clanci: l.clanci_napisano,
        greska: l.greska,
      })),
      sljedećiPipeline: "Svaki dan u 06:00 CET (Vercel Cron)",
    });
  } catch (err) {
    return NextResponse.json({
      ukupnoClanci: 0, objavljeno: 0, naČekanju: 0, ukupnoVodica: 0, ukupnoPregleda: 0,
      pipelineLogs: [], sljedećiPipeline: "—",
      greska: (err as Error).message,
    });
  }
}
