"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Rezerva dok baza nema objavljenih članaka (i dok se učitava)
const FALLBACK = [
  "Nova pravila za Aufenthaltstitel od 2026",
  "Minimalna plaća u Njemačkoj raste na 13.50€",
  "Kindergeld povećan na 255€",
  "Rok za Steuerklasse promjenu do 30.11.",
];

// Kratak, udaran naslov: uzmi dio prije crtice (—/–/-), pa skrati ako treba
function kratak(naslov: string): string {
  let s = String(naslov || "").split(/\s[—–-]\s/)[0].trim();
  if (s.length > 58) {
    s = s.slice(0, 55);
    const zadnjiRazmak = s.lastIndexOf(" ");
    if (zadnjiRazmak > 24) s = s.slice(0, zadnjiRazmak);
    s = s.replace(/[\s.,;:]+$/, "") + "…";
  }
  return s;
}

interface Stavka {
  tekst: string;
  link?: string;
}

export default function Ticker() {
  const [stavke, setStavke] = useState<Stavka[]>(FALLBACK.map((t) => ({ tekst: t })));

  useEffect(() => {
    let ziv = true;
    fetch("/api/hero", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        const clanci = j?.clanci || [];
        if (ziv && clanci.length > 0) {
          setStavke(clanci.map((c: { naslov: string; slug: string }) => ({
            tekst: kratak(c.naslov),
            link: `/clanak/${c.slug}`,
          })));
        }
      })
      .catch(() => {
        /* ostavi fallback */
      });
    return () => {
      ziv = false;
    };
  }, []);

  // Dupliraj za neprekidno (seamless) vrtenje
  const dvostruko = [...stavke, ...stavke];

  return (
    <div
      style={{
        background: "var(--zelena)",
        color: "white",
        padding: "8px 0",
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* "Uživo" badge — fiksan lijevo */}
      <span
        style={{
          fontWeight: 600,
          whiteSpace: "nowrap",
          background: "rgba(255,255,255,0.2)",
          padding: "2px 8px",
          borderRadius: 20,
          fontSize: 11,
          marginLeft: 24,
          marginRight: 16,
          flexShrink: 0,
          zIndex: 2,
        }}
      >
        Uživo
      </span>

      {/* Klizni sadržaj */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
          maskImage: "linear-gradient(to right, transparent, #000 24px, #000 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, #000 24px, #000 92%, transparent)",
        }}
      >
        <div className="ticker-track">
          {dvostruko.map((s, i) => (
            <span className="ticker-cell" key={i}>
              {s.link ? (
                <Link href={s.link} className="ticker-link">
                  {s.tekst}
                </Link>
              ) : (
                <span className="ticker-link">{s.tekst}</span>
              )}
              <span className="ticker-sep">·</span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .ticker-track {
          display: inline-flex;
          white-space: nowrap;
          will-change: transform;
          animation: ticker-scroll 50s linear infinite;
        }
        .ticker-track:hover { animation-play-state: paused; }
        .ticker-cell { display: inline-flex; align-items: center; }
        .ticker-link { color: white; text-decoration: none; opacity: 0.97; }
        .ticker-link:hover { text-decoration: underline; }
        .ticker-sep { margin: 0 14px; opacity: 0.55; }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track { animation: none; }
        }
      `}</style>
    </div>
  );
}
