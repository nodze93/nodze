import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Ticker from "@/components/Ticker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "O nama — Dijaspora.ba",
  description: "Dijaspora.ba je portal za Bosance u Njemačkoj i Austriji.",
};

export default function ONamaPage() {
  return (
    <>
      <Nav />
      <Ticker />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.5px" }}>
          O Dijaspora.ba
        </h1>
        <p style={{ fontSize: 15, color: "var(--tekst-muted)", marginBottom: 40 }}>
          Tvoj vodič kroz život u Njemačkoj, Austriji i Švicarskoj
        </p>

        <div style={{ fontSize: 16, lineHeight: 1.8, color: "var(--tekst)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, marginTop: 32 }}>Ko smo mi?</h2>
          <p style={{ marginBottom: 16 }}>
            Dijaspora.ba je nezavisni informativni portal koji prikuplja, piše i objavljuje vijesti i praktične vodiče relevantne za Bosance koji žive u Njemačkoj i Austriji.
          </p>
          <p style={{ marginBottom: 16 }}>
            Znamo iz iskustva kako je teško snaći se u njemackoj birokraciji — Ausländerbehörde, Finanzamt, Krankenkasse... Svaki korak je labirint bez dobrog vodiča na bosanskom jeziku.
          </p>

          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, marginTop: 32 }}>Šta radimo?</h2>
          <p style={{ marginBottom: 16 }}>
            Svaki dan pratimo novosti relevantne za dijasporu — promjene u viznom sistemu, nova pravila za radnike, izmjene socijalnih naknada. Naša redakcija prati njemačke i bosanske izvore i priprema sažete, razumljive vijesti na bosanskom jeziku.
          </p>
          <p style={{ marginBottom: 16 }}>
            Pored vijesti, nudimo korak-po-korak vodiče koji te vode kroz konkretne procedure — od aplikacije za vizu do povrata poreza.
          </p>

          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, marginTop: 32 }}>AI asistent</h2>
          <p style={{ marginBottom: 16 }}>
            Portal uključuje asistenta koji može odgovoriti na tvoja specifična pitanja na bosanskom jeziku — 24/7, bez čekanja. Fokusiran je na teme o njemačkim sistemima i objašnjava kompleksne stvari jednostavnim rječnikom.
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
