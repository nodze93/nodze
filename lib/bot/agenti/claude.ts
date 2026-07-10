// ============================================================
// ZAJEDNIČKI CLAUDE HELPER za sve agente
// ============================================================
// Svi agenti koriste "tool use" — Claude je FORSIRAN da vrati
// tačno strukturiran JSON. Nema više regex parsiranja koje puca.
import Anthropic from "@anthropic-ai/sdk";

let _klijent: Anthropic | null = null;

export function claude(): Anthropic {
  if (!_klijent) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY nije postavljen u env varijablama!");
    }
    _klijent = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _klijent;
}

// Modeli — Haiku za sve (max ušteda)
export const MODEL_BRZI = "claude-haiku-4-5";
export const MODEL_PISAC = "claude-haiku-4-5";

// ── PREKIDAČ za završni gramatički prolaz (gramatika.ts) ──────────────
// Default: Haiku (najjeftinije). Da se dobije BOLJA bosanska gramatika,
// dovoljno je u Vercel env postaviti:  MODEL_GRAMATIKA=claude-sonnet-4-5
// i sačuvati — bot odmah počne koristiti Sonnet SAMO za taj zadnji prolaz.
// Bez ikakve izmjene koda. (Da se prolaz potpuno isključi: GRAMATIKA_PROLAZ=off)
export const MODEL_GRAMATIKA = process.env.MODEL_GRAMATIKA || "claude-haiku-4-5";

/**
 * Pozovi Claude s forsiranim tool-useom i vrati validiran JSON objekat.
 * Retry 2x na prolazne greške (rate limit / mreža).
 */
export async function pozoviSaAlatom<T>(opts: {
  model: string;
  system: string;
  user: string;
  maxTokens: number;
  toolName: string;
  toolOpis: string;
  schema: Anthropic.Tool.InputSchema;
}): Promise<T> {
  const tool: Anthropic.Tool = {
    name: opts.toolName,
    description: opts.toolOpis,
    input_schema: opts.schema,
    // Keširaj definiciju alata (statična po agentu) — jeftinije kod
    // ponovljenih poziva istog agenta u istom pokretanju.
    cache_control: { type: "ephemeral" },
  };

  let zadnjaGreska: Error | null = null;
  for (let pokusaj = 0; pokusaj < 3; pokusaj++) {
    try {
      const odgovor = await claude().messages.create({
        model: opts.model,
        max_tokens: opts.maxTokens,
        // Sistem prompt kao keširani blok (ephemeral, ~5 min TTL).
        // Aktivira se tek iznad min. dužine — inače je bez efekta i troška.
        system: [
          { type: "text", text: opts.system, cache_control: { type: "ephemeral" } },
        ],
        tools: [tool],
        tool_choice: { type: "tool", name: opts.toolName },
        messages: [{ role: "user", content: opts.user }],
      });
      // Ako je model udario u max_tokens, JSON (i sadržaj članka) može biti
      // odsječen — upozori u logu da to primijetimo.
      if (odgovor.stop_reason === "max_tokens") {
        console.warn(`   ⚠️ ${opts.toolName}: odgovor dostigao max_tokens (${opts.maxTokens}) — moguć odsječen tekst.`);
      }
      const blok = odgovor.content.find(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );
      if (!blok) throw new Error("Model nije vratio strukturiran odgovor");
      return blok.input as T;
    } catch (err) {
      zadnjaGreska = err as Error;
      const poruka = zadnjaGreska.message || "";
      // Retry samo na prolazne greške
      if (/429|529|overloaded|timeout|ECONNRESET|fetch failed/i.test(poruka) && pokusaj < 2) {
        const cekaj = (pokusaj + 1) * 3000;
        console.warn(`   ⏳ Prolazna greška, čekam ${cekaj / 1000}s pa ponavljam...`);
        await new Promise((r) => setTimeout(r, cekaj));
        continue;
      }
      throw zadnjaGreska;
    }
  }
  throw zadnjaGreska || new Error("Nepoznata greška");
}
