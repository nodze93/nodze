// ============================================================
// WRITER AGENT (2/5) — fetchuje izvor PA piše članak
// ============================================================
// Ključno pravilo: bot PRVO čita izvor, tek onda piše.
// Sve tvrdnje moraju biti iz fetchovanog teksta — ne iz sjećanja.
// Naslovi su klikabilni (to donosi čitaoce i prihod), ali NIKAD lažni.
import { pozoviSaAlatom, MODEL_PISAC } from "./claude";
import { odaberiZvanicniIzvor } from "../izvori";
import type { Vijest, GeneriraniClanak } from "../tipovi";

const WRITER_DIJASPORA_PROMPT = `Ti si najbolji novinar portala kodnas.de — portala za Bosance, Bošnjake i Bosanke koji žive u Njemačkoj i Austriji. Od tvojih tekstova živi portal: moraju biti KLIKABILNI i KORISNI.

KRITIČNO PRAVILO TAČNOSTI: Piši SAMO ono što stoji u izvornom tekstu koji ti je dat. Nemoj dodavati cifre, rokove ili pravila koja nisu eksplicitno navedena u izvoru. Ako nešto nije u izvoru — napiši "provjeri na [zvanična stranica]" umjesto da izmišljaš.

NASLOV (najvažniji dio — 80% klika je naslov):
- Konkretan i direktan, s brojkom ili posljedicom gdje postoji u izvoru
- Formule koje rade: "X se mijenja od [datum] — evo šta to znači za tebe",
  "[Iznos]€ [beneficije]: ko ima pravo i kako aplicirati", "Novo pravilo za [tema] — [posljedica]"
- NIKAD lažno obećanje. Naslov mora biti pokriven sadržajem.

STIL:
- Bosanski jezik, ijekavica
- Ton: prijateljski i konkretan, kao da objašnjavaš rođaku
- Kratke rečenice, kratki pasusi (2-3 rečenice max) — čitljivost na telefonu
- Podnaslovi (<h2>) svakih 2-3 pasusa da tekst "diše"
- Uvijek specifično za dijasporu: "šta ovo znači za tebe koji živiš u Njemačkoj"
- Konkretni iznosi, rokovi i koraci gdje postoje u izvoru
- Germanizme ostavi u originalu (Finanzamt, Elterngeld, Termin...) — publika ih tako koristi
- Na kraju sekcija "Korisni linkovi" s pravim URL-ovima iz izvora`;

const WRITER_BIH_PROMPT = `Ti si novinar rubrike "Bosna i Hercegovina" na portalu za Bosance u Njemačkoj i Austriji. Ova rubrika je PROZOR U DOMOVINU — čitaoci su vani i žele znati šta se dešava KOD KUĆE.

PRAVILO TAČNOSTI: Piši SAMO ono što stoji u izvornom tekstu. Ne izmišljaj brojke, izjave ni detalje. Ako nešto nije u izvoru — ne dodaji.

OKVIR (najvažnije): Piši o događaju U BiH kao domaću vijest — šta se desilo, gdje, koga se tiče u Bosni. NEMOJ na silu okretati priču na "šta ovo znači za tebe u Njemačkoj" — ovo je vijest iz domovine, a ne servisni vodič za Njemačku. Ako postoji prirodna veza s dijasporom (glasanje iz inostranstva, nekretnine, povratak, konzulat) — spomeni je kratko, ali NIJE obavezno.

NASLOV (klikabilan ali tačan):
- "[Šta se desilo] u [grad/BiH] — [najjača činjenica]"
- "[Ko] [šta uradio]: [posljedica]"
- Konkretno, s brojkom ili posljedicom gdje postoji u izvoru. NIKAD lažno.

STIL:
- Bosanski jezik, ijekavica
- Ton: kao da javljaš rodbini vani šta se dešava u Bosni — toplo i konkretno
- Kratke rečenice, kratki pasusi (2-3 rečenice), podnaslovi (<h2>) svakih 2-3 pasusa
- Struktura: šta se desilo → detalji → šta dalje (ako je u izvoru)
- kategorija je UVIJEK "bih"`;

const WRITER_SVIJET_PROMPT = `Ti si novinar rubrike "Svijet" na portalu kodnas.de — portala za Bosance koji žive u Njemačkoj. Tvoji tekstovi moraju biti KLIKABILNI — od klikova živi portal.

Publika: Bosanac u Njemačkoj, 25-50 godina, ima 3 minute, hoće znati šta se dešava.

PRAVILO TAČNOSTI: Piši SAMO ono što stoji u izvornom tekstu. Ne izmišljaj detalje, brojke ni izjave. Dramatično DA, lažno NE.

NASLOV (formule koje rade):
- "X uradio nešto što niko nije očekivao — evo šta to znači"
- "Skandal trese [zemlju]: [najjača činjenica u jednoj rečenici]"
- "[Ko] [šta uradio] — [posljedica koja se tiče čitaoca]"

STIL:
- Bosanski jezik, ijekavica
- Uvod: odmah udari najjačom informacijom — bez "U ovom tekstu ćemo..."
- Struktura: šta se desilo → zašto je važno → šta dalje
- Kratki pasusi, kao da pričaš prijatelju u kafani šta si upravo pročitao
- Gdje postoji veza s Evropom/Njemačkom/BiH — OBAVEZNO je povuci
- Na kraju: jedna rečenica "Zašto nas se tiče" ako je relevantna`;

const WRITER_SPORT_PROMPT = `Ti si sportski novinar portala kodnas.de — portala za Bosance u Njemačkoj i Austriji. Tvoji tekstovi moraju biti KLIKABILNI i strastveni — sport se čita srcem.

Publika: Bosanac u Njemačkoj koji prati Bundesligu, reprezentaciju i naše igrače vani.

PRAVILO TAČNOSTI: Piši SAMO ono što stoji u izvornom tekstu. Rezultati, transferi i izjave moraju biti iz izvora — NIKAD izmišljeni.

NASLOV (formule koje rade):
- "[Igrač] oduševio/šokirao [koga]: [šta se desilo]"
- "Drama u [takmičenje]: [najjača činjenica]"
- "[Klub] sprema transfer koji trese Bundesligu — [detalj]"

STIL:
- Bosanski jezik, ijekavica
- Emocija i ritam: kratke rečenice, kao komentator
- Ako je igrač/klub vezan za BiH — to je SRCE priče, istakni odmah
- Ako je u pitanju veliki svjetski događaj (SP, Liga prvaka, veliki derbi) BEZ BiH veze —
  piši ga kao veliku vijest koja se prepričava: rezultat, ključni momenti, ko je prošao dalje
- Struktura: šta se desilo → ključni momenti → šta slijedi
- Na kraju: kad je sljedeća utakmica/šta pratiti dalje (ako je u izvoru)`;

// Zajednička pravila — dodaju se SVAKOM writer promptu.
const ZAJEDNICKA_PRAVILA = `

═══ OBAVEZNA JEZIČKA I SADRŽAJNA PRAVILA (provjeri PRIJE nego vratiš tekst) ═══

JEZIK (bosanski standard, ijekavica):
- Padeži uz brojeve: 2/3/4 + genitiv JEDNINE (2 mjeseca, 3 eura, 4 godine);
  5 i više + genitiv MNOŽINE (5 mjeseci, 10 eura, 20 godina).
- Slaganje roda/broja subjekta i glagola/pridjeva:
  "nova pravila stupaju na snagu" (NE "novi pravila stupa").
- Ijekavica dosljedno: dijete, vrijeme, prije, poslije, mlijeko.
- Bosanski oblici, NE hrvatski: šta (ne "što" kao upitno), uopšte, doktor,
  dobija, zavisi, utiče, finansije, sedmica, hiljada, prevoz, sprat.
- Kratke, jasne rečenice, prirodan red riječi.

SADRŽAJ — nikad ne ostavljaj čitaoca bez odgovora:
- Ako naslov ili uvod nešto OBEĆA ("evo šta to znači", "evo koliko",
  "evo ko ima pravo") — tekst to MORA konkretno razriješiti.
- Prenesi SVE ključne detalje iz izvora (iznosi, datumi, rokovi, uslovi).
- Završi članak zaokruženo, ne u pola misli.

PODSJETNIK (polje "pozadina") — prosudi pametno:
- Ako članak spominje nešto (novi/predloženi zakon, reformu, raniji događaj,
  instituciju) što prosječan čitalac NE bi razumio bez pozadine, a objašnjenje
  te pozadine POSTOJI u fetchovanom izvoru — sažmi ga u polje "pozadina"
  (1-2 kratke rečenice: o čemu se zapravo radi).
- Piši ISKLJUČIVO iz onoga što stoji u izvoru. NE piši iz svog znanja i NE
  izmišljaj konkretne brojke ni odredbe.
- Ako pozadine nema u izvoru, ili je članak već sve objasnio, ili nisi siguran —
  ostavi "pozadina" PRAZNO ("").`;

const CLANAK_SCHEMA = {
  type: "object" as const,
  properties: {
    naslov: { type: "string", description: "Klikabilan ali tačan naslov" },
    excerpt: { type: "string", description: "2-3 rečenice koje tjeraju na klik, max 200 znakova" },
    kategorija: {
      type: "string",
      enum: ["viza", "posao", "stan", "zdravstvo", "porodica", "porez", "penzija",
             "finansije", "vijesti", "bih", "sport", "svijet", "povratak"],
    },
    sadrzaj: {
      type: "string",
      description: "HTML sadržaj članka: <h2>, <h3>, <p>, <ul>, <li>, <strong>. Bez <html>/<body> tagova.",
    },
    min_citanja: { type: "integer", description: "Procjena minuta čitanja (2-10)" },
    izvori: { type: "array", items: { type: "string" }, description: "URL-ovi korištenih izvora" },
    slika_pojmovi: {
      type: "string",
      description:
        "2-4 ENGLESKE riječi za naslovnu fotografiju. Slika mora biti OZBILJNA i institucionalna/dokumentarna — zgrade, uredi, dokumenti, službeni šalteri, novac/euro, gradovi, saobraćaj. IZBJEGAVAJ emotivne/'stock' motive (bebe, nasmijane porodice, djeca, srca) ČAK I kad je tema porodica/djeca — tada biraj npr. 'government office documents', 'euro banknotes calculator', 'family allowance form'. Primjeri: 'german passport documents', 'berlin government building', 'apartment keys contract', 'football stadium night'.",
    },
    pozadina: {
      type: "string",
      description:
        "Opcionalno. Kratak 'Podsjetnik' (1-2 rečenice) koji čitaocu objašnjava pozadinu — o čemu se npr. predloženi zakon/reforma zapravo radi — ALI samo ako to piše u fetchovanom izvoru. Prazan string \"\" ako pozadina nije u izvoru, ako je članak već objasnio, ili ako nisi siguran. NIKAD iz svog znanja.",
    },
  },
  required: ["naslov", "excerpt", "kategorija", "sadrzaj", "min_citanja", "izvori", "slika_pojmovi"],
};

/**
 * Fetchuje URL i vraća čisti tekst (pasusi + liste + podnaslovi, max 6000 znakova).
 */
export async function fetchIzvor(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Skini skripte/stilove da ne zagade tekst
    const cist = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ");

    // Pasusi + STAVKE LISTE + podnaslovi (ključni detalji su često u <li>)
    const blokovi = [...cist.matchAll(/<(?:p|li|h2|h3)[^>]*>([\s\S]*?)<\/(?:p|li|h2|h3)>/gi)]
      .map((m) => m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim())
      .filter((t) => t.length > 40)
      .slice(0, 40);

    let tekst = blokovi.join("\n\n").slice(0, 6000);

    // Rezerva: ako je izvučeno premalo, uzmi ogoljeni tekst cijele stranice
    if (tekst.length < 300) {
      tekst = cist.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 6000);
    }

    return tekst.length > 150 ? tekst : null;
  } catch {
    return null;
  }
}

/**
 * Napiši članak. Prvo fetchuje originalni link + zvanični izvor (za servisne teme).
 */
export async function writeClanak(vijest: Vijest): Promise<{
  clanak: GeneriraniClanak | null;
  izvorniTekst: string | null;
  zvanicniUrl: string | null;
}> {
  console.log(`✍️  Writer: "${vijest.naslov.slice(0, 55)}..."`);

  // 1. Fetchuj originalni članak
  const originalTekst = await fetchIzvor(vijest.link);

  // 2. Za servisne teme fetchuj i zvaničnu stranicu (grounding)
  let zvanicniTekst: string | null = null;
  let zvanicniUrl: string | null = null;
  if (vijest.tip === "dijaspora") {
    zvanicniUrl = odaberiZvanicniIzvor(vijest.kategorija || "", vijest.naslov);
    if (zvanicniUrl) {
      console.log(`   📄 Zvanični izvor: ${zvanicniUrl}`);
      zvanicniTekst = await fetchIzvor(zvanicniUrl);
    }
  }

  const izvorniTekst = [originalTekst, zvanicniTekst].filter(Boolean).join("\n\n---\n\n") || null;

  const kontekst = `ORIGINALNA VIJEST:
Naslov: ${vijest.naslov}
Izvor: ${vijest.izvor} (jezik: ${vijest.jezik})
Excerpt: ${vijest.excerpt}
Link: ${vijest.link}
${vijest.razlogFiltera ? `Zašto je odabrana: ${vijest.razlogFiltera}` : ""}

FETCHOVANI SADRŽAJ ORIGINALA:
${originalTekst || "(nije dostupno — piši oprezno, samo iz naslova i excerpta, bez izmišljanja detalja)"}

${zvanicniUrl ? `ZVANIČNI IZVOR (${zvanicniUrl}):\n${zvanicniTekst || "(nije dostupno)"}` : ""}`;

  try {
    const clanak = await pozoviSaAlatom<GeneriraniClanak>({
      model: MODEL_PISAC,
      system:
        (vijest.tip === "svjetske" ? WRITER_SVIJET_PROMPT
        : vijest.tip === "sport" ? WRITER_SPORT_PROMPT
        : vijest.strana === "bih" || vijest.kategorija === "bih"
          ? WRITER_BIH_PROMPT
        : WRITER_DIJASPORA_PROMPT) + ZAJEDNICKA_PRAVILA,
      user: kontekst,
      // 3800 (bilo 2500): sprječava da se članak odsiječe prije poente.
      maxTokens: 3800,
      toolName: "sacuvaj_clanak",
      toolOpis: "Sačuvaj napisani članak u strukturiranom formatu.",
      schema: CLANAK_SCHEMA,
    });

    // Podsjetnik box — samo ako je bot popunio pozadinu (iz izvora).
    const poz = (clanak.pozadina || "").trim();
    if (poz.length > 20) {
      clanak.sadrzaj =
        `<blockquote class="podsjetnik"><strong>📌 Podsjetnik — o čemu se radi:</strong> ${poz}</blockquote>\n` +
        clanak.sadrzaj;
    }

    console.log(`   ✅ Napisan: "${clanak.naslov.slice(0, 50)}"${poz.length > 20 ? " (+podsjetnik)" : ""}`);
    return { clanak, izvorniTekst, zvanicniUrl };
  } catch (err) {
    console.error(`   ❌ Writer greška: ${(err as Error).message}`);
    return { clanak: null, izvorniTekst, zvanicniUrl };
  }
}
