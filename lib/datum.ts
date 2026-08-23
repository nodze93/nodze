// ============================================================
//  KAKO SE DATUM PRIKAZUJE ČITAOCU
// ------------------------------------------------------------
//  Odluka 20.8.2026.: na karticama i u vijestima NE pišemo dan,
//  nego samo mjesec — "august", odnosno "august 2026." ako je iz
//  neke ranije godine.
//
//  Zašto: tekst od 4. avgusta ne prestaje biti tačan 5. avgusta, ali
//  „4. avg" ga čini starim na prvi pogled. Mjesec stari mnogo sporije.
//
//  ⚠️ NE IZMIŠLJAMO NIŠTA. Tačan datum i dalje stoji u bazi i ide u
//  atribut <time dateTime="2026-08-04">, pa ga Google i svako ko
//  pogleda izvor i dalje vidi. Mijenja se SAMO ono što piše na ekranu.
//
//  Svježe stvari zadržavaju "Danas" i "Jučer" — tu dan nešto znači.
// ============================================================

function uDatum(ulaz: string | number | Date | null | undefined): Date | null {
  if (ulaz === null || ulaz === undefined || ulaz === "") return null;
  const d = ulaz instanceof Date ? ulaz : new Date(ulaz);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Ono što čitalac vidi: "Danas", "Jučer", "august" ili "august 2026.".
 * Godina se dopisuje samo ako datum NIJE iz tekuće godine — inače bi
 * na svakoj kartici stajala ista godina bez ikakve koristi.
 */
export function datumZaPrikaz(ulaz: string | number | Date | null | undefined): string {
  const d = uDatum(ulaz);
  if (!d) return "";

  const danas = new Date();
  const poc = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const razlika = Math.floor((poc(danas) - poc(d)) / 86_400_000);

  if (razlika === 0) return "Danas";
  if (razlika === 1) return "Jučer";

  return d.getFullYear() === danas.getFullYear()
    ? d.toLocaleDateString("bs-BA", { month: "long" })
    : d.toLocaleDateString("bs-BA", { month: "long", year: "numeric" });
}

/** "2026-08-04" — za atribut <time dateTime>, da tačan datum ostane čitljiv mašini. */
export function datumIso(ulaz: string | number | Date | null | undefined): string {
  const d = uDatum(ulaz);
  return d ? d.toISOString().slice(0, 10) : "";
}

/**
 * Za „uživo" traku: unutar 24h vrijeme još nešto znači, pa ostaje
 * "45 min" / "3h 20min". Sve starije prelazi na isto pravilo kao gore —
 * ranije je tu stajalo golo "27d", što je artikal činilo mrtvim.
 */
export function vrijemeZaPrikaz(ts: number): string {
  const min = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ${String(min % 60).padStart(2, "0")}min`;
  return datumZaPrikaz(ts);
}
