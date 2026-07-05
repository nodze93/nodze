// ============================================================
// ADMIN API — jedan članak: čitanje, izmjena, objava, brisanje
// ============================================================
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

// GET — jedan članak (po id ili slugu)
export async function GET(_req: Request, { params }: Props) {
  const { id } = await params;
  try {
    const db = createServerClient();
    const jeUuid = /^[0-9a-f-]{36}$/i.test(id);
    const { data, error } = await db
      .from("clanci")
      .select("*")
      .eq(jeUuid ? "id" : "slug", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return NextResponse.json({ error: "Članak nije pronađen" }, { status: 404 });
    return NextResponse.json({ clanak: data });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// Zajednička logika izmjene (PUT i PATCH rade isto)
async function azuriraj(req: Request, { params }: Props) {
  const { id } = await params;
  const body = await req.json();

  // Dozvoljena polja (da neko ne ubaci šta ne treba)
  const dozvoljena = [
    "naslov", "excerpt", "sadrzaj", "kategorija", "status",
    "min_citanja", "izvor", "slug", "slika", "slika_autor",
  ] as const;
  const izmjene: Record<string, unknown> = {};
  for (const k of dozvoljena) {
    if (body[k] !== undefined) izmjene[k] = body[k];
  }
  // podrška za camelCase iz starog UI-ja
  if (body.minCitanja !== undefined) izmjene.min_citanja = body.minCitanja;

  // Kad se objavljuje — upiši datum objave
  if (izmjene.status === "published") {
    izmjene.datum_objave = new Date().toISOString();
  }

  try {
    const db = createServerClient();
    const { data, error } = await db
      .from("clanci")
      .update(izmjene)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);

    return NextResponse.json({
      ok: true,
      clanak: data,
      poruka: izmjene.status === "published" ? "Članak je objavljen! 🎉" : "Članak je sačuvan.",
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: Props) {
  return azuriraj(req, ctx);
}

export async function PATCH(req: Request, ctx: Props) {
  return azuriraj(req, ctx);
}

// DELETE — obriši članak
export async function DELETE(_req: Request, { params }: Props) {
  const { id } = await params;
  try {
    const db = createServerClient();
    const { error } = await db.from("clanci").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, poruka: "Članak je obrisan." });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
