import Link from "next/link";
import { dajNajcitanije } from "@/lib/data";

// ============================================================
// NAJPOPULARNIJE OVE SEDMICE — numerisana lista (v19 stil)
// ============================================================

const MOCK = [
  { slug: "skandal-konzulat-berlin", naslov: "Skandal u BiH konzulatu u Berlinu — čekanje na pasoš 8 mjeseci, a neko preskače red", meta: "bih · 5 min" },
  { slug: "dzeko-bundesliga-povratak", naslov: "Džeko se vraća u Bundesligu? Glasine o transferu tresu bosansku dijasporu", meta: "sport · 3 min" },
  { slug: "bosanka-frankfurt-porez", naslov: "Bosanka iz Frankfurta dobila 12.400€ povrata poreza — trik koji malo ko zna", meta: "finansije · 4 min" },
  { slug: "njemacka-plata-bosanski-doktor", naslov: "Bosanski ljekar u Münchenu zarađuje 7.800€/mj. — od nule do specijaliste za 3 godine", meta: "vijesti · 7 min" },
  { slug: "stan-minhen-bez-schufe", naslov: "Kako naći stan u Minhenu bez Schufe — provjeren vodič", meta: "stan · 5 min" },
];

export default async function NajpopularnijeSection() {
  const izBaze = await dajNajcitanije(5);
  const stavke =
    izBaze.length > 0
      ? izBaze.map((c) => ({
          slug: c.slug,
          naslov: c.naslov,
          meta: `${c.kategorija} · ${c.min_citanja} min`,
        }))
      : MOCK;

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
