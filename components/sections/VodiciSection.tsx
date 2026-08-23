import Link from "next/link";

// ============================================================
//  DVIJE LISTE — 24.8.2026.
//  DESKTOP vodi ravno na žive vodiče (stari slugovi imaju 301, pa je
//  naslovna svoje najvrednije stranice linkovala kroz preusmjerenja).
//  MOBILNI ostaje NETAKNUT — dogovor: na telefonu se ne dira ništa.
//  Obje se ispišu, CSS na 768px sakrije onu koja ne treba.
// ============================================================

const VODICI_DESKTOP = [
  {
    ikona: "🛂",
    naziv: "Radna viza za Njemačku",
    opis: "Od termina u ambasadi do dolaska — šta stvarno traže",
    koraci: "Provjereno na sarajewo.diplo.de",
    href: "/vodic/radna-viza-njemacka",
  },
  {
    ikona: "🏥",
    naziv: "Krankenkasse",
    opis: "Šta je besplatno, šta plaćaš sam, koliko tačno",
    koraci: "Doprinosi, zubar, apoteka, bolnica",
    href: "/vodic/krankenkasse",
  },
  {
    ikona: "💶",
    naziv: "Porezi u Njemačkoj",
    opis: "Poreske klase, Lohnsteuer i povrat koji ti pripada",
    koraci: "Sa iznosima za 2026.",
    href: "/vodic/porezi-njemacka",
  },
  {
    ikona: "🔑",
    naziv: "Stan u Njemačkoj",
    opis: "Schufa, Mietvertrag, kaucija i prava stanara",
    koraci: "Od traženja do useljenja",
    href: "/vodic/stan-u-njemackoj",
  },
  {
    ikona: "👶",
    naziv: "Porodica u Njemačkoj",
    opis: "Kindergeld, Elterngeld, vrtić i škola",
    koraci: "Koliko para i kad se traži",
    href: "/vodic/porodica-u-njemackoj",
  },
  {
    ikona: "🧳",
    naziv: "Penzija i povratak",
    opis: "BiH–DE sporazum, staž i šta gubiš povratkom",
    koraci: "Prije nego se odlučiš",
    href: "/vodic/penzija-i-povratak",
  },
];

// NE DIRATI — ovo je ono što se vidi na telefonu
const VODICI_MOBILNI = [
  {
    ikona: "📋",
    naziv: "Radna viza za Njemačku",
    opis: "Od aplikacije do dolaska — sve što trebaš znati",
    koraci: "9 koraka · 15 min čitanja",
    href: "/vodic/radna-viza-njemacka",
  },
  {
    ikona: "🏥",
    naziv: "Krankenkasse — kako se prijaviti",
    opis: "Javno ili privatno, ko može biti suosiguran",
    koraci: "5 koraka · 8 min čitanja",
    href: "/vodic/krankenkasse",
  },
  {
    ikona: "👶",
    naziv: "Trudnoća u Njemačkoj",
    opis: "Mutterschutz, Elterngeld, Kindergeld — sve naknade",
    koraci: "7 koraka · 12 min čitanja",
    href: "/vodic/trudnoca-njemacka",
  },
  {
    ikona: "🏠",
    naziv: "Pronalazak stana",
    opis: "Schufa, Mietvertrag, prava stanara",
    koraci: "6 koraka · 10 min čitanja",
    href: "/vodic/pronalazak-stana",
  },
  {
    ikona: "💰",
    naziv: "Povrat poreza",
    opis: "Kako dobiti natrag novac od države — svake godine",
    koraci: "4 koraka · 7 min čitanja",
    href: "/vodic/povrat-poreza",
  },
  {
    ikona: "✈️",
    naziv: "Povratak u BiH",
    opis: "Šta gubiš, šta zadržavaš, kako planirati",
    koraci: "8 koraka · 14 min čitanja",
    href: "/vodic/povratak-bih",
  },
];

export default function VodiciSection() {
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
          Korak-po-korak vodiči
        </div>
        <Link
          href="/vodici"
          style={{
            fontSize: 12,
            color: "var(--zelena)",
            fontWeight: 500,
          }}
          className="hover:underline"
        >
          Svi vodiči →
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
        className="vodici-grid vodici-desktop"
      >
        {VODICI_DESKTOP.map((vodic, i) => (
          <Link
            key={i}
            href={vodic.href}
            style={{
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 16,
              cursor: "pointer",
              transition: "all 0.15s",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              textDecoration: "none",
              color: "inherit",
            }}
            className="hover:border-zelena hover:bg-zelena-svijetla"
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "var(--zelena-svijetla)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              {vodic.ikona}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                {vodic.naziv}
              </div>
              <div style={{ fontSize: 11, color: "var(--tekst-muted)" }}>
                {vodic.opis}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--zelena)",
                  fontWeight: 600,
                  marginTop: 4,
                }}
              >
                {vodic.koraci}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
        className="vodici-grid vodici-mobilni"
      >
        {VODICI_MOBILNI.map((vodic, i) => (
          <Link
            key={i}
            href={vodic.href}
            style={{
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 16,
              cursor: "pointer",
              transition: "all 0.15s",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              textDecoration: "none",
              color: "inherit",
            }}
            className="hover:border-zelena hover:bg-zelena-svijetla"
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "var(--zelena-svijetla)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              {vodic.ikona}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                {vodic.naziv}
              </div>
              <div style={{ fontSize: 11, color: "var(--tekst-muted)" }}>
                {vodic.opis}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--zelena)",
                  fontWeight: 600,
                  marginTop: 4,
                }}
              >
                {vodic.koraci}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .vodici-mobilni { display: none !important; }
        @media (max-width: 768px) {
          .vodici-grid { grid-template-columns: 1fr !important; }
          .vodici-desktop { display: none !important; }
          .vodici-mobilni { display: grid !important; }
        }
      `}</style>
    </div>
  );
}
