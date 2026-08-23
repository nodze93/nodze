"use client";

import { useState } from "react";
import Link from "next/link";

// ============================================================
//  DVIJE TRAKE — 24.8.2026.
// ------------------------------------------------------------
//  DESKTOP nudi ono što sajt stvarno radi: Akcije, Vodiče,
//  Brutto-Netto, Njemačku.
//
//  MOBILNI ostaje NETAKNUT — SVE, Njemačka, Svijet, Sport,
//  Finansije, Vodiči, Gastarbajter. Izričit dogovor: na telefonu
//  se ne dira ništa.
//
//  Obje se ispišu, a CSS na 768px sakrije onu koja ne treba. Tako
//  radi i na stranicama koje nemaju .hide-mob klase iz naslovne.
// ============================================================

const KATEGORIJE_DESKTOP = [
  { label: "SVE", value: "sve", href: "/" },
  { label: "🏷️ Akcije", value: "akcije", href: "/akcije" },
  { label: "Vodiči", value: "vodici", href: "/vodici" },
  { label: "Brutto-Netto", value: "brutto", href: "/brutto-netto" },
  { label: "🇩🇪 Njemačka", value: "de", href: "/de" },
];

// v19 raspored — NE DIRATI, ovo je ono što se vidi na telefonu
const KATEGORIJE_MOBILNI = [
  { label: "SVE", value: "sve", href: "/" },
  { label: "🇩🇪 Njemačka", value: "de", href: "/de" },
  { label: "Svijet", value: "svijet", href: "/kategorija/svijet" },
  { label: "Sport", value: "sport", href: "/kategorija/sport" },
  { label: "Finansije", value: "finansije", href: "/kategorija/finansije" },
  { label: "Vodiči", value: "vodici", href: "/vodici" },
  { label: "Gastarbajter", value: "gastarbajter", href: "/kategorija/gastarbajter" },
];

interface Props {
  aktivna?: string;
}

export default function KategorijBar({ aktivna = "sve" }: Props) {
  const [aktivan, setAktivan] = useState(aktivna);

  return (
    <div style={{ background: "white", borderBottom: "1px solid var(--border)" }}>
      <div
        className="kat-bar-scroll kat-desktop"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          gap: 0,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        {KATEGORIJE_DESKTOP.map((kat) => (
          <Link
            key={kat.value}
            href={kat.href}
            onClick={() => setAktivan(kat.value)}
            style={{
              padding: "12px 16px",
              fontSize: 13,
              fontWeight: 500,
              color: aktivan === kat.value ? "var(--zelena)" : "var(--tekst-muted)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              borderBottom:
                aktivan === kat.value
                  ? "2px solid var(--zelena)"
                  : "2px solid transparent",
              transition: "all 0.15s",
              display: "block",
              textDecoration: "none",
            }}
            className="hover:text-tekst"
          >
            {kat.label}
          </Link>
        ))}
      </div>
      <div
        className="kat-bar-scroll kat-mobilni"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          gap: 0,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        {KATEGORIJE_MOBILNI.map((kat) => (
          <Link
            key={kat.value}
            href={kat.href}
            onClick={() => setAktivan(kat.value)}
            style={{
              padding: "12px 16px",
              fontSize: 13,
              fontWeight: 500,
              color: aktivan === kat.value ? "var(--zelena)" : "var(--tekst-muted)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              borderBottom:
                aktivan === kat.value
                  ? "2px solid var(--zelena)"
                  : "2px solid transparent",
              transition: "all 0.15s",
              display: "block",
              textDecoration: "none",
            }}
            className="hover:text-tekst"
          >
            {kat.label}
          </Link>
        ))}
      </div>
      <style>{`
        .kat-bar-scroll::-webkit-scrollbar { display: none; }
        .kat-mobilni { display: none !important; }
        @media (max-width: 768px) {
          .kat-desktop { display: none !important; }
          .kat-mobilni { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
