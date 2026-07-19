// GET  /api/admin/vodici  — lista svih vodiča (admin)
// POST /api/admin/vodici  — kreiraj novi vodič
import { NextResponse } from "next/server";
import { getAllVodiciAdmin, createVodic } from "@/lib/vodici-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const vodici = await getAllVodiciAdmin();
    return NextResponse.json({ vodici });
  } catch (err) {
    console.error("GET /api/admin/vodici:", err);
    return NextResponse.json({ error: "Greška" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, naziv, opis, ikona, kategorija, min_citanja, tagovi, tekst, koraci } = body;
    if (!slug || !naziv) {
      return NextResponse.json({ error: "slug i naziv su obavezni" }, { status: 400 });
    }
    const vodic = await createVodic({
      slug,
      naziv,
      opis: opis ?? "",
      ikona: ikona ?? "📋",
      kategorija: kategorija ?? "viza",
      min_citanja: min_citanja ?? 5,
      tagovi: tagovi ?? [],
      tekst: tekst ?? null,
      koraci: koraci ?? null,
    });
    return NextResponse.json({ vodic }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/vodici:", err);
    return NextResponse.json({ error: "Greška" }, { status: 500 });
  }
}
