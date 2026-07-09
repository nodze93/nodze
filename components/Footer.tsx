import Link from "next/link";

const kategorije = [
  { label: "Viza i boravak", href: "/kategorija/viza" },
  { label: "Posao i plaća", href: "/kategorija/posao" },
  { label: "Stan i najam", href: "/kategorija/stan" },
  { label: "Zdravstvo", href: "/kategorija/zdravstvo" },
  { label: "Porodica", href: "/kategorija/porodica" },
];

const vodici = [
  { label: "Radna viza", href: "/vodic/radna-viza-njemacka" },
  { label: "Krankenkasse", href: "/vodic/krankenkasse" },
  { label: "Elterngeld", href: "/vodic/trudnoca-njemacka" },
  { label: "Povrat poreza", href: "/vodic/povrat-poreza" },
  { label: "Penzija", href: "/kategorija/penzija" },
];

const portal = [
  { label: "O nama", href: "/o-nama" },
  { label: "Kontakt", href: "/kontakt" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "Oglašavanje", href: "/oglasavanje" },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--white)",
        borderTop: "1px solid var(--border)",
        padding: "32px 24px",
        marginTop: 40,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 32,
        }}
        className="footer-inner"
      >
        {/* Brand */}
        <div>
          <div
            style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}
          >
            dijaspora<span style={{ color: "var(--zelena)" }}>.ba</span>
          </div>
          <p
            style={{
              fontSize: 13,
              color: "var(--tekst-muted)",
              lineHeight: 1.6,
            }}
          >
            Tvoj vodič kroz život u Njemačkoj, Austriji i Švicarskoj. Vijesti,
            vodiči i praktične informacije za Bosance u dijaspori.
          </p>
        </div>

        {/* Kategorije */}
        <div>
          <h4
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 12,
              color: "var(--tekst-muted)",
            }}
          >
            Kategorije
          </h4>
          {kategorije.map((k) => (
            <Link
              key={k.href}
              href={k.href}
              style={{
                display: "block",
                fontSize: 13,
                color: "var(--tekst-muted)",
                marginBottom: 6,
              }}
              className="hover:text-zelena"
            >
              {k.label}
            </Link>
          ))}
        </div>

        {/* Vodiči */}
        <div>
          <h4
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 12,
              color: "var(--tekst-muted)",
            }}
          >
            Vodiči
          </h4>
          {vodici.map((v) => (
            <Link
              key={v.href}
              href={v.href}
              style={{
                display: "block",
                fontSize: 13,
                color: "var(--tekst-muted)",
                marginBottom: 6,
              }}
              className="hover:text-zelena"
            >
              {v.label}
            </Link>
          ))}
        </div>

        {/* Portal */}
        <div>
          <h4
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 12,
              color: "var(--tekst-muted)",
            }}
          >
            Portal
          </h4>
          {portal.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              style={{
                display: "block",
                fontSize: 13,
                color: "var(--tekst-muted)",
                marginBottom: 6,
              }}
              className="hover:text-zelena"
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer bottom */}
      <div
        style={{
          maxWidth: 1100,
          margin: "24px auto 0",
          paddingTop: 20,
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "var(--tekst-light)",
        }}
      >
        <span>© 2026 kodnas.de — Sva prava zadržana</span>
        <span>Napravljeno za Bosance vani</span>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-inner {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
