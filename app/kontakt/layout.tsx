// ============================================================
//  Layout za /kontakt — postoji SAMO zbog metadata.
// ------------------------------------------------------------
//  app/kontakt/page.tsx je "use client", pa iz njega ne može da se
//  izveze `metadata`. Bez ovog fajla stranica nasljeđuje canonical "/"
//  iz root layouta i Googleu se predstavlja kao duplikat naslovne —
//  zbog čega ne može biti indeksirana. Vidi objašnjenje u app/layout.tsx.
// ============================================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt — kodnas.de",
  description:
    "Javi nam se — pitanja, prijedlozi, ispravke i saradnja. kodnas.de, portal za našu dijasporu u Njemačkoj.",
  alternates: { canonical: "/kontakt" },
};

export default function KontaktLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
