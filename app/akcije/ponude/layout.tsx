// ============================================================
//  Layout za /akcije/ponude — postoji SAMO zbog metadata.
// ------------------------------------------------------------
//  Stranica je "use client" pa ne može sama izvesti `metadata`.
//  Canonical je bitan i zbog drugog razloga: ova stranica se otvara sa
//  raznim parametrima (?sort=price, ?store=..., ?kat=...), a svi oni
//  moraju pokazivati na jednu istu adresu — inače Google vidi desetine
//  varijanti istog spiska. Vidi objašnjenje u app/layout.tsx.
// ============================================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sve ponude — akcije u njemačkim prodavnicama | kodnas.de",
  description:
    "Kompletan spisak akcija iz njemačkih prodavnica: pretraga, filter po prodavnici, kategoriji, procentu popusta i uštedi u eurima.",
  alternates: { canonical: "/akcije/ponude" },
};

export default function PonudeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
