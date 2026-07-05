// ============================================================
// PUBLISHER — upis u Supabase (SERVICE ROLE — zaobilazi RLS)
// ============================================================
import { createServerClient } from "../supabase";
import type { Vijest, GeneriraniClanak, FactcheckRezultat, ContextRezultat, JezikRezultat } from "./tipovi";
import type { UnsplashSlika } from "./slike";

// Slug: ispravno mapiranje naših slova (đ→d, ne đ→s!)
export function napraviSlug(naslov: string): string {
  const mapa: Record<string, string> = {
    č: "c", ć: "c", đ: "d", š: "s", ž: "z",
    Č: "c", Ć: "c", Đ: "d", Š: "s", Ž: "z",
  };
  const baza = naslov
    .split("")
    .map((c) => mapa[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  // kratak jedinstveni sufiks (protiv kolizija)
  const sufiks = Date.now().toString(36).slice(-4);
  return `${baza}-${sufiks}`;
}

// Učitaj već obrađene linkove (dedupe)
export async function ucitajObradjene(): Promise<Set<string>> {
  const db = createServerClient();
  const { data, error } = await db
    .from("obradjeni_linkovi")
    .select("link")
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) {
    console.warn(`⚠️  Dedupe učitavanje: ${error.message}`);
    return new Set();
  }
  return new Set((data || []).map((r: { link: string }) => r.link));
}

export async function oznaciObradjen(link: string): Promise<void> {
  const db = createServerClient();
  await db.from("obradjeni_linkovi").upsert({ link });
}

/**
 * Upiši gotov, provjeren i lektorisan članak kao DRAFT.
 */
export async function sacuvajDraft(args: {
  clanak: GeneriraniClanak;
  vijest: Vijest;
  factcheck: FactcheckRezultat;
  context: ContextRezultat;
  jezik: JezikRezultat;
  zvanicniUrl: string | null;
  slika: UnsplashSlika | null;
}): Promise<string | null> {
  const { clanak, vijest, factcheck, context, jezik, zvanicniUrl, slika } = args;
  const db = createServerClient();

  const finalNaslov = jezik.ispravljen_naslov || clanak.naslov;
  const finalExcerpt = (jezik.ispravljen_excerpt || clanak.excerpt).slice(0, 250);
  const finalSadrzaj = jezik.ispravljen_sadrzaj || clanak.sadrzaj;
  const slug = napraviSlug(finalNaslov);

  const { error } = await db.from("clanci").insert({
    slug,
    naslov: finalNaslov,
    excerpt: finalExcerpt,
    sadrzaj: finalSadrzaj,
    kategorija: clanak.kategorija || vijest.kategorija || "vijesti",
    status: "draft",
    auto_generisan: true,
    izvor: vijest.izvor,
    min_citanja: clanak.min_citanja || 4,

    faktcheck_status: factcheck.ukupni_status,
    faktcheck_report: factcheck,
    context_report: context,
    jezik_ocjena: jezik.ocjena,
    jezik_report: { broj_ispravki: jezik.broj_ispravki, ispravke: jezik.ispravke.slice(0, 20), komentar: jezik.komentar },

    originalni_link: vijest.link,
    zvanicni_izvor: zvanicniUrl,
    tip: vijest.tip,

    slika: slika?.url || null,
    slika_autor: slika ? `${slika.autor} / Unsplash` : null,
  });

  if (error) {
    console.error(`❌ Upis drafta nije uspio: ${error.message}`);
    return null;
  }
  await oznaciObradjen(vijest.link);
  console.log(`   💾 Draft: ${slug}`);
  return slug;
}

/**
 * Zapiši log pokretanja u pipeline_logovi (admin Pipeline stranica ovo čita).
 */
export async function logujPipeline(args: {
  status: "uspjeh" | "djelimicno" | "greška";
  clanci_napisano: number;
  rss_vijesti: number;
  trending_tema: string | null;
  greska: string | null;
  trajanje_sekundi: number;
  detalji?: unknown;
}): Promise<void> {
  const db = createServerClient();
  const { error } = await db.from("pipeline_logovi").insert(args);
  if (error) console.warn(`⚠️  Log upis: ${error.message}`);
}
