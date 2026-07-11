// ============================================================
// FILTER AGENT (1/5) — ocjenjuje relevantnost vijesti 0-10
// ============================================================
// Zadržava samo vijesti s ocjenom 6+.
// Dijaspora vijesti: relevantnost za život Bosanaca u Njemačkoj.
// Svjetske vijesti: klikabilnost (da li bi naš čovjek kliknuo).
import { pozoviSaAlatom, MODEL_BRZI } from "./claude";
import type { Vijest } from "../tipovi";
import type { TrendsRezultat } from "../trends";

const FILTER_DIJASPORA_PROMPT = `Ti si urednik portala kodnas.de — portala za Bosance, Bošnjake i Bosanke koji žive u Njemačkoj i Austriji.

Tvoj zadatak: ocijeni relevantnost svake vijesti za našu publiku, od 0 do 10.

VISOKA OCJENA (7-10):
- Promjene njemačkih zakona koje direktno utiču na strance (vize, boravak, rad, državljanstvo)
- Finansijske beneficije i rokovi (Elterngeld, Kindergeld, Steuererklärung, Bürgergeld, Wohngeld)
- Svakodnevni troškovi: cijene struje, goriva i energije, stanarine i režije, poskupljenja, minimalac
- Deutsche Bahn štrajkovi, veliki prekidi u saobraćaju, promjene u javnom prevozu
- Vozačke dozvole (Führerschein), promjene saobraćajnih pravila i kazni, TÜV
- Putovanje kući: cijene letova za BiH, gužve i pravila na granicama, rute i naplata cesta (posebno ljeti)
- Praktične stvari za svakog: zdravstveno osiguranje, doktori/Termini, banke, potrošačka prava, penzije
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

const FILTER_SVIJET_PROMPT = `Ti si urednik rubrike "Svijet" na portalu kodnas.de — portala za Bosance u Njemačkoj.

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

const FILTER_SPORT_PROMPT = `Ti si sportski urednik portala kodnas.de — portala za Bosance u Njemačkoj i Austriji.

Publika: Bosanci koji prate Bundesligu, reprezentaciju BiH i naše igrače vani.

Ocijeni svaku vijest 0-10: da li bi naš čitalac kliknuo?

VISOKA OCJENA (7-10):
- Bosanski sportisti u inostranstvu (transferi, golovi, povrede, izjave)
- Reprezentacija BiH (sve: nogomet, košarka, rukomet...)
- AKTUELNI veliki svjetski događaji o kojima svi pričaju — čak i BEZ BiH veze:
  Svjetsko prvenstvo (ko je prošao, rezultati nokaut faze), Liga prvaka,
  EURO, veliki finali i derbiji (npr. Španija–Portugal, El Clásico, Real–Barca)
- Bundesliga — velike utakmice, dramatični rezultati, skandali
- Transferi koji tresu svijet, region ili Bundesligu (Mbappé, Haaland i sl.)
- Emotivne sportske priče (povratak nakon povrede, uspjeh naših ljudi)

NISKA OCJENA (0-3):
- Niželigaški sport bez naših igrača i bez svjetskog značaja
- Sportovi koje naša publika ne prati (npr. kriket, bejzbol) bez velike priče
- Suhe statistike i najave bez rezultata/priče
- Sitni lokalni sport trećih zemalja`;

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
 * DE (njemačke vijesti) + Svijet + Sport. (BiH rubrika uklonjena.)
 */
export async function filterVijesti(
  vijesti: Vijest[],
  trends: TrendsRezultat | null,
  maxDE = 1,
  maxSvjetske = 1,
  maxSport = 1
): Promise<Vijest[]> {
  console.log(`🔍 Filter Agent: ocjenjujem ${vijesti.length} vijesti...`);

  // Dijaspora = njemačke vijesti (BiH izvori su uklonjeni iz feeda).
  const de = vijesti.filter((v) => v.tip === "dijaspora");
  const svjetske = vijesti.filter((v) => v.tip === "svjetske");
  const sport = vijesti.filter((v) => v.tip === "sport");
  console.log(`   🇩🇪 DE: ${de.length} | 🌍 Svijet: ${svjetske.length} | ⚽ Sport: ${sport.length}`);

  const [ocDE, ocSvjetske, ocSport] = await Promise.all([
    filterBatch(de, FILTER_DIJASPORA_PROMPT, "DE", trends),
    filterBatch(svjetske, FILTER_SVIJET_PROMPT, "svijet", null),
    filterBatch(sport, FILTER_SPORT_PROMPT, "sport", null),
  ]);

  const poOcjeni = (a: Vijest, b: Vijest) => (b.score || 0) - (a.score || 0);
  const topDE = ocDE.sort(poOcjeni).slice(0, maxDE);
  const topSvjetske = ocSvjetske.sort(poOcjeni).slice(0, maxSvjetske);
  const topSport = ocSport.sort(poOcjeni).map((v) => ({ ...v, kategorija: "sport" })).slice(0, maxSport);
  const rezultat = [...topDE, ...topSvjetske, ...topSport];

  console.log(`✅ Filter: ${rezultat.length} prošlo (${topDE.length} DE + ${topSvjetske.length} svijet + ${topSport.length} sport)`);
  rezultat.forEach((v) => {
    const ikona = v.tip === "svjetske" ? "🌍" : v.tip === "sport" ? "⚽" : "🇩🇪";
    console.log(`   ${ikona} ${v.score}/10 [${v.kategorija}] ${v.naslov.slice(0, 55)}`);
  });

  return rezultat;
}
