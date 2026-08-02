import type { Metadata } from "next";
import BnFrame from "@/components/BnFrame";

// ============================================================
// BRUTTO-NETTO KALKULATOR — /brutto-netto
// ============================================================
// Kalkulator je samostalna mini-aplikacija (statični fajlovi u
// public/kalkulator-app/ — korisnikov dizajn, NE dira se). Ovdje ga
// ugrađujemo preko iframe-a; BnFrame ga automatski SKALIRA da cijeli
// stane na jedan ekran (bez odsijecanja desne strane i bez skrolanja
// oko kalkulatora — vidi components/BnFrame.tsx).

export const metadata: Metadata = {
  title: "Brutto-Netto Rechner 2026 — izračunaj neto platu | kodnas.de",
  description:
    "Izračunaj svoju neto platu u Njemačkoj brzo i jednostavno: poreska klasa, savezna država, djeca, osiguranja. Bruto → neto za 2026.",
  alternates: { canonical: "/brutto-netto" },
};

export default function BruttoNettoPage() {
  return <BnFrame />;
}
