// ============================================================
// ADMIN — SCRAPER (historija prolaza)  ·  /api/admin/akcije/scraper
//   GET → zadnjih ~60 zapisa iz ak_scrape_runs (prodavnica, PLZ, datum,
//         broj artikala, trajanje, status). Zaštićeno middleware-om.
// ============================================================
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
/* eslint-disable @typescript-eslint/no-explicit-any */

function clock(ms: number | null): string {
  if (!ms || ms < 0) return "—";
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export async function GET() {
  const db = createServerClient();
  try {
    const { data } = await db
      .from("ak_scrape_runs")
      .select("plz, date, items, duration_ms, status, error, started_at, ak_stores(name)")
      .order("started_at", { ascending: false })
      .limit(80);

    const items = (data || []).map((r: any) => ({
      store: (r.ak_stores as any)?.name ?? "—",
      plz: r.plz,
      datum: r.date,
      artikala: r.items ?? 0,
      trajanje: clock(r.duration_ms),
      status: r.status,
      error: r.error ?? null,
      vrijeme: r.started_at
        ? new Date(r.started_at).toLocaleString("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
        : "—",
    }));
    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json({ items: [], greska: (err as Error).message });
  }
}
