import Nav from "@/components/Nav";
import Ticker from "@/components/Ticker";
import KategorijBar from "@/components/KategorijBar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { dajLiveBIH, MOCK_BIH } from "@/lib/live";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vijesti iz BiH — Dijaspora.ba",
  description: "Najnovije vijesti iz Bosne i Hercegovine važne za dijasporu — konzulati, pasoši, glasanje, letovi.",
};

export const revalidate = 300;

export default async function BihPage() {
  const rss = await dajLiveBIH(24);
  const vijesti = rss.length > 0 ? rss : MOCK_BIH;

  return (
    <>
      <Nav />
      <Ticker />
      <KategorijBar aktivna="bih" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: "var(--tekst-muted)", marginBottom: 16 }}>
          <Link href="/" style={{ color: "var(--zelena)" }}>Početna</Link> → Vijesti iz BiH
        </div>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.5px" }}>
            🇧🇦 Vijesti iz BiH
          </h1>
          <p style={{ fontSize: 15, color: "var(--tekst-muted)" }}>
            Aktualne vijesti iz Bosne i Hercegovine — konzulati, pasoši, izbori, zakoni koji utječu na dijasporu.
          </p>
        </div>

        {/* LIVE badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#ef4444" }}>
            <span className="live-dot" style={{ display: "inline-block" }} />
            LIVE
          </span>
        </div>

        {/* Lista */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          {vijesti.map((v, i) => {
            const interni = v.link.startsWith("/");
            const sadrzaj = (
              <>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#0F6E56", background: "#E1F5EE", padding: "3px 8px", borderRadius: 4, whiteSpace: "nowrap", marginTop: 2, flexShrink: 0 }}>
                  {v.izvor}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.45, color: "var(--tekst)" }}>{v.naslov}</div>
                </div>
                <span style={{ fontSize: 11, color: "var(--tekst-light)", whiteSpace: "nowrap", marginTop: 3, flexShrink: 0 }}>{v.vrijemeAgo}</span>
              </>
            );
            const stil = { display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 18px", background: "white", cursor: "pointer", textDecoration: "none", color: "inherit" } as const;
            return interni ? (
              <Link key={i} href={v.link} className="bih-red" style={stil}>{sadrzaj}</Link>
            ) : (
              <a key={i} href={v.link !== "#" ? v.link : undefined} target="_blank" rel="noopener noreferrer" className="bih-red" style={stil}>{sadrzaj}</a>
            );
          })}
        </div>

        {/* Info box */}
        <div style={{ marginTop: 24, padding: 16, background: "var(--zelena-svijetla)", borderRadius: 10, border: "1px solid #b7e5d4" }}>
          <p style={{ fontSize: 13, color: "var(--zelena-tamna)", marginBottom: 6, fontWeight: 600 }}>ℹ️ O ovim vijestima</p>
          <p style={{ fontSize: 13, color: "var(--zelena-tamna)" }}>
            Naš AI bot prati bosanske izvore (Klix.ba, N1 BiH, Slobodna Evropa, DW) i piše najvažnije za dijasporu kao naše članke. Klik otvara naš članak.
          </p>
        </div>
      </div>

      <Footer />
      <style>{`.bih-red:hover { background: #fafafa !important; }`}</style>
    </>
  );
}
