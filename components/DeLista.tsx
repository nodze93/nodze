"use client";

// ============================================================
// DE LISTA — kartice njemačkih vijesti + "Učitaj još" dugme
// ============================================================
// Server (/de) dohvati SVE članke (veliki bazen), a ovdje ih
// prikazujemo po KORAK (20) i dugmetom otkrivamo starije prema dnu.
// Nema mrežnog poziva na klik — sve je već tu, samo se otkriva.

import { useState } from "react";
import Link from "next/link";
import type { KarticaVijest } from "@/lib/live";

const KORAK = 20;

export default function DeLista({ clanci }: { clanci: KarticaVijest[] }) {
  const [prikazano, setPrikazano] = useState(KORAK);
  const vidljivi = clanci.slice(0, prikazano);
  const preostalo = clanci.length - prikazano;

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          background: "var(--border)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {vidljivi.map((c) => (
          <Link
            key={c.slug}
            href={`/clanak/${c.slug}`}
            className="kat-red"
            style={{
              background: "var(--white)",
              padding: "14px 16px",
              display: "flex",
              gap: 12,
              alignItems: "center",
              textDecoration: "none",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 6,
                flexShrink: 0,
                backgroundColor: "var(--border)",
                backgroundImage: c.slika ? `url('${c.slika}')` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="tag-pill" style={{ background: "#eff6ff", color: "#1e40af" }}>
                {c.izvor}
              </span>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.4,
                  marginBottom: 6,
                  marginTop: 4,
                  color: "var(--tekst)",
                }}
              >
                {c.naslov}
              </div>
              <div style={{ fontSize: 11, color: "var(--tekst-light)" }}>
                {c.datum} · {c.minCitanja} min čitanja
              </div>
            </div>
          </Link>
        ))}
      </div>

      {preostalo > 0 && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            onClick={() => setPrikazano((p) => p + KORAK)}
            style={{
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--tekst)",
              cursor: "pointer",
            }}
            className="hover:bg-[#fafafa]"
          >
            Učitaj još ({preostalo})
          </button>
        </div>
      )}
    </>
  );
}
