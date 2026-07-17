import Nav from "@/components/Nav";
import Ticker from "@/components/Ticker";
import Hero from "@/components/Hero";
import KategorijBar from "@/components/KategorijBar";
import LiveVijesti from "@/components/LiveVijesti";
import MobilnaNaslovna from "@/components/MobilnaNaslovna";
import NajnovijeSection from "@/components/sections/NajnovijeSection";
import KategorijaSekcija from "@/components/sections/KategorijaSekcija";
import NajpopularnijeSection from "@/components/sections/NajpopularnijeSection";
import VodiciSection from "@/components/sections/VodiciSection";
import NewsletterBox from "@/components/sidebar/NewsletterBox";
import NajcitanijeBox from "@/components/sidebar/NajcitanijeBox";
import FaqBox from "@/components/sidebar/FaqBox";
import Footer from "@/components/Footer";

// Naslovna se osvježava svakih 5 minuta (novi objavljeni članci)
export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <Nav />
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
          {/* Iz svijeta — DESKTOP (na mobilnom je u MobilnaNaslovna kutiji) */}
          <div className="hide-mob">
            <KategorijaSekcija
              naslov="🌍 Iz svijeta"
              podnaslov="Najvažnije svjetske vijesti — politika, ekonomija i krize koje utiču na nas"
              kategorija="svijet"
              prikaziIzvor
              samoTip="svjetske"
            />
          </div>
          {/* Najnovije — SAMO desktop (na telefonu poslije Sporta idu odmah Vodiči) */}
          <div className="hide-mob">
            <NajnovijeSection />
          </div>
          <VodiciSection />
          {/* Viza + Gastarbajter — SAMO desktop (telefon: poslije Vodiča odmah Najpopularnije) */}
          <div className="hide-mob">
            <KategorijaSekcija
              naslov="Viza i ulazak"
              podnaslov="Chancenkarte, radna viza, Plava karta, porodično spajanje"
              kategorija="viza"
            />
            <KategorijaSekcija
              naslov="Gastarbajter"
              podnaslov="Priče iz dijaspore — život, iskustva i korisni savjeti"
              kategorija="gastarbajter"
            />
          </div>
          {/* Sport — DESKTOP (na mobilnom je u MobilnaNaslovna kutiji, ispod Svijeta) */}
          <div className="hide-mob">
            <KategorijaSekcija
              naslov="⚽ Sport"
              podnaslov="Bundesliga, svjetski fudbal i veliki mečevi"
              kategorija="sport"
            />
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
