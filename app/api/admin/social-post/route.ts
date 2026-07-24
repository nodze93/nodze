// ============================================================
// ADMIN API — Objavi odobreni FB post
// POST /api/admin/social-post  { id: number }
//
// Uzima članak, bira pravi tekst + sliku (thumbnail ili original),
// šalje na Facebook Graph API, ažurira fb_social_status → 'objavljeno'.
// ============================================================
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { objaviNaFacebook } from "@/lib/bot/facebook";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { id } = await req.json() as { id: number };
    if (!id) return NextResponse.json({ error: "Nedostaje id članka." }, { status: 400 });

    const db = createServerClient();

    // Dohvati članak s FB poljima
    const { data, error } = await db
      .from("clanci")
      .select(`
        id, slug, naslov, slika, excerpt, izvor, fb_slika_url,
        fb_tekst_news, fb_tekst_engage,
        fb_thumbnail_r1, fb_thumbnail_r2,
        fb_tip, fb_social_status
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Članak nije pronađen." }, { status: 404 });
    }

    if (data.fb_social_status === "objavljeno") {
      return NextResponse.json(
        { error: "Ovaj post je već objavljen na Facebooku." },
        { status: 409 }
      );
    }

    const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://kodnas.de";

    // Pozadinska slika: ručno dodani URL ima prednost, inače slika članka.
    const pozadina = data.fb_slika_url || data.slika;

    // Generiši thumbnail URL ako je tip news/engage i postoji thumbnail tekst
    let thumbnail_url: string | null = null;
    const tip = (data.fb_tip || "news") as "news" | "engage" | "original";

    if (tip !== "original" && data.fb_thumbnail_r1) {
      const predlozak = tip === "engage" ? "engagement" : "informative";
      const r2 = data.fb_thumbnail_r2 || (data.izvor ? `Izvor: ${data.izvor}` : "");
      const params = new URLSearchParams({
        t: predlozak,
        r1: data.fb_thumbnail_r1,
        r2,
      });
      if (pozadina) params.set("slika", pozadina);
      thumbnail_url = `${SITE}/api/og/thumbnail?${params.toString()}`;
    }

    // Objavi na Facebook
    const fb = await objaviNaFacebook({
      naslov:          data.naslov,
      slug:            data.slug,
      slika:           pozadina,
      excerpt:         data.excerpt,
      fb_tekst_news:   data.fb_tekst_news,
      fb_tekst_engage: data.fb_tekst_engage,
      thumbnail_url,
      tip,
    });

    if (!fb.ok) {
      const status = fb.preskoceno ? 400 : 502;
      return NextResponse.json(
        { error: fb.greska || "FB objava nije uspjela." },
        { status }
      );
    }

    // Ažuriraj status u bazi
    await db.from("clanci").update({
      fb_social_status: "objavljeno",
      fb_post_id: fb.postId || null,
    }).eq("id", id);

    const poruka = fb.komentarOk
      ? "Objavljeno na Facebook — link je u prvom komentaru! 🔵"
      : `Objavljeno na Facebook 🔵, ALI link u komentaru nije prošao: ${fb.komentarGreska || "nepoznato"}`;

    return NextResponse.json({
      ok: true,
      postId:     fb.postId,
      komentarOk: fb.komentarOk,
      poruka,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
