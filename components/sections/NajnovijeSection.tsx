import Link from "next/link";
import KarticaH, { type KarticaHClanak } from "@/components/KarticaH";
import { dajNajnovije, formatirajMeta } from "@/lib/data";

// ============================================================
// NAJNOVIJE — v19 raspored: horizontalne kartice, 2 po redu
// ============================================================

// Fallback — dok baza nema objavljenih članaka (slike kao u v19 preview-u)
const MOCK_CLANCI: KarticaHClanak[] = [
  { slug: "nova-radna-viza-2026", kategorija: "viza", naslov: "Nova pravila za radnu vizu u Njemačkoj — šta se mijenja za Bosance od 2026. godine", meta: "28. juna 2026. · 8 min čitanja", slika: "https://loremflickr.com/240/240/passport,germany?lock=1" },
  { slug: "elterngeld-2026", kategorija: "porodica", naslov: "Elterngeld 2026 — koliko para dobijaš i kako aplicirati odmah nakon poroda", meta: "27. juna 2026. · 6 min čitanja", slika: "https://loremflickr.com/240/240/baby,family?lock=2" },
  { slug: "stan-minhen-bez-schufe", kategorija: "stan", naslov: "Kako naći stan u Minhenu bez Schufe — provjeren vodič za novopridošle", meta: "26. juna 2026. · 5 min čitanja", slika: "https://loremflickr.com/240/240/apartment,city?lock=3" },
  { slug: "krankenkasse-2026", kategorija: "zdravstvo", naslov: "Krankenkasse povećava doprinos u 2026 — koliko više plaćaš", meta: "28. juna 2026. · 3 min čitanja", slika: "https://loremflickr.com/240/240/hospital,healthcare?lock=4" },
  { slug: "steuerklasse-vodic", kategorija: "finansije", naslov: "Steuerklasse — koja klasa ti najviše odgovara i kako je promijeniti", meta: "27. juna 2026. · 6 min čitanja", slika: "https://loremflickr.com/240/240/tax,document?lock=5" },
  { slug: "penzija-bih-njemacka", kategorija: "finansije", naslov: "Penzija u Njemačkoj za Bosance — BiH-DE sporazum objašnjen", meta: "25. juna 2026. · 10 min čitanja", slika: "https://loremflickr.com/240/240/retirement,senior?lock=6" },
];

export default async function NajnovijeSection() {
  const izBaze = await dajNajnovije(6);
  const clanci: KarticaHClanak[] =
    izBaze.length > 0
      ? izBaze.map((c) => ({
          slug: c.slug,
          naslov: c.naslov,
          kategorija: c.kategorija,
          meta: formatirajMeta(c),
          slika: c.slika,
        }))
      : MOCK_CLANCI;

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
