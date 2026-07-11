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
import { gramatikaProlaz } from "./agenti/gramatika";
import { temaTokeni, istaTema } from "./dedupe";
import { bosaniziraj } from "./bosanski";
import { ucitajObradjene, ucitajTeme, ucitajNaslove, oznaciTema, oznaciNaslov, oznaciObradjen, oznaciObradjeneBatch, sacuvajDraft, logujPipeline } from "./publisher";
import { nadjiSliku } from "./slike";
import { nadjiSlikuWiki } from "./slike-wikimedia";
import type { PipelineRezultat, FactcheckRezultat, ContextRezultat, SlikaInfo, JezikRezultat } from "./tipovi";

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
    // Default: 1 DE + 1 svijet + 1 sport po pokretanju. (BiH rubrika uklonjena.)
    const kDE = parseInt(process.env.CLANCI_DE || process.env.CLANCI_DIJASPORA || "1", 10);
    const kSvijet = parseInt(process.env.CLANCI_SVIJET || "1", 10);
    const kSport = parseInt(process.env.CLANCI_SPORT || "1", 10);

    const filtrirane = await filterVijesti(nove, trends, kDE, kSvijet, kSport);
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
    // Dedupe po TEMI: naslovi nedavno napisanih priča (hvata istu vijest
    // koja dođe s drugog izvora/linka — link-dedupe to ne uhvati).
    const vidjeneTeme = (await ucitajTeme()).map(temaTokeni);
    const vidjeniNaslovi = (await ucitajNaslove()).map(temaTokeni);
    for (const vijest of filtrirane) {
      try {
        // Ista priča s drugog izvora → preskoči (da ne pišemo duplikat).
        const teme = temaTokeni(vijest.naslov);
        if (vidjeneTeme.some((t) => istaTema(teme, t))) {
          console.log(`   ⏭️  Duplikat teme — preskačem: ${vijest.naslov.slice(0, 55)}`);
          await oznaciObradjen(vijest.link);
          continue;
        }
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

        // JEDAN jezički prolaz — Sonnet (gramatika + kroatizmi).
        // Stari Haiku lektor je UKLONJEN; Sonnet ga zamjenjuje (bolja gramatika,
        // a trošak sličan jer je nestao cijeli jedan prolaz).
        const gram = await gramatikaProlaz({
          naslov: clanak.naslov,
          excerpt: clanak.excerpt,
          sadrzaj: clanak.sadrzaj,
        });
        const jezik: JezikRezultat = {
          ispravljen_naslov: gram.naslov,
          ispravljen_excerpt: gram.excerpt,
          ispravljen_sadrzaj: gram.sadrzaj,
          broj_ispravki: gram.broj_ispravki,
          ispravke: (gram.ispravke || []).map((i) => ({
            original: i.original, ispravljeno: i.ispravljeno, razlog: "gramatika/jezik",
          })),
          ocjena: gram.ocjena,
          komentar: "Sonnet jezički prolaz (bez zasebnog Haiku lektora)",
        };

        // Besplatni deterministički popravak kroatizama (0 troška, 100% pouzdano).
        jezik.ispravljen_naslov = bosaniziraj(jezik.ispravljen_naslov);
        jezik.ispravljen_excerpt = bosaniziraj(jezik.ispravljen_excerpt);
        jezik.ispravljen_sadrzaj = bosaniziraj(jezik.ispravljen_sadrzaj);

        // Dedupe po GOTOVOM naslovu — najjači sloj: hvata istu priču čak i
        // kad su izvorni naslovi drugačije sročeni (npr. dva članka isti dan
        // s istog izvora o istoj reformi).
        const finalNaslov = jezik.ispravljen_naslov || clanak.naslov;
        const naslovTk = temaTokeni(finalNaslov);
        if (vidjeniNaslovi.some((t) => istaTema(naslovTk, t))) {
          console.log(`   ⏭️  Duplikat (naslov) — preskačem: ${finalNaslov.slice(0, 55)}`);
          await oznaciObradjen(vijest.link);
          continue;
        }

        // Naslovna slika: PRVO Wikimedia (prava, besplatna, sigurna za Njemačku),
        // pa Unsplash kao rezerva ako Wikimedia nema ništa relevantno.
        const pojam = clanak.slika_pojmovi || vijest.naslov;
        let slika: SlikaInfo | null = null;
        const wiki = await nadjiSlikuWiki(pojam);
        if (wiki) {
          slika = { url: wiki.url, autor: wiki.autor, izvor: "wikimedia", licenca: wiki.licenca };
        } else {
          const u = await nadjiSliku(pojam);
          if (u) slika = { url: u.url, autor: u.autor, izvor: "unsplash" };
        }

        const slug = await sacuvajDraft({ clanak, vijest, factcheck, context, jezik, zvanicniUrl, slika });
        if (slug) {
          rez.napisano++;
          rez.clanciZaPregled.push({
            naslov: (jezik.ispravljen_naslov || clanak.naslov).slice(0, 70),
            status: factcheck.ukupni_status,
            slug,
            kategorija: clanak.kategorija,
          });
          // Zapamti temu (izvorni naslov) I gotov naslov — za dedupe u ovom i
          // budućim runovima (dva sloja: po izvoru + po gotovom naslovu).
          vidjeneTeme.push(teme);
          vidjeniNaslovi.push(naslovTk);
          await oznaciTema(vijest.naslov);
          await oznaciNaslov(finalNaslov);
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
