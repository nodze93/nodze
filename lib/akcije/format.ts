const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

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
