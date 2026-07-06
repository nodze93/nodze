import Nav from "@/components/Nav";
import Ticker from "@/components/Ticker";
import KategorijBar from "@/components/KategorijBar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { dajDE } from "@/lib/live";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vijesti iz Njemačke — Dijaspora.ba",
  description: "Najnovije vijesti iz Njemačke relevantne za bosansku dijasporu — radni zakoni, socijalne naknade, politika.",
};

export const revalidate = 300;

export default async function DePage() {
  const clanci = await dajDE(30);

  return (
    <>
      <Nav />
      <Ticker />
      <KategorijBar aktivna="de" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ fontSize: 12, color: "var(--tekst-muted)", marginBottom: 16 }}>
          <Link href="/" style={{ color: "var(--zelena)" }}>Početna</Link> → Vijesti iz Njemačke
        </div>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.5px" }}>
            🇩🇪 Vijesti iz Njemačke
          </h1>
          <p style={{ fontSize: 15, color: "var(--tekst-muted)" }}>
            Najnovije vijesti iz Njemačke relevantne za bosansku dijasporu — radni zakoni, socijalne naknade, politika.
          </p>
        </div>

        {clanci.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--tekst-muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
            <p>Nema još vijesti u ovoj rubrici. Uskoro!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            {clanci.map((c) => (
              <Link
                key={c.slug}
                href={`/clanak/${c.slug}`}
                className="kat-red"
                style={{ background: "var(--white)", padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", textDecoration: "none", color: "inherit", cursor: "pointer" }}
              >
                <div
                  style={{
                    width: 60, height: 60, borderRadius: 6, flexShrink: 0,
                    backgroundColor: "var(--border)",
                    backgroundImage: c.slika ? `url('${c.slika}')` : undefined,
                    backgroundSize: "cover", backgroundPosition: "center",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="tag-pill" style={{ background: "#eff6ff", color: "#1e40af" }}>{c.izvor}</span>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, marginBottom: 6, marginTop: 4, color: "var(--tekst)" }}>
                    {c.naslov}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--tekst-light)" }}>
                    {c.datum} · {c.minCitanja} min čitanja
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
      <style>{`.kat-red:hover { background: #fafafa !important; }`}</style>
    </>
  );
}
