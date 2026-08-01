/**
 * =====================================================================
 *  DATUMI VAŽENJA PONUDA (valid_from / valid_to)
 * =====================================================================
 *  Lanci period važenja pišu u naslovu SEKCIJE iznad artikala, svaki
 *  svojim rječnikom. Provjereno gledanjem pravih stranica:
 *
 *   Kaufland   "Gültig vom 30.07. bis 05.08."          → pun raspon
 *              "Gültig vom 30.07.2026 bis 05.08.2026"  → pun raspon s godinom
 *   Aldi Süd   "Wochenangebote Mo., 27.7. – Sa., 1.8." → pun raspon
 *              "Angebote ab Montag 27.7."              → samo početak
 *              "Angebote zum Wochenende ab 31.7."      → samo početak
 *   Aldi Nord  "Aktion Mo. 27.7."                      → samo početak
 *              "Nur Sa. 1.8."                          → samo taj dan
 *
 *  Kad je dat SAMO početak, kraj je posljednji dan prodajne sedmice tog
 *  lanca (kod Aldija subota). Kod Kauflanda se to ne dešava — on uvijek
 *  napiše oba datuma.
 *
 *  Godina se skoro nikad ne piše. Pogađa se tako da datum padne najbliže
 *  DANAŠNJEM danu (bitno oko Nove godine: "2.1." u decembru je SLJEDEĆA
 *  godina, a "28.12." u januaru je PROŠLA).
 * =====================================================================
 */

export interface Period {
  /** 'YYYY-MM-DD' ili null kad se iz teksta ništa ne da pročitati */
  validFrom: string | null;
  validTo: string | null;
}

const PRAZNO: Period = { validFrom: null, validTo: null };

/** Tekst mora ličiti na najavu perioda, da ne pokupimo npr. cijenu "1.99". */
const NAJAVA = /(g[üu]ltig|wochenangebot|angebot|aktion|wochenende|\bab\b|\bnur\b)/i;

/** "30.07.2026", "27.7." … — dan.mjesec s neobaveznom godinom. */
const DATUM = /(\d{1,2})\.\s*(\d{1,2})\.(?:\s*(\d{4}|\d{2}))?/g;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function iso(y: number, m: number, d: number): string {
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** Je li (y,m,d) stvarno postojeći datum (hvata 31.02. i sl.). */
function postoji(y: number, m: number, d: number): boolean {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/**
 * Godina kad je nije bilo u tekstu: uzmi onu koja datum stavlja najbliže
 * današnjem danu (gleda i prošlu i sljedeću zbog prelaza godine).
 */
function pogodiGodinu(mjesec: number, dan: number, danas: Date): number | null {
  const g0 = danas.getUTCFullYear();
  let najbolja: number | null = null;
  let najmanjaRazlika = Infinity;
  for (const g of [g0 - 1, g0, g0 + 1]) {
    if (!postoji(g, mjesec, dan)) continue;
    const razlika = Math.abs(Date.UTC(g, mjesec - 1, dan) - Date.UTC(
      danas.getUTCFullYear(), danas.getUTCMonth(), danas.getUTCDate(),
    ));
    if (razlika < najmanjaRazlika) {
      najmanjaRazlika = razlika;
      najbolja = g;
    }
  }
  return najbolja;
}

interface Nadjen {
  y: number;
  m: number;
  d: number;
}

function izvadiDatume(tekst: string, danas: Date): Nadjen[] {
  const rezultat: Nadjen[] = [];
  DATUM.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = DATUM.exec(tekst)) !== null) {
    const dan = Number(m[1]);
    const mjesec = Number(m[2]);
    if (mjesec < 1 || mjesec > 12 || dan < 1 || dan > 31) continue;

    let godina: number | null;
    if (m[3]) {
      godina = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
      if (!postoji(godina, mjesec, dan)) continue;
    } else {
      godina = pogodiGodinu(mjesec, dan, danas);
      if (godina === null) continue;
    }
    rezultat.push({ y: godina, m: mjesec, d: dan });
  }
  return rezultat;
}

/** Prvi dan >= `od` čiji je dan u sedmici `dan` (0=ned … 6=sub). */
function sljedeciDanUSedmici(od: Nadjen, dan: number): string {
  const start = new Date(Date.UTC(od.y, od.m - 1, od.d));
  const razmak = (dan - start.getUTCDay() + 7) % 7;
  const kraj = new Date(start.getTime() + razmak * 86_400_000);
  return iso(kraj.getUTCFullYear(), kraj.getUTCMonth() + 1, kraj.getUTCDate());
}

/**
 * Pročitaj period iz naslova sekcije.
 *
 * @param tekst      sirovi tekst naslova sa stranice lanca
 * @param krajSedmice dan u sedmici kad ponuda ističe ako je dat samo početak
 *                    (0=ned … 6=sub; Aldi = 6). null → bez pretpostavke.
 * @param danas      referentni dan (za pogađanje godine); podrazumijevano sad
 */
export function procitajPeriod(
  tekst: string | null | undefined,
  krajSedmice: number | null = 6,
  danas: Date = new Date(),
): Period {
  if (!tekst) return PRAZNO;
  const t = tekst.replace(/\s+/g, ' ').trim();
  if (!t || !NAJAVA.test(t)) return PRAZNO;

  const datumi = izvadiDatume(t, danas);
  if (datumi.length === 0) return PRAZNO;

  const od = datumi[0]!;
  const validFrom = iso(od.y, od.m, od.d);

  // Dva datuma = pun raspon ("vom … bis …", "Mo., 27.7. – Sa., 1.8.").
  if (datumi.length >= 2) {
    const doo = datumi[1]!;
    let kraj = new Date(Date.UTC(doo.y, doo.m - 1, doo.d));
    // Prelaz godine: "vom 28.12. bis 03.01." — kraj mora biti POSLIJE početka.
    if (kraj.getTime() < Date.UTC(od.y, od.m - 1, od.d)) {
      kraj = new Date(Date.UTC(doo.y + 1, doo.m - 1, doo.d));
    }
    return {
      validFrom,
      validTo: iso(kraj.getUTCFullYear(), kraj.getUTCMonth() + 1, kraj.getUTCDate()),
    };
  }

  // "Nur Sa. 1.8." = vrijedi samo taj dan.
  if (/\bnur\b/i.test(t)) return { validFrom, validTo: validFrom };

  // Samo početak → kraj je zadnji dan prodajne sedmice tog lanca.
  if (krajSedmice === null) return { validFrom, validTo: null };
  return { validFrom, validTo: sljedeciDanUSedmici(od, krajSedmice) };
}

/** Vrijedi li ponuda na dati dan? Prazan datum = "uvijek važi". */
export function vaziNa(period: Period, dan: string): boolean {
  if (period.validFrom && dan < period.validFrom) return false;
  if (period.validTo && dan > period.validTo) return false;
  return true;
}
