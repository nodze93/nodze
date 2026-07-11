// ============================================================
// GRAMATIKA AGENT (završni prolaz) — SAMO gramatika, ništa drugo
// ============================================================
// Ovo je zaseban, ZADNJI poziv nakon lektora (jezik.ts). Jedini mu je
// zadatak: proći kroz gotov tekst i ispraviti GRAMATIČKE greške (padeži,
// rod pridjeva uz imenicu, slaganje, ijekavica). NE mijenja stil, NE
// skraćuje, NE prepravlja smisao, NE dira HTML. Kao lektor koji dobije
// gotov članak i samo crvenom olovkom ispravi gramatiku.
//
// Model je PREKIDAČ (MODEL_GRAMATIKA u claude.ts): default Haiku (jeftino),
// a jednom env varijablom u Vercelu prebaci se na Sonnet za bolju gramatiku.
// Potpuno se isključuje sa: GRAMATIKA_PROLAZ=off
import { pozoviSaAlatom, MODEL_GRAMATIKA } from "./claude";

const GRAMATIKA_PROMPT = `Ti si korektor bosanskog jezika. Dobijaš GOTOV tekst i tvoj JEDINI zadatak je ispraviti GRAMATIČKE greške. Vrati CIJELI tekst nazad, s ispravkama.

STROGA PRAVILA ŠTA SMIJEŠ, A ŠTA NE:
- Ispravljaš SAMO gramatiku. NE mijenjaš stil, NE prepravljaš rečenice da "ljepše zvuče", NE skraćuješ, NE dodaješ ništa novo.
- Ako je rečenica gramatički TAČNA — ostavi je potpuno netaknutu, riječ po riječ.
- HTML tagove (<p>, <h2>, <blockquote>, <a href="...">, <ul>, <li>, <strong>...) NE diraj — ostaju identični i pravilno zatvoreni.
- Germanizme u kontekstu OSTAVI (Finanzamt, Elterngeld, Termin, Krankenkasse, Bürgergeld...). Vlastita imena NE diraj.

GRAMATIKA — traži OVE greške posebno (najčešće su):

1) SLAGANJE PRIDJEVA I IMENICE U RODU (broj 1 uzrok grešaka — provjeri SVAKI pridjev uz imenicu):
   • SREDNJI rod (imenice na -e/-o: glasanje, pravilo, pitanje, rješenje, pravo, tijelo, mjesto) → pridjev na -O:
     TAČNO: "presudnO glasanje", "novO pravilo", "važnO pitanje", "konačnO rješenje".
     GREŠKA: "presudAN glasanje", "novI pravilo", "važAN pitanje" → ISPRAVI u srednji rod (-o).
   • ŽENSKI rod (reforma, odluka, plata, viza, dozvola, promjena, granica) → pridjev na -A:
     TAČNO: "novA reforma", "važnA odluka", "minimalnA plata", "stroŽA granica".
   • MUŠKI rod (zakon, rok, ugovor, doprinos, sud, porez) → pridjev na -I ili bez nastavka:
     TAČNO: "novI zakon", "presudAN rok", "važAN ugovor".
   • MNOŽINA: pridjev i glagol se slažu s množinom:
     TAČNO: "novA pravilA stupajU na snagu" (NE "novi pravila stupa").

2) SLAGANJE SUBJEKTA I GLAGOLA U BROJU I RODU:
   TAČNO: "vlada je odlučila", "ministarstvo je saopštilo", "poslodavci su dužni".
   GREŠKA: "vlada su odlučili", "ministarstvo je saopštila".

3) PADEŽI UZ BROJEVE:
   • 2, 3, 4 + genitiv JEDNINE: "2 mjeseca", "3 eura", "4 godine".
   • 5 i više + genitiv MNOŽINE: "5 mjeseci", "10 eura", "20 godina".

4) PADEŽI UZ PRIJEDLOGE:
   • "s/sa" + instrumental ("s dozvolom"), "od" + genitiv ("od januara"),
     "prema/ka" + dativ, "za" + akuzativ, "u/na" (mjesto → lokativ: "u Njemačkoj").

5) IJEKAVICA dosljedno: dijete, vrijeme, prije, poslije, mlijeko, htio (NE "dete, vreme, pre").

6) FUTUR i glagolski oblici: "dobićeš", "stupiće na snagu", "moraće".

7) ZAREZ ispred zavisne rečenice (koji/koja/koje/što/da/jer) gdje pravilo traži.

8) KROATIZMI → BOSANSKI STANDARD (ispravi, ali PAŽLJIVO):
   • "što" UPITNO → "šta" ("šta se mijenja"), ALI relativno OSTAVI ("ono što", "sve što").
   • "uopće"→"uopšte"; "liječnik"→"doktor"; "dobiva/dobivaju"→"dobija/dobijaju";
     "ovisi"→"zavisi"; "utječe"→"utiče"; "financije"→"finansije"; "prijevoz"→"prevoz";
     "tjedan"→"sedmica"; "tisuća"→"hiljada"; "sudjeluje"→"učestvuje"; "vezano uz"→"vezano za".
   • Germanizme (Finanzamt, Elterngeld, Termin...) NE diraj.

OCJENA (koliko si gramatičkih grešaka našao/ispravio):
- "cisto" = 0-2 sitne greške
- "sitne_greske" = 3-6 grešaka, sve ispravljene
- "puno_gresaka" = 7+ grešaka`;

const GRAMATIKA_SCHEMA = {
  type: "object" as const,
  properties: {
    naslov: { type: "string", description: "Gramatički ispravljen naslov" },
    excerpt: { type: "string", description: "Gramatički ispravljen excerpt" },
    sadrzaj: { type: "string", description: "Cijeli HTML sadržaj, samo gramatika ispravljena, tagovi netaknuti" },
    broj_ispravki: { type: "integer" },
    ispravke: {
      type: "array",
      items: {
        type: "object",
        properties: {
          original: { type: "string" },
          ispravljeno: { type: "string" },
        },
        required: ["original", "ispravljeno"],
      },
    },
    ocjena: { type: "string", enum: ["cisto", "sitne_greske", "puno_gresaka"] },
  },
  required: ["naslov", "excerpt", "sadrzaj", "broj_ispravki", "ispravke", "ocjena"],
};

export interface GramatikaRezultat {
  naslov: string;
  excerpt: string;
  sadrzaj: string;
  broj_ispravki: number;
  ispravke: { original: string; ispravljeno: string }[];
  ocjena: "cisto" | "sitne_greske" | "puno_gresaka";
}

/**
 * Završni gramatički prolaz. Ako je isključen (GRAMATIKA_PROLAZ=off) ili
 * padne, vraća tekst nepromijenjen (nikad ne ruši pipeline).
 */
export async function gramatikaProlaz(tekst: {
  naslov: string;
  excerpt: string;
  sadrzaj: string;
}): Promise<GramatikaRezultat> {
  // Prekidač za potpuno isključenje
  if ((process.env.GRAMATIKA_PROLAZ || "on").toLowerCase() === "off") {
    return { ...tekst, broj_ispravki: 0, ispravke: [], ocjena: "cisto" };
  }

  const kojiModel = MODEL_GRAMATIKA.includes("sonnet") ? "Sonnet" : "Haiku";
  console.log(`🔤 Gramatika (${kojiModel}): završni prolaz...`);
  try {
    const rez = await pozoviSaAlatom<GramatikaRezultat>({
      model: MODEL_GRAMATIKA,
      system: GRAMATIKA_PROMPT,
      user: `Ispravi SAMO gramatiku u ovom tekstu (vrati cijeli tekst):\n\nNASLOV:\n${tekst.naslov}\n\nEXCERPT:\n${tekst.excerpt}\n\nSADRŽAJ (HTML):\n${tekst.sadrzaj}`,
      // Vraća cijeli članak nazad — isti budžet kao lektor da se ne odsiječe.
      maxTokens: 4500,
      toolName: "ispravljena_gramatika",
      toolOpis: "Vrati tekst sa ispravljenom gramatikom (samo gramatika).",
      schema: GRAMATIKA_SCHEMA,
    });
    console.log(`   ✅ ${rez.broj_ispravki} gramatičkih ispravki (${rez.ocjena})`);
    // Sigurnosna mreža: ako model vrati prazno polje, zadrži original.
    return {
      naslov: rez.naslov || tekst.naslov,
      excerpt: rez.excerpt || tekst.excerpt,
      sadrzaj: rez.sadrzaj || tekst.sadrzaj,
      broj_ispravki: rez.broj_ispravki || 0,
      ispravke: rez.ispravke || [],
      ocjena: rez.ocjena || "cisto",
    };
  } catch (err) {
    console.warn(`   ⚠️ Gramatika greška: ${(err as Error).message} — zadržavam tekst`);
    return { ...tekst, broj_ispravki: 0, ispravke: [], ocjena: "cisto" };
  }
}
