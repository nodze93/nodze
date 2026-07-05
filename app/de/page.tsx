import Nav from "@/components/Nav";
import Ticker from "@/components/Ticker";
import KategorijBar from "@/components/KategorijBar";
import Footer from "@/components/Footer";
import { dajLiveDE, MOCK_DE } from "@/lib/live";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vijesti iz Njemačke — Dijaspora.ba",
  description: "Najnovije vijesti iz Njemačke relevantne za bosansku dijasporu — radni zakoni, socijalne naknade, politika.",
};

export const revalidate = 300;

export default async function DePage() {
  const rss = await dajLiveDE(24);
  const vijesti = rss.length > 0 ? rss : MOCK_DE;

  return (
    <>
      <Nav />
      <Ticker />
      <KategorijBar aktivna="de" />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 26 }}>🇩🇪</span>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px" }}>Vijesti iz Njemačke</h1>
          <span className="live-dot" />
          <span className="live-badge">LIVE</span>
        </div>
        <p style={{ fontSize: 14, color: "var(--tekst-muted)", marginBottom: 24 }}>
          Najnovije s njemačkih portala — radni zakoni, socijalne naknade, politika. Linkovi vode na originalne članke.
        </p>
        <div className="live-box">
          <div className="live-list">
            {vijesti.map((v, i) => (
              <a key={i} href={v.link !== "#" ? v.link : "#"} target={v.link !== "#" ? "_blank" : undefined} rel="noopener noreferrer" className="live-item">
                <span className="live-izvor de">{v.izvor}</span>
                <span className="live-naslov">{v.naslov}</span>
                <span className="live-vrijeme">{v.vrijemeAgo}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
