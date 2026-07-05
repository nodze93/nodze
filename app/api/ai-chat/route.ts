import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { poruke } = await req.json();

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 800,
        system: `Ti si AI asistent portala Dijaspora.ba — portala za Bosance koji žive u Njemačkoj i Austriji.
Odgovaraj UVIJEK na bosanskom/srpskom/hrvatskom jeziku, kratko i konkretno (max 150 rijecï).
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
    const odgovor = data.content[0]?.text || "Nema odgovora.";

    return NextResponse.json({ odgovor });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { odgovor: "Tehnička greška. Pokušaj ponovo za koji trenutak." },
      { status: 500 }
    );
  }
}
