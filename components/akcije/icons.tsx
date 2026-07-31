import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 22, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconMenu = (p: P) => (
  <Svg {...p}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </Svg>
);

export const IconSearch = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);

export const IconUser = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="9" r="3.4" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    <circle cx="12" cy="12" r="9.5" />
  </Svg>
);

export const IconHeart = ({ filled, ...p }: P & { filled?: boolean }) => (
  <Svg {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.5 3C19.5 15.4 12 20 12 20Z" />
  </Svg>
);

export const IconBack = (p: P) => (
  <Svg {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
);

export const IconChevron = (p: P) => (
  <Svg {...p}>
    <path d="M9 5l7 7-7 7" />
  </Svg>
);

export const IconCart = (p: P) => (
  <Svg {...p}>
    <path d="M3 4h2.2l2.2 11h10L20 7H6" />
    <circle cx="9.5" cy="19" r="1.4" />
    <circle cx="16.5" cy="19" r="1.4" />
  </Svg>
);

export const IconCalendar = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
    <path d="M3.5 10h17M8.5 3v4M15.5 3v4" />
  </Svg>
);

export const IconStore = (p: P) => (
  <Svg {...p}>
    <path d="M4 9.5V20h16V9.5" />
    <path d="M3 9.5 5 4h14l2 5.5a3 3 0 0 1-5.6 1.2A3 3 0 0 1 12 12a3 3 0 0 1-3.4-1.3A3 3 0 0 1 3 9.5Z" />
  </Svg>
);

export const IconTag = (p: P) => (
  <Svg {...p}>
    <path d="M20.5 13.3 13.3 20.5a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 3 12V4.5A1.5 1.5 0 0 1 4.5 3H12a2 2 0 0 1 1.4.6l7.1 7.1a2 2 0 0 1 0 2.6Z" />
    <circle cx="8" cy="8" r="1.4" />
  </Svg>
);

export const IconStock = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.3 2.3 4.7-5" />
  </Svg>
);

export const IconShare = (p: P) => (
  <Svg {...p}>
    <path d="M12 3v11M12 3 8.5 6.5M12 3l3.5 3.5" />
    <path d="M5 12v7.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V12" />
  </Svg>
);

export const IconFilter = (p: P) => (
  <Svg {...p}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </Svg>
);

export const IconPin = (p: P) => (
  <Svg {...p} size={p.size ?? 16}>
    <path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21Z" />
    <circle cx="12" cy="10" r="2.2" />
  </Svg>
);

export const IconStar = (p: P) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />
  </Svg>
);

export const IconNews = (p: P) => (
  <Svg {...p}>
    <path d="M5 4h11a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1Z" />
    <path d="M17 8h2a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2M7.5 8h6M7.5 12h6M7.5 16h3" />
  </Svg>
);

export const IconBriefcase = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="7.5" width="18" height="12.5" rx="2" />
    <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 13h18" />
  </Svg>
);

export const IconBook = (p: P) => (
  <Svg {...p}>
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" />
    <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" />
  </Svg>
);

export const IconCalculator = (p: P) => (
  <Svg {...p}>
    <rect x="4.5" y="3" width="15" height="18" rx="2.5" />
    <path d="M8 7.5h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" />
  </Svg>
);

export const IconSpark = (p: P) => (
  <Svg {...p}>
    <path d="M12 3.5l1.7 4.3 4.3 1.7-4.3 1.7L12 15.5l-1.7-4.3L6 9.5l4.3-1.7L12 3.5Z" />
    <path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
  </Svg>
);
