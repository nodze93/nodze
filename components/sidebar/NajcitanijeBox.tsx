import Link from "next/link";

const stavke = [
  {
    broj: 1,
    naslov: "Nova radna viza — šta se mijenja od 2026",
    meta: "Viza · 2.4k",
    href: "/clanak/nova-radna-viza-2026",
  },
  {
    broj: 2,
    naslov: "Elterngeld — koliko para dobijaš kao roditelj",
    meta: "Porodica · 1.9k",
    href: "/clanak/elterngeld-2026",
  },
  {
    broj: 3,
    naslov: "Povrat poreza — kako do novca svake godine",
    meta: "Porez · 1.5k",
    href: "/clanak/povrat-poreza",
  },
  {
    broj: 4,
    naslov: "Stan bez Schufe — je li moguće i kako",
    meta: "Stan · 1.2k",
    href: "/clanak/stan-bez-schufe",
  },
];

export default function NajcitanijeBox() {
  return (
    <div
      style={{
        background: "var(--white)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: "var(--tekst-muted)",
        }}
      >
        Najčitanije danas
      </div>

      {stavke.map((stavka, i) => (
        <Link
          key={i}
          href={stavka.href}
          style={{
            display: "flex",
            gap: 10,
            padding: "12px 16px",
            borderBottom:
              i < stavke.length - 1 ? "1px solid var(--border)" : "none",
            cursor: "pointer",
            transition: "background 0.15s",
            alignItems: "flex-start",
            textDecoration: "none",
            color: "inherit",
          }}
          className="hover:bg-[#fafafa]"
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "var(--border)",
              minWidth: 24,
              lineHeight: 1,
              marginTop: 1,
            }}
          >
            {stavka.broj}
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                lineHeight: 1.4,
                marginBottom: 3,
              }}
            >
              {stavka.naslov}
            </div>
            <div style={{ fontSize: 10, color: "var(--tekst-light)" }}>
              {stavka.meta}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
