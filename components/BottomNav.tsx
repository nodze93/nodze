"use client";

// ============================================================
// DONJA NAV TRAKA (mobilni) — app-stil
// ============================================================
// Fiksna na dnu, iznad Chromeovih dugmadi. Kartice: Vijesti,
// Akcije, Vodiči, Brutto-Netto. Prikazuje se SAMO na telefonu
// (<=768px); na desktopu je sakrivena (tamo je klasična Nav traka).

import Link from "next/link";
import { usePathname } from "next/navigation";

// Redoslijed po učestalosti korištenja (odluka korisnika, 3.8.2026):
// navika (akcije = početna) · alat (kalkulator) · pomoć (vodiči).
// Vijesti su namjerno VAN trake — gase se; naslovna vijesti postoji
// još samo preko loga dok se ne ugasi skroz.
const TABS = [
  {
    href: "/akcije",
    label: "Početna",
    match: (p: string) => p.startsWith("/akcije"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </svg>
    ),
  },
  {
    href: "/brutto-netto",
    label: "Brutto-Netto",
    match: (p: string) => p.startsWith("/brutto-netto"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
        <path d="M8 6h8" />
        <path d="M8 10.5h2M12 10.5h2M16 10.5h.01" />
        <path d="M8 14h2M12 14h2M16 14h.01" />
        <path d="M8 17.5h2M12 17.5h4" />
      </svg>
    ),
  },
  {
    href: "/vodici",
    label: "Vodiči",
    match: (p: string) => p.startsWith("/vodic"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
        <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const p = usePathname() || "/";
  return (
    <>
      <nav className="botnav" aria-label="Glavna navigacija">
        {TABS.map((t) => {
          const active = t.match(p);
          return (
            <Link key={t.href} href={t.href} className={`botnav-item${active ? " active" : ""}`}>
              <span className="botnav-ico">{t.icon}</span>
              <span className="botnav-lbl">{t.label}</span>
            </Link>
          );
        })}
      </nav>

      <style>{`
        .botnav { display: none; }
        @media (max-width: 768px) {
          .botnav {
            display: flex;
            position: fixed;
            left: 0; right: 0; bottom: 0;
            z-index: 1000;
            background: #ffffff;
            border-top: 1px solid #e5e7eb;
            box-shadow: 0 -1px 10px rgba(0,0,0,0.06);
            /* 6px podiže dugmad od samog ruba ekrana — bila su "previše
               dole skroz" (posebno na telefonima bez safe-area). */
            padding-bottom: calc(6px + env(safe-area-inset-bottom));
          }
          .botnav-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            padding: 8px 4px 7px;
            text-decoration: none;
            color: #6b7280;
            font-size: 11px;
            font-weight: 600;
          }
          /* 10px: da i najduži natpis ("Brutto-Netto") stane ISPISAN CIO
             i na uskim telefonima — sjeklo je "netto" dio. */
          .botnav-lbl { white-space: nowrap; font-size: 10px; }
          .botnav-item.active { color: #1a8a4a; }
          .botnav-item:active { background: #f3f4f6; }
          .botnav-ico { width: 24px; height: 24px; }
          .botnav-ico svg { width: 24px; height: 24px; display: block; }
          /* Razmak na dnu da sadržaj ne bude ispod trake.
             68px = visina trake sa podignutom dugmadi (6px) — mora se
             slagati sa BnFrame.tsx i AdminModeracija.tsx. */
          body { padding-bottom: calc(68px + env(safe-area-inset-bottom)); }
        }
        /* Sa 4 kartice "Brutto-Netto" je najduži natpis — na uskim
           telefonima se slova malo stisnu da ne pređe u dva reda. */
        @media (max-width: 380px) {
          .botnav-item { font-size: 10px; padding-left: 2px; padding-right: 2px; }
          .botnav-lbl { letter-spacing: -0.02em; }
        }
      `}</style>
    </>
  );
}
