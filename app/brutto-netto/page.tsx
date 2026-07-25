import type { Metadata } from "next";

// ============================================================
// BRUTTO-NETTO KALKULATOR — /brutto-netto
// ============================================================
// Kalkulator je samostalna mini-aplikacija (statični fajlovi u
// public/kalkulator-app/). Ovdje ga ugrađujemo preko iframe-a da
// donja nav traka sajta ostane vidljiva oko njega.

export const metadata: Metadata = {
  title: "Brutto-Netto Rechner 2026 — izračunaj neto platu | kodnas.de",
  description:
    "Izračunaj svoju neto platu u Njemačkoj brzo i jednostavno: poreska klasa, savezna država, djeca, osiguranja. Bruto → neto za 2026.",
  alternates: { canonical: "/brutto-netto" },
};

export default function BruttoNettoPage() {
  return (
    <div className="bn-wrap">
      <iframe
        src="/kalkulator-app/index.html"
        title="Brutto-Netto Rechner"
        className="bn-frame"
      />
      <style>{`
        .bn-wrap {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: #F0F4FF;
        }
        .bn-frame {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }
        /* Na telefonu ostavi mjesta za donju nav traku */
        @media (max-width: 768px) {
          .bn-wrap { bottom: calc(58px + env(safe-area-inset-bottom)); }
        }
      `}</style>
    </div>
  );
}
