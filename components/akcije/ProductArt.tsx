/**
 * Ilustracije artikala.
 *
 * Kad scraper da pravu sliku (`image_url`), prikazuje se ona. Dok je nema,
 * ovdje je set flat SVG ilustracija - biraju se po nazivu artikla, pa po
 * kategoriji. Sve dijele istu paletu i istu "podlogu" (sjenka na dnu),
 * pa grid izgleda kao jedan set, a ne kao skup emojija.
 */

import type { ReactElement, ReactNode } from 'react';

type Art = (props: { size: number }) => ReactElement;

const shadow = <ellipse cx="48" cy="84" rx="26" ry="4.5" fill="#0f172a" opacity="0.07" />;

const wrap = (children: ReactNode): Art =>
  function Illustration({ size }) {
    return (
      <svg width={size} height={size} viewBox="0 0 96 96" role="presentation" aria-hidden="true">
        {/* Artikal se skalira da popuni okvir - inace izgleda sitno u kartici,
            a na dizajnu fotografija ispunjava skoro cijelu sliku. */}
        <g transform="translate(48 49.5) scale(1.12) translate(-48 -48)">
          {shadow}
          {children}
        </g>
      </svg>
    );
  };

// ---------------------------------------------------------------- alat
const drill = wrap(
  <>
    <rect x="18" y="34" width="40" height="22" rx="7" fill="#1f7a4d" />
    <rect x="18" y="34" width="40" height="8" rx="4" fill="#27965e" />
    <path d="M34 54h16l-3 20a5 5 0 0 1-5 4h-2a5 5 0 0 1-5-4l-1-20Z" fill="#1c1f26" />
    <rect x="30" y="72" width="24" height="10" rx="4" fill="#2b2f39" />
    <rect x="56" y="38" width="10" height="14" rx="3" fill="#9aa3ae" />
    <rect x="65" y="42" width="16" height="5" rx="2.5" fill="#6b7280" />
    <rect x="79" y="43" width="8" height="3" rx="1.5" fill="#4b5563" />
    <rect x="24" y="24" width="14" height="12" rx="3" fill="#f5b301" />
    <circle cx="31" cy="45" r="3" fill="#0f172a" opacity="0.3" />
  </>,
);

// ---------------------------------------------------------------- meso
const steak = wrap(
  <>
    <path
      d="M25 48c0-11 13-19 27-19 13 0 22 7 22 17 0 11-11 20-25 20-13 0-24-7-24-18Z"
      fill="#cf4a60"
    />
    <path
      d="M31 47c0-8 11-14 22-14 10 0 16 5 16 12 0 8-9 14-20 14-10 0-18-5-18-12Z"
      fill="#e8788c"
    />
    <path d="M40 40c4 2 7 6 9 11M50 38c4 3 7 7 8 12" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" opacity="0.5" />
    <path d="M69 40c5 1 8 4 8 8s-3 7-8 8c2-5 2-11 0-16Z" fill="#f7e7d2" />
    <circle cx="35" cy="56" r="5.5" fill="#f7e7d2" />
    <circle cx="35" cy="56" r="2.2" fill="#e2d0b6" />
  </>,
);

const chicken = wrap(
  <>
    <path
      d="M20 54c0-10 10-18 22-18 9 0 14 5 15 11 1 7-5 14-14 17-10 3-23 1-23-10Z"
      fill="#f0b6a8"
    />
    <path
      d="M27 52c1-6 8-11 16-11 6 0 10 3 10 7 0 6-5 10-13 12-7 1-14-2-13-8Z"
      fill="#fbd8ce"
    />
    <path
      d="M46 58c0-9 9-16 19-16 7 0 12 4 12 10 0 8-7 14-16 15-8 1-15-2-15-9Z"
      fill="#f5c4b7"
    />
    <path d="M53 56c2-5 7-8 13-8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
  </>,
);

// ---------------------------------------------------------------- mlijecni
const cheese = wrap(
  <>
    <path d="M18 58l30-24 32 10-32 22-30-8Z" fill="#f7c948" />
    <path d="M48 66l32-22v10L48 76V66Z" fill="#e0ab21" />
    <path d="M18 58v8l30 10V66l-30-8Z" fill="#f0bb37" />
    <circle cx="40" cy="56" r="4" fill="#e0ab21" />
    <circle cx="56" cy="52" r="3" fill="#e0ab21" />
    <circle cx="62" cy="62" r="2.5" fill="#cf9c17" />
  </>,
);

const milk = wrap(
  <>
    <path d="M34 30h28v46a4 4 0 0 1-4 4H38a4 4 0 0 1-4-4V30Z" fill="#eef2f7" stroke="#cfd7e2" strokeWidth="1.6" />
    <path d="M34 30l7-12h14l7 12H34Z" fill="#d7dfea" stroke="#cfd7e2" strokeWidth="1.6" />
    <rect x="34" y="46" width="28" height="18" fill="#1a56db" />
    <rect x="38" y="51" width="20" height="3" rx="1.5" fill="#fff" opacity="0.9" />
    <rect x="38" y="57" width="13" height="3" rx="1.5" fill="#fff" opacity="0.6" />
  </>,
);

const butter = wrap(
  <>
    <path d="M20 52l22-14h34v22l-22 14H20V52Z" fill="#fbe294" stroke="#e6c766" strokeWidth="1.4" />
    <path d="M54 60h22v14L54 74V60Z" fill="#f6d572" />
    <path d="M20 52h34v22H20V52Z" fill="#fff3cb" />
    <rect x="26" y="58" width="22" height="9" rx="2" fill="#1a56db" opacity="0.85" />
  </>,
);

const yoghurt = wrap(
  <>
    <path d="M32 36h32l-4 40a5 5 0 0 1-5 4H41a5 5 0 0 1-5-4l-4-40Z" fill="#eef2f7" stroke="#cfd7e2" strokeWidth="1.6" />
    <rect x="30" y="30" width="36" height="8" rx="3" fill="#e11d2e" />
    <path d="M36 52h24l-2 20H38l-2-20Z" fill="#fbd0d6" />
    <circle cx="48" cy="62" r="5" fill="#e11d2e" opacity="0.65" />
  </>,
);

// ---------------------------------------------------------------- voce/gemuese
const apple = wrap(
  <>
    <path d="M48 30c10-6 26-2 26 16 0 18-12 34-26 34S22 64 22 46c0-18 16-22 26-16Z" fill="#e0333f" />
    <path d="M40 34c-8 3-12 10-12 18 0 9 3 17 8 23-9-6-14-17-14-29 0-13 8-19 18-12Z" fill="#f0656e" />
    <path d="M48 30c0-6 4-10 10-11-1 7-4 10-10 11Z" fill="#2f9e4f" />
    <rect x="46" y="20" width="4" height="12" rx="2" fill="#7a4a25" />
  </>,
);

const banana = wrap(
  <>
    <path d="M22 44c0 20 14 32 32 32 12 0 20-6 22-14-14 4-30-2-38-14-4-6-6-12-6-18-6 3-10 8-10 14Z" fill="#f7c948" />
    <path d="M30 32c0 18 14 30 32 30 6 0 11-1 14-4-14 2-28-4-35-16-3-5-5-10-5-15-3 1-5 3-6 5Z" fill="#fbdc7a" />
    <path d="M24 30c-2-3-4-4-7-4 1 3 3 5 7 4Z" fill="#8a6a2f" />
  </>,
);

const strawberry = wrap(
  <>
    <path d="M48 34c14 0 24 8 24 20 0 14-12 26-24 26S24 68 24 54c0-12 10-20 24-20Z" fill="#e0333f" />
    <path d="M36 26h24c-2 6-6 9-12 9s-10-3-12-9Z" fill="#2f9e4f" />
    <circle cx="40" cy="50" r="2" fill="#fff2b0" />
    <circle cx="54" cy="48" r="2" fill="#fff2b0" />
    <circle cx="47" cy="60" r="2" fill="#fff2b0" />
    <circle cx="60" cy="60" r="2" fill="#fff2b0" />
    <circle cx="36" cy="64" r="2" fill="#fff2b0" />
  </>,
);

const veg = wrap(
  <>
    <circle cx="38" cy="40" r="12" fill="#2f9e4f" />
    <circle cx="56" cy="36" r="10" fill="#37b45c" />
    <circle cx="60" cy="50" r="11" fill="#2a8f47" />
    <circle cx="44" cy="52" r="12" fill="#35a955" />
    <path d="M44 58h10l-3 22h-4l-3-22Z" fill="#9ad17f" />
  </>,
);

const potato = wrap(
  <>
    <path d="M26 54c-2-12 8-20 22-20s24 6 24 18-10 22-24 22-20-8-22-20Z" fill="#c99a5b" />
    <path d="M34 48c4-6 12-9 20-8-6 0-13 3-17 9-2 3-3 6-3 9-1-3-1-7 0-10Z" fill="#dcb47a" />
    <circle cx="44" cy="52" r="2" fill="#a87c42" />
    <circle cx="58" cy="60" r="2" fill="#a87c42" />
  </>,
);

// ---------------------------------------------------------------- pekara
const bread = wrap(
  <>
    <path d="M20 58c0-14 12-24 28-24s28 10 28 24c0 10-6 16-14 16H34c-8 0-14-6-14-16Z" fill="#c98a3f" />
    <path d="M26 56c0-11 10-18 22-18 6 0 11 2 15 5-4-2-9-3-14-3-12 0-21 7-21 17 0 5 2 9 5 12-4-3-7-7-7-13Z" fill="#dda75f" />
    <path d="M38 44l-6 10M50 42l-6 12M62 44l-6 10" stroke="#8f5f24" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
  </>,
);

// ---------------------------------------------------------------- pica
const cola = wrap(
  <>
    {/* Flasa je namjerno spustena (y 20..82) da ne udara u "-XX%" badge */}
    <path
      d="M43 24h10v4c0 3 5 5 5 10l-1 8c-1 4-1 5 0 8l1 20a7 7 0 0 1-7 7h-6a7 7 0 0 1-7-7l1-20c1-3 1-4 0-8l-1-8c0-5 5-7 5-10v-4Z"
      fill="#7d1a14"
    />
    <rect x="42" y="19" width="12" height="6" rx="2" fill="#c62b34" />
    <rect x="34" y="49" width="28" height="16" rx="2" fill="#e2131f" />
    <path d="M37 56c5-3 10-3 14 0s7 3 10 1" stroke="#fff" strokeWidth="2.3" fill="none" strokeLinecap="round" />
    <path d="M44 31c-2 3-3 5-3 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
  </>,
);

const coffee = wrap(
  <>
    <path d="M28 32h40v40a8 8 0 0 1-8 8H36a8 8 0 0 1-8-8V32Z" fill="#5b3a22" />
    <path d="M28 32l6-8h28l6 8H28Z" fill="#472c19" />
    <rect x="28" y="48" width="40" height="16" fill="#f6efe4" stroke="#e0d5c4" strokeWidth="1.2" />
    <rect x="34" y="53" width="20" height="3" rx="1.5" fill="#5b3a22" />
    <rect x="34" y="58" width="12" height="2.5" rx="1.25" fill="#8a6547" />
    <circle cx="62" cy="40" r="4" fill="#c98a3f" />
  </>,
);

const beer = wrap(
  <>
    <rect x="20" y="42" width="56" height="38" rx="5" fill="#8a5a2b" />
    <rect x="20" y="42" width="56" height="10" rx="4" fill="#a06b34" />
    <rect x="27" y="26" width="9" height="18" rx="4" fill="#3f6b2e" />
    <rect x="43" y="26" width="9" height="18" rx="4" fill="#3f6b2e" />
    <rect x="59" y="26" width="9" height="18" rx="4" fill="#3f6b2e" />
    <rect x="27" y="24" width="9" height="5" rx="2" fill="#f5b301" />
    <rect x="43" y="24" width="9" height="5" rx="2" fill="#f5b301" />
    <rect x="59" y="24" width="9" height="5" rx="2" fill="#f5b301" />
    <rect x="30" y="58" width="36" height="12" rx="3" fill="#f3ece2" opacity="0.9" />
  </>,
);

const water = wrap(
  <>
    <path d="M30 34h14v42a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5V34Z" fill="#bfe0f5" />
    <path d="M52 34h14v42a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5V34Z" fill="#bfe0f5" />
    <rect x="31" y="24" width="12" height="11" rx="3" fill="#9ccbe8" />
    <rect x="53" y="24" width="12" height="11" rx="3" fill="#9ccbe8" />
    <rect x="30" y="52" width="14" height="12" fill="#1a56db" opacity="0.85" />
    <rect x="52" y="52" width="14" height="12" fill="#1a56db" opacity="0.85" />
  </>,
);

// ---------------------------------------------------------------- tiefkuehl
const pizza = wrap(
  <>
    <circle cx="48" cy="52" r="28" fill="#e8c079" />
    <circle cx="48" cy="52" r="22" fill="#e0913f" />
    <circle cx="48" cy="52" r="19" fill="#f2c94c" opacity="0.85" />
    <circle cx="40" cy="44" r="4.5" fill="#c62b34" />
    <circle cx="57" cy="48" r="4.5" fill="#c62b34" />
    <circle cx="44" cy="60" r="4.5" fill="#c62b34" />
    <circle cx="58" cy="62" r="3.5" fill="#c62b34" />
  </>,
);

const iceCream = wrap(
  <>
    <path d="M26 40h44l-4 34a8 8 0 0 1-8 7H38a8 8 0 0 1-8-7l-4-34Z" fill="#eef2f7" stroke="#cfd7e2" strokeWidth="1.6" />
    <rect x="24" y="32" width="48" height="10" rx="4" fill="#7a4a25" />
    <path d="M32 50h32l-2 22H34l-2-22Z" fill="#e6c9a8" />
    <path d="M38 56c4-4 8-4 12 0s8 4 10 0" stroke="#c98a3f" strokeWidth="3" strokeLinecap="round" fill="none" />
  </>,
);

// ---------------------------------------------------------------- drogerija
const pump = wrap(
  <>
    <rect x="34" y="34" width="28" height="46" rx="8" fill="#3fc0b0" />
    <rect x="34" y="46" width="28" height="20" rx="2" fill="#f3f6fa" />
    <rect x="40" y="52" width="16" height="3" rx="1.5" fill="#3fc0b0" />
    <rect x="40" y="58" width="10" height="2.5" rx="1.25" fill="#8ed8ce" />
    <rect x="43" y="24" width="10" height="12" rx="3" fill="#2a9c8f" />
    <path d="M53 26h9v4h-9z" fill="#2a9c8f" />
  </>,
);

const toothpaste = wrap(
  <>
    <path
      d="M28 40h44c3 0 5 2 5 5v18c0 3-2 5-5 5H28l-9-14 9-14Z"
      fill="#eef2f7"
      stroke="#cfd7e2"
      strokeWidth="1.8"
    />
    <path d="M19 54l9-14v28l-9-14Z" fill="#dde4ed" stroke="#cfd7e2" strokeWidth="1.6" />
    <rect x="75" y="42" width="12" height="24" rx="4" fill="#1a56db" />
    <rect x="34" y="48" width="30" height="6" rx="3" fill="#1a56db" />
    <rect x="34" y="58" width="18" height="4.5" rx="2.25" fill="#3fc0b0" />
  </>,
);

// ---------------------------------------------------------------- kuca
const detergent = wrap(
  <>
    <rect x="24" y="30" width="48" height="50" rx="5" fill="#1f7a4d" />
    <rect x="24" y="46" width="48" height="20" fill="#f3f6fa" />
    <rect x="30" y="52" width="26" height="4" rx="2" fill="#1f7a4d" />
    <rect x="30" y="59" width="16" height="3" rx="1.5" fill="#7ab894" />
    <rect x="38" y="24" width="20" height="7" rx="3" fill="#155c39" />
    <circle cx="63" cy="38" r="4" fill="#f5b301" />
  </>,
);

const toiletPaper = wrap(
  <>
    <rect x="26" y="34" width="44" height="46" rx="10" fill="#f0f3f8" stroke="#cfd7e2" strokeWidth="1.6" />
    <ellipse cx="48" cy="34" rx="22" ry="8" fill="#dde4ed" stroke="#cfd7e2" strokeWidth="1.4" />
    <ellipse cx="48" cy="34" rx="8" ry="3.5" fill="#c6ced9" />
    <path d="M70 44c0 10-4 18-10 22" stroke="#dfe5ec" strokeWidth="4" fill="none" />
    <rect x="34" y="56" width="20" height="4" rx="2" fill="#1a56db" opacity="0.7" />
  </>,
);

const tabs = wrap(
  <>
    <rect x="24" y="34" width="48" height="46" rx="6" fill="#1a56db" />
    <rect x="24" y="48" width="48" height="18" fill="#f3f6fa" />
    <rect x="30" y="54" width="24" height="4" rx="2" fill="#1a56db" />
    <circle cx="62" cy="42" r="5" fill="#3fc0b0" />
    <circle cx="52" cy="40" r="4" fill="#f5b301" opacity="0.9" />
  </>,
);

// ---------------------------------------------------------------- baby / tier
const diapers = wrap(
  <>
    <rect x="20" y="34" width="56" height="46" rx="10" fill="#8fb8f0" />
    <path d="M20 52h56v14H20z" fill="#f3f6fa" />
    <circle cx="36" cy="59" r="6" fill="#8fb8f0" />
    <path d="M33 58a1.5 1.5 0 1 0 0-.1M39 58a1.5 1.5 0 1 0 0-.1" stroke="#1a56db" strokeWidth="2" />
    <rect x="46" y="55" width="22" height="4" rx="2" fill="#1a56db" opacity="0.75" />
    <rect x="46" y="62" width="14" height="3" rx="1.5" fill="#8fb8f0" />
  </>,
);

const petFood = wrap(
  <>
    <rect x="28" y="36" width="40" height="44" rx="6" fill="#c14b2a" />
    <rect x="28" y="50" width="40" height="18" fill="#f3f6fa" />
    <ellipse cx="48" cy="36" rx="20" ry="6" fill="#a53d20" />
    <circle cx="44" cy="59" r="3" fill="#c14b2a" />
    <circle cx="52" cy="57" r="2.4" fill="#c14b2a" />
    <circle cx="58" cy="61" r="2" fill="#c14b2a" />
    <circle cx="38" cy="62" r="2" fill="#c14b2a" />
  </>,
);

// ---------------------------------------------------------------- tehnika
const tv = wrap(
  <>
    <rect x="14" y="26" width="68" height="42" rx="4" fill="#1c1f26" />
    <rect x="18" y="30" width="60" height="34" rx="2" fill="#1a56db" />
    <path d="M18 30h60v34L18 30Z" fill="#3f7bef" opacity="0.55" />
    <rect x="42" y="68" width="12" height="8" fill="#2b2f39" />
    <rect x="30" y="76" width="36" height="5" rx="2.5" fill="#2b2f39" />
  </>,
);

const headphones = wrap(
  <>
    <path d="M24 56V48a24 24 0 0 1 48 0v8" stroke="#1c1f26" strokeWidth="7" fill="none" strokeLinecap="round" />
    <rect x="16" y="52" width="16" height="26" rx="7" fill="#2b2f39" />
    <rect x="64" y="52" width="16" height="26" rx="7" fill="#2b2f39" />
    <rect x="20" y="57" width="8" height="16" rx="4" fill="#1a56db" />
    <rect x="68" y="57" width="8" height="16" rx="4" fill="#1a56db" />
  </>,
);

// ---------------------------------------------------------------- ostalo
const jar = wrap(
  <>
    <rect x="30" y="36" width="36" height="44" rx="6" fill="#6b4423" />
    <rect x="30" y="48" width="36" height="20" fill="#f3f6fa" />
    <rect x="36" y="54" width="24" height="4" rx="2" fill="#c62b34" />
    <rect x="36" y="61" width="14" height="3" rx="1.5" fill="#6b4423" />
    <rect x="32" y="28" width="32" height="10" rx="3" fill="#1c1f26" />
  </>,
);

const fish = wrap(
  <>
    <path d="M22 52c8-12 24-18 40-14 10 3 14 10 12 16-2 7-10 12-22 12-14 0-24-6-30-14Z" fill="#f08a5d" />
    <path d="M30 52c6-8 18-12 30-9 6 2 9 6 8 10-14-4-28-3-38-1Z" fill="#f7b08a" />
    <path d="M74 44l10-8v30l-10-8v-14Z" fill="#e0703f" />
    <circle cx="36" cy="50" r="2.5" fill="#1c1f26" />
  </>,
);

const Generic = wrap(
  <>
    <path d="M24 40h48l-4 36a6 6 0 0 1-6 5H34a6 6 0 0 1-6-5l-4-36Z" fill="#e3e9f1" stroke="#c9d2de" strokeWidth="1.6" />
    <path d="M36 40V32a12 12 0 0 1 24 0v8" stroke="#9aa3ae" strokeWidth="5" fill="none" strokeLinecap="round" />
    <rect x="36" y="54" width="24" height="4" rx="2" fill="#b9c2cd" />
  </>,
);

// ---------------------------------------------------------------------
// Mapiranje: prvo po nazivu artikla (precizno), pa po kategoriji
// ---------------------------------------------------------------------
const BY_NAME: Array<[RegExp, Art]> = [
  [/bohrmasch|bušilic|busilic|akku|aku |schrauber|werkzeug/i, drill],
  [/haehnchen|hähnchen|pileć|pilec|chicken|schnitzel|puten/i, chicken],
  [/hack|steak|rind|schwein|salami|wurst|bratwurst|nacken|doener|döner|schinken/i, steak],
  [/lachs|fisch|garnel|forelle|thunfisch/i, fish],
  [/gouda|kaese|käse|mozzarella|milbona|emmentaler/i, cheese],
  [/milch|sahne/i, milk],
  [/butter|margarine/i, butter],
  [/joghurt|quark|skyr/i, yoghurt],
  [/apfel|äpfel|apple/i, apple],
  [/banane|banana/i, banana],
  [/erdbeer|beeren|himbeer|strawberry/i, strawberry],
  [/kartoffel|zwiebel|potato/i, potato],
  [/brokkoli|salat|gurke|paprika|tomate|rucola|gemuese|gemüse|zucchini/i, veg],
  [/brot|broetchen|brötchen|croissant|toast|kuchen|backwaren/i, bread],
  [/cola|limo|fanta|sprite|eistee/i, cola],
  [/kaffee|espresso|coffee|kakao|tee/i, coffee],
  [/bier|weizen|pils|radler/i, beer],
  [/wasser|mineral|saft|apfelsaft|orangensaft/i, water],
  [/pizza/i, pizza],
  [/eis |eis$|eiscreme|magnum|sorbet/i, iceCream],
  [/duschgel|shampoo|creme|deo|lotion|seife/i, pump],
  [/zahnpasta|zahncreme|mundspuel|mundspül/i, toothpaste],
  [/waschmittel|persil|weichspueler|weichspüler|reiniger|deterd/i, detergent],
  [/toilettenpapier|kuechenrolle|küchenrolle|taschentuech|papier/i, toiletPaper],
  [/tabs|spuelmaschine|spülmaschine|geschirr/i, tabs],
  [/windel|pampers|baby|feuchttuech|feuchttüch/i, diapers],
  [/katzen|hunde|tierfutter|futter/i, petFood],
  [/fernseher|tv |monitor|zoll/i, tv],
  [/kopfhoerer|kopfhörer|headset|earbuds|bluetooth/i, headphones],
  [/nutella|marmelade|honig|creme nuss|aufstrich|olivenoel|olivenöl|oel|öl/i, jar],
];

const BY_CATEGORY: Array<[RegExp, Art]> = [
  [/alat|werkzeug/i, drill],
  [/fleisch/i, steak],
  [/fisch/i, fish],
  [/molkerei/i, cheese],
  [/obst/i, apple],
  [/gemuese|gemüse/i, veg],
  [/backwaren/i, bread],
  [/getraenke|getränke/i, cola],
  [/tiefkuehl|tiefkühl/i, pizza],
  [/drogerie/i, pump],
  [/haushalt/i, detergent],
  [/baby/i, diapers],
  [/tier/i, petFood],
  [/elektronik/i, tv],
  [/lebensmittel/i, jar],
];

export default function ProductArt({
  category,
  productName,
  size = 96,
}: {
  category: string | null;
  productName: string;
  size?: number;
}) {
  for (const [pattern, Art] of BY_NAME) {
    if (pattern.test(productName)) return <Art size={size} />;
  }
  for (const [pattern, Art] of BY_CATEGORY) {
    if (pattern.test(category ?? '')) return <Art size={size} />;
  }
  return <Generic size={size} />;
}
