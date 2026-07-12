// ============================================================
// PIPELINE 2 — LIJEVAK ("Dnevni filter njemačkih vijesti")
// ============================================================
// Nova arhitektura. Pali se env prekidačem NOVI_PIPELINE=on.
// Stari pipeline.ts ostaje netaknut kao sigurnosna mreža.
//
// LIJEVAK:
//   ~1500 sirovih (RSS, besplatno)
//     → dedupe po linku (baza)                      [bez AI]
//     → PRAVILA: baci šum/staro/prazno              [bez AI]  ~150
//     → KLJUČNE RIJEČI + težina izvora: top 40      [bez AI]
//     → AI TRIAŽA: jedan poziv, naslov+opis         [1 AI poziv] ~8
//     → dedupe po TEMI (ista priča iz dva izvora)   [bez AI]
//     → za pobjednike: WRITER čita cijeli tekst i piše [AI]
//     → Fact-check + Context + Jezik → Supabase DRAFT
//
// AI "skupo" radi samo na ~8 članaka dnevno. Trošak: centi/dan.

import { fetchIzvore } from "./rss";
import { IZVORI_PRO } from "./izvori-prosireni";
import { primijeniPravila } from "./lijevak/pravila";
import { bodujKljucnim } from "./lijevak/kljucne";
import { triazirajVijesti } from "./agenti/triaza";
import { temaTokeni, istaTema } from "./dedupe";
import { writeClanak } from "./agenti/writer";
import { factcheckClanak, contextCheck } from "./agenti/factcheck";
import { jezikCheck } from "./agenti/jezik";
import { ucitajObradjene, ucitajNedavneNaslove, sacuvajDraft, logujPipeline } from "./publisher";
import { nadjiSliku } from "./slike";
import type { PipelineRezultat, FactcheckRezultat, Vijest } from "./tipovi";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const FACTCHECK_PRESKOCEN: FactcheckRezultat = {
  ukupni_status: "zeleno",
  mozeSeObjaviti: true,
  tvrdnje: [],
  preporuka: "Fact-check preskočen (sport/svijet — niži rizik).",
};

// Izbaci istu priču koja se pojavila iz dva izvora (poredi teme naslova).
function izbaciDuplikateTeme(vijesti: Vijest[]): Vijest[] {
  const zadrzane: { v: Vijest; tokeni: Set<string> }[] = [];
  for (const v of vijesti) {
    const tokeni = temaTokeni(v.naslov);
    if (zadrzane.some((z) => istaTema(z.tokeni, tokeni))) continue;
    zadrzane.push({ v, tokeni });
  }
  return zadrzane.map((z) => z.v);
}

export async function pokreniPipeline2(): Promise<PipelineRezultat> {
  const start = Date.now();
  console.log("\n🚀 ===== DNEVNI FILTER (pipeline2 / lijevak) =====");
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
    // ── 1. Prikupljanje (prošireni, slojeviti izvori) ──────────
    const vijesti = await fetchIzvore(IZVORI_PRO);
    rez.procitanoRss = vijesti.length;
    if (vijesti.length === 0) {
      await zavrsi(rez, start, "greška", "Nijedan feed nije vratio vijesti");
      return rez;
    }

    // ── 2. Dedupe po linku (već obrađeno) ──────────────────────
    const obradjeni = await ucitajObradjene();
    const nove = vijesti.filter((v) => !obradjeni.has(v.link));
    console.log(`🔁 Dedupe (link): ${vijesti.length} → ${nove.length} novih`);
    if (nove.length === 0) {
      await zavrsi(rez, start, "uspjeh", null);
      return rez;
    }

    // ── 3. PRAVILA (bez AI) — baci šum/staro/prazno ────────────
    const { prosle } = primijeniPravila(nove, {
      maxStarostSati: parseInt(process.env.MAX_STAROST_SATI || "36", 10),
    });

    // ── 4. KLJUČNE RIJEČI + težina izvora (bez AI) → top N ─────
    const topN = parseInt(process.env.TOP_ZA_TRIAZU || "40", 10);
    const uzak = bodujKljucnim(prosle, topN);

    // ── 5. AI TRIAŽA (jedan poziv na naslov+opis) → pobjednici ─
    // Memorija tema: naslovi objavljeni zadnjih par dana → signal triaži
    // (ne da izbaci istu temu, nego da prepozna "isto" vs "novi razvoj").
    const memorija = await ucitajNedavneNaslove(3, 30);
    if (memorija.length) console.log(`🧠 Memorija: ${memorija.length} nedavnih naslova (signal triaži)`);
    let izabrane = await triazirajVijesti(uzak, { vecPokriveno: memorija });

    // ── 6. Dedupe po TEMI (ista priča iz dva izvora) ───────────
    const prijeTeme = izabrane.length;
    izabrane = izbaciDuplikateTeme(izabrane);
    if (izabrane.length < prijeTeme) {
      console.log(`🧯 Tema-dedupe: ${prijeTeme} → ${izabrane.length} (izbačene duple priče)`);
    }
    rez.prosloFilter = izabrane.length;

    if (izabrane.length === 0) {
      console.log("❌ Ništa nije prešlo prag triaže danas.");
      await zavrsi(rez, start, "uspjeh", null);
      return rez;
    }

    // ── 7. Pisanje: tek SADA writer čita cijeli članak ─────────
    for (const vijest of izabrane) {
      try {
        console.log(`\n─── ✍️  ${vijest.naslov.slice(0, 60)} ───`);

        const { clanak, izvorniTekst, zvanicniUrl } = await writeClanak(vijest);
        if (!clanak) {
          rez.greske++;
          continue;
        }

        // Fact-check samo za dijaspora (viši rizik); sport/svijet preskaču.
        const jeDijaspora = vijest.tip === "dijaspora";
        const [factcheck, context] = await Promise.all([
          jeDijaspora ? factcheckClanak(clanak, izvorniTekst) : Promise.resolve(FACTCHECK_PRESKOCEN),
          contextCheck(clanak),
        ]);

        const jezik = await jezikCheck({
          naslov: clanak.naslov,
          excerpt: clanak.excerpt,
          sadrzaj: clanak.sadrzaj,
        });

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

        await sleep(1500);
      } catch (err) {
        console.error(`❌ Greška za "${vijest.naslov.slice(0, 40)}": ${(err as Error).message}`);
        rez.greske++;
      }
    }

    const status = rez.greske === 0 ? "uspjeh" : rez.napisano > 0 ? "djelimicno" : "greška";
    await zavrsi(rez, start, status, rez.greske > 0 ? `${rez.greske} grešaka u obradi` : null);
  } catch (err) {
    console.error(`💥 Pipeline2 crash: ${(err as Error).message}`);
    rez.greske++;
    await zavrsi(rez, start, "greška", (err as Error).message);
  }

  console.log("\n🏁 ===== ZAVRŠENO (lijevak) =====");
  console.log(`⏱  ${rez.trajanjeSekundi}s | ✅ ${rez.napisano} draftova | ❌ ${rez.greske} grešaka`);
  return rez;
}

async function zavrsi(
  rez: PipelineRezultat,
  start: number,
  status: "uspjeh" | "djelimicno" | "greška",
  greska: string | null
): Promise<void> {
  rez.trajanjeSekundi = Math.round((Date.now() - start) / 1000);
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
      detalji: { clanci: rez.clanciZaPregled, prosloFilter: rez.prosloFilter, lijevak: true },
    });
  } catch {
    /* log ne smije srušiti pipeline */
  }
}
