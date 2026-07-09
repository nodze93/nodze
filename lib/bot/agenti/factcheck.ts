// ============================================================
// FACT-CHECK AGENT (3/5) + CONTEXT AGENT (4/5)
// ============================================================
// Fact-check: uporedi svaku tvrdnju iz članka s izvorom → 🟢🟡🔴
// Context: provjeri dijaspora ton, klikabilnost naslova, strukturu
import { pozoviSaAlatom, MODEL_BRZI } from "./claude";
import type { GeneriraniClanak, FactcheckRezultat, ContextRezultat } from "../tipovi";

const FACTCHECK_PROMPT = `Ti si fact-checker portala kodnas.de.

Dobijaš: (1) napisani članak, (2) izvorni tekst na kojem je baziran.

Zadatak: provjeri SVAKU konkretnu tvrdnju u članku (cifre, rokovi, uslovi, procedure, imena) i odredi je li potkrijepljena izvorom.

STATUSI tvrdnje:
- "ok" = jasno potvrđena u izvoru
- "upozorenje" = nije direktno u izvoru (možda tačna, ali nepotvrđena)
- "greska" = kontradikcija s izvorom ili očito netačna

UKUPNI STATUS:
- "zeleno" = sve ok, može se odmah objaviti
- "zuto" = ima upozorenja, urednik neka pogleda
- "crveno" = ima grešaka, NE objavljivati bez ispravke`;

const FACTCHECK_SCHEMA = {
  type: "object" as const,
  properties: {
    ukupni_status: { type: "string", enum: ["zeleno", "zuto", "crveno"] },
    mozeSeObjaviti: { type: "boolean" },
    tvrdnje: {
      type: "array",
      items: {
        type: "object",
        properties: {
          tekst: { type: "string" },
          status: { type: "string", enum: ["ok", "upozorenje", "greska"] },
          napomena: { type: "string" },
        },
        required: ["tekst", "status", "napomena"],
      },
    },
    preporuka: { type: "string", description: "Šta urednik treba ispraviti/provjeriti" },
  },
  required: ["ukupni_status", "mozeSeObjaviti", "tvrdnje", "preporuka"],
};

export async function factcheckClanak(
  clanak: GeneriraniClanak,
  izvorniTekst: string | null
): Promise<FactcheckRezultat> {
  console.log(`🔎 Fact-check Agent: provjeravam tvrdnje...`);

  if (!izvorniTekst) {
    return {
      ukupni_status: "zuto",
      mozeSeObjaviti: true,
      tvrdnje: [],
      preporuka: "Izvorni tekst nije fetchovan — automatska provjera nije bila moguća. Ručno provjeri cifre i rokove prije objave.",
    };
  }

  const sadrzajBezHTML = clanak.sadrzaj.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  try {
    const rez = await pozoviSaAlatom<FactcheckRezultat>({
      model: MODEL_BRZI,
      system: FACTCHECK_PROMPT,
      user: `ČLANAK:\n${clanak.naslov}\n\n${sadrzajBezHTML.slice(0, 4000)}\n\n---\n\nIZVORNI TEKST:\n${izvorniTekst.slice(0, 4000)}`,
      maxTokens: 1500,
      toolName: "izvjestaj_factcheck",
      toolOpis: "Vrati fact-check izvještaj za članak.",
      schema: FACTCHECK_SCHEMA,
    });
    console.log(`   ${rez.ukupni_status === "zeleno" ? "🟢" : rez.ukupni_status === "zuto" ? "🟡" : "🔴"} ${rez.tvrdnje.length} tvrdnji provjereno`);
    return rez;
  } catch (err) {
    console.warn(`   ⚠️ Fact-check greška: ${(err as Error).message}`);
    return {
      ukupni_status: "zuto",
      mozeSeObjaviti: true,
      tvrdnje: [],
      preporuka: `Fact-check nije uspio (${(err as Error).message}). Ručna provjera preporučena.`,
    };
  }
}

// ============================================================
// CONTEXT AGENT — dijaspora ugao, ton, klikabilnost
// ============================================================
const CONTEXT_PROMPT = `Ti si glavni urednik portala kodnas.de.

Provjeri je li članak spreman za našu publiku (Bosanci u Njemačkoj/Austriji):
- Piše li za dijasporu konkretno (ne generički)?
- Je li ton prijateljski i direktan?
- Je li naslov klikabilan ali pošten (bez lažnih obećanja)?
- Ima li konkretne iznose/rokove/korake gdje ih tema traži?
- Ima li korisne linkove?
- Je li excerpt do 200 znakova i tjera li na klik?`;

const CONTEXT_SCHEMA = {
  type: "object" as const,
  properties: {
    ton_ok: { type: "boolean" },
    dijaspora_kontekst: { type: "boolean" },
    ima_linkove: { type: "boolean" },
    naslov_ok: { type: "boolean" },
    excerpt_ok: { type: "boolean" },
    sugestije: { type: "array", items: { type: "string" } },
  },
  required: ["ton_ok", "dijaspora_kontekst", "ima_linkove", "naslov_ok", "excerpt_ok", "sugestije"],
};

export async function contextCheck(clanak: GeneriraniClanak): Promise<ContextRezultat> {
  console.log(`🧭 Context Agent: provjeravam ton i ugao...`);
  try {
    return await pozoviSaAlatom<ContextRezultat>({
      model: MODEL_BRZI,
      system: CONTEXT_PROMPT,
      user: `Naslov: ${clanak.naslov}\nExcerpt: ${clanak.excerpt}\nKategorija: ${clanak.kategorija}\nSadržaj (prvih 1500 znakova): ${clanak.sadrzaj.slice(0, 1500)}`,
      maxTokens: 800,
      toolName: "izvjestaj_context",
      toolOpis: "Vrati uredničku provjeru članka.",
      schema: CONTEXT_SCHEMA,
    });
  } catch (err) {
    console.warn(`   ⚠️ Context greška: ${(err as Error).message}`);
    return { ton_ok: true, dijaspora_kontekst: true, ima_linkove: false, naslov_ok: true, excerpt_ok: true, sugestije: [] };
  }
}
