// ============================================================
// WIKIMEDIA COMMONS SLIKE — besplatno, bez API ključa, bez naloga
// ============================================================
// Traži pravu fotografiju (osoba / grad / institucija) na Wikimedia
// Commons. Vraća URL slike + autora + licencu (za obaveznu oznaku).
// Ako ništa dobro ne nađe → vrati null (pipeline onda padne na Unsplash).
//
// Wikimedia je javni servis — samo lijepo postaviti opisni User-Agent.

const API = "https://commons.wikimedia.org/w/api.php";
const UA = "kodnas.de-news-bot/1.0 (https://kodnas.de; image lookup)";

export interface WikiSlika {
  url: string;
  autor: string;
  licenca: string;
}

function bezHtml(s?: string): string {
  return (s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

// Riječi koje označavaju NE-fotografije (logo, mapa, grb, dijagram...)
const LOSE = /(logo|icon|ikona|map\b|karte|karta|flag|zastava|coat of arms|grb|seal|diagram|chart|svg|drawing|clipart)/i;

/**
 * Nađi relevantnu fotografiju na Wikimedia Commons za dati pojam.
 * Pojam najbolje radi kad je konkretno ime (osoba, grad, institucija).
 */
export async function nadjiSlikuWiki(pojam: string): Promise<WikiSlika | null> {
  const q = (pojam || "").trim();
  if (!q) return null;

  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    // filetype:bitmap = samo prave slike (ne SVG/PDF)
    gsrsearch: `${q} filetype:bitmap`,
    gsrnamespace: "6", // File: prostor
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime|size",
    iiurlwidth: "1200",
  });

  try {
    const r = await fetch(`${API}?${params.toString()}`, {
      headers: { "User-Agent": UA, "Api-User-Agent": UA },
    });
    if (!r.ok) return null;

    const data = (await r.json()) as {
      query?: { pages?: Record<string, unknown> };
    };
    const pages = data.query?.pages;
    if (!pages) return null;

    type Kand = { url: string; mime: string; w: number; h: number; autor: string; licenca: string; title: string };

    const kandidati: Kand[] = [];
    for (const p of Object.values(pages) as Array<Record<string, unknown>>) {
      const ii = (p.imageinfo as Array<Record<string, unknown>> | undefined)?.[0];
      if (!ii) continue;
      const meta = (ii.extmetadata as Record<string, { value?: string }> | undefined) || {};
      const url = (ii.thumburl as string) || (ii.url as string) || "";
      const mime = (ii.mime as string) || "";
      const w = (ii.thumbwidth as number) || (ii.width as number) || 0;
      const h = (ii.thumbheight as number) || (ii.height as number) || 0;
      const title = (p.title as string) || "";
      if (!url) continue;
      kandidati.push({
        url,
        mime,
        w,
        h,
        title,
        autor: bezHtml(meta.Artist?.value) || "Wikimedia Commons",
        licenca: bezHtml(meta.LicenseShortName?.value) || "Wikimedia Commons",
      });
    }

    const dobre = kandidati
      .filter((x) => /jpe?g|png/i.test(x.mime)) // prave fotografije
      .filter((x) => x.w >= 500) // dovoljno velike (ne ikonice)
      .filter((x) => !LOSE.test(x.title)); // izbaci logotipe/mape/grbove

    if (dobre.length === 0) return null;

    // Prednost pejzažnim (novinski izgled), pa najširim
    dobre.sort((a, b) => {
      const la = a.w >= a.h ? 1 : 0;
      const lb = b.w >= b.h ? 1 : 0;
      if (lb !== la) return lb - la;
      return b.w - a.w;
    });

    const best = dobre[0];
    return { url: best.url, autor: best.autor, licenca: best.licenca };
  } catch {
    return null;
  }
}
