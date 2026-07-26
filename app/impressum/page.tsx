import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum — kodnas.de",
  description: "Impressum und Anbieterkennzeichnung von kodnas.de gemäß § 5 DDG.",
  alternates: { canonical: "/impressum" },
};

export default function ImpressumPage() {
  return (
    <>
      <Nav />
      <main className="legal">
        <h1>Impressum</h1>

        <h2>Angaben gemäß § 5 DDG</h2>
        <p>
          Dzena Karg<br />
          Korbinianstraße 1<br />
          80807 München<br />
          Deutschland
        </p>

        <h2>Kontakt</h2>
        <p>
          E-Mail: <a href="mailto:info@kodnas.de">info@kodnas.de</a>
        </p>

        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>
          Dzena Karg<br />
          Korbinianstraße 1<br />
          80807 München
        </p>

        <h2>Haftung für Inhalte</h2>
        <p>
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf
          diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10
          DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder
          gespeicherte fremde Informationen zu überwachen oder nach Umständen zu
          forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur
          Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen
          Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch
          erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
          Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese
          Inhalte umgehend entfernen.
        </p>

        <h2>Haftung für Links</h2>
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte
          wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch
          keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der
          jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten
          Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
          überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht
          erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist
          jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei
          Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend
          entfernen.
        </p>

        <h2>Urheberrecht</h2>
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
          unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
          Verbreitung und jede Art der Verwertung außerhalb der Grenzen des
          Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors
          bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten,
          nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite
          nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet.
          Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten
          wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen
          werden wir derartige Inhalte umgehend entfernen.
        </p>

        <h2>Hinweis zu redaktionellen Inhalten</h2>
        <p>
          kodnas.de ist ein unabhängiges Informationsportal für die Diaspora aus
          Bosnien und Herzegowina in Deutschland und Österreich. Ein Teil der Beiträge
          wird mit Unterstützung automatisierter Systeme (KI) auf Grundlage
          öffentlich verfügbarer Quellen erstellt und redaktionell geprüft. Die Inhalte
          dienen ausschließlich der allgemeinen Information und stellen keine Rechts-,
          Steuer- oder sonstige Fachberatung dar.
        </p>

        <h2>EU-Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung
          (OS) bereit:{" "}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
            https://ec.europa.eu/consumers/odr/
          </a>
          . Unsere E-Mail-Adresse finden Sie oben im Impressum. Zur Teilnahme an einem
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle sind wir
          nicht verpflichtet und grundsätzlich nicht bereit.
        </p>
      </main>
      <Footer />

      <style>{`
        .legal { max-width: 760px; margin: 0 auto; padding: 28px 18px 40px; }
        .legal h1 { font-size: 28px; font-weight: 800; color: #111827; letter-spacing: -0.5px; margin-bottom: 20px; }
        .legal h2 { font-size: 17px; font-weight: 700; color: #1a8a4a; margin: 26px 0 8px; }
        .legal p { font-size: 15px; line-height: 1.7; color: #374151; margin-bottom: 12px; }
        .legal a { color: #1a8a4a; text-decoration: underline; word-break: break-word; }
      `}</style>
    </>
  );
}
