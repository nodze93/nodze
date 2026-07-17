import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Ticker from "@/components/Ticker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum — kodnas.de",
  description: "Impressum und Anbieterkennzeichnung für kodnas.de.",
};

const IMPRESSUM = {
  ime: "Dzen Karg",
  ulica: "Korbinianstraße 1",
  plz: "80807",
  grad: "München",
  drzava: "Deutschland",
  email: "info@kodnas.de", // ← mora biti aktivan email za kontakt
};

export default function ImpressumPage() {
  const A = IMPRESSUM;
  return (
    <>
      <Nav />
      <Ticker />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px", fontSize: 15, lineHeight: 1.8, color: "var(--tekst)" }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 24, letterSpacing: "-0.5px" }}>Impressum</h1>

        <h2 style={h2}>Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)</h2>
        <p style={p}>
          {A.ime}<br />
          {A.ulica}<br />
          {A.plz} {A.grad}<br />
          {A.drzava}
        </p>

        <h2 style={h2}>Kontakt</h2>
        <p style={p}>
          E-Mail: <a href={`mailto:${A.email}`} style={aStyle}>{A.email}</a>
        </p>

        <h2 style={h2}>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p style={p}>
          {A.ime}<br />
          {A.ulica}, {A.plz} {A.grad}
        </p>

        <h2 style={h2}>Haftung für Inhalte</h2>
        <p style={p}>
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den
          allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht
          verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu
          forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der
          Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche
          Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
          Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
        </p>

        <h2 style={h2}>Haftung für Links</h2>
        <p style={p}>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
          Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
          Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten
          wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum
          Zeitpunkt der Verlinkung nicht erkennbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige
          Links umgehend entfernen.
        </p>

        <h2 style={h2}>Urheberrecht</h2>
        <p style={p}>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
          Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
          Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter
          beachtet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
          entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend
          entfernen.
        </p>
      </div>
      <Footer />
    </>
  );
}

const h2: React.CSSProperties = { fontSize: 18, fontWeight: 700, margin: "28px 0 8px" };
const p: React.CSSProperties = { marginBottom: 14, color: "var(--tekst-muted)" };
const aStyle: React.CSSProperties = { color: "var(--zelena)" };
