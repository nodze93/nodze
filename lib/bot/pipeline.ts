// ============================================================
// PIPELINE ORCHESTRATOR — srce bota
// ============================================================
// RSS + Trends → Filter (1) → Writer (2) → Fact-check (3)
//              → Context (4) → Jezik (5) → Supabase DRAFT
//
// Svaki članak prolazi svih 5 kontrola. Ti na kraju u adminu
// vidiš 🟢🟡🔴 i odobriš jednim klikom.
import { fetchSveVijesti } from "./rss";
import { fetchTrends } from "./trends";
import { filterVijesti } from "./agenti/filter";
import { writeClanak } from "./agenti/writer";
import { factcheckClanak, contextCheck } from "./agenti/factcheck";
import { jezikCheck } from "./agenti/jezik";
import { ucitajObradjene, sacuvajDraft, logujPipeline } from "./publisher";
import { nadjiSliku } from "./slike";
import type { PipelineRezultat } from "./tipovi";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

    // ── 3. Filter Agent — kvote po kategoriji (env podesivo) ─
    // Default: 1 dijaspora + 1 svijet + 1 sport po pokretanju.
    // Sa 2 pokretanja dnevno (08:00 i 20:00) = 6 članaka/dan, 2 po kategoriji.
    const kDijaspora = parseInt(process.env.CLANCI_DIJASPORA || "1", 10);
    const kSvijet = parseInt(process.env.CLANCI_SVIJET || "1", 10);
    const kSport = parseInt(process.env.CLANCI_SPORT || "1", 10);

    const filtrirane = await filterVijesti(nove, trends, kDijaspora, kSvijet, kSport);
    rez.prosloFilter = filtrirane.length;

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

        // Fact-check i Context idu paralelno (nezavisni su)
        const [factcheck, context] = await Promise.all([
          factcheckClanak(clanak, izvorniTekst),
          contextCheck(clanak),
        ]);

        // Jezik (lektor) — zadnja stanica
        const jezik = await jezikCheck({
          naslov: clanak.naslov,
          excerpt: clanak.excerpt,
          sadrzaj: clanak.sadrzaj,
        });

        // Naslovna slika (Unsplash — samo URL, ne čuvamo fajl)
        const slika = await nadjiSliku(clanak.slika_pojmovi || vijest.naslov);

        const slug = await sacuvajDraft({ clanak, vijest, factcheck, context, jezik, zvanicniUrl, slika });
        if (slug) {
          rez.napisano++;
          rez.clanciZaPregled.push({
            naslov: (jezik.ispravljen_naslov || clanak.naslov).slice(0, 70),
            status: factcheck.ukupni_status,
            slug,
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
  try {
    await logujPipeline({
      status,
      clanci_napisano: rez.napisano,
      rss_vijesti: rez.procitanoRss,
      trending_tema: rez.trendingTema,
      greska,
      trajanje_sekundi: rez.trajanjeSekundi,
      detalji: { clanci: rez.clanciZaPregled, prosloFilter: rez.prosloFilter },
    });
  } catch {
    /* log ne smije srušiti pipeline */
  }
}
