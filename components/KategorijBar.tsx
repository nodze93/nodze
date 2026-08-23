"use client";

import { useState } from "react";
import Link from "next/link";

// ============================================================
//  DVIJE TRAKE — 24.8.2026.
// ------------------------------------------------------------
//  DESKTOP nudi ono što sajt stvarno radi: Akcije, Vodiče,
//  Brutto-Netto, Njemačku.
//
//  NA TELEFONU TRAKE NEMA UOPŠTE (24.8.2026.). Ranije je tu stajalo
//  SVE · Njemačka · Svijet · Sport · Finansije · Vodiči · Gastarbajter —
//  izbrisano na izričit zahtjev. Sakriva se cijeli okvir preko klase
//  `.kat-bar`, pa ne ostane ni bijela crta.
// ============================================================

const KATEGORIJE_DESKTOP = [
  { label: "SVE", value: "sve", href: "/" },
  { label: "🏷️ Akcije", value: "akcije", href: "/akcije" },
  { label: "Vodiči", value: "vodici", href: "/vodici" },
  { label: "Brutto-Netto", value: "brutto", href: "/brutto-netto" },
  { label: "🇩🇪 Njemačka", value: "de", href: "/de" },
];


interface Props {
  aktivna?: string;
}

export default function KategorijBar({ aktivna = "sve" }: Props) {
  const [aktivan, setAktivan] = useState(aktivna);

  return (
    <div className="kat-bar" style={{ background: "white", borderBottom: "1px solid var(--border)" }}>
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
      <style>{`
        .kat-bar-scroll::-webkit-scrollbar { display: none; }
        /* 24.8.2026.: na telefonu ove trake NEMA uopšte — izričit dogovor.
           Sakriva se cijeli okvir, ne samo linkovi, inače ostane bijela
           crta od donjeg ruba. Na desktopu radi normalno. */
        @media (max-width: 768px) {
          .kat-bar { display: none !important; }
        }
      `}</style>
    </div>
  );
}
