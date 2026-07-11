// ============================================================
// PUBLISHER — upis u Supabase (SERVICE ROLE — zaobilazi RLS)
// ============================================================
import { createServerClient } from "../supabase";
import type { Vijest, GeneriraniClanak, FactcheckRezultat, ContextRezultat, JezikRezultat, SlikaInfo } from "./tipovi";

// Formatiraj oznaku autora slike prema izvoru (Wikimedia traži autora + licencu).
function oznakaSlike(s: SlikaInfo): string {
  if (s.izvor === "wikimedia") {
    return `${s.autor} — Wikimedia Commons${s.licenca ? ` (${s.licenca})` : ""}`;
  }
  return `${s.autor} / Unsplash`;
}

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
    .not("link", "like", "%::%") // interni "tema::"/"nas::" redovi se čitaju posebno
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) {
    console.warn(`⚠️  Dedupe učitavanje: ${error.message}`);
    return new Set();
  }
  return new Set((data || []).map((r: { link: string }) => r.link));
}

// Prefiks za "tema" redove u obradjeni_linkovi (dedupe po temi, bez nove tabele).
const TEMA_PREFIX = "tema::";

// Učitaj nedavne teme (naslove već napisanih priča) za dedupe po temi.
export async function ucitajTeme(limit = 300): Promise<string[]> {
  const db = createServerClient();
  const { data, error } = await db
    .from("obradjeni_linkovi")
    .select("link")
    .like("link", `${TEMA_PREFIX}%`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn(`⚠️  Teme učitavanje: ${error.message}`);
    return [];
  }
  return (data || []).map((r: { link: string }) => r.link.slice(TEMA_PREFIX.length));
}

// Zapamti temu (naslov IZVORA) napisanog članka — da se ista priča ne piše opet.
export async function oznaciTema(naslov: string): Promise<void> {
  if (!naslov) return;
  const db = createServerClient();
  await db
    .from("obradjeni_linkovi")
    .upsert({ link: TEMA_PREFIX + naslov.slice(0, 300) }, { onConflict: "link", ignoreDuplicates: true });
}

// Prefiks za GOTOVE (bosanske) naslove — jači dedupe (ista priča i kad su
// izvorni naslovi drugačije sročeni; naš pisac generiše slične naslove).
const NASLOV_PREFIX = "nas::";

export async function ucitajNaslove(limit = 300): Promise<string[]> {
  const db = createServerClient();
  const { data, error } = await db
    .from("obradjeni_linkovi")
    .select("link")
    .like("link", `${NASLOV_PREFIX}%`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn(`⚠️  Naslovi učitavanje: ${error.message}`);
    return [];
  }
  return (data || []).map((r: { link: string }) => r.link.slice(NASLOV_PREFIX.length));
}

export async function oznaciNaslov(naslov: string): Promise<void> {
  if (!naslov) return;
  const db = createServerClient();
  await db
    .from("obradjeni_linkovi")
    .upsert({ link: NASLOV_PREFIX + naslov.slice(0, 300) }, { onConflict: "link", ignoreDuplicates: true });
}

export async function oznaciObradjen(link: string): Promise<void> {
  const db = createServerClient();
  await db.from("obradjeni_linkovi").upsert({ link });
}

/**
 * Zapamti VIŠE linkova odjednom kao "viđene" (dedupe).
 * VAŽNO za trošak: bez ovoga filter (Claude) ponovo ocjenjuje iste
 * ~140 vijesti svakih 15 min. Ovako svaki sljedeći run gleda samo
 * stvarno nove vijesti → drastično manje Claude poziva.
 */
export async function oznaciObradjeneBatch(linkovi: string[]): Promise<void> {
  if (linkovi.length === 0) return;
  const db = createServerClient();
  const jedinstveni = Array.from(new Set(linkovi.filter(Boolean)));
  const redovi = jedinstveni.map((link) => ({ link }));
  const { error } = await db
    .from("obradjeni_linkovi")
    .upsert(redovi, { onConflict: "link", ignoreDuplicates: true });
  if (error) console.warn(`⚠️  Batch dedupe upis: ${error.message}`);
  else console.log(`   🔖 Zapamćeno ${jedinstveni.length} vijesti (neće se opet filtrirati)`);
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
  slika: SlikaInfo | null;
}): Promise<string | null> {
  const { clanak, vijest, factcheck, context, jezik, zvanicniUrl, slika } = args;
  const db = createServerClient();

  const finalNaslov = jezik.ispravljen_naslov || clanak.naslov;
  const finalExcerpt = (jezik.ispravljen_excerpt || clanak.excerpt).slice(0, 250);
  const finalSadrzaj = jezik.ispravljen_sadrzaj || clanak.sadrzaj;
  const slug = napraviSlug(finalNaslov);

  // Kategorija po PRAVILU (izvor/strana pobjeđuju pisca — da isti članak ne
  // upadne u dvije rubrike, npr. i "Vijesti iz Njemačke" i "Iz svijeta"):
  //  - svjetski izvori  → "svijet"
  //  - sport            → "sport"
  //  - bosanska strana  → "bih"
  //  - njemačka strana  → piščeva tema, ALI "svijet" nije dozvoljen (→ "vijesti")
  const piscevaKat = clanak.kategorija || vijest.kategorija || "vijesti";
  const bihStrana = vijest.strana ? vijest.strana === "bih" : vijest.jezik !== "de";
  const finalKategorija =
    vijest.tip === "svjetske" ? "svijet"
    : vijest.tip === "sport" ? "sport"
    : bihStrana ? "bih"
    : piscevaKat === "svijet" ? "vijesti"
    : piscevaKat;

  const { error } = await db.from("clanci").insert({
    slug,
    naslov: finalNaslov,
    excerpt: finalExcerpt,
    sadrzaj: finalSadrzaj,
    kategorija: finalKategorija,
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
    slika_autor: slika ? oznakaSlike(slika) : null,
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
