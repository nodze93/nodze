import Link from "next/link";

export default function Hero() {
  return (
    <div
      style={{
        background: "var(--white)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          minHeight: 320,
        }}
        className="hero-inner"
      >
        {/* Glavni članak */}
        <Link
          href="/clanak/nova-radna-viza-2026"
          style={{
            padding: "32px 32px 32px 24px",
            borderRight: "1px solid var(--border)",
            cursor: "pointer",
            transition: "background 0.15s",
            display: "block",
          }}
          className="hover:bg-[#fafafa]"
        >
          {/* Tag */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--zelena-svijetla)",
              color: "var(--zelena-tamna)",
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 20,
              marginBottom: 14,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <span
              className="hero-tag-dot"
              style={{
                width: 6,
                height: 6,
                background: "var(--zelena)",
                borderRadius: "50%",
                display: "inline-block",
              }}
            />
            Viza · Novo
          </div>

          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              lineHeight: 1.3,
              letterSpacing: "-0.5px",
              marginBottom: 12,
              maxWidth: 520,
              color: "var(--tekst)",
            }}
          >
            Nova pravila za radnu vizu u Njemačkoj — što se mijenja za Bosance
            od 2026. godine
          </h1>

          <p
            style={{
              fontSize: 15,
              color: "var(--tekst-muted)",
              lineHeight: 1.6,
              marginBottom: 20,
              maxWidth: 480,
            }}
          >
            Fachkräfteeinwanderungsgesetz je promijenio sve. Koje dokumente
            trebaš, koji je rok čekanja, i kako aplicirati korak po korak iz
            BiH.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 12,
              color: "var(--tekst-light)",
            }}
          >
            <span>Danas, 28. juna 2026.</span>
            <span style={{ color: "var(--border)" }}>·</span>
            <span>8 min čitanja</span>
            <span style={{ color: "var(--border)" }}>·</span>
            <span>2.4k pročitano</span>
          </div>
        </Link>

        {/* Bočni članci */}
        <div style={{ display: "flex", flexDirection: "column" }} className="hero-side">
          {[
            {
              tag: "porodica",
              label: "Porodica",
              naslov:
                "Elterngeld 2026 — koliko para dobijaš i kako aplicirati odmah nakon poroda",
              meta: "Jučer · 6 min",
              href: "/clanak/elterngeld-2026",
            },
            {
              tag: "stan",
              label: "Stan",
              naslov:
                "Kako naći stan u Minhenu bez Schufe — provjeren vodič za novopridošle",
              meta: "2 dana · 5 min",
              href: "/clanak/stan-minhen-bez-schufe",
            },
            {
              tag: "bih",
              label: "BiH",
              naslov: "Sedmični pregled iz BiH — što se desilo dok si bio na poslu",
              meta: "Jučer · 3 min",
              href: "/clanak/sedmicni-pregled-bih",
            },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              style={{
                padding: "18px 20px",
                borderBottom: i < 2 ? "1px solid var(--border)" : "none",
                cursor: "pointer",
                transition: "background 0.15s",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
              className="hover:bg-[#fafafa]"
            >
              <div>
                <span className={`tag-pill tag-${item.tag}`} style={{ marginBottom: 6, display: "inline-block" }}>
                  {item.label}
                </span>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: 1.4,
                    marginBottom: 8,
                    color: "var(--tekst)",
                  }}
                >
                  {item.naslov}
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--tekst-light)" }}>
                {item.meta}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-inner {
            grid-template-columns: 1fr !important;
          }
          .hero-side {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
