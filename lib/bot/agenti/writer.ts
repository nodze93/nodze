// ============================================================
// WRITER AGENT (2/5) — fetchuje izvor PA piše članak
// ============================================================
// Ključno pravilo: bot PRVO čita izvor, tek onda piše.
// Sve tvrdnje moraju biti iz fetchovanog teksta — ne iz sjećanja.
// Naslovi su klikabilni (to donosi čitaoce i prihod), ali NIKAD lažni.
import { pozoviSaAlatom, MODEL_PISAC } from "./claude";
import { odaberiZvanicniIzvor } from "../izvori";
import type { Vijest, GeneriraniClanak } from "../tipovi";

const WRITER_DIJASPORA_PROMPT = `Ti si najbolji novinar portala kodnas.de — portala za nas, našu dijasporu u Njemačkoj i Austriji. Od tvojih tekstova živi portal: moraju biti KLIKABILNI i KORISNI.

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
- SLAGANJE PRIDJEVA I IMENICE U RODU (najčešća greška — provjeri svaki pridjev):
  srednji rod na -e/-o → pridjev -O: "presudnO glasanje", "novO pravilo", "važnO pitanje"
  (NE "presudAN glasanje"); ženski → -A: "novA reforma", "važnA odluka";
  muški → -I: "novI zakon", "presudAN rok". Množina: "novA pravilA stupajU".
- Ijekavica dosljedno: dijete, vrijeme, prije, poslije, mlijeko.
- Bosanski oblici, NE hrvatski: šta (ne "što" kao upitno), uopšte, doktor,
  dobija, zavisi, utiče, finansije, sedmica, hiljada, prevoz, sprat.
- Kratke, jasne rečenice, prirodan red riječi.
- OBRAĆANJE: piši u prvom licu množine — "mi", "nas", "naši ljudi", "naša
  dijaspora". Izbjegavaj "za Bosance" — piši "za nas" / "za naše ljude".

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
  ostavi "pozadina" PRAZNO ("").

═══ FACEBOOK SOCIAL MEDIA — generiši U ISTOM POZIVU, bez extra troška ═══

Uz članak generiši i dva Facebook posta i thumbnail tekst.
Piši kao marketing menadžer portala kodnas.de koji VOLI svoju dijasporu —
ne kao robot. Varij ton, pitanja i fraze — čitaoci primijete ako je uvijek ista rečenica.

fb_tekst_news (VIJESTI post — tjera na KLIK na članak):
- Svrha: što više klikova na članak (traffic)
- Dužina: 300-500 znakova
- Struktura: udarno otvaranje → 2-3 ključne činjenice iz članka → poziv na akciju
- OBAVEZNO završi s: "👇 Cijeli članak u prvom komentaru."
- Emoji: 1-3 na strateška mjesta (početak ili kraj rečenice, NE u svakom redu)
- Bez hashtaga. Bez linkova (link ide u komentar).
- Varij otvaranje: "Novo pravilo od [datum]...", "Pažnja!", "Važno za sve nas...",
  "Ovo se mijenja...", "Znate li da...", "Upravo objavljeno:"

fb_tekst_engage (ENGAGEMENT post — tjera na KOMENTARE):
- Svrha: što više komentara i dijeljenja (Facebook algoritam to voli)
- Dužina: 150-300 znakova
- Oblik: PITANJE čitaocu, mini-anketa ili provokacija vezana za temu
- NIKAD ista fraza/rečenica svaki put — varij između:
  "A vi šta mislite?", "Jeste li znali?", "Jeste li se susreli s ovim?",
  "Slagate li se?", "Šta bi vi uradili na mjestu...?",
  "Kako vam je iskustvo s ovim?", "Pišite ispod 👇"
- Osoban, topao ton — kao pitanje prijatelju, ne korporativna komunikacija
- Može biti i blag humor ako tema dozvoljava
- Završi pitanjem ili pozivom da pišu u komentare

fb_thumbnail_r1 (NASLOV na thumbnail slici):
- Udarnih 4-8 kratkih BOSANSKIH rijeci — ono što prvu sekundu zapne za oko
- Konkretan podatak ili pitanje (NE generičko)
- Primjer: "NOVO PRAVILO OD JANUARA", "5.000€ KINDERGELD?", "ŠTA SE MIJENJA?"

fb_thumbnail_r2 (PODNASLOV na thumbnail slici):
- Max 4-5 rijeci — kategorija/kontekst
- Primjeri: "Vijesti iz Njemačke", "VAŽNO ZA NAS", "Za sve u dijaspori"

fb_ide_na_facebook (boolean — AI filter):
- false SAMO za: lične tragedije/pogrebne vijesti, ekstremno lokalne vijesti
  bez veze s Njemačkom/dijasporom, ili vijesti koje bi mogle uvrijediti publiku
- true za sve ostalo — čak i manje važne vijesti imaju vrijednost na FB`;

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
    // ── FACEBOOK POLJA (opcionalna — ne u required, ne ruše stari pipeline) ──
    fb_tekst_news: {
      type: "string",
      description:
        "Facebook VIJESTI post koji tjera na klik. 300-500 znakova. Emoji na strateškim mjestima (ne svaki red). Završi UVIJEK s: '👇 Cijeli članak u prvom komentaru.' Bez hashtaga, bez linkova. Varij otvaranje svaki put.",
    },
    fb_tekst_engage: {
      type: "string",
      description:
        "Facebook ENGAGEMENT post koji tjera na komentare. 150-300 znakova. Pitanje, mini-anketa ili blaga provokacija. Osoban, topao ton kao prijatelju. NIKAD ista fraza. Završi pozivom da pišu u komentare.",
    },
    fb_thumbnail_r1: {
      type: "string",
      description:
        "Kratki udari naslov za thumbnail overlay (max 4-8 BOSANSKIH rijeci, specifičan podatak ili pitanje). Primjeri: 'NOVO PRAVILO OD JANUARA', '5.000€ KINDERGELD?', 'ŠTA SE MIJENJA U 2025?'",
    },
    fb_thumbnail_r2: {
      type: "string",
      description:
        "Kratki podnaslov za thumbnail overlay (max 4-5 rijeci, kategorija ili kontekst). Primjeri: 'Vijesti iz Njemačke', 'VAŽNO ZA NAS', 'Za sve u dijaspori'",
    },
    fb_ide_na_facebook: {
      type: "boolean",
      description:
        "false SAMO za: lične tragedije, pogrebne vijesti, ekstremno lokalne vijesti bez veze s Njemačkom/dijasporom. Za sve ostalo: true.",
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
        : WRITER_DIJASPORA_PROMPT) + ZAJEDNICKA_PRAVILA,
      user: kontekst,
      // 4200 (dodano za FB polja): sprječava odsijecanje prije FB teksta.
      maxTokens: 4200,
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

    const fbLog = clanak.fb_tekst_news
      ? ` | 📱 FB: ${clanak.fb_ide_na_facebook !== false ? "✅" : "⏭️"}`
      : "";
    console.log(`   ✅ Napisan: "${clanak.naslov.slice(0, 50)}"${poz.length > 20 ? " (+podsjetnik)" : ""}${fbLog}`);
    return { clanak, izvorniTekst, zvanicniUrl };
  } catch (err) {
    console.error(`   ❌ Writer greška: ${(err as Error).message}`);
    return { clanak: null, izvorniTekst, zvanicniUrl };
  }
}
