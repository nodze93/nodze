// ============================================================
// LIJEVAK · KORAK 2 — KLJUČNE RIJEČI + TEŽINA IZVORA (bez AI)
// ============================================================
// Od ~150 vijesti pravimo ~40 tako što svakoj damo jeftini
// "predScore" i uzmemo najbolje. NEMA AI-a ovdje — samo brojanje.
//
// predScore = težina sloja (tier) + pogodci ključnih riječi
//           + bonus za hitnost + mala nagrada za svježinu.
// Ključne riječi su BONUS (dižu), ne tvrdi filter — da ne izgubimo
// priču koja je bitna a nema baš tu riječ (to hvata AI triaža).

import type { Vijest } from "../tipovi";
import { TIER_TEZINA } from "../izvori-prosireni";

// Teme koje direktno pogađaju život u Njemačkoj → jak signal.
const KLJUCNE: { rijeci: string[]; tezina: number }[] = [
  // Boravak / državljanstvo / migracija
  { tezina: 30, rijeci: ["aufenthalt", "aufenthaltstitel", "einbürgerung", "staatsangehörigkeit", "visum", "chancenkarte", "fachkräfte", "ausländerbehörde", "westbalkan", "asyl", "abschiebung", "migration"] },
  // Novac / beneficije / porezi
  { tezina: 30, rijeci: ["kindergeld", "elterngeld", "bürgergeld", "wohngeld", "rente", "rentenversicherung", "steuer", "steuererklärung", "mindestlohn", "sozialhilfe", "krankenkasse", "krankenversicherung"] },
  // Stanovanje
  { tezina: 22, rijeci: ["miete", "mietpreis", "mietpreisbremse", "wohnung", "wohnungsmarkt", "nebenkosten", "kaution", "vermieter", "mieter"] },
  // Cijene / režije / troškovi života
  { tezina: 22, rijeci: ["inflation", "strompreis", "gaspreis", "spritpreis", "benzin", "energiepreis", "lebenshaltungskosten", "preise steigen", "teurer"] },
  // Rad / posao
  { tezina: 20, rijeci: ["arbeitsmarkt", "jobs", "stellen", "fachkräftemangel", "tarifvertrag", "kurzarbeit", "arbeitslos", "pflegekräfte", "ausbildung"] },
  // Zdravstvo / bolnice
  { tezina: 18, rijeci: ["krankenhaus", "klinik", "gesundheit", "arztpraxis", "apotheke", "pflege"] },
  // Saobraćaj (Bahn / štrajk / autoput / aerodrom)
  { tezina: 26, rijeci: ["deutsche bahn", "bahn", "streik", "gdl", "verdi", "flughafen", "autobahn", "a1", "a2", "a3", "a7", "a8", "a9", "gesperrt", "stau", "zugausfall", "fahrplan"] },
  // Vrijeme / upozorenja
  { tezina: 26, rijeci: ["unwetter", "sturm", "orkan", "hochwasser", "überschwemmung", "schnee", "glätte", "hitze", "hitzewelle", "dwd", "warnung", "wetterwarnung"] },
  // EU / putovanje
  { tezina: 16, rijeci: ["eu-kommission", "roaming", "führerschein", "reisepass", "personalausweis", "schengen", "eu-parlament", "ees", "etias"] },
  // Veliki gradovi (lokalni značaj)
  { tezina: 8, rijeci: ["münchen", "berlin", "hamburg", "frankfurt", "stuttgart", "köln", "düsseldorf", "bayern", "nrw", "hessen"] },
];

// Riječi koje znače HITNO / vremenski osjetljivo → dodatni bonus.
const HITNE = [
  "streik", "unwetter", "sturm", "hochwasser", "warnung", "gesperrt",
  "ausfall", "zugausfall", "evakuierung", "großbrand", "unfall", "sofort",
  "ab morgen", "ab montag", "ab januar", "achtung", "notfall",
];

function bodujJednu(v: Vijest): number {
  const tekst = `${v.naslov} ${v.excerpt || ""}`.toLowerCase();

  // 1) bazna težina sloja (tier), s fallbackom po tipu
  const tierW = v.tier
    ? TIER_TEZINA[v.tier] ?? 15
    : v.tip === "sport"
    ? 12
    : v.tip === "svjetske"
    ? 12
    : 18;
  let score = tierW;

  // 2) pogodci ključnih riječi (svaka grupa se broji jednom, ne 5x)
  for (const grupa of KLJUCNE) {
    if (grupa.rijeci.some((r) => tekst.includes(r))) score += grupa.tezina;
  }

  // 3) hitnost — dodatni bonus (i po jednom pogotku je dovoljno)
  if (HITNE.some((r) => tekst.includes(r))) score += 20;

  // 4) svježina — do +10 za vijesti mlađe od 12h
  const t = Date.parse(v.datum);
  if (!isNaN(t)) {
    const satiStaro = (Date.now() - t) / 3600000;
    if (satiStaro <= 12) score += 10;
    else if (satiStaro <= 24) score += 5;
  }

  return score;
}

/**
 * Boduj sve vijesti jeftino i vrati top N (default 40), sortirane.
 * Svakoj upiše v.predScore da se vidi u logu i kasnijoj triaži.
 */
export function bodujKljucnim(vijesti: Vijest[], topN = 40): Vijest[] {
  const bodovane = vijesti
    .map((v) => ({ ...v, predScore: bodujJednu(v) }))
    .sort((a, b) => (b.predScore || 0) - (a.predScore || 0));

  const top = bodovane.slice(0, topN);
  console.log(
    `🔑 Ključne riječi: ${vijesti.length} → ${top.length} ` +
      `(najbolji ${top[0]?.predScore ?? 0}, prag ulaza u triažu ${top[top.length - 1]?.predScore ?? 0})`
  );
  return top;
}
