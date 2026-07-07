// ============================================================
// CRON TICK — otkucaj koji vanjski servis (cron-job.org) zove često
// (npr. svakih 15 min). Provjeri raspored iz baze i pokreni bota
// ako je neki termin "na redu". Tako admin kontroliše vremena, a
// pouzdan vanjski servis samo kuca — GitHub-ov nepouzdan cron nam
// više ne treba.
// ============================================================
import { NextResponse } from "next/server";
import { dajBotConfig } from "@/lib/bot-config";
import { dispatchBot } from "@/lib/github-dispatch";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Koliko dugo nakon zadatog vremena termin ostaje "na redu"
// (da uhvati i kad otkucaj malo kasni). 45 min.
const TOLERANCIJA_MIN = 45;

function berlinSada(): { datum: string; minuti: number } {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const dio = (t: string) => fmt.formatToParts(new Date()).find((p) => p.type === t)?.value || "00";
  const datum = `${dio("year")}-${dio("month")}-${dio("day")}`;
  const h = parseInt(dio("hour"), 10);
  const m = parseInt(dio("minute"), 10);
  return { datum, minuti: h * 60 + m };
}

async function obradi(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret") || req.headers.get("x-cron-secret") || "";
  const ocekivan = process.env.CRON_SECRET;

  if (!ocekivan || secret !== ocekivan) {
    return NextResponse.json({ ok: false, error: "Neispravan secret" }, { status: 401 });
  }

  const cfg = await dajBotConfig();
  if (!cfg.aktivan) {
    return NextResponse.json({ ok: true, skip: "bot je ugašen u adminu" });
  }

  const { datum, minuti } = berlinSada();

  // Nađi termin koji je "na redu" a nije već odrađen danas
  let due: string | null = null;
  for (const t of cfg.vremena) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
    if (!m) continue;
    const slotMin = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    const marker = `${datum} ${t.trim()}`;
    if (minuti >= slotMin && minuti < slotMin + TOLERANCIJA_MIN && cfg.zadnji_slot !== marker) {
      due = t.trim();
      break;
    }
  }

  if (!due) {
    return NextResponse.json({
      ok: true,
      skip: "nijedan termin nije na redu",
      berlin: `${datum} ${String(Math.floor(minuti / 60)).padStart(2, "0")}:${String(minuti % 60).padStart(2, "0")}`,
      vremena: cfg.vremena,
    });
  }

  // Rezerviši slot ODMAH (prije dispatcha) da spriječiš duplo pokretanje
  // ako dva otkucaja stignu skoro istovremeno.
  try {
    const db = createServerClient();
    await db.from("bot_config").update({ zadnji_slot: `${datum} ${due}` }).eq("id", 1);
  } catch {
    /* nastavi — dispatch je bitniji */
  }

  const rez = await dispatchBot({
    de: String(cfg.kvota_de),
    bih: String(cfg.kvota_bih),
    svijet: String(cfg.kvota_svijet),
    sport: String(cfg.kvota_sport),
  });

  if (!rez.ok) {
    return NextResponse.json({ ok: false, termin: due, error: rez.error }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    pokrenuto: `${datum} ${due}`,
    kvote: { de: cfg.kvota_de, bih: cfg.kvota_bih, svijet: cfg.kvota_svijet, sport: cfg.kvota_sport },
  });
}

export async function GET(req: Request) {
  return obradi(req);
}
export async function POST(req: Request) {
  return obradi(req);
}
