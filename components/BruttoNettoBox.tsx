// ============================================================
//  BRUTTO-NETTO POZIV (dodano 20.8.2026.)
// ------------------------------------------------------------
//  Kalkulator je alat sa najjačom namjerom pretrage koji imamo, a na
//  naslovnoj ga nije bilo nigdje. Ovo je jedna kutija koja vodi na njega.
// ============================================================

import Link from "next/link";

export default function BruttoNettoBox() {
  return (
    <section className="bn-box">
      <div className="bn-tekst">
        <h2>💶 Koliko ti ostane na ruke?</h2>
        <p>
          Upiši bruto platu i poresku klasu — kalkulator ti pokaže neto iznos,
          poreze i doprinose, po njemačkim stopama za 2026.
        </p>
      </div>
      <Link href="/brutto-netto" className="bn-dugme">
        Izračunaj →
      </Link>

      <style>{`
        .bn-box {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
          background: var(--white, #fff);
          border: 1px solid var(--border, #e5e7eb);
          border-left: 4px solid var(--zelena, #1a8a4a);
          border-radius: 10px;
          padding: 18px 20px;
          margin: 0 0 28px;
        }
        .bn-tekst h2 { font-size: 17px; font-weight: 800; letter-spacing: -0.3px; margin-bottom: 4px; }
        .bn-tekst p { font-size: 13.5px; color: var(--tekst-muted, #6b7280); line-height: 1.5; max-width: 560px; }
        .bn-dugme {
          background: var(--zelena, #1a8a4a); color: #fff;
          font-size: 14px; font-weight: 700;
          padding: 10px 18px; border-radius: 8px;
          text-decoration: none; white-space: nowrap;
        }
        .bn-dugme:hover { filter: brightness(1.08); }
        @media (max-width: 640px) {
          .bn-box { margin: 0 12px 24px; }
        }
      `}</style>
    </section>
  );
}
