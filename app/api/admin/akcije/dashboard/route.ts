// ============================================================
// ADMIN — Pregled (dashboard) za AKCIJE
//   GET /api/admin/akcije/dashboard?plz=85737
// Vraća stat-kartice + "Zdravlje scrapera" (danas vs juče po prodavnici)
// iz stvarnih podataka: ak_scrape_runs + ak_discounts.
// Zaštićeno middleware-om (/api/admin/*).
// ============================================================
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// duration_ms -> "0:41"
function msToClock(ms: number | null): string {
  if (!ms || ms < 0) return "—";
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// started_at (timestamptz) -> "06:11" po berlinskom vremenu
function berlinTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Berlin",
    });
  } catch {
    return "—";
  }
}

// ak_scrape_runs.status ('ok'|'empty'|'error') + brojevi -> ljudski status
function friendlyStatus(
  status: string,
  today: number,
  changePct: number | null,
  error: string | null,
): { label: string; ok: boolean } {
  if (status === "error") {
    return { label: error && /timeout/i.test(error) ? "Timeout" : "Greška", ok: false };
  }
  if (today === 0) return { label: "Selektor?", ok: false };
  if (changePct !== null && changePct <= -40) return { label: "Pad?", ok: false };
  return { label: "U redu", ok: true };
}

interface RunToday {
  store_id: number | null;
  items: number | null;
  duration_ms: number | null;
  status: string;
  error: string | null;
  started_at: string | null;
  ak_stores: { name?: string } | null;
}

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const wantedPlz = /^\d{5}$/.test(sp.get("plz") || "") ? (sp.get("plz") as string) : null;

  const db = createServerClient();

  try {
    // Dostupni PLZ-ovi (za izbornik)
    const { data: plzRows } = await db.from("ak_scrape_runs").select("plz");
    const plzList = [...new Set((plzRows || []).map((r) => r.plz as string))].sort();
    const plz = wantedPlz || plzList[0] || "85737";

    // Najnoviji i prethodni datum ZA TAJ PLZ
    const { data: dateRows } = await db
      .from("ak_scrape_runs")
      .select("date")
      .eq("plz", plz)
      .order("date", { ascending: false })
      .limit(120);
    const dates = [...new Set((dateRows || []).map((r) => r.date as string))];
    const today = dates[0] ?? null;
    const yday = dates[1] ?? null;

    // Zdravlje scrapera — današnji prolazi + jučerašnji (za promjenu)
    const [{ data: runsToday }, { data: runsYday }] = await Promise.all([
      db
        .from("ak_scrape_runs")
        .select("store_id, items, duration_ms, status, error, started_at, ak_stores(name)")
        .eq("plz", plz)
        .eq("date", today ?? "1970-01-01"),
      db
        .from("ak_scrape_runs")
        .select("store_id, items")
        .eq("plz", plz)
        .eq("date", yday ?? "1970-01-01"),
    ]);

    const ydayItems = new Map<number | null, number>(
      (runsYday || []).map((r) => [r.store_id as number | null, (r.items as number) ?? 0]),
    );

    const zdravlje = ((runsToday as RunToday[] | null) || [])
      .map((r) => {
        const t = r.items ?? 0;
        const y = ydayItems.get(r.store_id) ?? 0;
        const changePct = y > 0 ? Math.round(((t - y) / y) * 100) : null;
        const st = friendlyStatus(r.status, t, changePct, r.error);
        return {
          store: r.ak_stores?.name ?? "—",
          plz,
          danas: t,
          juce: y,
          promjena: changePct,
          trajanje: msToClock(r.duration_ms),
          status: st.label,
          ok: st.ok,
        };
      })
      .sort((a, b) => a.store.localeCompare(b.store));

    const pali = zdravlje.filter((z) => !z.ok).length;
    const zadnjiScrape = ((runsToday as RunToday[] | null) || [])
      .map((r) => r.started_at)
      .filter(Boolean)
      .sort()
      .pop() as string | null;

    // Stat-kartice iz ak_discounts (plz + datum). `refine` dodaje npr. filter
    // "image_url nije null". Supabase generici su nezgodni pa idemo preko any.
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const count = async (dt: string | null, refine?: (q: any) => any) => {
      if (!dt) return 0;
      let q: any = db
        .from("ak_discounts")
        .select("id", { count: "exact", head: true })
        .eq("plz", plz)
        .eq("date", dt);
      if (refine) q = refine(q);
      const { count: c } = await q;
      return c || 0;
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const [ponudaDanas, ponudaJuce, saSlikom, popusti] = await Promise.all([
      count(today),
      count(yday),
      count(today, (q) => q.not("image_url", "is", null)),
      count(today, (q) => q.not("old_price", "is", null)),
    ]);

    return NextResponse.json({
      plz,
      plzList,
      datum: today,
      zadnjiScrape: berlinTime(zadnjiScrape),
      pali,
      ponudaDanas,
      ponudaJuce,
      ponudaDelta: ponudaDanas - ponudaJuce,
      saSlikom,
      saSlikomPct: ponudaDanas > 0 ? Math.round((100 * saSlikom) / ponudaDanas) : 0,
      popusti,
      zdravlje,
    });
  } catch (err) {
    // Ako šema još nije tu — ne rušimo stranicu, vraćamo prazno + poruku.
    return NextResponse.json({
      plz: wantedPlz,
      plzList: [],
      datum: null,
      zadnjiScrape: "—",
      pali: 0,
      ponudaDanas: 0,
      ponudaJuce: 0,
      ponudaDelta: 0,
      saSlikom: 0,
      saSlikomPct: 0,
      popusti: 0,
      zdravlje: [],
      greska: (err as Error).message,
    });
  }
}
