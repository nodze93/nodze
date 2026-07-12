// ============================================================
// PROŠIRENI IZVORI (za NOVI lijevak / pipeline2)
// ============================================================
// Ovdje su izvori podijeljeni po SLOJEVIMA (tier). Sloj nosi
// bazno povjerenje/težinu u bodovanju:
//   sluzbeni  → vlada, ministarstva, policija, DWD (najviše povjerenje)
//   mediji    → veliki mediji (Tagesschau, Spiegel, Zeit...)
//   lokalno   → gradski mediji (München, Berlin, Frankfurt...)
//   poslovi   → tržište rada / oglasi
//   vrijeme   → upozorenja na nevrijeme
//   saobracaj → Bahn, štrajkovi, autoputevi, aerodromi
//   finansije → ekonomija, cijene, kamate, plate
//   eu        → EU odluke koje utiču na život u Njemačkoj
//
// VAŽNO: RSS čitač je otporan — ako neki feed ne radi, samo se
// preskoči (ne ruši ništa). Zato je lista namjerno široka.
// Feedove označene s "// provjeri" testiraj pri prvom pokretanju
// (u admin/pipeline logu vidiš koliko je vijesti stiglo iz svakog).
//
// BiH izvori su NAMJERNO izostavljeni — portal je fokusiran na
// Njemačku/svijet/sport (frontend više nema BiH rubriku).

import type { FeedIzvorPro } from "./tipovi";

export const IZVORI_PRO: FeedIzvorPro[] = [
  // ══════════════ SLOJ 1: SLUŽBENI (najviše povjerenje) ══════════════
  // Javni servis + saopštenja institucija. Ovdje je tačnost, ne senzacija.
  { ime: "Tagesschau",          tier: "sluzbeni", url: "https://www.tagesschau.de/index~rss2.xml",            jezik: "de", tip: "dijaspora", strana: "de" },
  { ime: "Tagesschau Inland",   tier: "sluzbeni", url: "https://www.tagesschau.de/inland/index~rss2.xml",     jezik: "de", tip: "dijaspora", strana: "de" },
  { ime: "Bundesregierung",     tier: "sluzbeni", url: "https://www.bundesregierung.de/breg-de/aktuelles.rss",jezik: "de", tip: "dijaspora", strana: "de" }, // provjeri
  { ime: "Presseportal Polizei",tier: "sluzbeni", url: "https://www.presseportal.de/rss/polizei.rss2",        jezik: "de", tip: "dijaspora", strana: "de" }, // provjeri

  // ══════════════ SLOJ 2: VELIKI MEDIJI ══════════════
  { ime: "Spiegel",             tier: "mediji",   url: "https://www.spiegel.de/schlagzeilen/index.rss",       jezik: "de", tip: "dijaspora", strana: "de" },
  { ime: "Zeit",                tier: "mediji",   url: "https://newsfeed.zeit.de/index",                       jezik: "de", tip: "dijaspora", strana: "de" },
  { ime: "Süddeutsche",         tier: "mediji",   url: "https://rss.sueddeutsche.de/rss/Topthemen",            jezik: "de", tip: "dijaspora", strana: "de" },
  { ime: "FAZ",                 tier: "mediji",   url: "https://www.faz.net/rss/aktuell/",                     jezik: "de", tip: "dijaspora", strana: "de" },
  { ime: "n-tv",                tier: "mediji",   url: "https://www.n-tv.de/rss",                              jezik: "de", tip: "dijaspora", strana: "de" },
  { ime: "Focus",               tier: "mediji",   url: "https://rss.focus.de/fol/XML/rss_folnews.xml",         jezik: "de", tip: "dijaspora", strana: "de" }, // provjeri
  { ime: "DW Deutsch",          tier: "mediji",   url: "https://rss.dw.com/rdf/rss-de-all",                    jezik: "de", tip: "dijaspora", strana: "de" },
  // DW Bosanski: naš jezik, ali piše o Njemačkoj → strana "de"
  { ime: "DW Bosanski",         tier: "mediji",   url: "https://rss.dw.com/rdf/rss-bos-all",                   jezik: "bs", tip: "dijaspora", strana: "de" },

  // ══════════════ SLOJ 3: LOKALNO (veliki gradovi) ══════════════
  // Objavljuje se SAMO ako AI procijeni širi značaj (zatvaranje autoputa,
  // veliki požar, promjena javnog prevoza). Volumen je velik — triaža siječe.
  { ime: "München (Merkur)",    tier: "lokalno",  url: "https://www.merkur.de/lokales/muenchen/rssfeed.rdf",   jezik: "de", tip: "dijaspora", strana: "de" }, // provjeri
  { ime: "Berlin (Morgenpost)", tier: "lokalno",  url: "https://www.morgenpost.de/berlin/rss",                 jezik: "de", tip: "dijaspora", strana: "de" }, // provjeri
  { ime: "Frankfurt (FR)",      tier: "lokalno",  url: "https://www.fr.de/frankfurt/rssfeed.rdf",              jezik: "de", tip: "dijaspora", strana: "de" }, // provjeri
  { ime: "Hamburg (Abendblatt)",tier: "lokalno",  url: "https://www.abendblatt.de/hamburg/rss",                jezik: "de", tip: "dijaspora", strana: "de" }, // provjeri
  { ime: "Köln (Stadt-Anz.)",   tier: "lokalno",  url: "https://www.ksta.de/feed/index.rss",                   jezik: "de", tip: "dijaspora", strana: "de" }, // provjeri

  // ══════════════ SLOJ 4: FINANSIJE / EKONOMIJA ══════════════
  { ime: "Tagesschau Wirtschaft",tier: "finansije",url: "https://www.tagesschau.de/wirtschaft/index~rss2.xml", jezik: "de", tip: "dijaspora", strana: "de" },
  { ime: "Handelsblatt",        tier: "finansije",url: "https://www.handelsblatt.com/contentexport/feed/schlagzeilen", jezik: "de", tip: "dijaspora", strana: "de" }, // provjeri

  // ══════════════ SLOJ 5: SVIJET (klikabilne međunarodne) ══════════════
  { ime: "BBC World",           tier: "mediji",   url: "https://feeds.bbci.co.uk/news/world/rss.xml",          jezik: "en", tip: "svjetske" },
  { ime: "Guardian World",      tier: "mediji",   url: "https://www.theguardian.com/world/rss",                jezik: "en", tip: "svjetske" },
  { ime: "DW World",            tier: "mediji",   url: "https://rss.dw.com/rdf/rss-en-top",                    jezik: "en", tip: "svjetske" },
  { ime: "Sky News World",      tier: "mediji",   url: "https://feeds.skynews.com/feeds/rss/world.xml",        jezik: "en", tip: "svjetske" },

  // ══════════════ SLOJ 6: SPORT (naši + Bundesliga + svjetski) ══════════════
  { ime: "Kicker",              tier: "mediji",   url: "https://newsfeed.kicker.de/news/aktuell",              jezik: "de", tip: "sport" },
  { ime: "SportSport.ba",       tier: "mediji",   url: "https://sportsport.ba/feed",                           jezik: "bs", tip: "sport" },
  { ime: "Avaz Sport",          tier: "mediji",   url: "https://avaz.ba/rss/sport",                            jezik: "bs", tip: "sport" },
  { ime: "BBC Sport",           tier: "mediji",   url: "https://feeds.bbci.co.uk/sport/rss.xml",               jezik: "en", tip: "sport" },
];

// Bazno povjerenje po sloju (0-100). Ulazi u jeftini (bez-AI) predScore.
// Službeni izvori kreću s prednošću jer je tačnost najvažnija.
export const TIER_TEZINA: Record<string, number> = {
  sluzbeni:  40,
  saobracaj: 34,
  vrijeme:   34,
  finansije: 26,
  poslovi:   26,
  eu:        24,
  mediji:    18,
  lokalno:   10, // lokalno starta nisko — mora "zaraditi" mjesto kroz značaj
};

// NAPOMENA: strukturirani službeni izvori (DWD upozorenja na nevrijeme,
// Deutsche Bahn poremećaji) NISU klasični RSS nego JSON/API. Njih pokriva
// poseban fetcher (vidi BOT-LIJEVAK.md, Faza 1.5) i ubacuje kao Vijest[]
// s tier "vrijeme"/"saobracaj" — lijevak ih dalje tretira jednako.
