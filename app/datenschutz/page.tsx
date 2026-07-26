import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung — kodnas.de",
  description: "Informationen zur Verarbeitung personenbezogener Daten auf kodnas.de gemäß DSGVO.",
  alternates: { canonical: "/datenschutz" },
};

export default function DatenschutzPage() {
  return (
    <>
      <Nav />
      <main className="legal">
        <h1>Datenschutzerklärung</h1>
        <p>
          Wir freuen uns über Ihren Besuch auf kodnas.de. Der Schutz Ihrer
          personenbezogenen Daten ist uns ein wichtiges Anliegen. Nachfolgend
          informieren wir Sie gemäß der Datenschutz-Grundverordnung (DSGVO) über die
          Verarbeitung personenbezogener Daten auf dieser Website.
        </p>

        <h2>1. Verantwortlicher</h2>
        <p>
          Verantwortlich im Sinne der DSGVO ist:<br />
          Dzena Karg<br />
          Korbinianstraße 1<br />
          80807 München, Deutschland<br />
          E-Mail: <a href="mailto:info@kodnas.de">info@kodnas.de</a>
        </p>

        <h2>2. Ihre Rechte als betroffene Person</h2>
        <p>
          Sie haben jederzeit das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung
          (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18),
          Datenübertragbarkeit (Art. 20) sowie Widerspruch gegen die Verarbeitung
          (Art. 21). Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für
          die Zukunft widerrufen. Zur Ausübung Ihrer Rechte genügt eine E-Mail an{" "}
          <a href="mailto:info@kodnas.de">info@kodnas.de</a>. Darüber hinaus haben Sie
          das Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde, in Bayern
          beim Bayerischen Landesamt für Datenschutzaufsicht (BayLDA).
        </p>

        <h2>3. Hosting</h2>
        <p>
          Diese Website wird bei der Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA
          91789, USA, gehostet. Beim Aufruf der Website werden technisch notwendige
          Daten (siehe Server-Logfiles) verarbeitet, um die Website sicher und stabil
          bereitzustellen. Rechtsgrundlage ist unser berechtigtes Interesse an einer
          zuverlässigen Darstellung der Website (Art. 6 Abs. 1 lit. f DSGVO). Eine
          Übermittlung in die USA erfolgt auf Grundlage geeigneter Garantien
          (EU-Standardvertragsklauseln bzw. EU-US Data Privacy Framework). Mit dem
          Anbieter besteht ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO.
        </p>

        <h2>4. Server-Logfiles</h2>
        <p>
          Beim Besuch der Website werden automatisch Informationen erfasst, die Ihr
          Browser übermittelt: aufgerufene Seite, Datum und Uhrzeit, übertragene
          Datenmenge, Referrer-URL, Browsertyp und -version, Betriebssystem sowie eine
          gekürzte bzw. verarbeitete IP-Adresse. Diese Daten dienen dem sicheren Betrieb
          und der Fehleranalyse und werden nicht mit anderen Datenquellen
          zusammengeführt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
        </p>

        <h2>5. Cookies</h2>
        <p>
          Unsere Website verwendet technisch notwendige Speichermechanismen, damit die
          Website funktioniert (z. B. Spracheinstellung, Anmeldung im Adminbereich).
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO bzw. § 25 Abs. 2 TDDDG.
          Cookies bzw. Analyse-Technologien, die nicht zwingend erforderlich sind,
          werden nur mit Ihrer Einwilligung gesetzt (§ 25 Abs. 1 TDDDG, Art. 6 Abs. 1
          lit. a DSGVO).
        </p>

        <h2>6. Google Analytics</h2>
        <p>
          Sofern Sie eingewilligt haben, nutzen wir Google Analytics 4, einen
          Webanalysedienst der Google Ireland Limited, Gordon House, Barrow Street,
          Dublin 4, Irland. Google Analytics verwendet Informationen über Ihre Nutzung
          der Website, um Reichweite und Nutzungsverhalten in aggregierter Form
          auszuwerten. Die IP-Adresse wird dabei gekürzt bzw. anonymisiert verarbeitet.
          Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie
          jederzeit widerrufen können. Sie können die Erfassung durch das
          Browser-Add-on unter{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
            tools.google.com/dlpage/gaoptout
          </a>{" "}
          verhindern.
        </p>

        <h2>7. Vercel Web Analytics &amp; Speed Insights</h2>
        <p>
          Zur Messung von Reichweite und Ladegeschwindigkeit nutzen wir Vercel Web
          Analytics und Speed Insights der Vercel Inc. Diese Dienste arbeiten
          weitgehend cookielos und werten Daten in aggregierter, nicht auf einzelne
          Personen rückführbarer Form aus. Rechtsgrundlage ist unser berechtigtes
          Interesse an der Optimierung unseres Angebots (Art. 6 Abs. 1 lit. f DSGVO).
        </p>

        <h2>8. Newsletter</h2>
        <p>
          Wenn Sie unseren Newsletter abonnieren, verarbeiten wir Ihre E-Mail-Adresse,
          um Ihnen regelmäßig Informationen zu senden. Die Anmeldung erfolgt auf
          Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Sie können den
          Newsletter jederzeit über den Abmeldelink in jeder E-Mail oder per Nachricht
          an <a href="mailto:info@kodnas.de">info@kodnas.de</a> abbestellen. Nach der
          Abmeldung wird Ihre E-Mail-Adresse aus dem Verteiler entfernt.
        </p>

        <h2>9. Datenbank / Auftragsverarbeitung (Supabase)</h2>
        <p>
          Zur Speicherung von Website-Inhalten und Newsletter-Anmeldungen nutzen wir die
          Infrastruktur der Supabase Inc. als Auftragsverarbeiter. Die Verarbeitung
          erfolgt auf Grundlage eines Auftragsverarbeitungsvertrags gemäß Art. 28 DSGVO.
          Es werden nur die für den jeweiligen Zweck erforderlichen Daten gespeichert.
        </p>

        <h2>10. Kontaktaufnahme</h2>
        <p>
          Wenn Sie uns per E-Mail oder über ein Kontaktformular kontaktieren, werden
          Ihre Angaben zur Bearbeitung der Anfrage verarbeitet. Rechtsgrundlage ist
          Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO. Die Daten werden gelöscht, sobald sie
          für die Erreichung des Zwecks nicht mehr erforderlich sind, sofern keine
          gesetzlichen Aufbewahrungspflichten bestehen.
        </p>

        <h2>11. Social Media / Facebook</h2>
        <p>
          Wir betreiben eine Facebook-Seite (Meta Platforms Ireland Ltd.), um über
          unsere Inhalte zu informieren. Beim Besuch dieser Seite auf Facebook gelten
          die Datenschutzbestimmungen von Meta. Auf unserer Website selbst sind keine
          Facebook-Tracking-Pixel oder Social-Plugins eingebunden; das Teilen von
          Beiträgen erfolgt über die geräteeigene Teilen-Funktion Ihres Browsers.
        </p>

        <h2>12. Datensicherheit</h2>
        <p>
          Diese Website nutzt aus Sicherheitsgründen eine SSL-/TLS-Verschlüsselung. Eine
          verschlüsselte Verbindung erkennen Sie an „https://" in der Adresszeile Ihres
          Browsers.
        </p>

        <h2>13. Aktualität und Änderung</h2>
        <p>
          Diese Datenschutzerklärung ist aktuell gültig. Durch die Weiterentwicklung
          der Website oder aufgrund geänderter gesetzlicher bzw. behördlicher Vorgaben
          kann es notwendig werden, diese Erklärung anzupassen. Stand: Juli 2026.
        </p>
      </main>
      <Footer />

      <style>{`
        .legal { max-width: 760px; margin: 0 auto; padding: 28px 18px 40px; }
        .legal h1 { font-size: 28px; font-weight: 800; color: #111827; letter-spacing: -0.5px; margin-bottom: 16px; }
        .legal h2 { font-size: 17px; font-weight: 700; color: #1a8a4a; margin: 26px 0 8px; }
        .legal p { font-size: 15px; line-height: 1.7; color: #374151; margin-bottom: 12px; }
        .legal a { color: #1a8a4a; text-decoration: underline; word-break: break-word; }
      `}</style>
    </>
  );
}
