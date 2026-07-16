import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Ticker from "@/components/Ticker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "O nama — kodnas.de",
  description: "kodnas.de — sve njemačke vijesti na našem jeziku i praktični vodiči za našu dijasporu u Njemačkoj.",
};

export default function ONamaPage() {
  return (
    <>
      <Nav />
      <Ticker />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.5px" }}>
          O portalu Kod nas
        </h1>
        <p style={{ fontSize: 15, color: "var(--tekst-muted)", marginBottom: 40 }}>
          Sve njemačke vijesti na našem jeziku — i praktični vodiči
        </p>

        <div style={{ fontSize: 16, lineHeight: 1.8, color: "var(--tekst)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, marginTop: 32 }}>Ko smo mi?</h2>
          <p style={{ marginBottom: 16 }}>
            kodnas.de je nezavisni informativni portal koji prati sve važne njemačke izvore iz minute u minutu, piše i objavljuje vijesti i praktične vodiče na našem jeziku — za nas, našu dijasporu u Njemačkoj.
          </p>
          <p style={{ marginBottom: 16 }}>
            Znamo iz iskustva kako je teško snaći se u njemačkoj birokraciji — Ausländerbehörde, Finanzamt, Krankenkasse... Svaki korak je labirint bez dobrog vodiča na našem jeziku.
          </p>

          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, marginTop: 32 }}>Šta radimo?</h2>
          <p style={{ marginBottom: 16 }}>
            Svaki dan pratimo novosti relevantne za dijasporu — promjene u viznom sistemu, nova pravila za radnike, izmjene socijalnih naknada. Sažimamo ih u kratke, jasne vijesti na bosanskom jeziku.
          </p>
          <p style={{ marginBottom: 16 }}>
            Pored vijesti, nudimo korak-po-korak vodiče koji te vode kroz konkretne procedure — od aplikacije za vizu do povrata poreza.
          </p>

          <div style={{ background: "var(--zelena-svijetla)", border: "1px solid var(--zelena)", borderRadius: 12, padding: 24, marginTop: 32 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 8, color: "var(--zelena-tamna)" }}>⚠️ Odricanje odgovornosti</h3>
            <p style={{ fontSize: 14, color: "var(--zelena-tamna)", lineHeight: 1.6 }}>
              Sadržaj portala je informativne prirode i ne predstavlja pravni ni financijski savjet. Za konkretna pravna pitanja obratite se advokatu ili nadležnim institucijama. Zakoni se mijenjaju — uvijek provjerite aktuelne informacije na službenim stranicama.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
