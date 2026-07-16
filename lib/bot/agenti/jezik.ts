// ============================================================
// JEZIK AGENT (5/5) — lektor: bosanski jezik, gramatika, stil
// ============================================================
// Zadnja stanica prije baze: ispravlja kroatizme i greške.
import { pozoviSaAlatom, MODEL_LEKTOR } from "./claude";
import type { JezikRezultat } from "../tipovi";

const JEZIK_PROMPT = `Ti si profesionalni lektor za bosanski standardni jezik. Radiš za portal kodnas.de ("Dnevni filter njemačkih vijesti") za bosansku dijasporu u Njemačkoj.

Tvoj zadatak je ISKLJUČIVO gramatička i pravopisna ispravka teksta. Vrati CIJELI ispravljeni tekst (ne samo izmjene).

STROGA PRAVILA:
1. ZADRŽI ORIGINAL: Ne prepravljaj stil. Ne mijenjaj rečenice koje su već gramatički tačne. Ne sažimaj i ne dodaji informacije. NE IZMIŠLJAJ nove riječi (npr. "nuždenome" nije riječ) — ako riječ ne postoji u standardnom bosanskom, zamijeni je stvarnom, običnom riječju.
2. POPRAVI SAMO GREŠKE: padeže, ROD i slaganje (npr. "znatna dio" → "znatan dio", "velika broj" → "veliki broj"), slaganje vremena, interpunkciju (zarez ispred "koji/koja/što/da" gdje treba) i tipfelere. Ukloni suvišne/pogrešne akcente unutar riječi (npr. "planirȃš" → "planiraš").
3. BEZ KREATIVNOSTI: Zabranjeno je pisati u stihovima, haiku formi ili bilo kojoj književnoj formi. Piši informativno i direktno.
4. HTML tagovi moraju ostati NETAKNUTI i pravilno zatvoreni.
5. Ako je rečenica gramatički toliko neispravna da joj se ne može odrediti smisao, preformuliši je tako da bude jednostavna, jasna i gramatički tačna, zadržavajući originalnu informaciju.
6. FUTUR I piši ODVOJENO (bosanski standard): "radit će", "bit će", "donosit će", "doći će", "imat će", "moći će" — NIKAD stopljeno "radiće", "biće", "donosiće", "imaće".

KROATIZMI → BOSANSKI (obavezno ispravi):
- "istorija/istorijski/istoričar" → "historija/historijski/historičar" (bosanski H-oblik; isto: hemija, hirurg, haos, harmonija)
- "što" (upitno) → "šta"  (ali relativno "ono što", "sve što" OSTAVI)
- "uopće" → "uopšte"
- "liječnik/liječnica" → "doktor/doktorica"
- "dobiva/dobivaš/dobivaju" → "dobija/dobijaš/dobijaju"
- "ovisi/ovise/ovisno" → "zavisi/zavise/zavisno"
- "utječe/utjecaj" → "utiče/uticaj"
- "financije/financijski" → "finansije/finansijski"
- "vlak" → "voz", "kolodvor" → "željeznička stanica"
- "sudjeluje" → "učestvuje", "sudionik" → "učesnik"
- "vezano uz" → "vezano za"
- "tjedan" → "sedmica", "tisuća" → "hiljada"
- "kat" → "sprat", "kruh" → "hljeb"
- "tvrtka" → "firma", "tvornica" → "fabrika", "poduzeće" → "preduzeće"
- "obitelj" → "porodica", "opći/općina" → "opšti/opština"

IJEKAVICA (bosanski je IJEKAVSKI — obavezno, ovo je čest izvor grešaka):
- Koristi IJEKAVSKE oblike: prijevoz, prijedlog, vrijeme, mlijeko, dijete, dio, poslije, prije, uvijek, mjesto, htio, vidio, želio, cijena, dvije, bijel, lijep, riječ.
- NIKAD ekavske: prevoz, predlog, vreme, mleko, dete, deo, posle, uvek, cena, dve, beo, lep, reč.
- Ali NE pretjeruj: gdje je "e" korijensko (ne od jata), ostaje "e" — npr. "greška", "mjesec", "sedmica", "vjerovatno", "dvadeset". Ne izmišljaj "ije" gdje mu nije mjesto.

GERMANIZME U KONTEKSTU OSTAVI (Finanzamt, Elterngeld, Termin, Krankenkasse, Jobcenter, Anmeldung...). Skraćenice "mj.", "god." su OK.

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
    broj_ispravki: { type: "integer", description: "Ukupan broj ispravki (samo broj, NE nabrajaj ih)" },
    ocjena: { type: "string", enum: ["cisto", "sitne_greske", "puno_gresaka"] },
    komentar: { type: "string", description: "Kratka napomena uredniku (jedna rečenica), ako treba" },
  },
  required: ["ispravljen_naslov", "ispravljen_excerpt", "ispravljen_sadrzaj", "broj_ispravki", "ocjena"],
};

export async function jezikCheck(clanak: {
  naslov: string;
  excerpt: string;
  sadrzaj: string;
}): Promise<JezikRezultat> {
  console.log(`📝 Jezik Agent: lektorišem...`);
  try {
    const rez = await pozoviSaAlatom<JezikRezultat>({
      model: MODEL_LEKTOR,
      system: JEZIK_PROMPT,
      user: `Provjeri i ispravi bosanski jezik:\n\nNASLOV:\n${clanak.naslov}\n\nEXCERPT:\n${clanak.excerpt}\n\nSADRŽAJ (HTML):\n${clanak.sadrzaj}`,
      // 8000 da cijeli ispravljeni članak stane — ranije se na dužim tekstovima
      // odgovor odsijecao (max_tokens), pa je vraćen krnj objekat i rušio spremanje.
      maxTokens: 8000,
      toolName: "lektorisan_tekst",
      toolOpis: "Vrati SAMO ispravljen tekst, naslov, excerpt, ukupan broj ispravki i ocjenu. NE nabrajaj pojedinačne ispravke.",
      schema: JEZIK_SCHEMA,
    });

    // ZAŠTITA: ako je odgovor ipak stigao krnj (odsječen), glavna polja fale.
    // Tada NE rušimo članak — vraćamo original (bolje neispravljen nego izgubljen).
    if (
      !rez ||
      typeof rez.ispravljen_sadrzaj !== "string" || rez.ispravljen_sadrzaj.length === 0 ||
      typeof rez.ispravljen_naslov !== "string" || rez.ispravljen_naslov.length === 0 ||
      typeof rez.ispravljen_excerpt !== "string"
    ) {
      console.warn("   ⚠️ Lektor vratio nepotpun odgovor (odsječen) — koristim original.");
      return {
        ispravljen_naslov: clanak.naslov,
        ispravljen_excerpt: clanak.excerpt,
        ispravljen_sadrzaj: clanak.sadrzaj,
        broj_ispravki: 0,
        ispravke: [],
        ocjena: "cisto",
        komentar: "Lektor vratio nepotpun odgovor — tekst je original.",
      };
    }

    // Normalizuj opciona polja koja mogu faliti (da .slice nizvodno nikad ne pukne).
    rez.ispravke = Array.isArray(rez.ispravke) ? rez.ispravke : [];
    rez.ocjena = rez.ocjena || "sitne_greske";
    rez.broj_ispravki = typeof rez.broj_ispravki === "number" ? rez.broj_ispravki : rez.ispravke.length;
    rez.komentar = rez.komentar || "";

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
