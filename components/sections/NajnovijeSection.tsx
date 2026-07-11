import Link from "next/link";
import KarticaH, { type KarticaHClanak } from "@/components/KarticaH";
import { dajNajnovije, formatirajMeta } from "@/lib/data";

// ============================================================
// NAJNOVIJE — v19 raspored: horizontalne kartice, 2 po redu
// ============================================================

export default async function NajnovijeSection() {
  const izBaze = await dajNajnovije(6);
  const clanci: KarticaHClanak[] = izBaze.map((c) => ({
    slug: c.slug,
    naslov: c.naslov,
    kategorija: c.kategorija,
    meta: formatirajMeta(c),
    slika: c.slika,
  }));

  // Bez izmišljenih primjera — ako nema članaka, sekcija se ne prikazuje.
  if (clanci.length === 0) return null;

  return (
    <div className="section" style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Najnovije
        </div>
        <Link href="/vijesti" style={{ fontSize: 12, color: "var(--zelena)", fontWeight: 500 }} className="hover:underline">
          Sve vijesti →
        </Link>
      </div>

      {/* Grid 2 po redu — v19 kartice sa sličicom lijevo */}
      <div className="card-grid-2">
        {clanci.map((c) => (
          <KarticaH key={c.slug} clanak={c} />
        ))}
      </div>
    </div>
  );
}
