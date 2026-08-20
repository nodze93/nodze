// ============================================================
// Layout za /akcije/*
//
// Gornja Nav traka i Footer su isti kao na ostatku kodnas.de.
// Sadržaj Akcija je omotan u <div className="ak"> jer je CSS iz
// originalne aplikacije prefiksiran sa .ak — tako se .card, .grid,
// .chip, .btn, .hero i ostali nazivi ne sudaraju sa kodnas stilovima.
// ============================================================

import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AkcijeBar from "@/components/akcije/AkcijeBar";
import { PlzProvider } from "@/components/akcije/PlzProvider";
import "./akcije.css";

export const metadata: Metadata = {
  title: "Akcije i popusti u njemačkim prodavnicama | kodnas.de",
  description:
    "Sve akcije iz njemačkih prodavnica na jednom mjestu: filtriraj po procentu popusta, ušteđi u eurima, kategoriji i prodavnici. Ažurirano svaki dan.",
  // Bez ovoga /akcije nasljeđuje canonical iz root layouta i Googleu kaže
  // da je duplikat naslovne — vidi objašnjenje u app/layout.tsx.
  alternates: { canonical: "/akcije" },
};

export default function AkcijeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <PlzProvider>
        <div className="ak">
          <div className="app">
            <AkcijeBar />
            {children}
          </div>
        </div>
      </PlzProvider>
      <Footer />
    </>
  );
}
