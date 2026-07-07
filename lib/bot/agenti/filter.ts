// ============================================================
// FILTER AGENT (1/5) — ocjenjuje relevantnost vijesti 0-10
// ============================================================
// Zadržava samo vijesti s ocjenom 6+.
// Dijaspora vijesti: relevantnost za život Bosanaca u Njemačkoj.
// Svjetske vijesti: klikabilnost (da li bi naš čovjek kliknuo).
import { pozoviSaAlatom, MODEL_BRZI } from "./claude";
import type { Vijest } from "../tipovi";
import type { TrendsRezultat } from "../trends";

const FILTER_DIJASPORA_PROMPT = `Ti si urednik portala Dijaspora.ba — portala za Bosance, Bošnjake i Bosanke koji žive u Njemačkoj i Austriji.

Tvoj zadatak: ocijeni relevantnost svake vijesti za našu publiku, od 0 do 10.

VISOKA OCJENA (7-10):
- Promjene njemačkih zakona koje direktno utiču na strance (vize, boravak, rad, državljanstvo)
- Finansijske beneficije i rokovi (Elterngeld, Kindergeld, Steuererklärung, Bürgergeld, Wohngeld)
- Konzulati BiH u Njemačkoj/Austriji, pasoši, dokumenti
- BiH vijesti koje utiču na dijasporu (glasanje iz inostranstva, novi zakoni, nekretnine)
- Priče o uspješnim Bosancima vani (inspirativno = klikabilno)
- Sport: bosanski sportisti u Bundesligi i reprezentacija

NISKA OCJENA (0-3):
- Opće njemačke političke rasprave bez direktnog uticaja na strance
- BiH unutrašnja politika bez veze s dijasporom
- Crna hronika bez veze s dijasporom
- Celebrity gossip bez veze s BiH
- Suhe ekonomske analize bez konkretnih implikacija`;

const FILTER_BIH_PROMPT = `Ti si urednik rubrike "Bosna i Hercegovina" na portalu za našu dijasporu u Njemačkoj i Austriji.

Ova rubrika je PROZOR U DOMOVINU — čitaoci žive vani i žele znati šta se DEŠAVA U BiH dok ih nema. Ovdje se NE piše o Njemačkoj/Austriji; to ide u drugu rubriku.

Ocijeni svaku vijest 0-10: koliko bi bila zanimljiva Bosancu vani koji prati šta se dešava kod kuće.

VISOKA OCJENA (7-10):
- Važni događaji u BiH: politika, izbori, odluke vlasti, novi zakoni
- Ekonomija kod kuće: cijene, plate, penzije, struja, gorivo, inflacija u BiH
- Društvo i svakodnevica: nesreće, vremenske nepogode, infrastruktura, zdravstvo, školstvo
- Veze domovine i dijaspore: glasanje iz inostranstva, pasoši, nekretnine, ulaganja, povratak
- Priče koje se prepričavaju: veliki događaji, skandali, uspjesi naših ljudi u BiH, kultura, sport u BiH
- Bilo šta o čemu bi naš čovjek vani rekao: "jesi čuo šta je bilo u Bosni?"

NISKA OCJENA (0-3):
- Vijesti koje se TIČU Njemačke/Austrije/EU migracija (to ide u DE rubriku, ne ovdje)
- Sitne lokalne vijesti bez šireg značaja
- Suha PR saopštenja i najave
- Puke statistike bez priče`;

const FILTER_SVIJET_PROMPT = `Ti si urednik rubrike "Svijet" na portalu Dijaspora.ba — portala za Bosance u Njemačkoj.

Publika: Bosanci 25-50 godina, prate svijet, vole klikabilne naslove ali NE lažne.

Ocijeni svaku vijest 0-10: da li bi naš čitalac kliknuo?

VISOKA OCJENA (7-10):
- Veliki politički događaji i skandali (SAD, EU, Rusija, Kina, Bliski istok)
- Ratovi i krize koje utiču na Evropu ili ekonomiju (a time i na dijasporu)
- Ekonomija koja pogađa svakoga: inflacija, cijene, euro, gorivo
- Šokantne/bizarne priče koje se viralno šire ("kako je to moguće?")
- Velike prirodne katastrofe i vanredni događaji
- Priče o pravdi/nepravdi koje bude emociju

NISKA OCJENA (0-3):
- Lokalne vijesti bez globalnog značaja
- Suhe tehničke vijesti bez dramatičnog ugla
- PR saopštenja i korporativne vijesti
- Sport bez veze s BiH/Bosancima`;

const FILTER_SPORT_PROMPT = `Ti si sportski urednik portala Dijaspora.ba — portala za Bosance u Njemačkoj i Austriji.

Publika: Bosanci koji prate Bundesligu, reprezentaciju BiH i naše igrače vani.

Ocijeni svaku vijest 0-10: da li bi naš čitalac kliknuo?

VISOKA OCJENA (7-10):
- Bosanski sportisti u inostranstvu (transferi, golovi, povrede, izjave)
- Reprezentacija BiH (sve: nogomet, košarka, rukomet...)
- Bundesliga — velike utakmice, dramatični rezultati, skandali
- Liga prvaka / EURO / SP — velike priče
- Transferi koji tresu region ili Bundesligu
- Emotivne sportske priče (povratak nakon povrede, uspjeh naših ljudi)

NISKA OCJENA (0-3):
- Niželigaški sport bez naših igrača
- Sportovi koje naša publika ne prati, bez BiH veze
- Suhe statistike bez priče
- Lokalni sport trećih zemalja`;

const FILTER_SCHEMA = {
  type: "object" as const,
  properties: {
    ocjene: {
      type: "array",
      description: "Ocjena za svaku vijest iz liste",
      items: {
        type: "object",
        properties: {
          index: { type: "integer", description: "Redni broj vijesti iz liste" },
          score: { type: "integer", description: "Ocjena 0-10" },
          razlog: { type: "string", description: "Kratak razlog ocjene" },
          kategorija: {
            type: "string",
            enum: ["viza", "posao", "stan", "zdravstvo", "porodica", "porez", "penzija",
                   "finansije", "vijesti", "bih", "sport", "svijet", "povratak"],
            description: "Najprikladnija kategorija za ovu vijest",
          },
        },
        required: ["index", "score", "razlog", "kategorija"],
      },
    },
  },
  required: ["ocjene"],
};

interface FilterOdgovor {
  ocjene: { index: number; score: number; razlog: string; kategorija: string }[];
}

async function filterBatch(
  vijesti: Vijest[],
  systemPrompt: string,
  oznaka: string,
  trends: TrendsRezultat | null
): Promise<Vijest[]> {
  if (vijesti.length === 0) return [];

  const BATCH = 20;
  const prosle: Vijest[] = [];

  for (let i = 0; i < vijesti.length; i += BATCH) {
    const batch = vijesti.slice(i, i + BATCH);
    const lista = batch
      .map((v, idx) => `[${idx}] ${v.izvor}: "${v.naslov}" — ${v.excerpt?.slice(0, 150) || ""}`)
      .join("\n");

    const trendKontekst =
      trends && trends.relevantni.length > 0
        ? `\nTrenutno trending u Njemačkoj: ${trends.relevantni.slice(0, 8).join(", ")}`
        : "";

    try {
      const rez = await pozoviSaAlatom<FilterOdgovor>({
        model: MODEL_BRZI,
        system: systemPrompt,
        user: `Ocijeni ove vijesti (${oznaka}):${trendKontekst}\n\n${lista}`,
        maxTokens: 2000,
        toolName: "ocijeni_vijesti",
        toolOpis: "Vrati ocjene relevantnosti za sve vijesti iz liste.",
        schema: FILTER_SCHEMA,
      });

      for (const o of rez.ocjene) {
        if (o.score >= 6 && batch[o.index]) {
          prosle.push({
            ...batch[o.index],
            score: o.score,
            razlogFiltera: o.razlog,
            kategorija: o.kategorija,
          });
        }
      }
    } catch (err) {
      console.warn(`⚠️  Filter ${oznaka} batch ${i}: ${(err as Error).message}`);
    }
  }

  return prosle;
}

/**
 * Filtrira sve vijesti i vraća top članke po kvotama:
 * DE (njemački izvori) + BiH (bosanski izvori) + Svijet + Sport.
 * DE i BiH su odvojeni pa BiH nikad ne ostane prazan.
 */
export async function filterVijesti(
  vijesti: Vijest[],
  trends: TrendsRezultat | null,
  maxDE = 1,
  maxBih = 1,
  maxSvjetske = 1,
  maxSport = 1
): Promise<Vijest[]> {
  console.log(`🔍 Filter Agent: ocjenjujem ${vijesti.length} vijesti...`);

  // Dijaspora izvori se dijele po STRANI: "de" = Njemačka, "bih" = Bosna.
  // (DW Bosanski je bosanski jezik ali piše o Njemačkoj → strana "de".)
  // Fallback ako strana nije zadata: njemački jezik → DE, ostalo → BiH.
  const jeBihStrana = (v: Vijest) => (v.strana ? v.strana === "bih" : v.jezik !== "de");
  const dijaspora = vijesti.filter((v) => v.tip === "dijaspora");
  const de = dijaspora.filter((v) => !jeBihStrana(v));
  const bih = dijaspora.filter((v) => jeBihStrana(v));
  const svjetske = vijesti.filter((v) => v.tip === "svjetske");
  const sport = vijesti.filter((v) => v.tip === "sport");
  console.log(`   🇩🇪 DE: ${de.length} | 🇧🇦 BiH: ${bih.length} | 🌍 Svijet: ${svjetske.length} | ⚽ Sport: ${sport.length}`);

  const [ocDE, ocBih, ocSvjetske, ocSport] = await Promise.all([
    filterBatch(de, FILTER_DIJASPORA_PROMPT, "DE", trends),
    filterBatch(bih, FILTER_BIH_PROMPT, "BiH", null),
    filterBatch(svjetske, FILTER_SVIJET_PROMPT, "svijet", null),
    filterBatch(sport, FILTER_SPORT_PROMPT, "sport", null),
  ]);

  const poOcjeni = (a: Vijest, b: Vijest) => (b.score || 0) - (a.score || 0);
  const topDE = ocDE.sort(poOcjeni).slice(0, maxDE);
  // BiH = vijesti iz domovine → uvijek kategorija "bih"
  const topBih = ocBih.sort(poOcjeni).map((v) => ({ ...v, kategorija: "bih" })).slice(0, maxBih);
  const topSvjetske = ocSvjetske.sort(poOcjeni).slice(0, maxSvjetske);
  const topSport = ocSport.sort(poOcjeni).map((v) => ({ ...v, kategorija: "sport" })).slice(0, maxSport);
  const rezultat = [...topDE, ...topBih, ...topSvjetske, ...topSport];

  console.log(`✅ Filter: ${rezultat.length} prošlo (${topDE.length} DE + ${topBih.length} BiH + ${topSvjetske.length} svijet + ${topSport.length} sport)`);
  rezultat.forEach((v) => {
    const ikona = v.tip === "svjetske" ? "🌍" : v.tip === "sport" ? "⚽" : v.jezik === "de" ? "🇩🇪" : "🇧🇦";
    console.log(`   ${ikona} ${v.score}/10 [${v.kategorija}] ${v.naslov.slice(0, 55)}`);
  });

  return rezultat;
}
