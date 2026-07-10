// ============================================================
// PIPELINE ORCHESTRATOR — srce bota
// ============================================================
// RSS + Trends → Filter (1) → Writer (2) → Fact-check (3, samo dijaspora)
//              → Jezik/lektor (4) → Gramatika (5, samo gramatika) → Supabase DRAFT
//
// Context provjera je isključena radi uštede (nije se koristila u adminu).
// Ti na kraju u adminu vidiš 🟢🟡🔴 i odobriš jednim klikom.
import { fetchSveVijesti } from "./rss";
import { fetchTrends } from "./trends";
import { filterVijesti } from "./agenti/filter";
import { writeClanak } from "./agenti/writer";
import { factcheckClanak } from "./agenti/factcheck";
import { jezikCheck } from "./agenti/jezik";
import { gramatikaProlaz } from "./agenti/gramatika";
import { ucitajObradjene, oznaciObradjeneBatch, sacuvajDraft, logujPipeline } from "./publisher";
import { nadjiSliku } from "./slike";
import type { PipelineRezultat, FactcheckRezultat, ContextRezultat } from "./tipovi";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Default rezultat kad se fact-check preskače (sport/svijet — niži rizik).
// Ušteda: jedan Haiku poziv manje po takvom članku.
const FACTCHECK_PRESKOCEN: FactcheckRezultat = {
  ukupni_status: "zeleno",
  mozeSeObjaviti: true,
  tvrdnje: [],
  preporuka: "Fact-check preskočen (sport/svijet — niži rizik).",
};

// Context provjera je ISKLJUČENA (ušteda: jedan Claude poziv po svakom članku).
// Vraćala je samo true/false kućice koje se u adminu ne koriste. Zadržavamo
// default objekat da baza (context_report kolona) ostane ista.
const CONTEXT_DEFAULT: ContextRezultat = {
  ton_ok: true,
  dijaspora_kontekst: true,
  ima_linkove: true,
  naslov_ok: true,
  excerpt_ok: true,
  sugestije: [],
};

export async function pokreniPipeline(): Promise<PipelineRezultat> {
  const start = Date.now();
  console.log("\n🚀 ========== DIJASPORA BOT ==========");
  console.log(`⏰ ${new Date().toISOString()}\n`);

  const rez: PipelineRezultat = {
    procitanoRss: 0,
    prosloFilter: 0,
    napisano: 0,
    greske: 0,
    trajanjeSekundi: 0,
    trendingTema: null,
    clanciZaPregled: [],
  };

  try {
    // ── 1. Prikupljanje ──────────────────────────────────────
    const [vijesti, trends] = await Promise.all([fetchSveVijesti(), fetchTrends()]);
    rez.procitanoRss = vijesti.length;
    rez.trendingTema = trends.relevantni[0] || trends.svi[0] || null;

    if (vijesti.length === 0) {
      console.log("❌ Nijedan feed nije vratio vijesti.");
      await zavrsi(rez, start, "greška", "Nijedan RSS feed nije vratio vijesti");
      return rez;
    }

    // ── 2. Dedupe (izbaci već obrađene linkove) ──────────────
    const obradjeni = await ucitajObradjene();
    const nove = vijesti.filter((v) => !obradjeni.has(v.link));
    console.log(`🔁 Dedupe: ${vijesti.length} → ${nove.length} novih`);

    if (nove.length === 0) {
      console.log("✅ Sve današnje vijesti su već obrađene.");
      await zavrsi(rez, start, "uspjeh", null);
      return rez;
    }

    // ── 3. Filter Agent — kvote po grupi (env podesivo) ─
    // Default: 1 DE + 1 BiH + 1 svijet + 1 sport po pokretanju.
    // DE i BiH su ODVOJENI — BiH nikad ne ostane prazan.
    const kDE = parseInt(process.env.CLANCI_DE || process.env.CLANCI_DIJASPORA || "1", 10);
    const kBih = parseInt(process.env.CLANCI_BIH || "1", 10);
    const kSvijet = parseInt(process.env.CLANCI_SVIJET || "1", 10);
    const kSport = parseInt(process.env.CLANCI_SPORT || "1", 10);

    const filtrirane = await filterVijesti(nove, trends, kDE, kBih, kSvijet, kSport);
    rez.prosloFilter = filtrirane.length;

    // ⚡ UŠTEDA: zapamti SVE vijesti koje su prošle kroz filter kao "viđene".
    // Bez ovoga filter (Claude) ponovo ocjenjuje istih ~140 vijesti svakih
    // 15 min. Ovako sljedeći run gleda samo stvarno nove vijesti.
    await oznaciObradjeneBatch(nove.map((v) => v.link));

    if (filtrirane.length === 0) {
      console.log("❌ Nijedna vijest nije prošla filter (prag 6/10).");
      await zavrsi(rez, start, "uspjeh", null);
      return rez;
    }

    // ── 4-5-6-7. Writer → Fact-check → Context → Jezik → Draft
    for (const vijest of filtrirane) {
      try {
        console.log(`\n─── ${vijest.naslov.slice(0, 60)} ───`);

        const { clanak, izvorniTekst, zvanicniUrl } = await writeClanak(vijest);
        if (!clanak) {
          rez.greske++;
          continue;
        }

        // Fact-check SAMO za dijaspora članke (viši rizik/preciznost).
        // Sport i svijet ga preskaču radi uštede. Context provjera isključena
        // (ušteda jednog Claude poziva po članku) — koristimo default.
        const jeDijaspora = vijest.tip === "dijaspora";
        if (!jeDijaspora) {
          console.log("   ⏭️  Fact-check preskočen (sport/svijet)");
        }
        const factcheck = jeDijaspora
          ? await factcheckClanak(clanak, izvorniTekst)
          : FACTCHECK_PRESKOCEN;
        const context = CONTEXT_DEFAULT;

        // Jezik (lektor) — provjera jezika, kroatizmi, stil
        const jezik = await jezikCheck({
          naslov: clanak.naslov,
          excerpt: clanak.excerpt,
          sadrzaj: clanak.sadrzaj,
        });

        // ZAVRŠNI GRAMATIČKI PROLAZ — zaseban poziv, SAMO gramatika.
        // Model je prekidač (MODEL_GRAMATIKA): default Haiku, lako na Sonnet.
        const gram = await gramatikaProlaz({
          naslov: jezik.ispravljen_naslov,
          excerpt: jezik.ispravljen_excerpt,
          sadrzaj: jezik.ispravljen_sadrzaj,
        });
        // Ubaci gramatički ispravljen tekst kao finalni (ide u bazu).
        jezik.ispravljen_naslov = gram.naslov;
        jezik.ispravljen_excerpt = gram.excerpt;
        jezik.ispravljen_sadrzaj = gram.sadrzaj;
        jezik.broj_ispravki += gram.broj_ispravki;

        // Naslovna slika (Unsplash — samo URL, ne čuvamo fajl)
        const slika = await nadjiSliku(clanak.slika_pojmovi || vijest.naslov);

        const slug = await sacuvajDraft({ clanak, vijest, factcheck, context, jezik, zvanicniUrl, slika });
        if (slug) {
          rez.napisano++;
          rez.clanciZaPregled.push({
            naslov: (jezik.ispravljen_naslov || clanak.naslov).slice(0, 70),
            status: factcheck.ukupni_status,
            slug,
            kategorija: clanak.kategorija,
          });
        } else {
          rez.greske++;
        }

        await sleep(1500); // pauza — ne udaraj API rate limit
      } catch (err) {
        console.error(`❌ Greška za "${vijest.naslov.slice(0, 40)}": ${(err as Error).message}`);
        rez.greske++;
      }
    }

    const status = rez.greske === 0 ? "uspjeh" : rez.napisano > 0 ? "djelimicno" : "greška";
    await zavrsi(rez, start, status, rez.greske > 0 ? `${rez.greske} grešaka u obradi` : null);
  } catch (err) {
    console.error(`💥 Pipeline crash: ${(err as Error).message}`);
    rez.greske++;
    await zavrsi(rez, start, "greška", (err as Error).message);
  }

  // Izvještaj
  console.log("\n🏁 ========== ZAVRŠENO ==========");
  console.log(`⏱  ${rez.trajanjeSekundi}s | ✅ ${rez.napisano} draftova | ❌ ${rez.greske} grešaka`);
  rez.clanciZaPregled.forEach((c) => {
    const ikona = c.status === "zeleno" ? "🟢" : c.status === "zuto" ? "🟡" : "🔴";
    console.log(`   ${ikona} ${c.naslov}`);
  });
  if (rez.napisano > 0) console.log("\n👉 Otvori /admin/clanci i odobri članke.");

  return rez;
}

async function zavrsi(
  rez: PipelineRezultat,
  start: number,
  status: "uspjeh" | "djelimicno" | "greška",
  greska: string | null
): Promise<void> {
  rez.trajanjeSekundi = Math.round((Date.now() - start) / 1000);

  // "Tema" pokretanja = kategorije stvarno napisanih članaka (npr. "viza, bih, sport").
  // Korisnije od nekadašnje "trending" riječi koja je uvijek bila ista.
  const napisaneTeme = Array.from(
    new Set(rez.clanciZaPregled.map((c) => c.kategorija).filter(Boolean) as string[])
  ).join(", ");

  try {
    await logujPipeline({
      status,
      clanci_napisano: rez.napisano,
      rss_vijesti: rez.procitanoRss,
      trending_tema: napisaneTeme || null,
      greska,
      trajanje_sekundi: rez.trajanjeSekundi,
      detalji: { clanci: rez.clanciZaPregled, prosloFilter: rez.prosloFilter },
    });
  } catch {
    /* log ne smije srušiti pipeline */
  }
}
