// ============================================================
//  Layout za /akcije/najnize — postoji SAMO zbog metadata.
//  Stranica je "use client" pa iz nje ne može da se izveze `metadata`.
//  Bez ovoga bi naslijedila canonical iz root layouta — vidi app/layout.tsx.
// ============================================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Najniže do sada — najniže cijene koje smo zabilježili | kodnas.de",
  description:
    "Artikli koji su danas na najnižoj cijeni koju smo im ikad zabilježili u njemačkim prodavnicama. Svaki lanac se poredi sam sa sobom.",
  alternates: { canonical: "/akcije/najnize" },
};

export default function NajnizeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
