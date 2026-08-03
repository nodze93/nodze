/**
 * Logotipi prodavnica kao SVG - u prepoznatljivim bojama i formama, crtani
 * (ne kopije zasticenih fajlova). Kad dobijes prava na prave logotipe, samo
 * popuni `logo_url` u tabeli `stores` i StoreLogo prikaze pravu sliku umjesto
 * ovoga.
 */
import type { ReactElement } from 'react';

type Mark = () => ReactElement;

const box = (bg: string, children: React.ReactNode, radius = 14): ReactElement => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" role="presentation">
    <rect x="2" y="2" width="96" height="96" rx={radius} fill={bg} />
    {children}
  </svg>
);

const text = (
  content: string,
  color: string,
  size: number,
  weight = 900,
  y = 50,
  extra: Record<string, string | number> = {},
): ReactElement => (
  <text
    x="50"
    y={y}
    fill={color}
    fontFamily="'Inter Variable', Inter, system-ui, sans-serif"
    fontSize={size}
    fontWeight={weight}
    textAnchor="middle"
    dominantBaseline="central"
    letterSpacing="-1"
    {...extra}
  >
    {content}
  </text>
);

const MARKS: Record<string, Mark> = {
  lidl: () =>
    box(
      '#fff200',
      <>
        <circle cx="34" cy="46" r="9" fill="#e2001a" />
        {text('Lidl', '#0050aa', 30, 900, 52)}
      </>,
    ),
  'aldi-sued': () =>
    box(
      '#00549f',
      <>
        <path d="M22 62c8-10 48-10 56 0" stroke="#ff7d00" strokeWidth="5" fill="none" strokeLinecap="round" />
        {text('ALDI', '#ffffff', 26, 900, 42)}
        <text x="50" y="70" fill="#f9c000" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="800" textAnchor="middle">SÜD</text>
      </>,
    ),
  'aldi-nord': () =>
    box(
      '#00549f',
      <>
        <path d="M22 62c8-10 48-10 56 0" stroke="#ff7d00" strokeWidth="5" fill="none" strokeLinecap="round" />
        {text('ALDI', '#ffffff', 26, 900, 44)}
      </>,
    ),
  kaufland: () =>
    box(
      '#e10915',
      <>
        <rect x="30" y="30" width="40" height="40" rx="4" fill="#ffffff" />
        {text('K', '#e10915', 34, 900, 50)}
      </>,
    ),
  rewe: () => box('#cc071e', text('REWE', '#ffffff', 24, 900)),
  penny: () => box('#d61f26', text('PENNY', '#ffffff', 20, 900)),
  netto: () =>
    box(
      '#ffdd00',
      <>
        {text('netto', '#e2001a', 24, 900, 44)}
        <rect x="30" y="60" width="40" height="4" rx="2" fill="#e2001a" />
      </>,
    ),
  edeka: () => box('#005ca9', text('EDEKA', '#ffe500', 21, 900)),
  dm: () =>
    box(
      '#002d72',
      <>
        {text('dm', '#ffffff', 34, 900, 44)}
        <rect x="34" y="62" width="32" height="4" rx="2" fill="#f28c00" />
      </>,
    ),
  rossmann: () => box('#c4021e', text('ROSS', '#ffffff', 22, 900)),
  mediamarkt: () =>
    box(
      '#df0000',
      <>
        {text('Media', '#ffffff', 17, 800, 40)}
        {text('Markt', '#ffffff', 17, 800, 62)}
      </>,
    ),
  norma: () => box('#e2001a', text('NORMA', '#ffffff', 19, 900)),
  obi: () => box('#ff7100', text('OBI', '#ffffff', 30, 900)),
  fressnapf: () =>
    box(
      '#e2001a',
      <>
        {text('Fress', '#ffffff', 19, 800, 40)}
        {text('napf', '#ffffff', 19, 800, 62)}
      </>,
    ),
};

export function hasBrandMark(slug: string): boolean {
  return slug in MARKS;
}

export default function BrandLogo({ slug }: { slug: string }): ReactElement | null {
  const Mark = MARKS[slug];
  return Mark ? Mark() : null;
}
