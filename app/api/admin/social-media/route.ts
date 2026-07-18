// ============================================================
// ADMIN API — Social Media red čekanja
// GET  /api/admin/social-media?status=ceka   → lista FB postova
// PATCH /api/admin/social-media              → ažuriraj status/tip/tekst
// ============================================================
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Kolone koje vraćamo (ne šaljemo sve)
const KOLONE = [
  "id", "slug", "naslov", "excerpt", "kategorija", "status",
  "slika", "slika_autor",
  "fb_tekst_news", "fb_tekst_engage",
  "fb_thumbnail_r1", "fb_thumbnail_r2",
  "fb_social_status", "fb_tip", "fb_ide_na_facebook", "fb_zakazano_za",
  "fb_post_id",
  "created_at",
].join(",");

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ceka";
    const limit = Math.min(Number(searchParams.get("limit") || "30"), 100);

    const db = createServerClient();

    let query = db
      .from("clanci")
      .select(KOLONE)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status === "sve") {
      // sve osim undefined (clanci koji nemaju FB sadržaj)
      query = query.not("fb_social_status", "is", null);
    } else {
      query = query.eq("fb_social_status", status);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ postovi: data || [] });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...izmjene } = body as {
      id: number;
      fb_social_status?: string;
      fb_tip?: string | null;
      fb_tekst_news?: string;
      fb_tekst_engage?: string;
      fb_thumbnail_r1?: string;
      fb_thumbnail_r2?: string;
      fb_zakazano_za?: string | null;
    };

    if (!id) return NextResponse.json({ error: "Nedostaje id." }, { status: 400 });

    // Samo dozvoljene kolone
    const dozvoljene = [
      "fb_social_status", "fb_tip",
      "fb_tekst_news", "fb_tekst_engage",
      "fb_thumbnail_r1", "fb_thumbnail_r2",
      "fb_zakazano_za",
    ];
    const update: Record<string, unknown> = {};
    for (const k of dozvoljene) {
      if (k in izmjene) update[k] = (izmjene as Record<string, unknown>)[k];
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nema šta ažurirati." }, { status: 400 });
    }

    const db = createServerClient();
    const { error } = await db.from("clanci").update(update).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
