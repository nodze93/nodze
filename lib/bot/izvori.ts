// ============================================================
// IZVORI — RSS feedovi koje bot čita + zvanični izvori za grounding
// ============================================================
// Feedovi su birani po pouzdanosti (stabilni RSS-ovi velikih kuća).
// Ako neki prestane raditi, bot ga samo preskoči — ne ruši se.
// Mrtve feedove (npr. stari Reuters) smo izbacili.

import type { FeedIzvor } from "./tipovi";

export const RSS_IZVORI: FeedIzvor[] = [
  // ── DIJASPORA / BiH + Njemačka (servisne i BiH teme) ──────────
  { ime: "Klix.ba",            url: "https://www.klix.ba/rss/naslovnica",            jezik: "bs", tip: "dijaspora" },
  { ime: "N1 BiH",             url: "https://n1info.ba/feed/",                        jezik: "bs", tip: "dijaspora" },
  { ime: "Slobodna Evropa",    url: "https://www.slobodnaevropa.org/api/zrqiteuuir",  jezik: "bs", tip: "dijaspora" },
  { ime: "DW Bosanski",        url: "https://rss.dw.com/rdf/rss-bos-all",             jezik: "bs", tip: "dijaspora" },
  { ime: "Tagesschau",         url: "https://www.tagesschau.de/index~rss2.xml",       jezik: "de", tip: "dijaspora" },
  { ime: "Spiegel",            url: "https://www.spiegel.de/schlagzeilen/index.rss",  jezik: "de", tip: "dijaspora" },
  { ime: "Make it in Germany", url: "https://www.make-it-in-germany.com/de/rss-news", jezik: "de", tip: "dijaspora" },

  // ── SVIJET (klikabilne međunarodne vijesti) ───────────────────
  // Al Jazeera Balkans — već na našem jeziku, odličan za brzu adaptaciju
  { ime: "Al Jazeera Balkans", url: "https://balkans.aljazeera.net/rss",              jezik: "bs", tip: "svjetske" },
  // BBC World — najpouzdaniji svjetski RSS
  { ime: "BBC World",          url: "https://feeds.bbci.co.uk/news/world/rss.xml",    jezik: "en", tip: "svjetske" },
  // Guardian World — otvoren, bogat sadržaj
  { ime: "Guardian World",     url: "https://www.theguardian.com/world/rss",          jezik: "en", tip: "svjetske" },
  // DW English Top — evropski ugao
  { ime: "DW World",           url: "https://rss.dw.com/rdf/rss-en-top",              jezik: "en", tip: "svjetske" },
  // Sky News World — brze, klikabilne vijesti
  { ime: "Sky News World",     url: "https://feeds.skynews.com/feeds/rss/world.xml",  jezik: "en", tip: "svjetske" },

  // ── SPORT (bosanski sportisti, Bundesliga, regionalni sport) ──
  { ime: "Klix Sport",         url: "https://www.klix.ba/rss/sport",                  jezik: "bs", tip: "sport" },
  { ime: "Sportske.net",       url: "https://sportske.net/rss",                       jezik: "bs", tip: "sport" },
  { ime: "BBC Sport",          url: "https://feeds.bbci.co.uk/sport/rss.xml",         jezik: "en", tip: "sport" },
  { ime: "Kicker",             url: "https://newsfeed.kicker.de/news/aktuell",        jezik: "de", tip: "sport" },
];

// ── Zvanični izvori po kategoriji (bot ih fetchuje PRIJE pisanja) ──
export const ZVANICNI_IZVORI: Record<string, string[]> = {
  finansije: ["https://www.elster.de", "https://www.bzst.de"],
  porez:     ["https://www.elster.de", "https://www.bzst.de"],
  porodica:  ["https://familienportal.de", "https://www.bmfsfj.de"],
  viza:      ["https://www.bamf.de", "https://www.make-it-in-germany.com"],
  posao:     ["https://www.make-it-in-germany.com", "https://www.arbeitsagentur.de"],
  zdravstvo: ["https://www.gkv-spitzenverband.de", "https://www.bundesgesundheitsministerium.de"],
  stan:      ["https://www.mieterbund.de"],
  penzija:   ["https://www.deutsche-rentenversicherung.de"],
};

// Specifične zvanične stranice po ključnoj riječi u naslovu
export const KLJUCNE_STRANICE: Record<string, string> = {
  "steuererklärung":       "https://www.elster.de/eportal/infoseite/help",
  "elterngeld":            "https://familienportal.de/familienportal/lebenslagen/schwangerschaft-geburt/elterngeld",
  "kindergeld":            "https://familienportal.de/familienportal/lebenslagen/schwangerschaft-geburt/kindergeld",
  "bürgergeld":            "https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/buergergeld",
  "wohngeld":              "https://www.bmi.bund.de/DE/themen/bauen-wohnen/wohnen/wohngeld/wohngeld-node.html",
  "aufenthaltstitel":      "https://www.bamf.de/DE/Themen/MigrationAufenthalt/ZuwandererDrittstaaten/zuwandererdrittstaaten-node.html",
  "einbürgerung":          "https://www.bamf.de/DE/Themen/Integration/ZugewanderteTeilnehmende/Einbuergerung/einbuergerung-node.html",
  "rente":                 "https://www.deutsche-rentenversicherung.de",
  "penzij":                "https://www.deutsche-rentenversicherung.de",
};

// Odaberi koji zvanični izvor fetchovati
export function odaberiZvanicniIzvor(kategorija: string, naslov: string): string | null {
  const naslovLower = (naslov || "").toLowerCase();
  for (const [kljuc, url] of Object.entries(KLJUCNE_STRANICE)) {
    if (naslovLower.includes(kljuc)) return url;
  }
  const izbori = ZVANICNI_IZVORI[kategorija] || [];
  return izbori[0] || null;
}

// Google Trends seed pojmovi (za trend kontekst u filteru)
export const SEED_POJMOVI = [
  "Steuererklärung", "Elterngeld", "Aufenthaltstitel", "Kindergeld",
  "Krankenkasse", "Arbeitslosengeld", "Bürgergeld", "Wohngeld",
  "Niederlassungserlaubnis", "Einbürgerung",
];
