import Link from "next/link";

// ============================================================
//  ISPRAVLJENO 20.8.2026.
//  Ova lista je pokazivala na STARE slugove (trudnoca-njemacka,
//  pronalazak-stana, povrat-poreza, povratak-bih) koji od konsolidacije
//  vodiča imaju 301 preusmjerenje. Naslovna je dakle svoje najvrednije
//  stranice linkovala kroz preusmjerenja — korisnik ide dva skoka, a
//  Google to broji kao slab interni link.
//
//  Sada vodi ravno na šest živih vodiča.
// ============================================================

const vodici = [
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
        className="vodici-grid"
      >
        {vodici.map((vodic, i) => (
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
        @media (max-width: 768px) {
          .vodici-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
