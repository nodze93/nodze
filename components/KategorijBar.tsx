"use client";

import { useState } from "react";
import Link from "next/link";

// v19 raspored — isti kao u headeru
const kategorije = [
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
        className="kat-bar-scroll"
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
        {kategorije.map((kat) => (
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
      <style>{`.kat-bar-scroll::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
