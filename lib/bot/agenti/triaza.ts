// ============================================================
// LIJEVAK · KORAK 3 — AI TRIAŽA (jedan jeftin poziv na naslov+opis)
// ============================================================
// AI NE čita cijele članke. Dobije listu od ~40 (naslov + kratak
// opis) i u JEDNOM pozivu ocijeni svaki po dimenzijama. Kod onda
// izračuna ukupnu ocjenu (težine su OVDJE, lako se štimaju) i uzme
// samo pobjednike. Tek za njih pipeline kasnije vuče cijeli tekst.
//
// Trošak: ~40 kratkih stavki × ~40 tokena = par hiljada tokena,
// jedan poziv. Doslovno centi.

import { pozoviSaAlatom, MODEL_BRZI } from "./claude";
import type { Vijest, TriazaOcjena } from "../tipovi";

const TRIAZA_PROMPT = `Ti si glavni urednik portala kodnas.de — "Dnevni filter njemačkih vijesti" za našu dijasporu (Bosance/Bošnjake) koja živi u Njemačkoj.

Dobićeš listu vijesti (samo naslov i kratak opis). Za SVAKU ocijeni 4 stvari, svaku od 0 do 100:

1) relevantnost_de — koliko ovo utiče na svakodnevni život u Njemačkoj (zakoni, novac, cijene, posao, stan, zdravstvo, saobraćaj, vrijeme). Suha politička prepucavanja bez posljedica = nisko.
2) relevantnost_dijaspora — koliko je baš za NAS: strance/doseljenike (boravak, državljanstvo, Kindergeld, priznavanje diploma, putovanje kući, konzulati, naši ljudi vani). Ako je jednako bitno svakome ko živi u Njemačkoj, to je i za nas.
3) hitnost — koliko je vremenski osjetljivo (štrajk sutra, upozorenje na nevrijeme, rok za prijavu). Evergreen tema = nisko.
4) klik — hoće li naš čitalac stvarno kliknuti (jasna korist ili jaka priča), bez lažnog senzacionalizma.

Takođe:
- vec_poznato = true ako je to očito već poznata/uveliko ispričana priča od jučer/danas (da ne objavljujemo isto dvaput).
- kategorija = najprikladnija rubrika.

Budi STROG. Većina vijesti je prosječna. Visoke ocjene čuvaj za ono što stvarno mijenja ili olakšava život našim ljudima u Njemačkoj, ili je stvarno velika priča.`;

const TRIAZA_SCHEMA = {
  type: "object" as const,
  properties: {
    ocjene: {
      type: "array",
      description: "Ocjena za SVAKU vijest iz liste (isti index)",
      items: {
        type: "object",
        properties: {
          index: { type: "integer", description: "Redni broj vijesti iz liste" },
          relevantnost_de: { type: "integer", description: "0-100 uticaj na život u Njemačkoj" },
          relevantnost_dijaspora: { type: "integer", description: "0-100 baš za našu dijasporu" },
          hitnost: { type: "integer", description: "0-100 vremenska osjetljivost" },
          klik: { type: "integer", description: "0-100 hoće li čitalac kliknuti" },
          vec_poznato: { type: "boolean", description: "već poznata/ispričana priča" },
          kategorija: {
            type: "string",
            enum: ["viza", "posao", "stan", "zdravstvo", "porodica", "porez", "penzija",
                   "finansije", "saobracaj", "vrijeme", "vijesti", "sport", "svijet"],
          },
          razlog: { type: "string", description: "kratko zašto" },
        },
        required: ["index", "relevantnost_de", "relevantnost_dijaspora", "hitnost", "klik", "vec_poznato", "kategorija", "razlog"],
      },
    },
  },
  required: ["ocjene"],
};

interface TriazaOdgovor {
  ocjene: Omit<TriazaOcjena, "ukupno">[];
}

// Težine za ukupnu ocjenu — OVDJE se štima uređivačka politika.
const T = { de: 0.30, dijaspora: 0.30, hitnost: 0.20, klik: 0.20 };

function ukupnaOcjena(o: Omit<TriazaOcjena, "ukupno">): number {
  let u =
    T.de * o.relevantnost_de +
    T.dijaspora * o.relevantnost_dijaspora +
    T.hitnost * o.hitnost +
    T.klik * o.klik;
  if (o.vec_poznato) u *= 0.5; // već poznato → prepolovi (izbjegni duplu priču)
  return Math.round(u);
}

export interface TriazaOpcije {
  prag?: number;        // minimalna ukupna ocjena (default 68, env PRAG_TRIAZA)
  brojObjava?: number;  // koliko ih ide dalje na pisanje (default 8)
  kapDijaspora?: number; // max dijaspora po pokretanju (default 5)
  kapSvijet?: number;   // max svijet (default 3)
  kapSport?: number;    // max sport (default 3)
}

/**
 * Ocijeni sve (title+desc), izračunaj ukupno, i vrati POBJEDNIKE
 * (iznad praga, uz blage kvote po tipu da ne bude sve sport/svijet).
 */
export async function triazirajVijesti(
  vijesti: Vijest[],
  opcije: TriazaOpcije = {}
): Promise<Vijest[]> {
  if (vijesti.length === 0) return [];

  const prag = opcije.prag ?? parseInt(process.env.PRAG_TRIAZA || "68", 10);
  const brojObjava = opcije.brojObjava ?? parseInt(process.env.BROJ_OBJAVA || "8", 10);
  const kap = {
    dijaspora: opcije.kapDijaspora ?? 5,
    svjetske: opcije.kapSvijet ?? 3,
    sport: opcije.kapSport ?? 3,
  };

  console.log(`🧠 Triaža: ocjenjujem ${vijesti.length} (naslov+opis, jedan poziv)...`);

  const lista = vijesti
    .map((v, idx) => `[${idx}] (${v.izvor}${v.tier ? "/" + v.tier : ""}): "${v.naslov}" — ${(v.excerpt || "").slice(0, 160)}`)
    .join("\n");

  let odgovor: TriazaOdgovor;
  try {
    odgovor = await pozoviSaAlatom<TriazaOdgovor>({
      model: MODEL_BRZI,
      system: TRIAZA_PROMPT,
      user: `Ocijeni ovih ${vijesti.length} vijesti:\n\n${lista}`,
      maxTokens: 4000,
      toolName: "ocijeni_vijesti",
      toolOpis: "Vrati ocjene po dimenzijama za SVAKU vijest iz liste.",
      schema: TRIAZA_SCHEMA,
    });
  } catch (err) {
    console.warn(`⚠️  Triaža nije uspjela: ${(err as Error).message}`);
    return [];
  }

  // Spoji ocjene s vijestima + izračunaj ukupno
  const ocijenjene: Vijest[] = [];
  for (const o of odgovor.ocjene) {
    const v = vijesti[o.index];
    if (!v) continue;
    const ukupno = ukupnaOcjena(o);
    ocijenjene.push({
      ...v,
      kategorija: o.kategorija || v.kategorija,
      triaza: { ...o, ukupno },
      score: ukupno, // da downstream (log/prikaz) ima jedinstven "score"
    });
  }

  // Iznad praga, sortirano po ukupnoj ocjeni
  const iznadPraga = ocijenjene
    .filter((v) => (v.triaza?.ukupno ?? 0) >= prag)
    .sort((a, b) => (b.triaza?.ukupno ?? 0) - (a.triaza?.ukupno ?? 0));

  // Blage kvote po tipu — da ne prođe sve sport/svijet
  const brojac = { dijaspora: 0, svjetske: 0, sport: 0 };
  const izabrane: Vijest[] = [];
  for (const v of iznadPraga) {
    if (izabrane.length >= brojObjava) break;
    const t = v.tip as keyof typeof brojac;
    if (brojac[t] >= (kap as Record<string, number>)[t]) continue;
    brojac[t]++;
    izabrane.push(v);
  }

  console.log(
    `✅ Triaža: ${ocijenjene.length} ocijenjeno → ${iznadPraga.length} iznad praga (${prag}) → ${izabrane.length} za pisanje`
  );
  izabrane.forEach((v) => {
    const ik = v.tip === "svjetske" ? "🌍" : v.tip === "sport" ? "⚽" : "🇩🇪";
    console.log(`   ${ik} ${v.triaza?.ukupno}/100 [${v.kategorija}] ${v.naslov.slice(0, 55)}`);
  });

  return izabrane;
}
