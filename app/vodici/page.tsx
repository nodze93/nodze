import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Ticker from "@/components/Ticker";
import { getAllVodici } from "@/lib/data/vodici";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Korak-po-korak vodiči — Dijaspora.ba",
  description: "Praktični vodiči za Bosance u Njemačkoj i Austriji: viza, stan, zdravstvo, porez i penzija.",
};

export default function VodiciPage() {
  const vodici = getAllVodici();

  return (
    <>
      <Nav />
      <Ticker />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.5px" }}>
            Korak-po-korak vodiči
          </h1>
          <p style={{ fontSize: 15, color: "var(--tekst-muted)" }}>
            Praktični vodiči koji te vode kroz birokratske procedure u Njemačkoj i Austriji.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="vodici-page-grid">
          {vodici.map((vodic) => (
            <Link
              key={vodic.id}
              href={`/vodic/${vodic.slug}`}
              style={{
                background: "var(--white)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 24,
                display: "flex",
                gap: 16,
                textDecoration: "none",
                color: "inherit",
                transition: "all 0.15s",
              }}
              className="hover:border-zelena hover:bg-zelena-svijetla"
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--zelena-svijetla)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                {vodic.ikona}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>
                  {vodic.naziv}
                </h2>
                <p style={{ fontSize: 13, color: "var(--tekst-muted)", lineHeight: 1.5, marginBottom: 10 }}>
                  {vodic.opis}
                </p>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--zelena)", fontWeight: 600 }}>
                    {vodic.koraci.length} koraka · {vodic.minCitanja} min
                  </span>
                  <span className={`tag-pill tag-${vodic.kategorija}`}>{vodic.kategorija}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
      <style>{`
        @media (max-width: 768px) {
          .vodici-page-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
