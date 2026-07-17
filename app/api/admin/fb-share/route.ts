// ============================================================
// ADMIN API — ručno dijeljenje članka na Facebook (dugme u adminu)
// ============================================================
// Uvijek objavi (dozvoljava ponovno slanje), pa upiše fb_post_id.
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { objaviNaFacebook } from "@/lib/bot/facebook";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Nedostaje id članka." }, { status: 400 });

    const db = createServerClient();
    const { data, error } = await db
      .from("clanci")
      .select("id,naslov,slug,slika,excerpt")
      .eq("id", id)
      .single();
    if (error || !data) return NextResponse.json({ error: "Članak nije pronađen." }, { status: 404 });

    const fb = await objaviNaFacebook({
      naslov: data.naslov, slug: data.slug, slika: data.slika, excerpt: data.excerpt,
    });

    if (!fb.ok) {
      const status = fb.preskoceno ? 400 : 502;
      return NextResponse.json({ error: fb.greska || "FB objava nije uspjela." }, { status });
    }

    if (fb.postId) {
      await db.from("clanci").update({ fb_post_id: fb.postId }).eq("id", id);
    }
    const poruka = fb.komentarOk
      ? "Objavljeno na Facebook — link je u prvom komentaru! 🔵"
      : `Objavljeno na Facebook 🔵, ALI link u komentaru nije prošao: ${fb.komentarGreska || "nepoznato"}`;
    return NextResponse.json({ ok: true, postId: fb.postId, komentarOk: fb.komentarOk, poruka });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
