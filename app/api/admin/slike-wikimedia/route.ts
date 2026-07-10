// ============================================================
// ADMIN API — zamjena slika na OBJAVLJENIM člancima sa Wikimedia
// ============================================================
// Dva režima:
//   mode="preview" → prođe kroz stranicu objavljenih članaka (offset/limit),
//                    za svaki potraži Wikimedia sliku i vrati PRIJEDLOG
//                    (ne mijenja ništa u bazi).
//   mode="apply"   → dobije listu odabranih prijedloga i UPIŠE ih.
//
// Klijent (admin stranica) prolazi kroz stranice zbog Vercel limita
// vremena — svaki poziv obradi mali batch da ne istekne.
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { nadjiSlikuWiki } from "@/lib/bot/slike-wikimedia";
import { osvjeziSajt } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

interface Clanak {
  id: string;
  naslov: string;
  slika: string | null;
  slika_autor: string | null;
  kategorija: string | null;
}

interface Stavka {
  id: string;
  url: string;
  autor: string;
  licenca: string;
}

// Pojam za pretragu = naslov bez navodnika (najbolje pogađa poznata imena/mjesta)
function pojamIzNaslova(naslov: string): string {
  return (naslov || "").replace(/["'„""»«]/g, " ").replace(/\s+/g, " ").trim();
}

function oznaka(autor: string, licenca: string): string {
  return `${autor} — Wikimedia Commons${licenca ? ` (${licenca})` : ""}`;
}

export async function POST(req: Request) {
  let body: { mode?: string; offset?: number; limit?: number; stavke?: Stavka[] } = {};
  try {
    body = await req.json();
  } catch {
    /* prazno tijelo */
  }
  const mode = body.mode || "preview";
  const db = createServerClient();

  // ── APPLY: upiši odabrane prijedloge ──────────────────────
  if (mode === "apply") {
    const stavke = Array.isArray(body.stavke) ? body.stavke : [];
    if (stavke.length === 0) {
      return NextResponse.json({ error: "Nema odabranih slika." }, { status: 400 });
    }
    let ok = 0;
    for (const s of stavke) {
      if (!s.id || !s.url) continue;
      const { error } = await db
        .from("clanci")
        .update({ slika: s.url, slika_autor: oznaka(s.autor || "Wikimedia Commons", s.licenca || "") })
        .eq("id", s.id);
      if (!error) ok++;
    }
    try {
      osvjeziSajt();
    } catch {
      /* revalidate ne smije srušiti odgovor */
    }
    return NextResponse.json({ ok: true, primijenjeno: ok, poruka: `Zamijenjeno slika: ${ok}` });
  }

  // ── PREVIEW: nađi prijedloge za jednu stranicu ────────────
  const offset = Math.max(0, Number(body.offset) || 0);
  const limit = Math.min(12, Math.max(1, Number(body.limit) || 8));

  // Ukupan broj objavljenih (za progress na klijentu)
  const { count: total } = await db
    .from("clanci")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");

  const { data, error } = await db
    .from("clanci")
    .select("id,naslov,slika,slika_autor,kategorija")
    .eq("status", "published")
    .order("datum_objave", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const clanci = (data || []) as Clanak[];

  // Wikimedia pretraga paralelno za ovaj batch
  const prijedlozi = (
    await Promise.all(
      clanci.map(async (c) => {
        const vecWiki = (c.slika_autor || "").includes("Wikimedia");
        const wiki = await nadjiSlikuWiki(pojamIzNaslova(c.naslov));
        if (!wiki) return null;
        // Ne predlaži ako je već tačno ta slika
        if (c.slika && c.slika === wiki.url) return null;
        return {
          id: c.id,
          naslov: c.naslov,
          kategorija: c.kategorija,
          staraSlika: c.slika,
          vecWiki,
          novaSlika: wiki.url,
          autor: wiki.autor,
          licenca: wiki.licenca,
        };
      })
    )
  ).filter(Boolean);

  return NextResponse.json({
    ok: true,
    total: total || 0,
    offset,
    limit,
    obradjeno: clanci.length,
    sljedeciOffset: offset + clanci.length,
    ima_jos: offset + clanci.length < (total || 0),
    prijedlozi,
  });
}
