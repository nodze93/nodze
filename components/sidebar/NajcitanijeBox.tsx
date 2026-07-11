import Link from "next/link";
import { dajNajcitanije } from "@/lib/data";

// Kad baza još nema pregleda — pokaži PRAVE vodiče (nema mrtvih linkova).
const FALLBACK = [
  { naslov: "Radna viza za Njemačku — korak po korak", meta: "Vodič", href: "/vodic/radna-viza-njemacka" },
  { naslov: "Krankenkasse — kako se prijaviti", meta: "Vodič", href: "/vodic/krankenkasse" },
  { naslov: "Povrat poreza — kako do novca svake godine", meta: "Vodič", href: "/vodic/povrat-poreza" },
  { naslov: "Pronalazak stana — Schufa i Mietvertrag", meta: "Vodič", href: "/vodic/pronalazak-stana" },
];

export default async function NajcitanijeBox() {
  const izBaze = await dajNajcitanije(4);
  const stavke =
    izBaze.length > 0
      ? izBaze.map((c) => ({
          naslov: c.naslov,
          meta: c.kategorija,
          href: `/clanak/${c.slug}`,
        }))
      : FALLBACK;

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
            {i + 1}
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
