import type { Metadata } from "next";
import Nav from "@/components/Nav";
import AkcijeNaslovna from "@/components/AkcijeNaslovna";
import BruttoNettoBox from "@/components/BruttoNettoBox";
import Ticker from "@/components/Ticker";
import Hero from "@/components/Hero";
import KategorijBar from "@/components/KategorijBar";
import LiveVijesti from "@/components/LiveVijesti";
import MobilnaNaslovna from "@/components/MobilnaNaslovna";
import NajnovijeSection from "@/components/sections/NajnovijeSection";
import NajpopularnijeSection from "@/components/sections/NajpopularnijeSection";
import VodiciSection from "@/components/sections/VodiciSection";
import NewsletterBox from "@/components/sidebar/NewsletterBox";
import NajcitanijeBox from "@/components/sidebar/NajcitanijeBox";
import FaqBox from "@/components/sidebar/FaqBox";
import Footer from "@/components/Footer";

// Canonical se postavlja PO STRANICI, ne u root layoutu — vidi objašnjenje
// u app/layout.tsx. Naslovna je jedina koja pokazuje na "/".
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Naslovna se osvježava svakih 5 minuta (novi objavljeni članci)
export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <Nav />

      {/* AKCIJE PRVE — SAMO DESKTOP (24.8.2026.).
          Jedini dio sajta koji se sam ažurira svaki dan, a na naslovnoj
          ga nije bilo uopšte. Na telefonu se NE prikazuje: tamo naslovna
          ostaje tačno kakva je bila (kutije sa slikama). Dogovor. */}
      <div className="naslovna-akcije hide-mob">
        <AkcijeNaslovna />
      </div>

      {/* Ticker "Uživo" — sakriven na telefonu */}
      <div className="hide-mob"><Ticker /></div>
      <div className="hero-kat">
        <Hero />
        <KategorijBar aktivna="sve" />
      </div>

      {/* Live vijesti — dvije kutije (DESKTOP) */}
      <div className="hide-mob"><LiveVijesti /></div>

      {/* MOBILNA naslovna — kutije sa slikama (SAMO telefon) */}
      <MobilnaNaslovna />

      {/* Main content */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "24px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 24,
        }}
        className="main-layout"
      >
        {/* Left column — v19 redoslijed sekcija */}
        <main>
          {/* SKINUTO 20.8.2026.: „Iz svijeta", „Viza i ulazak", „Gastarbajter"
              i „Sport". To su bile bot-pisane vijesti od kojih Google nije
              indeksirao nijednu, a razvodnjavale su temu sajta. Vijesti iz
              Njemačke ostaju (LiveVijesti iznad). Sam sadržaj nije obrisan —
              stranice /kategorija/* i dalje rade. */}

          {/* Vodiči — jedini pravi SEO kapital, sada odmah ispod Akcija */}
          <VodiciSection />

          <div className="hide-mob">
            <BruttoNettoBox />
          </div>

          <div className="hide-mob">
            <NajnovijeSection />
          </div>

          <NajpopularnijeSection />
        </main>

        {/* Sidebar */}
        <aside
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <NewsletterBox />
          <NajcitanijeBox />
          <FaqBox />
        </aside>
      </div>

      <Footer />

      <style>{`
        .naslovna-akcije { max-width: 1100px; margin: 0 auto; padding: 20px 24px 0; }
        @media (max-width: 768px) { .naslovna-akcije { padding: 12px 0 0; } }
        /* Mobilno pokazuje "samo-mob", desktop pokazuje "hide-mob" */
        .samo-mob { display: none; }
        @media (max-width: 768px) {
          .main-layout {
            grid-template-columns: 1fr !important;
          }
          .main-layout aside {
            display: none !important;
          }
          .hide-mob { display: none !important; }
          .samo-mob { display: flex !important; }
          /* Traka kategorija iznad slike (samo telefon) */
          .hero-kat { display: flex; flex-direction: column; }
          .hero-kat > :last-child { order: -1; }
          /* Glavni sadržaj bez bočnog razmaka na telefonu (kutije do ivica) */
          .main-layout { padding: 0 !important; gap: 0 !important; }
          .main-layout > main { padding: 0 12px; }
        }
      `}</style>
    </>
  );
}
