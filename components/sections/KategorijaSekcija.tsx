import Link from "next/link";
import KarticaH, { type KarticaHClanak } from "@/components/KarticaH";
import { dajPoKategoriji, formatirajMeta } from "@/lib/data";

// ============================================================
// GENERIČKA SEKCIJA PO KATEGORIJI (v19 stil)
// naslov + podnaslov + 3 članka jedan ispod drugog (v19)
// ============================================================

interface Props {
  naslov: string;          // npr. "🌍 Iz svijeta"
  podnaslov?: string;      // sivi opis ispod naslova
  kategorija: string;      // DB kategorija za filter
  limit?: number;
  fallback?: KarticaHClanak[]; // statični primjeri dok je baza prazna
}

export default async function KategorijaSekcija({ naslov, podnaslov, kategorija, limit = 3, fallback = [] }: Props) {
  const izBaze = await dajPoKategoriji(kategorija, limit);
  const clanci: KarticaHClanak[] =
    izBaze.length > 0
      ? izBaze.map((c) => ({
          slug: c.slug,
          naslov: c.naslov,
          kategorija: c.kategorija,
          meta: formatirajMeta(c),
          slika: c.slika,
        }))
      : fallback;

  if (clanci.length === 0) return null; // prazna sekcija se ne prikazuje

  return (
    <div className="section" style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {naslov}
          </div>
          {podnaslov && (
            <div style={{ fontSize: 11, color: "var(--tekst-light)", marginTop: 2 }}>{podnaslov}</div>
          )}
        </div>
        <Link href={`/kategorija/${kategorija}`} style={{ fontSize: 12, color: "var(--zelena)", fontWeight: 500 }} className="hover:underline">
          Sve →
        </Link>
      </div>
      <div className="card-grid-1">
        {clanci.map((c) => (
          <KarticaH key={c.slug} clanak={c} />
        ))}
      </div>
    </div>
  );
}
