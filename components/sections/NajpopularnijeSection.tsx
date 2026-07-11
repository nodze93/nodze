import Link from "next/link";
import { dajNajcitanije } from "@/lib/data";

// ============================================================
// NAJPOPULARNIJE OVE SEDMICE — numerisana lista (v19 stil)
// ============================================================

export default async function NajpopularnijeSection() {
  const izBaze = await dajNajcitanije(5);
  const stavke = izBaze.map((c) => ({
    slug: c.slug,
    naslov: c.naslov,
    meta: `${c.kategorija} · ${c.min_citanja} min`,
  }));

  // Bez izmišljenih primjera — ako nema članaka, sekcija se ne prikazuje.
  if (stavke.length === 0) return null;

  return (
    <div className="section" style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Najpopularnije ove sedmice
        </div>
      </div>
      <div className="lista">
        {stavke.map((s, i) => (
          <Link key={s.slug} href={`/clanak/${s.slug}`} className="lista-item">
            <div className="lista-broj">{i + 1}</div>
            <div>
              <div className="lista-naslov">{s.naslov}</div>
              <div className="lista-meta">{s.meta}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
