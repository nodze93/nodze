import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import KategorijBar from "@/components/KategorijBar";
import Ticker from "@/components/Ticker";
import ClanakCard from "@/components/ClanakCard";
import { clanci as staticniClanci } from "@/lib/data/clanci";
import { dajNajnovije } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vijesti — Dijaspora.ba",
  description: "Sve vijesti relevantne za Bosance u Njemačkoj i Austriji.",
};

export const revalidate = 300;

export default async function VijestPage() {
  // DB članci prvo (bot + ručno objavljeni), pa statični primjeri
  const izBaze = await dajNajnovije(30);
  const dbClanci = izBaze.map((c) => ({
    id: c.id,
    slug: c.slug,
    naslov: c.naslov,
    excerpt: c.excerpt || "",
    sadrzaj: c.sadrzaj || "",
    kategorija: c.kategorija,
    datum: new Date(c.datum_objave || c.created_at).toLocaleDateString("bs-BA", { day: "numeric", month: "short" }),
    minCitanja: c.min_citanja,
    procitano: c.broj_pregleda,
  }));
  const dbSlugovi = new Set(dbClanci.map((c) => c.slug));
  const clanci = [...dbClanci, ...staticniClanci.filter((c) => !dbSlugovi.has(c.slug))];

  return (
    <>
      <Nav />
      <Ticker />
      <KategorijBar aktivna="sve" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, letterSpacing: "-0.5px" }}>
          Sve vijesti
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 40 }} className="main-layout">
          <div>
            {clanci.map((clanak) => (
              <ClanakCard key={clanak.id} clanak={clanak} varijanta="list" />
            ))}
          </div>

          <aside>
            <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--tekst-muted)" }}>Kategorije</h3>
              {["Viza", "Posao", "Stan", "Zdravstvo", "Porodica", "Porez", "Penzija", "Svijet", "BiH", "Povratak"].map((kat) => (
                <a
                  key={kat}
                  href={`/kategorija/${kat.toLowerCase()}`}
                  style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13, color: "var(--tekst-muted)", textDecoration: "none" }}
                  className="hover:text-zelena"
                >
                  {kat}
                  <span style={{ color: "var(--zelena)" }}>→</span>
                </a>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <Footer />
      <style>{`
        @media (max-width: 768px) {
          .main-layout { grid-template-columns: 1fr !important; }
          .main-layout aside { display: none !important; }
        }
      `}</style>
    </>
  );
}
