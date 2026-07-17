import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Ticker from "@/components/Ticker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung — kodnas.de",
  description: "Datenschutzerklärung für kodnas.de gemäß DSGVO.",
};

const V = {
  ime: "Dzen Karg",
  ulica: "Korbinianstraße 1",
  plz: "80807",
  grad: "München",
  email: "info@kodnas.de", // ← mora biti aktivan email za kontakt
};

export default function DatenschutzPage() {
  return (
    <>
      <Nav />
      <Ticker />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px", fontSize: 15, lineHeight: 1.8, color: "var(--tekst)" }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.5px" }}>Datenschutzerklärung</h1>
        <p style={{ ...p, fontSize: 13 }}>Stand: Juli 2026</p>

        <h2 style={h2}>1. Verantwortlicher</h2>
        <p style={p}>
          Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br />
          {V.ime}, {V.ulica}, {V.plz} {V.grad}, Deutschland<br />
          E-Mail: <a href={`mailto:${V.email}`} style={aStyle}>{V.email}</a>
        </p>

        <h2 style={h2}>2. Ihre Rechte</h2>
        <p style={p}>
          Sie haben jederzeit das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17),
          Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) sowie Widerspruch gegen die
          Verarbeitung (Art. 21). Erteilte Einwilligungen können Sie jederzeit mit Wirkung für die Zukunft
          widerrufen. Zudem steht Ihnen ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu, für uns
          zuständig ist das Bayerische Landesamt für Datenschutzaufsicht (BayLDA).
        </p>

        <h2 style={h2}>3. Hosting</h2>
        <p style={p}>
          Diese Website wird bei Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789, USA) gehostet. Beim Aufruf der
          Seite werden technisch notwendige Daten (z. B. IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browser)
          verarbeitet, um die Auslieferung der Website sowie deren Sicherheit und Stabilität zu gewährleisten.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem sicheren Betrieb).
        </p>

        <h2 style={h2}>4. Server-Logfiles</h2>
        <p style={p}>
          Der Provider erhebt und speichert automatisch Informationen in sogenannten Server-Logfiles, die Ihr
          Browser automatisch übermittelt (Browsertyp und -version, Betriebssystem, Referrer-URL, Uhrzeit der
          Anfrage, IP-Adresse). Diese Daten werden nicht mit anderen Datenquellen zusammengeführt und dienen der
          technischen Auslieferung und Sicherheit. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.
        </p>

        <h2 style={h2}>5. Datenbank / Inhalte</h2>
        <p style={p}>
          Zur Speicherung von Inhalten (Artikel) und Funktionsdaten nutzen wir Supabase (Supabase Inc., USA / EU-
          Region). Personenbezogene Daten der Besucher werden dort nur im Rahmen der unten genannten Funktionen
          (Kontakt, Newsletter) verarbeitet.
        </p>

        <h2 style={h2}>6. Kontaktaufnahme</h2>
        <p style={p}>
          Wenn Sie uns über das Kontaktformular oder per E-Mail kontaktieren, werden Ihre Angaben zur Bearbeitung der
          Anfrage und für Anschlussfragen gespeichert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Anbahnung/
          Erfüllung) bzw. lit. f (berechtigtes Interesse an der Beantwortung). Die Daten werden gelöscht, sobald sie
          nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
        </p>

        <h2 style={h2}>7. Newsletter</h2>
        <p style={p}>
          Für den Versand unseres Newsletters benötigen wir Ihre E-Mail-Adresse. Die Anmeldung erfolgt freiwillig;
          Rechtsgrundlage ist Ihre Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO. Sie können den Newsletter jederzeit
          abbestellen und Ihre Einwilligung widerrufen. Ihre E-Mail-Adresse wird nach der Abmeldung aus dem Verteiler
          entfernt.
        </p>

        <h2 style={h2}>8. Google Analytics</h2>
        <p style={p}>
          Diese Website nutzt Google Analytics, einen Webanalysedienst der Google Ireland Limited (Gordon House,
          Barrow Street, Dublin 4, Irland). Google Analytics verwendet Cookies, die eine Analyse der Benutzung der
          Website ermöglichen. Dabei können Informationen an Server von Google, auch in den USA, übertragen werden.
          Die IP-Adresse wird gekürzt (IP-Anonymisierung). Die Nutzung erfolgt ausschließlich auf Grundlage Ihrer
          Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie jederzeit widerrufen können. Sie können die Erfassung
          durch Google Analytics zudem über ein Browser-Add-on verhindern:{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" style={aStyle} target="_blank" rel="noopener noreferrer">
            tools.google.com/dlpage/gaoptout
          </a>.
        </p>

        <h2 style={h2}>9. Cookies</h2>
        <p style={p}>
          Unsere Website verwendet technisch notwendige Cookies sowie – nur mit Ihrer Einwilligung – Cookies für die
          Reichweitenmessung (Google Analytics). Sie können Ihren Browser so einstellen, dass Sie über das Setzen von
          Cookies informiert werden und Cookies nur im Einzelfall erlauben oder generell ausschließen.
        </p>

        <h2 style={h2}>10. SSL-/TLS-Verschlüsselung</h2>
        <p style={p}>
          Diese Seite nutzt aus Sicherheitsgründen eine SSL-/TLS-Verschlüsselung. Eine verschlüsselte Verbindung
          erkennen Sie an „https://“ und dem Schloss-Symbol in Ihrer Browserzeile.
        </p>

        <h2 style={h2}>11. Änderungen</h2>
        <p style={p}>
          Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen
          Anforderungen entspricht oder um Änderungen unserer Leistungen umzusetzen.
        </p>
      </div>
      <Footer />
    </>
  );
}

const h2: React.CSSProperties = { fontSize: 18, fontWeight: 700, margin: "28px 0 8px" };
const p: React.CSSProperties = { marginBottom: 14, color: "var(--tekst-muted)" };
const aStyle: React.CSSProperties = { color: "var(--zelena)" };
