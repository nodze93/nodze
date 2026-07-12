// ============================================================
// LIJEVAK · KORAK 1 — PRAVILA (bez AI, praktično besplatno)
// ============================================================
// Cilj: od ~1500 sirovih vijesti napraviti ~150 tako što OŠTRO
// bacimo samo ono u šta smo SIGURNI (reklame, horoskop, prestaro,
// prazno). Sve granično PUŠTAMO dalje — bolje da AI odbije par
// viška nego da pravilo tiho pojede pravu vijest.
//
// Dedupe po linku se radi u pipeline2 (ima učitane obrađene linkove).

import type { Vijest } from "../tipovi";

// Očiti šum u naslovu → baci. Namjerno usko: samo sigurne stvari.
const IZBACI = [
  "horoskop", "horoscope", "lotto", "lottozahlen", "gewinnspiel", "eurojackpot",
  "gewinnen sie", "anzeige:", "werbung", "sponsored", "im angebot", "% rabatt",
  "gutschein", "deal des tages", "amazon prime", "black friday",
  "tv-tipps", "tv-programm", "fernsehprogramm", "das tv-",
  "kreuzworträtsel", "sudoku", "kolumne:", "liveticker:", "im live-stream",
  "so sehen sie", "übertragung im tv", "wo läuft",
  // celebrity/trač bez značaja za život
  "dschungelcamp", "gntm", "bachelor", "promi big brother", "reality-star",
];

// Ako naslov djeluje kao spam velikim slovima/uzvicima — sumnjivo, ali
// ne bacamo tvrdo (može biti hitna vijest); samo se NE koristi ovdje.

export interface PravilaOpcije {
  maxStarostSati?: number;  // baci starije od ovoga (default 36h)
  minDuzinaNaslova?: number; // baci prekratke naslove (default 15)
}

export interface PravilaRezultat {
  prosle: Vijest[];
  odbaceno: { prestaro: number; sum: number; prazno: number };
}

export function primijeniPravila(
  vijesti: Vijest[],
  opcije: PravilaOpcije = {}
): PravilaRezultat {
  const maxStarost = (opcije.maxStarostSati ?? 36) * 3600 * 1000;
  const minDuzina = opcije.minDuzinaNaslova ?? 15;
  const granica = Date.now() - maxStarost;

  const odbaceno = { prestaro: 0, sum: 0, prazno: 0 };
  const prosle: Vijest[] = [];

  for (const v of vijesti) {
    const naslov = (v.naslov || "").trim();

    // 1) prazno / prekratko
    if (naslov.length < minDuzina || !v.link) {
      odbaceno.prazno++;
      continue;
    }

    // 2) prestaro (ako datum postoji i validan je)
    const t = Date.parse(v.datum);
    if (!isNaN(t) && t < granica) {
      odbaceno.prestaro++;
      continue;
    }

    // 3) očiti šum (reklame, horoskop, trač...)
    const nl = naslov.toLowerCase();
    if (IZBACI.some((k) => nl.includes(k))) {
      odbaceno.sum++;
      continue;
    }

    prosle.push(v);
  }

  console.log(
    `🧹 Pravila: ${vijesti.length} → ${prosle.length} ` +
      `(izbačeno: ${odbaceno.prestaro} staro, ${odbaceno.sum} šum, ${odbaceno.prazno} prazno)`
  );
  return { prosle, odbaceno };
}
