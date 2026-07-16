// ============================================================
// ADMIN API — lista i kreiranje članaka (prava Supabase baza)
// ============================================================
// Zaštićeno middleware-om (admin_token cookie).
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { napraviSlug } from "@/lib/bot/publisher";
import { osvjeziSajt } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

interface DbRed {
  id: string;
  slug: string;
  naslov: string;
  excerpt: string | null;
  kategorija: string;
  status: string;
  izvor: string | null;
  min_citanja: number;
  broj_pregleda: number;
  broj_dijeljenja: number | null;
  faktcheck_status: string | null;
  jezik_ocjena: string | null;
  auto_generisan: boolean;
  tip: string;
  slika: string | null;
  created_at: string;
  datum_objave: string | null;
  je_naslovna: boolean | null;
  zakazano_za: string | null;
  redoslijed: number | null;
}

// GET — lista članaka s filterima (?status=&kategorija=&q=)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const kategorija = searchParams.get("kategorija");
  const q = searchParams.get("q");

  try {
    const db = createServerClient();

    // Kolone. broj_dijeljenja je NOVO — ako kolona još ne postoji u bazi
    // (SQL nije pokrenut), upit s njom padne. Zato prvo probamo s njom, pa
    // ako padne, ponovimo BEZ nje — admin uvijek pokaže članke.
    const OSNOVNE =
      "id,slug,naslov,excerpt,kategorija,status,izvor,min_citanja,broj_pregleda,faktcheck_status,jezik_ocjena,auto_generisan,tip,slika,created_at,datum_objave,je_naslovna,zakazano_za,redoslijed";

    const izvrsi = (kolone: string) => {
      let query = db
        .from("clanci")
        .select(kolone)
        .order("je_naslovna", { ascending: false })
        .order("redoslijed", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(200);
      if (status) query = query.eq("status", status);
      if (kategorija) query = query.eq("kategorija", kategorija);
      if (q) query = query.ilike("naslov", `%${q}%`);
      return query;
    };

    // 1. pokušaj: s brojem dijeljenja
    let { data, error } = await izvrsi(OSNOVNE + ",broj_dijeljenja");
    // 2. ako kolona ne postoji → ponovi bez nje (podijeljeno ostane 0)
    if (error) {
      ({ data, error } = await izvrsi(OSNOVNE));
    }
    if (error) throw new Error(error.message);

    // Oblik koji admin UI očekuje
    const clanci = ((data as DbRed[]) || []).map((c) => ({
      id: c.id,
      slug: c.slug,
      naslov: c.naslov,
      excerpt: c.excerpt || "",
      kategorija: c.kategorija,
      status: c.status,
      izvor: c.auto_generisan ? `🤖 ${c.izvor || "Bot"}` : c.izvor || "Ručno",
      minCitanja: c.min_citanja,
      procitano: c.broj_pregleda,
      podijeljeno: c.broj_dijeljenja || 0,
      faktcheck: c.faktcheck_status,
      jezik: c.jezik_ocjena,
      slika: c.slika,
      jeNaslovna: c.je_naslovna || false,
      zakazanoZa: c.zakazano_za || null,
      datum: new Date(c.datum_objave || c.created_at).toLocaleDateString("bs-BA"),
    }));

    return NextResponse.json({ clanci, ukupno: clanci.length });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message, clanci: [], ukupno: 0 }, { status: 500 });
  }
}

// POST — ručno kreiranje novog članka
export async function POST(req: Request) {
  const body = await req.json();

  if (!body.naslov || !body.sadrzaj || !body.kategorija) {
    return NextResponse.json({ error: "Naslov, sadržaj i kategorija su obavezni." }, { status: 400 });
  }

  try {
    const db = createServerClient();
    const slug = body.slug || napraviSlug(body.naslov);
    const status = body.status === "published" ? "published" : "draft";

    const { data, error } = await db
      .from("clanci")
      .insert({
        slug,
        naslov: body.naslov,
        excerpt: body.excerpt || null,
        sadrzaj: body.sadrzaj,
        kategorija: body.kategorija,
        status,
        auto_generisan: false,
        izvor: body.izvor || "Ručno kreiran",
        min_citanja: body.minCitanja || Math.max(2, Math.ceil(String(body.sadrzaj).split(/\s+/).length / 200)),
        faktcheck_status: "zeleno",
        datum_objave: status === "published" ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    osvjeziSajt();
    return NextResponse.json({ clanak: data, ok: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
