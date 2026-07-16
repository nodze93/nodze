import Nav from "@/components/Nav";
import Ticker from "@/components/Ticker";
import KategorijBar from "@/components/KategorijBar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { dajDE } from "@/lib/live";
import DeLista from "@/components/DeLista";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vijesti iz Njemačke — kodnas.de",
  description: "Najnovije vijesti iz Njemačke relevantne za bosansku dijasporu — radni zakoni, socijalne naknade, politika.",
};

export const revalidate = 300;

export default async function DePage() {
  const clanci = await dajDE(200);

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
          <DeLista clanci={clanci} />
        )}
      </div>

      <Footer />
      <style>{`.kat-red:hover { background: #fafafa !important; }`}</style>
    </>
  );
}
