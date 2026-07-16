import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import KategorijBar from "@/components/KategorijBar";
import Ticker from "@/components/Ticker";
import Link from "next/link";
import { getClanciByKategorija } from "@/lib/data/clanci";
import { dajPoKategoriji } from "@/lib/data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const kategorijeInfo: Record<string, { naziv: string; opis: string }> = {
  viza: { naziv: "Viza i boravak", opis: "Radna viza, Aufenthaltstitel, Anerkennung diploma, promjena statusa" },
  posao: { naziv: "Posao i plaća", opis: "Traženje posla, plaće, radna prava, minimalna plaća, Kündigungsschutz" },
  stan: { naziv: "Stan i najam", opis: "Iznajmljivanje stana, Mietrecht, Kaution, Schufa" },
  zdravstvo: { naziv: "Zdravstvo", opis: "Krankenkasse, izbor doktora, lijekovi, Pflegeversicherung" },
  porodica: { naziv: "Porodica i djeca", opis: "Elterngeld, Kindergeld, Mutterschutz, Kindergarten, školovanje" },
  porez: { naziv: "Porez", opis: "Steuerklasse, Steuererklärung, povrat poreza, ELSTER" },
  penzija: { naziv: "Penzija", opis: "Deutsche Rentenversicherung, BiH-DE sporazum, penzijska prava" },
  povratak: { naziv: "Povratak u BiH", opis: "Planiranje povratka, zadržavanje statusa, penzija u BiH" },
  svijet: { naziv: "Svijet", opis: "Najvažnije i najzanimljivije vijesti iz svijeta — i šta znače za nas" },
  bih: { naziv: "BiH", opis: "Vijesti iz Bosne i Hercegovine važne za dijasporu" },
  vijesti: { naziv: "Vijesti", opis: "Najnovije vijesti za dijasporu u Njemačkoj i Austriji" },
  finansije: { naziv: "Finansije", opis: "Plate, štednja, porezi, povrat novca, beneficije" },
  sport: { naziv: "Sport", opis: "Bundesliga, svjetski fudbal i veliki mečevi" },
  gastarbajter: { naziv: "Gastarbajter", opis: "Stvarne priče iz dijaspore — smijeh i korisna informacija" },
  drama: { naziv: "Vijesti i drama", opis: "Priče koje se prepričavaju u dijaspori" },
  biznis: { naziv: "Biznis", opis: "Poduzetništvo, firme i biznis prilike za dijasporu" },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const info = kategorijeInfo[slug];
  if (!info) return { title: "Kategorija — Dijaspora.ba" };
  return {
    title: `${info.naziv} — Dijaspora.ba`,
    description: info.opis,
  };
}

export const revalidate = 300;

export async function generateStaticParams() {
  return Object.keys(kategorijeInfo).map((slug) => ({ slug }));
}

export default async function KategorijaPage({ params }: Props) {
  const { slug } = await params;
  const info = kategorijeInfo[slug];
  if (!info) notFound();

  // DB članci (bot + ručno objavljeni) prvo, pa statični primjeri
  const izBaze = await dajPoKategoriji(slug, 30);
  const dbClanci = izBaze.map((c) => ({
    id: c.id,
    slug: c.slug,
    naslov: c.naslov,
    excerpt: c.excerpt || "",
    sadrzaj: c.sadrzaj || "",
    kategorija: c.kategorija as import("@/lib/types").TagTip,
    datum: new Date(c.datum_objave || c.created_at).toLocaleDateString("bs-BA", { day: "numeric", month: "short" }),
    minCitanja: c.min_citanja,
    procitano: c.broj_pregleda,
    slika: c.slika,
  }));
  const staticni = getClanciByKategorija(slug);
  // Spoji: DB prvi, bez duplikata po slugu
  const dbSlugovi = new Set(dbClanci.map((c) => c.slug));
  const clanci = [...dbClanci, ...staticni.filter((c) => !dbSlugovi.has(c.slug))];

  return (
    <>
      <Nav />
      <Ticker />
      <KategorijBar aktivna={slug} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: "var(--tekst-muted)", marginBottom: 6 }}>
            <a href="/" style={{ color: "var(--zelena)" }}>Početna</a> → {info.naziv}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.5px" }}>
            {info.naziv}
          </h1>
          <p style={{ fontSize: 15, color: "var(--tekst-muted)" }}>{info.opis}</p>
        </div>

        {clanci.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--tekst-muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
            <p>Nema još članaka u ovoj kategoriji. Uskoro!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            {clanci.map((clanak) => (
              <Link
                key={clanak.id}
                href={`/clanak/${clanak.slug}`}
                className="kat-red"
                style={{ background: "var(--white)", padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", textDecoration: "none", color: "inherit", cursor: "pointer" }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 6,
                    flexShrink: 0,
                    backgroundColor: "var(--border)",
                    backgroundImage: clanak.slika ? `url('${clanak.slika}')` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className={`tag-pill tag-${clanak.kategorija}`}>{clanak.kategorija}</span>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, marginBottom: 6, marginTop: 4, color: "var(--tekst)" }}>
                    {clanak.naslov}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--tekst-light)" }}>
                    {clanak.datum} · {clanak.minCitanja} min čitanja
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
      <style>{`.kat-red:hover { background: #fafafa !important; }`}</style>
    </>
  );
}
