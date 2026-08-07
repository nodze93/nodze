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

// Strukturirani podaci: Googleu kažemo da je ovo besplatna web-aplikacija.
// Stranica je inače čist iframe (kalkulator preko cijelog ekrana — namjerno),
// pa je ovo jedini signal o sadržaju pored <title> i opisa.
const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Brutto-Netto Rechner 2026",
  url: "https://kodnas.de/brutto-netto",
  description:
    "Kalkulator neto plate u Njemačkoj za 2026: poreska klasa, savezna država, djeca, zdravstveno i penziono osiguranje.",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  inLanguage: "bs",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  publisher: { "@type": "Organization", name: "kodnas.de", url: "https://kodnas.de" },
}).replace(/</g, "\\u003c");

export default function BruttoNettoPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <BnFrame />
    </>
  );
}
