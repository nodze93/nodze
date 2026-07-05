// ============================================================
// LIVE VIJESTI — direktno iz RSS feedova (ne iz baze!)
// ============================================================
// Ovo su sirovi naslovi s originalnih portala koji vode na
// originalne članke — "wire" traka. Bot članci su odvojena stvar.
// Server-side, keširano kroz revalidate na stranicama.
import Parser from "rss-parser";

export interface LiveStavka {
  naslov: string;
  link: string;
  izvor: string;
  vrijemeAgo: string;
  datum: number; // timestamp za sortiranje
}

interface LiveFeed {
  ime: string;
  url: string;
}

// 🇩🇪 Njemačka strana
const FEEDOVI_DE: LiveFeed[] = [
  { ime: "Spiegel", url: "https://www.spiegel.de/schlagzeilen/index.rss" },
  { ime: "Tagesschau", url: "https://www.tagesschau.de/index~rss2.xml" },
  { ime: "Bild", url: "https://www.bild.de/rssfeeds/vw-home/vw-home-16725492,dzbildplus=false,view=rss2.bild.xml" },
  { ime: "Make it in Germany", url: "https://www.make-it-in-germany.com/de/rss-news" },
];

// 🇧🇦 BiH strana
const FEEDOVI_BIH: LiveFeed[] = [
  { ime: "Klix.ba", url: "https://www.klix.ba/rss/naslovnica" },
  { ime: "N1 BiH", url: "https://n1info.ba/feed/" },
  { ime: "Slobodna Evropa", url: "https://www.slobodnaevropa.org/api/zrqiteuuir" },
  { ime: "DW Bosanski", url: "https://rss.dw.com/rdf/rss-bos-all" },
];

const parser = new Parser({
  timeout: 8000,
  headers: { "User-Agent": "Mozilla/5.0 (compatible; DijasporaLive/1.0)" },
});

function vrijemeAgo(ts: number): string {
  const min = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ${String(min % 60).padStart(2, "0")}min`;
  return `${Math.floor(h / 24)}d`;
}

async function citajFeed(feed: LiveFeed): Promise<LiveStavka[]> {
  try {
    const rez = await parser.parseURL(feed.url);
    return (rez.items || [])
      .slice(0, 8)
      .filter((it) => it.title && it.link)
      .map((it) => {
        const ts = Date.parse(it.isoDate || it.pubDate || "") || Date.now();
        return {
          naslov: (it.title || "").trim(),
          link: (it.link || "").trim(),
          izvor: feed.ime,
          vrijemeAgo: vrijemeAgo(ts),
          datum: ts,
        };
      });
  } catch {
    return []; // mrtav feed se preskače
  }
}

async function citajGrupu(feedovi: LiveFeed[], limit: number): Promise<LiveStavka[]> {
  const liste = await Promise.all(feedovi.map(citajFeed));
  return liste
    .flat()
    .sort((a, b) => b.datum - a.datum)
    .slice(0, limit);
}

/** 🇩🇪 Najnovije iz Njemačke (direktno iz RSS-a) */
export async function dajLiveDE(limit = 6): Promise<LiveStavka[]> {
  return citajGrupu(FEEDOVI_DE, limit);
}

/** 🇧🇦 Najnovije iz BiH (direktno iz RSS-a) */
export async function dajLiveBIH(limit = 6): Promise<LiveStavka[]> {
  return citajGrupu(FEEDOVI_BIH, limit);
}

// Fallback ako RSS trenutno ne radi (da sekcija nikad nije prazna)
export const MOCK_DE: LiveStavka[] = [
  { naslov: "Bundesregierung uvodi nove olakšice za radnike s djecom — povećanje Kinderfreibetrag", link: "#", izvor: "Spiegel", vrijemeAgo: "8 min", datum: 0 },
  { naslov: "Rekordnih 5,3 miliona radnih mjesta ostalo nepopunjeno — traženi strani radnici", link: "#", izvor: "Spiegel", vrijemeAgo: "34 min", datum: 0 },
  { naslov: "Neue Aufenthaltserlaubnis: lakše produženje boravišne dozvole za IT stručnjake", link: "#", izvor: "Make it in Germany", vrijemeAgo: "1h 12min", datum: 0 },
  { naslov: "Bürgergeld: planira se povećanje od 2,4% prema inflaciji, odluka u novembru", link: "#", izvor: "Bild", vrijemeAgo: "2h 05min", datum: 0 },
  { naslov: "Wohnungsbau: Berlin otvara 3.000 novih stanova za srednji sloj", link: "#", izvor: "Bild", vrijemeAgo: "2h 48min", datum: 0 },
  { naslov: "Deutschlandticket opstaje — cijena ostaje 49€ prema koalicijskom dogovoru", link: "#", izvor: "Spiegel", vrijemeAgo: "4h 21min", datum: 0 },
];

export const MOCK_BIH: LiveStavka[] = [
  { naslov: "Ambasada BiH u Berlinu uvodi elektronski sistem zakazivanja termina", link: "#", izvor: "Klix.ba", vrijemeAgo: "12 min", datum: 0 },
  { naslov: "Broj Bosanaca koji apliciraju za njemačko državljanstvo porastao 41%", link: "#", izvor: "N1 BiH", vrijemeAgo: "49 min", datum: 0 },
  { naslov: "Pasošima izdatim prije 2020. uskoro ističe valjanost — zamijenite na vrijeme", link: "#", izvor: "Slobodna Evropa", vrijemeAgo: "1h 30min", datum: 0 },
  { naslov: "Glasanje u dijaspori na lokalnim izborima: razmatra se poštansko glasanje", link: "#", izvor: "DW Bosanski", vrijemeAgo: "3h 02min", datum: 0 },
  { naslov: "Sarajevo: novi direktni let ka Frankfurtu od decembra", link: "#", izvor: "Klix.ba", vrijemeAgo: "3h 55min", datum: 0 },
  { naslov: "Nostrifikacija diploma: novi sporazum BiH-Njemačka skraćuje procedure", link: "#", izvor: "N1 BiH", vrijemeAgo: "5h 17min", datum: 0 },
];
