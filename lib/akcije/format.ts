const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

/**
 * Bosanski padeži uz broj: 1 artikal · 2–4 artikla · 5+ artikala
 * (izuzetak 11–14 uvijek ide na treći oblik; 21, 101… idu na prvi/drugi)
 */
export function mnozina(n: number, jedan: string, dvaCetiri: string, vise: string): string {
  const zadnjaDva = n % 100;
  const zadnja = n % 10;
  if (zadnjaDva >= 11 && zadnjaDva <= 14) return `${n} ${vise}`;
  if (zadnja === 1) return `${n} ${jedan}`;
  if (zadnja >= 2 && zadnja <= 4) return `${n} ${dvaCetiri}`;
  return `${n} ${vise}`;
}

/** Današnji datum kao 'YYYY-MM-DD' po LOKALNOM satu (ne UTC — u ponoć po
 *  našem vremenu UTC još pokazuje jučerašnji dan, pa bi „NOVO" kasnilo). */
export function danasIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Najsvježija „tura" ponuda: najveći valid_from koji je ≤ danas.
 * NOVO oznaka i vrh „Top ponuda" prate NJU, ne strogo današnji datum —
 * pa ponedjeljkove ponude nose NOVO i u utorak/srijedu, sve dok ne
 * stigne svježija tura (tačno kako je korisnik tražio).
 */
export function najnovijaTura(items: Array<{ valid_from?: string | null }>): string | null {
  const danas = danasIso();
  let max: string | null = null;
  for (const item of items) {
    const od = item.valid_from ?? null;
    if (od && od <= danas && (!max || od > max)) max = od;
  }
  return max;
}

/**
 * Poredak PO SVJEŽINI: prvo najnoviji dan početka, unutar istog dana po
 * najvećem popustu.
 *
 *   ── 04.08. (danas) ──  Kaffee −50% · Käse −40% · Butter −30%
 *   ── 03.08. ──          Bier −55% · Chips −35%
 *   ── 30.07. ──          Beamer −60%
 *
 * Namjerno: Beamer od −60% pada ISPOD Butera od −30% jer je stariji.
 * Korisnik prvo vidi šta je novo, ne šta je najjeftinije — a stare ponude
 * se ne gube nego samo idu niže, dan po dan.
 *
 * Ponude bez `valid_from` (Aldi „Dauerhaft", trajno niska cijena) nemaju
 * dan pa idu na kraj — nisu ničija „nova tura".
 */
export function poSvjezini<T extends { valid_from?: string | null; discount_percent?: number | null }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const da = a.valid_from ?? '';
    const db = b.valid_from ?? '';
    if (da !== db) return db.localeCompare(da); // noviji dan gore
    return (b.discount_percent ?? -1) - (a.discount_percent ?? -1); // veći popust gore
  });
}

export const formatPrice = (value: number): string => euro.format(value);

export const formatPercent = (value: number): string => `-${Math.round(value)}%`;

/** "2026-08-04" -> "04.08." (kratko, kao na letku) */
export function formatShortDate(date: string | null): string | null {
  if (!date) return null;
  const [, month, day] = date.split('-');
  return month && day ? `${day}.${month}.` : null;
}

/** "2026-08-04" -> "04.08.2026." */
export function formatLongDate(date: string | null): string | null {
  if (!date) return null;
  const [year, month, day] = date.split('-');
  return year && month && day ? `${day}.${month}.${year}.` : null;
}

export function daysLeftLabel(date: string | null): string | null {
  if (!date) return null;
  const target = new Date(`${date}T00:00:00`);
  const days = Math.round((target.getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000);
  if (days < 0) return 'isteklo';
  if (days === 0) return 'samo danas';
  if (days === 1) return 'još 1 dan';
  return `još ${days} dana`;
}
