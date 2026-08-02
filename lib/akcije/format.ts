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
