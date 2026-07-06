import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// Node runtime (ne Edge) — treba nam in-memory rate limit.
export const runtime = "nodejs";

const MAX_PORUKA = 12; // max broj poruka u razgovoru
const MAX_DUZINA = 2000; // max znakova po poruci

export async function POST(req: NextRequest) {
  // ── Rate limit: 8 zahtjeva / minuti po IP (zaštita budžeta) ──
  const ip = clientIp(req);
  const rl = rateLimit(`ai:${ip}`, 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { odgovor: "Previše upita. Sačekaj malo pa pokušaj ponovo." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ odgovor: "AI trenutno nije dostupan." }, { status: 503 });
  }

  // ── Validacija ulaza (spriječi zloupotrebu / velike payloade) ──
  let poruke: unknown;
  try {
    ({ poruke } = await req.json());
  } catch {
    return NextResponse.json({ odgovor: "Neispravan zahtjev." }, { status: 400 });
  }

  if (!Array.isArray(poruke) || poruke.length === 0 || poruke.length > MAX_PORUKA) {
    return NextResponse.json({ odgovor: "Neispravan zahtjev." }, { status: 400 });
  }
  for (const m of poruke) {
    const rec = m as { role?: unknown; content?: unknown } | null;
    const ok =
      rec &&
      typeof rec === "object" &&
      (rec.role === "user" || rec.role === "assistant") &&
      typeof rec.content === "string" &&
      rec.content.length <= MAX_DUZINA;
    if (!ok) {
      return NextResponse.json({ odgovor: "Neispravan zahtjev." }, { status: 400 });
    }
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 800,
        system: `Ti si AI asistent portala Dijaspora.ba — portala za Bosance koji žive u Njemačkoj i Austriji.
Odgovaraj UVIJEK na bosanskom/srpskom/hrvatskom jeziku, kratko i konkretno (max 150 riječi).
Fokusiraj se isključivo na: viza i boravak, posao i plaće, stan i najam, zdravstveno osiguranje (Krankenkasse), porezi (Steuer), porodične naknade (Elterngeld, Kindergeld, Mutterschutz), penzija (Rentenversicherung), povratak u BiH.
Ako ne znaš odgovor ili tema nije relevantna za dijasporu — ljubazno odgovori da si tu samo za dijasporne teme i predloži da kontaktiraju nadležnu instituciju.
Ne navodi datume koji bi se mogli promijeniti bez potvrde — umjesto toga usmjeri korisnika na provjeru.`,
        messages: poruke,
      }),
    });

    if (!res.ok) {
      throw new Error(`Claude API greška: ${res.status}`);
    }

    const data = await res.json();
    const odgovor = data.content?.[0]?.text || "Nema odgovora.";

    return NextResponse.json({ odgovor });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { odgovor: "Tehnička greška. Pokušaj ponovo za koji trenutak." },
      { status: 500 }
    );
  }
}
