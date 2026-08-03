/**
 * Boje i kratke oznake prodavnica. Namjerno NE koristimo tudje logotipe
 * (zasticeni su) nego cistu tipografsku plocicu u prepoznatljivim bojama.
 * Ako kasnije dobijes prava na logotipe, samo popuni `logo_url` u tabeli
 * `stores` - komponenta StoreLogo ce ga automatski prikazati.
 */
export interface StoreBrand {
  label: string;
  /** kratka oznaka za male plocice (28px) */
  short: string;
  fg: string;
  bg: string;
}

const BRANDS: Record<string, StoreBrand> = {
  lidl: { label: 'Lidl', short: 'LIDL', fg: '#0050aa', bg: '#fff200' },
  'aldi-sued': { label: 'ALDI', short: 'ALDI', fg: '#ffffff', bg: '#00549f' },
  'aldi-nord': { label: 'ALDI', short: 'ALDI', fg: '#ffffff', bg: '#00549f' },
  aldi: { label: 'ALDI', short: 'ALDI', fg: '#ffffff', bg: '#00549f' },
  kaufland: { label: 'Kaufland', short: 'KAU', fg: '#ffffff', bg: '#e10915' },
  rewe: { label: 'REWE', short: 'REWE', fg: '#ffffff', bg: '#cc071e' },
  penny: { label: 'PENNY', short: 'PEN', fg: '#ffffff', bg: '#d81e05' },
  netto: { label: 'netto', short: 'NET', fg: '#e30613', bg: '#ffe500' },
  edeka: { label: 'EDEKA', short: 'EDK', fg: '#ffe500', bg: '#0056a8' },
  dm: { label: 'dm', short: 'dm', fg: '#ffffff', bg: '#002878' },
  rossmann: { label: 'ROSSMANN', short: 'ROSS', fg: '#ffffff', bg: '#c4021e' },
  mediamarkt: { label: 'MM', short: 'MM', fg: '#ffffff', bg: '#df0000' },
  saturn: { label: 'Saturn', short: 'SAT', fg: '#000000', bg: '#ff8000' },
  norma: { label: 'NORMA', short: 'NOR', fg: '#ffffff', bg: '#e2001a' },
  obi: { label: 'OBI', short: 'OBI', fg: '#ffffff', bg: '#ff7100' },
  fressnapf: { label: 'Fressnapf', short: 'FN', fg: '#ffffff', bg: '#e2001a' },
  tegut: { label: 'tegut', short: 'tegut', fg: '#ffffff', bg: '#e2001a' },
  real: { label: 'real', short: 'real', fg: '#ffffff', bg: '#003a80' },
};

const FALLBACK_COLORS = ['#1a56db', '#0f766e', '#7c3aed', '#b45309', '#be123c', '#0369a1'];

export function storeBrand(slug: string, name: string): StoreBrand {
  const known = BRANDS[slug];
  if (known) return known;
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return {
    label: name.slice(0, 10),
    short: name.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase(),
    fg: '#ffffff',
    bg: FALLBACK_COLORS[hash % FALLBACK_COLORS.length]!,
  };
}
