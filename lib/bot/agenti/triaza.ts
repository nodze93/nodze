// ============================================================
// LIJEVAK · KORAK 3 — AI TRIAŽA (jeftini pozivi na naslov+opis)
// ============================================================
// AI NE čita cijele članke. Dobije naslov + kratak opis i ocijeni
// svaki po dimenzijama. Radi u MANJIM grupama (batch) da odgovor
// nikad ne pređe limit tokena. Kod onda izračuna ukupnu ocjenu
// (težine su OVDJE) i uzme pobjednike. Tek za njih pipeline vuče
// cijeli tekst i piše.

import { pozoviSaAlatom, MODEL_BRZI } from "./claude";
import type { Vijest, TriazaOcjena } from "../tipovi";

const TRIAZA_PROMPT = `Ti si glavni urednik portala kodnas.de — "Dnevni filter njemačkih vijesti" za našu dijasporu (Bosance/Bošnjake) koja živi u Njemačkoj.

Dobićeš listu vijesti (samo naslov i kratak opis). Za SVAKU ocijeni 4 stvari, svaku od 0 do 100:

1) relevantnost_de — koliko utiče na svakodnevni život u Njemačkoj (zakoni, novac, cijene, posao, stan, zdravstvo, saobraćaj, vrijeme). Suha politička prepucavanja bez posljedica = nisko.
2) relevantnost_dijaspora — koliko je baš za NAS: strance/doseljenike (boravak, državljanstvo, Kindergeld, priznavanje diploma, putovanje kući, konzulati, naši ljudi vani). Ako je jednako bitno svakome ko živi u Njemačkoj, to je i za nas.
3) hitnost — koliko je vremenski osjetljivo (štrajk sutra, upozorenje na nevrijeme, rok za prijavu). Evergreen tema = nisko.
4) klik — hoće li naš čitalac stvarno kliknuti (jasna korist ili jaka priča), bez lažnog senzacionalizma.

Takođe: vec_poznato = true ako je priča već ispričana (ili je ista tema samo drugačije sročena); kategorija = najprikladnija rubrika.

Budi STROG. Visoke ocjene čuvaj za ono što stvarno mijenja ili olakšava život našim ljudima u Njemačkoj, ili je stvarno velika priča.

Za SPORT i SVIJET vijesti: ocijeni "klik" po jačini priče (velika utakmica, transfer, gol/pobjeda naših, veliki svjetski događaj) — "relevantnost za Njemačku" tu SMIJE biti niska, to je normalno i ne kažnjava se.`;

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
        },
        required: ["index", "relevantnost_de", "relevantnost_dijaspora", "hitnost", "klik", "vec_poznato", "kategorija"],
      },
    },
  },
  required: ["ocjene"],
};

type StavkaOcjene = Omit<TriazaOcjena, "ukupno" | "razlog">;
interface TriazaOdgovor {
  ocjene: StavkaOcjene[];
}

// Ukupna ocjena — težine ovise o TIPU (uređivačka politika).
function ukupnaOcjena(o: StavkaOcjene, tip: string): number {
  let u: number;
  if (tip === "svjetske" || tip === "sport") {
    // Sport i svijet: bitni su KLIK i hitnost (velika priča), a NE "relevantnost
    // za Njemačku" — inače uvijek padnu ispod praga i nikad se ne objave.
    u = 0.60 * o.klik + 0.25 * o.hitnost + 0.15 * Math.max(o.relevantnost_de, o.relevantnost_dijaspora);
  } else {
    // Dijaspora (njemačke vijesti): relevantnost je najvažnija.
    u = 0.30 * o.relevantnost_de + 0.30 * o.relevantnost_dijaspora + 0.20 * o.hitnost + 0.20 * o.klik;
  }
  if (o.vec_poznato) u *= 0.35; // već pokrivena tema → jako spusti (skoro sigurno ispada)
  return Math.round(u);
}

export interface TriazaOpcije {
  prag?: number;
  brojObjava?: number;
  kapDijaspora?: number;
  kapSvijet?: number;
  kapSport?: number;
  vecPokriveno?: string[]; // naslovi već objavljeni ovih dana (memorija tema)
}

// Ocijeni jednu grupu (do ~20). Vrati vijesti obogaćene triaza ocjenom.
async function triazirajBatch(batch: Vijest[], vecPokriveno: string[] = []): Promise<Vijest[]> {
  const lista = batch
    .map((v, idx) => `[${idx}] (${v.izvor}${v.tier ? "/" + v.tier : ""}): "${v.naslov}" — ${(v.excerpt || "").slice(0, 150)}`)
    .join("\n");

  // Memorija tema — signal, NE slijepo pravilo. AI odlučuje "isto" vs "novi razvoj".
  const memo = vecPokriveno.length
    ? `\n\nVEĆ SMO OBJAVILI ovih dana (NE ponavljaj iste teme drugim riječima):\n${vecPokriveno.map((t) => "• " + t).join("\n")}\n` +
      `Za SVAKU vijest provjeri govori li o ISTOM subjektu kao nešto gore — istoj naknadi, zakonu, cijeni, ustanovi ili događaju — makar bila DRUGAČIJE SROČENA, iz drugog ugla ili s malo drugačijim brojem.\n` +
      `→ vec_poznato=TRUE ako je ista tema samo drugačije napisana, drugi ugao ("šta to znači za nas", "evo detalja", "reformom može biti gore") ili sitna promjena broja/procenta. Naslovi ne moraju dijeliti nijednu istu riječ da bi bili ista priča — gledaj SMISAO.\n` +
      `→ vec_poznato=FALSE samo ako se desio konkretno NOV DOGAĐAJ (zakon zaista usvojen, štrajk počeo ili završio, presuda, nov rok, nova brojka koja mijenja zaključak) — a ne samo nov tekst o već pokrivenoj temi.`
    : "";

  let odgovor: TriazaOdgovor;
  try {
    odgovor = await pozoviSaAlatom<TriazaOdgovor>({
      model: MODEL_BRZI,
      system: TRIAZA_PROMPT,
      user: `Ocijeni ovih ${batch.length} vijesti:\n\n${lista}${memo}`,
      maxTokens: 3500,
      // temperature 0 → dosljedno: isti ulaz uvijek daje isti rezultat.
      // (Ranije bez temperature = nasumično: ista vijest znala proći ili pasti
      //  ovisno od pokretanja — otud "2x ništa, 3. put par članaka".)
      temperature: 0,
      toolName: "ocijeni_vijesti",
      toolOpis: "Vrati ocjene po dimenzijama za SVAKU vijest iz liste.",
      schema: TRIAZA_SCHEMA,
    });
  } catch (err) {
    console.warn(`⚠️  Triaža batch nije uspjela: ${(err as Error).message}`);
    return [];
  }

  // Zaštita: ako odgovor stigne krnj (bez validne liste) — preskoči batch, ne ruši.
  if (!odgovor || !Array.isArray(odgovor.ocjene)) {
    console.warn("⚠️  Triaža batch: odgovor bez validne liste ocjena — preskačem.");
    return [];
  }

  const out: Vijest[] = [];
  for (const o of odgovor.ocjene) {
    const v = batch[o.index];
    if (!v) continue;
    const ukupno = ukupnaOcjena(o, v.tip);
    out.push({
      ...v,
      kategorija: o.kategorija || v.kategorija,
      triaza: { ...o, ukupno },
      score: ukupno,
    });
  }
  return out;
}

/**
 * Ocijeni sve (title+desc) u grupama, izračunaj ukupno i vrati POBJEDNIKE
 * (iznad praga, uz blage kvote po tipu da ne bude sve sport/svijet).
 */
export async function triazirajVijesti(
  vijesti: Vijest[],
  opcije: TriazaOpcije = {}
): Promise<Vijest[]> {
  if (vijesti.length === 0) return [];

  const prag = opcije.prag ?? parseInt(process.env.PRAG_TRIAZA || "61", 10);
  const brojObjava = opcije.brojObjava ?? parseInt(process.env.BROJ_OBJAVA || "8", 10);
  const kap = {
    dijaspora: opcije.kapDijaspora ?? 5,
    svjetske: opcije.kapSvijet ?? 3,
    sport: opcije.kapSport ?? 3,
  };

  console.log(`🧠 Triaža: ocjenjujem ${vijesti.length} (naslov+opis, u grupama po 20)...`);

  // Grupe po 20 — da odgovor nikad ne pređe limit tokena.
  const BATCH = 20;
  const vecPokriveno = opcije.vecPokriveno ?? [];
  const ocijenjene: Vijest[] = [];
  for (let i = 0; i < vijesti.length; i += BATCH) {
    const dio = await triazirajBatch(vijesti.slice(i, i + BATCH), vecPokriveno);
    ocijenjene.push(...dio);
  }

  // Sport i svijet imaju NIŽI prag — inače nikad ne prođu (nisu "životna tema",
  // ali su klikabilni). Dijaspora ostaje na strogom pragu.
  const pragSS = parseInt(process.env.PRAG_SPORT_SVIJET || "50", 10);
  const iznadPraga = ocijenjene
    .filter((v) => {
      const p = v.tip === "svjetske" || v.tip === "sport" ? pragSS : prag;
      return (v.triaza?.ukupno ?? 0) >= p;
    })
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
