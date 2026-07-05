import Nav from "@/components/Nav";
import Ticker from "@/components/Ticker";
import Hero from "@/components/Hero";
import KategorijBar from "@/components/KategorijBar";
import LiveVijesti from "@/components/LiveVijesti";
import NajnovijeSection from "@/components/sections/NajnovijeSection";
import KategorijaSekcija from "@/components/sections/KategorijaSekcija";
import NajpopularnijeSection from "@/components/sections/NajpopularnijeSection";
import VodiciSection from "@/components/sections/VodiciSection";
import NewsletterBox from "@/components/sidebar/NewsletterBox";
import NajcitanijeBox from "@/components/sidebar/NajcitanijeBox";
import FaqBox from "@/components/sidebar/FaqBox";
import Footer from "@/components/Footer";
import type { KarticaHClanak } from "@/components/KarticaH";

// Naslovna se osvježava svakih 5 minuta (novi objavljeni članci)
export const revalidate = 300;

// ── Statični fallbackovi za sekcije dok baza nema članaka (v19 primjeri) ──
const FALLBACK_VIZA: KarticaHClanak[] = [
  { slug: "nova-radna-viza-2026", kategorija: "viza", naslov: "Nova pravila za radnu vizu u Njemačkoj — šta se mijenja za Bosance od 2026. godine", meta: "28. juna 2026. · 8 min čitanja", slika: "https://loremflickr.com/240/240/passport,germany?lock=1" },
  { slug: "chancenkarte-vodic", kategorija: "viza", naslov: "Chancenkarte 2026 — dođi u Njemačku BEZ ponude posla i traži posao uživo", meta: "1. jula 2026. · 6 min čitanja", slika: "https://loremflickr.com/240/240/passport,visa?lock=18" },
  { slug: "radna-viza-korak-po-korak", kategorija: "viza", naslov: "Radna viza za Njemačku 2026 — korak po korak, od ugovora do slijetanja", meta: "1. jula 2026. · 7 min čitanja", slika: "https://loremflickr.com/240/240/airport,travel?lock=19" },
];

const FALLBACK_GASTARBAJTER: KarticaHClanak[] = [
  { slug: "tri-mjeseca-povracao-stan", kategorija: "gastarbajter", naslov: "Tri mjeseca povraćao u svom stanu. Ispostavilo se da razlog nije bio duh.", meta: "1. jula 2026. · 3 min čitanja", slika: "https://loremflickr.com/240/240/apartment,building?lock=12" },
  { slug: "komsiluk-na-njemackom", kategorija: "gastarbajter", naslov: "\"Kako se kaže komšiluk na njemačkom?\" — Pitao u grupi. Dobio 200 komentara i naučio nešto što nije očekivao.", meta: "30. juna 2026. · 4 min čitanja", slika: "https://loremflickr.com/240/240/street,neighborhood?lock=13" },
  { slug: "vratiti-za-2-godine", kategorija: "gastarbajter", naslov: "\"Svako ko je rekao da će se vratiti za 2 godine — ostao je 20\"", meta: "1. jula 2026. · 5 min čitanja", slika: "https://loremflickr.com/240/240/suitcase,travel?lock=14" },
];

const FALLBACK_SVIJET: KarticaHClanak[] = [
  { slug: "eu-pravila-stranci", kategorija: "svijet", naslov: "Šokantan potez u Bruxellesu: EU sprema odluku koja mijenja pravila za strance", meta: "Danas · 3 min čitanja", slika: "https://loremflickr.com/240/240/europe,flag?lock=21" },
  { slug: "inflacija-evropa", kategorija: "svijet", naslov: "Inflacija ponovo raste — šta to znači za tvoju plaću i ušteđevinu", meta: "Danas · 3 min čitanja", slika: "https://loremflickr.com/240/240/money,economy?lock=22" },
  { slug: "skandal-washington", kategorija: "svijet", naslov: "Skandal trese Washington: otkriveni dokumenti koje niko nije trebao vidjeti", meta: "Jučer · 4 min čitanja", slika: "https://loremflickr.com/240/240/washington,capitol?lock=24" },
];

const FALLBACK_SPORT: KarticaHClanak[] = [
  { slug: "dzeko-bundesliga-povratak", kategorija: "sport", naslov: "Džeko se vraća u Bundesligu? Glasine o transferu tresu bosansku dijasporu", meta: "Danas · 3 min čitanja", slika: "https://loremflickr.com/240/240/soccer,football?lock=9" },
  { slug: "zmajevi-euro", kategorija: "sport", naslov: "Zmajevi saznali protivnike: evo puta do EURO-a", meta: "Danas · 4 min čitanja", slika: "https://loremflickr.com/240/240/stadium,football?lock=23" },
  { slug: "transfer-trese-region", kategorija: "sport", naslov: "Transfer koji trese region: naš reprezentativac pred potpisom karijere", meta: "Jučer · 3 min čitanja", slika: "https://loremflickr.com/240/240/football,goal?lock=25" },
];

export default function HomePage() {
  return (
    <>
      <Nav />
      <Ticker />
      <Hero />
      <KategorijBar aktivna="sve" />

      {/* Live vijesti — dvije kutije (v19) */}
      <LiveVijesti />

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
          <NajnovijeSection />
          <VodiciSection />
          <KategorijaSekcija
            naslov="Viza i ulazak"
            podnaslov="Chancenkarte, radna viza, Plava karta, porodično spajanje"
            kategorija="viza"
            fallback={FALLBACK_VIZA}
          />
          <KategorijaSekcija
            naslov="Gastarbajter"
            podnaslov="Stvarne priče iz Facebook grupa — smijeh + korisna info"
            kategorija="gastarbajter"
            fallback={FALLBACK_GASTARBAJTER}
          />
          <KategorijaSekcija
            naslov="🌍 Iz svijeta"
            podnaslov="Politika, skandali, krize i bizarni događaji — direktno i klikabilno"
            kategorija="svijet"
            fallback={FALLBACK_SVIJET}
          />
          <KategorijaSekcija
            naslov="⚽ Sport"
            podnaslov="Bosanski sportisti vani, reprezentacija, Bundesliga"
            kategorija="sport"
            fallback={FALLBACK_SPORT}
          />
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
        @media (max-width: 768px) {
          .main-layout {
            grid-template-columns: 1fr !important;
          }
          .main-layout aside {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
