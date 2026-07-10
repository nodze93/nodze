// ============================================================
// WIKIMEDIA / WIKIPEDIA SLIKE — besplatno, bez API ključa
// ============================================================
// Cilj: naći PRAVU sliku glavne osobe/mjesta/institucije iz vijesti.
//
// Strategija (od najboljeg ka rezervi):
//  1) Izvuci ključna IMENA iz naslova (vlastite imenice — Merz, Bundestag,
//     Bruxelles, Džeko...). Duga bosanska rečenica se ne pretražuje dobro.
//  2) Wikipedia (de → en) "pageimages": vrati GLAVNU sliku najboljeg članka
//     (npr. za "Friedrich Merz" njegov portret). Licencu dovučemo s Commons.
//  3) Rezerva: Commons full-text pretraga po tim istim pojmovima.
// Ako ništa → null (pipeline zadrži Unsplash / postojeću sliku).

const COMMONS = "https://commons.wikimedia.org/w/api.php";
const UA = "kodnas.de-news-bot/1.0 (https://kodnas.de; image lookup)";

export interface WikiSlika {
  url: string;
  autor: string;
  licenca: string;
}

// Riječi koje NISU entiteti (počinju velikim slovom ali su početak rečenice / opšte)
const STOP = new Set([
  "Novo", "Nova", "Novi", "Nove", "Šok", "Šokantan", "Šokantno", "Evo", "Kako", "Zašto",
  "Ovo", "Ova", "Ovaj", "Ove", "Veliki", "Velika", "Veliko", "Hitno", "Danas", "Jučer",
  "Sutra", "Sve", "Svi", "Nakon", "Zbog", "Kraj", "Prvi", "Prva", "Prvo", "Više", "Manje",
  "Bosanci", "Bosance", "Bosanac", "Bosanka", "Dijaspora", "Dijasporu", "Dijaspore",
  "Poznati", "Nevjerovatno", "Konačno", "Stiže", "Stigao", "Došlo", "Pogledajte", "Video",
  "Zvanično", "Otkriveno", "Objavljeno", "Ako", "Kada", "Gdje", "Šta", "Ko", "Novac",
  "Njemačka", "Njemačkoj", "Njemačke", "Njemačku", "Njemci", // prezasto → daje mapu/zastavu
]);

// Filenames koje NE želimo (zastave, mape, grbovi, logotipi, ikone)
const LOSE_FILE = /(flag|zastava|\bmap\b|karte|karta|locator|coat[_ ]of[_ ]arms|grb|\bseal\b|logo|icon|svg|orthographic|blank)/i;

function bezHtml(s?: string): string {
  return (s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

// Izvuci do 3 vlastite imenice iz naslova
function entiteti(naslov: string): string {
  const ocisceno = (naslov || "").replace(/[„""»«:.,!?()\[\]\-–—/"']/g, " ");
  const rijeci = ocisceno.split(/\s+/);
  const iz: string[] = [];
  for (const r of rijeci) {
    if (r.length < 3) continue;
    if (!/^[A-ZČĆŽŠĐ]/.test(r)) continue; // mora početi velikim slovom
    if (STOP.has(r)) continue;
    if (iz.includes(r)) continue;
    iz.push(r);
    if (iz.length >= 3) break;
  }
  return iz.join(" ");
}

async function jsonFetch(url: string): Promise<unknown | null> {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA, "Api-User-Agent": UA } });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

// Glavna slika najboljeg Wikipedia članka za dati pojam
async function wikiLeadImage(wiki: "de" | "en", pojam: string): Promise<{ url: string; file: string } | null> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: pojam,
    gsrlimit: "1",
    gsrnamespace: "0",
    prop: "pageimages",
    piprop: "original|name",
    pithumbsize: "1200",
  });
  const data = (await jsonFetch(`https://${wiki}.wikipedia.org/w/api.php?${params}`)) as
    | { query?: { pages?: Record<string, { original?: { source?: string }; thumbnail?: { source?: string }; pageimage?: string }> } }
    | null;
  const pages = data?.query?.pages;
  if (!pages) return null;
  for (const p of Object.values(pages)) {
    // Prednost: kvalitetan ~1200px thumbnail (oštar, ali se brzo učita).
    // Original (puna rezolucija) samo ako thumbnail ne postoji.
    const url = p.thumbnail?.source || p.original?.source;
    const file = p.pageimage || "";
    if (!url || !file) continue;
    if (LOSE_FILE.test(file)) continue; // preskoči zastave/mape/logo
    return { url, file };
  }
  return null;
}

// Licenca + autor za dati Commons fajl
async function commonsLicenca(file: string): Promise<{ autor: string; licenca: string }> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    titles: `File:${file}`,
    prop: "imageinfo",
    iiprop: "extmetadata",
  });
  const data = (await jsonFetch(`${COMMONS}?${params}`)) as
    | { query?: { pages?: Record<string, { imageinfo?: Array<{ extmetadata?: Record<string, { value?: string }> }> }> } }
    | null;
  const pages = data?.query?.pages;
  if (pages) {
    for (const p of Object.values(pages)) {
      const meta = p.imageinfo?.[0]?.extmetadata;
      if (meta) {
        return {
          autor: bezHtml(meta.Artist?.value) || "Wikimedia Commons",
          licenca: bezHtml(meta.LicenseShortName?.value) || "CC / Wikimedia",
        };
      }
    }
  }
  return { autor: "Wikimedia Commons", licenca: "CC / Wikimedia" };
}

// Rezerva: Commons full-text pretraga
async function commonsPretraga(pojam: string): Promise<WikiSlika | null> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `${pojam} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime|size",
    iiurlwidth: "1200",
  });
  const data = (await jsonFetch(`${COMMONS}?${params}`)) as
    | { query?: { pages?: Record<string, Record<string, unknown>> } }
    | null;
  const pages = data?.query?.pages;
  if (!pages) return null;

  type K = { url: string; w: number; h: number; autor: string; licenca: string; title: string; mime: string };
  const kand: K[] = [];
  for (const p of Object.values(pages)) {
    const ii = (p.imageinfo as Array<Record<string, unknown>> | undefined)?.[0];
    if (!ii) continue;
    const meta = (ii.extmetadata as Record<string, { value?: string }> | undefined) || {};
    const url = (ii.thumburl as string) || (ii.url as string) || "";
    if (!url) continue;
    kand.push({
      url,
      w: (ii.thumbwidth as number) || (ii.width as number) || 0,
      h: (ii.thumbheight as number) || (ii.height as number) || 0,
      mime: (ii.mime as string) || "",
      title: (p.title as string) || "",
      autor: bezHtml(meta.Artist?.value) || "Wikimedia Commons",
      licenca: bezHtml(meta.LicenseShortName?.value) || "CC / Wikimedia",
    });
  }
  const dobre = kand
    .filter((x) => /jpe?g|png/i.test(x.mime))
    .filter((x) => x.w >= 500)
    .filter((x) => !LOSE_FILE.test(x.title));
  if (dobre.length === 0) return null;
  dobre.sort((a, b) => {
    const la = a.w >= a.h ? 1 : 0;
    const lb = b.w >= b.h ? 1 : 0;
    if (lb !== la) return lb - la;
    return b.w - a.w;
  });
  return { url: dobre[0].url, autor: dobre[0].autor, licenca: dobre[0].licenca };
}

/**
 * Nađi relevantnu sliku za vijest. Vraća null ako nema dobrog pogotka.
 */
export async function nadjiSlikuWiki(pojam: string): Promise<WikiSlika | null> {
  const sirovo = (pojam || "").trim();
  if (!sirovo) return null;

  // Najbolji upit = izvučena imena; ako ih nema, cijeli pojam
  const imena = entiteti(sirovo);
  const upit = imena || sirovo;

  // 1) Wikipedia glavna slika (de pa en)
  for (const wiki of ["de", "en"] as const) {
    const lead = await wikiLeadImage(wiki, upit);
    if (lead) {
      const lic = await commonsLicenca(lead.file);
      return { url: lead.url, autor: lic.autor, licenca: lic.licenca };
    }
  }

  // 2) Rezerva: Commons pretraga
  return await commonsPretraga(upit);
}
