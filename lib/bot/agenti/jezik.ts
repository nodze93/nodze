// ============================================================
// JEZIK AGENT (5/5) — lektor: bosanski jezik, gramatika, stil
// ============================================================
// Zadnja stanica prije baze: ispravlja kroatizme i greške.
import { pozoviSaAlatom, MODEL_BRZI } from "./claude";
import type { JezikRezultat } from "../tipovi";

const JEZIK_PROMPT = `Ti si lektor portala Dijaspora.ba koji piše za bosansku dijasporu u Njemačkoj.

Zadatak: provjeri i ispravi tekst da bude čist bosanski standardni jezik. Vrati CIJELI ispravljeni tekst (ne samo izmjene).

KROATIZMI → BOSANSKI (obavezno ispravi):
- "što" (upitno) → "šta"  (ali relativno "ono što", "sve što" OSTAVI)
- "uopće" → "uopšte"
- "liječnik/liječnica" → "doktor/doktorica"
- "dobiva/dobivaš/dobivaju" → "dobija/dobijaš/dobijaju"
- "ovisi/ovise/ovisno" → "zavisi/zavise/zavisno"
- "utječe/utjecaj" → "utiče/uticaj"
- "financije/financijski" → "finansije/finansijski"
- "prijevoz" → "prevoz"
- "sudjeluje" → "učestvuje", "sudionik" → "učesnik"
- "vezano uz" → "vezano za"
- "tjedan" → "sedmica", "tisuća" → "hiljada"
- "kat" → "sprat", "kruh" → "hljeb"

GRAMATIKA:
- Slaganje subjekta i predikata, padeži
- Zarez ispred "koji/koja/što/da" gdje treba
- HTML tagovi moraju ostati netaknuti i pravilno zatvoreni

STIL:
- Informativno, direktno, bez patetike
- Germanizme u kontekstu OSTAVI (Finanzamt, Elterngeld, Termin, Krankenkasse...)
- Skraćenice "mj.", "god." su OK

OCJENA:
- "cisto" = 0-2 sitne greške
- "sitne_greske" = 3-5 grešaka, sve ispravljene
- "puno_gresaka" = 6+ grešaka (upozorenje uredniku)`;

const JEZIK_SCHEMA = {
  type: "object" as const,
  properties: {
    ispravljen_naslov: { type: "string" },
    ispravljen_excerpt: { type: "string" },
    ispravljen_sadrzaj: { type: "string", description: "Cijeli HTML sadržaj s ispravkama, tagovi netaknuti" },
    broj_ispravki: { type: "integer" },
    ispravke: {
      type: "array",
      items: {
        type: "object",
        properties: {
          original: { type: "string" },
          ispravljeno: { type: "string" },
          razlog: { type: "string" },
        },
        required: ["original", "ispravljeno", "razlog"],
      },
    },
    ocjena: { type: "string", enum: ["cisto", "sitne_greske", "puno_gresaka"] },
    komentar: { type: "string" },
  },
  required: ["ispravljen_naslov", "ispravljen_excerpt", "ispravljen_sadrzaj", "broj_ispravki", "ispravke", "ocjena", "komentar"],
};

export async function jezikCheck(clanak: {
  naslov: string;
  excerpt: string;
  sadrzaj: string;
}): Promise<JezikRezultat> {
  console.log(`📝 Jezik Agent: lektorišem...`);
  try {
    const rez = await pozoviSaAlatom<JezikRezultat>({
      model: MODEL_BRZI,
      system: JEZIK_PROMPT,
      user: `Provjeri i ispravi bosanski jezik:\n\nNASLOV:\n${clanak.naslov}\n\nEXCERPT:\n${clanak.excerpt}\n\nSADRŽAJ (HTML):\n${clanak.sadrzaj}`,
      maxTokens: 3000,
      toolName: "lektorisan_tekst",
      toolOpis: "Vrati lektorisan tekst sa spiskom ispravki.",
      schema: JEZIK_SCHEMA,
    });
    console.log(`   ✅ ${rez.broj_ispravki} ispravki (${rez.ocjena})`);
    return rez;
  } catch (err) {
    console.warn(`   ⚠️ Jezik greška: ${(err as Error).message} — koristim original`);
    return {
      ispravljen_naslov: clanak.naslov,
      ispravljen_excerpt: clanak.excerpt,
      ispravljen_sadrzaj: clanak.sadrzaj,
      broj_ispravki: 0,
      ispravke: [],
      ocjena: "cisto",
      komentar: "Lektor nije uspio — tekst je original.",
    };
  }
}
