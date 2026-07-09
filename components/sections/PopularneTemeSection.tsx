import Link from "next/link";

const popularneStavke = [
  {
    broj: 1,
    naslov: "Ausländerbehörde — kako zakazati termin i što ponijeti",
    meta: "Viza · 5 min",
    href: "/clanak/auslander-termin",
  },
  {
    broj: 2,
    naslov: "Vozačka dozvola BiH → Führerschein — kako zamijeniti bez ispita",
    meta: "Dokumenti · 6 min",
    href: "/clanak/vozacka-fuhrerschein",
  },
  {
    broj: 3,
    naslov: "Elterngeld 2026 — koliko para i kako aplicirati",
    meta: "Porodica · 8 min",
    href: "/clanak/elterngeld-2026",
  },
  {
    broj: 4,
    naslov: "Penzija u Njemačkoj za Bosance — BiH-DE sporazum objašnjen",
    meta: "Penzija · 10 min",
    href: "/clanak/penzija-bih-njemacka",
  },
  {
    broj: 5,
    naslov: "Wise vs. Western Union — ko šalje jeftinije novac u BiH",
    meta: "Finansije · 4 min",
    href: "/clanak/wise-vs-western-union",
  },
];

export default function PopularneTemeSection() {
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Najpopularnije ove sedmice
        </div>
        <Link
          href="/vijesti"
          style={{
            fontSize: 12,
            color: "var(--zelena)",
            fontWeight: 500,
          }}
          className="hover:underline"
        >
          Sve →
        </Link>
      </div>

      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {popularneStavke.map((stavka, i) => (
          <Link
            key={i}
            href={stavka.href}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "14px 16px",
              borderBottom:
                i < popularneStavke.length - 1
                  ? "1px solid var(--border)"
                  : "none",
              cursor: "pointer",
              transition: "background 0.15s",
              textDecoration: "none",
              color: "inherit",
            }}
            className="hover:bg-[#fafafa]"
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--zelena)",
                minWidth: 20,
                marginTop: 1,
              }}
            >
              {stavka.broj}
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.4,
                  marginBottom: 4,
                }}
              >
                {stavka.naslov}
              </div>
              <div style={{ fontSize: 11, color: "var(--tekst-light)" }}>
                {stavka.meta}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
