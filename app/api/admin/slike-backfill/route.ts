// ============================================================
// ADMIN — dodaj slike STARIM člancima (Unsplash), u serijama
// ============================================================
// Radi u malim serijama (Vercel 60s limit). Klikni više puta dok
// "preostalo" ne padne na 0. Traži UNSPLASH_ACCESS_KEY u Vercelu.
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { nadjiSliku } from "@/lib/bot/slike";
import { osvjeziSajt } from "@/lib/revalidate";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Ozbiljni, institucionalni pojmovi po kategoriji (bez beba/emocija)
const KAT_POJMOVI: Record<string, string> = {
  viza: "passport visa documents",
  posao: "office work germany",
  stan: "apartment building keys",
  zdravstvo: "hospital clinic medical",
  porodica: "government office documents form",
  porez: "tax documents calculator",
  penzija: "documents office paperwork",
  finansije: "euro money finance",
  sport: "stadium football",
  svijet: "city skyline news",
  bih: "sarajevo bosnia city",
  vijesti: "news documents office",
  povratak: "airport travel",
  gastarbajter: "suitcase travel",
};

export async function POST() {
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "UNSPLASH_ACCESS_KEY nije postavljen u Vercelu. Dodaj ga (Settings → Environment Variables, Production+Preview) pa Redeploy, i probaj ponovo.",
      },
      { status: 400 }
    );
  }

  try {
    const db = createServerClient();
    const { data, error } = await db
      .from("clanci")
      .select("id,kategorija")
      .is("slika", null)
      .limit(6);
    if (error) throw new Error(error.message);

    const clanci = data || [];
    let azurirano = 0;

    for (const c of clanci) {
      const pojmovi = KAT_POJMOVI[c.kategorija as string] || "documents office building";
      const seed = String(c.id)
        .split("")
        .reduce((a, ch) => a + ch.charCodeAt(0), 0);
      const slika = await nadjiSliku(pojmovi, seed);
      if (slika) {
        await db
          .from("clanci")
          .update({ slika: slika.url, slika_autor: `${slika.autor} / Unsplash` })
          .eq("id", c.id);
        azurirano++;
      }
    }

    // Koliko još članaka nema sliku
    const { count } = await db
      .from("clanci")
      .select("id", { count: "exact", head: true })
      .is("slika", null);

    if (azurirano > 0) osvjeziSajt();

    return NextResponse.json({ ok: true, azurirano, preostalo: count ?? 0 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
