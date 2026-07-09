import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Ticker from "@/components/Ticker";
import { getClanak, clanci, getNajnovijeClanci } from "@/lib/data/clanci";
import { dajClanak, dajNajnovije, formatirajMeta, type DbClanak } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ocistiHtml } from "@/lib/sanitize";

interface Props {
  params: Promise<{ slug: string }>;
}

// Ikona po kategoriji — za uredan baner kad članak nema fotografiju
const KAT_IKONA: Record<string, string> = {
  viza: "🛂", posao: "💼", stan: "🏠", zdravstvo: "🏥", porodica: "📋",
  porez: "🧾", penzija: "📄", finansije: "💶", sport: "⚽", svijet: "🌍",
  bih: "🇧🇦", vijesti: "📰", povratak: "✈️", gastarbajter: "🧳",
};

// Novi slugovi iz baze se renderuju na zahtjev, keš 5 min
export const dynamicParams = true;
export const revalidate = 300;

// Zajednički oblik: DB članak ili statični primjer
interface PrikazClanak {
  id: string | number;
  slug: string;
  naslov: string;
  excerpt: string;
  sadrzaj: string;
  kategorija: string;
  datum: string;
  minCitanja: number;
  procitano: number;
  slika?: string | null;
  slikaAutor?: string | null;
}

function izBaze(c: DbClanak): PrikazClanak {
  const datum = c.datum_objave || c.created_at;
  return {
    id: c.id,
    slug: c.slug,
    naslov: c.naslov,
    excerpt: c.excerpt || "",
    sadrzaj: c.sadrzaj,
    kategorija: c.kategorija,
    datum: new Date(datum).toLocaleDateString("bs-BA", { day: "numeric", month: "long", year: "numeric" }),
    minCitanja: c.min_citanja,
    procitano: c.broj_pregleda,
    slika: c.slika,
    slikaAutor: c.slika_autor,
  };
}

async function nadjiClanak(slug: string): Promise<PrikazClanak | null> {
  // 1. Baza (bot članci + ručno objavljeni)
  const db = await dajClanak(slug);
  if (db) return izBaze(db);
  // 2. Statični primjeri (fallback)
  const staticni = getClanak(slug);
  if (staticni) {
    return {
      ...staticni,
      excerpt: staticni.excerpt || "",
      procitano: staticni.procitano ?? 0,
    } as PrikazClanak;
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const clanak = await nadjiClanak(slug);
  if (!clanak) return { title: "Članak — kodnas.de" };

  const url = `/clanak/${clanak.slug}`;
  const opis = clanak.excerpt || "Vijesti i vodiči za Bosance u Njemačkoj i Austriji.";
  // Slika članka (Unsplash URL) ako postoji, inače podrazumijevana OG slika.
  const slika = clanak.slika || "/og-default.jpg";

  return {
    title: `${clanak.naslov} — kodnas.de`,
    description: opis,
    alternates: { canonical: url },
    openGraph: {
      title: clanak.naslov,
      description: opis,
      url,
      siteName: "kodnas.de",
      locale: "bs_BA",
      type: "article",
      images: [{ url: slika, alt: clanak.naslov }],
    },
    twitter: {
      card: "summary_large_image",
      title: clanak.naslov,
      description: opis,
      images: [slika],
    },
  };
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

export default async function ClanakPage({ params }: Props) {
  const { slug } = await params;
  const clanak = await nadjiClanak(slug);
  if (!clanak) notFound();

  // Preporučeni: prvo iz baze, fallback statični
  const izBazeNajnoviji = await dajNajnovije(4);
  const preporuceni =
    izBazeNajnoviji.length > 0
      ? izBazeNajnoviji
          .filter((c) => c.slug !== slug)
          .slice(0, 3)
          .map((c) => ({
            id: c.id,
            slug: c.slug,
            naslov: c.naslov,
            kategorija: c.kategorija,
            datum: formatirajMeta(c).split(" · ")[0],
            minCitanja: c.min_citanja,
          }))
      : getNajnovijeClanci(4).filter((c) => c.slug !== slug).slice(0, 3);

  return (
    <>
      <Nav />
      <Ticker />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 40 }} className="clanak-layout">
        {/* Glavni sadržaj */}
        <article>
          {/* Breadcrumb */}
          <div style={{ fontSize: 12, color: "var(--tekst-muted)", marginBottom: 16 }}>
            <Link href="/" style={{ color: "var(--zelena)" }}>Početna</Link>
            {" → "}
            <Link href={`/kategorija/${clanak.kategorija}`} style={{ color: "var(--zelena)" }}>
              {clanak.kategorija.charAt(0).toUpperCase() + clanak.kategorija.slice(1)}
            </Link>
          </div>

          {/* Tag */}
          <span className={`tag-pill tag-${clanak.kategorija}`} style={{ marginBottom: 12, display: "inline-block" }}>
            {clanak.kategorija}
          </span>

          {/* Naslov */}
          <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.5px", marginBottom: 16, color: "var(--tekst)" }}>
            {clanak.naslov}
          </h1>

          {/* Meta */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 13, color: "var(--tekst-light)", marginBottom: 24, alignItems: "center" }}>
            <span>📅 {clanak.datum}</span>
            <span>·</span>
            <span>⏱ {clanak.minCitanja} min čitanja</span>
            <span>·</span>
            <span>👁 {clanak.procitano.toLocaleString()} pročitano</span>
          </div>

          {/* Naslovna slika — prava fotka ako postoji, inače uredan baner */}
          {clanak.slika ? (
            <figure style={{ margin: "0 0 24px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={clanak.slika}
                alt={clanak.naslov}
                style={{ width: "100%", height: 320, objectFit: "cover", borderRadius: 10, display: "block" }}
              />
              {clanak.slikaAutor && (
                <figcaption style={{ fontSize: 11, color: "var(--tekst-light)", marginTop: 6 }}>
                  Foto: {clanak.slikaAutor}
                </figcaption>
              )}
            </figure>
          ) : (
            <div
              style={{
                width: "100%",
                height: 240,
                borderRadius: 10,
                marginBottom: 24,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                background: "linear-gradient(135deg, #eef6f1 0%, #e4eef8 100%)",
                border: "1px solid var(--border)",
              }}
            >
              <span style={{ fontSize: 60, opacity: 0.5 }}>
                {KAT_IKONA[clanak.kategorija] || "📰"}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "var(--tekst-light)",
                }}
              >
                {clanak.kategorija}
              </span>
            </div>
          )}

          {/* Excerpt */}
          <p style={{ fontSize: 17, color: "var(--tekst-muted)", lineHeight: 1.7, marginBottom: 28, padding: "16px 20px", borderLeft: "3px solid var(--zelena)", background: "var(--zelena-svijetla)", borderRadius: "0 8px 8px 0" }}>
            {clanak.excerpt}
          </p>

          {/* Sadržaj */}
          <div
            className="clanak-sadrzaj"
            dangerouslySetInnerHTML={{ __html: ocistiHtml(clanak.sadrzaj) }}
          />

          {/* Tagovi */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 13, color: "var(--tekst-muted)", marginRight: 8 }}>Kategorija:</span>
            <Link href={`/kategorija/${clanak.kategorija}`}>
              <span className={`tag-pill tag-${clanak.kategorija}`}>{clanak.kategorija}</span>
            </Link>
          </div>

          {/* Dijeli */}
          <div style={{ marginTop: 24, padding: 16, background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Podijeli ovaj članak:</span>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=https://kodnas.de/clanak/${clanak.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 14px", background: "#1877F2", color: "white", borderRadius: 6, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>Facebook</a>
            <a href={`https://t.me/share/url?url=https://kodnas.de/clanak/${clanak.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 14px", background: "#229ED9", color: "white", borderRadius: 6, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>Telegram</a>
            <a href={`https://wa.me/?text=https://kodnas.de/clanak/${clanak.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 14px", background: "#25D366", color: "white", borderRadius: 6, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>WhatsApp</a>
          </div>
        </article>

        {/* Sidebar */}
        <aside>
          {/* Preporučeni članci */}
          <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--tekst-muted)" }}>
              Čitaj i ovo
            </div>
            {preporuceni.map((p, i) => (
              <Link
                key={p.id}
                href={`/clanak/${p.slug}`}
                style={{ display: "flex", gap: 10, padding: "12px 16px", borderBottom: i < preporuceni.length - 1 ? "1px solid var(--border)" : "none", textDecoration: "none", color: "inherit", transition: "background 0.15s" }}
                className="hover:bg-[#fafafa]"
              >
                <div>
                  <span className={`tag-pill tag-${p.kategorija}`} style={{ marginBottom: 4, display: "inline-block" }}>{p.kategorija}</span>
                  <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{p.naslov}</div>
                  <div style={{ fontSize: 10, color: "var(--tekst-light)", marginTop: 4 }}>{p.datum} · {p.minCitanja} min</div>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>

      <Footer />

      <style>{`
        .clanak-sadrzaj h2 {
          font-size: 20px;
          font-weight: 700;
          margin: 28px 0 12px;
          letter-spacing: -0.3px;
          color: var(--tekst);
        }
        .clanak-sadrzaj h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 20px 0 10px;
          color: var(--tekst);
        }
        .clanak-sadrzaj p {
          margin-bottom: 16px;
          line-height: 1.75;
          color: var(--tekst);
          font-size: 15px;
        }
        .clanak-sadrzaj ul, .clanak-sadrzaj ol {
          margin: 12px 0 20px 20px;
        }
        .clanak-sadrzaj li {
          margin-bottom: 8px;
          line-height: 1.6;
          font-size: 15px;
        }
        .clanak-sadrzaj table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 14px;
        }
        .clanak-sadrzaj th, .clanak-sadrzaj td {
          padding: 10px 12px;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }
        .clanak-sadrzaj th { background: var(--bg); font-weight: 600; }
        .clanak-sadrzaj strong { font-weight: 700; color: var(--tekst); }
        /* 📌 Podsjetnik kutija (pozadina o čemu se radi) */
        .clanak-sadrzaj blockquote.podsjetnik {
          background: var(--zelena-svijetla);
          border-left: 4px solid var(--zelena);
          border-radius: 0 10px 10px 0;
          padding: 14px 18px;
          margin: 0 0 22px;
          font-size: 14.5px;
          line-height: 1.6;
          color: var(--tekst);
        }
        .clanak-sadrzaj blockquote.podsjetnik strong { color: var(--zelena-tamna); }
        /* Ništa ne smije biti šire od ekrana (nema pomjeranja lijevo/desno) */
        .clanak-layout > article { min-width: 0; }
        .clanak-sadrzaj { overflow-wrap: anywhere; word-break: break-word; }
        .clanak-sadrzaj img { max-width: 100%; height: auto; border-radius: 8px; }
        .clanak-sadrzaj a { word-break: break-word; }
        .clanak-sadrzaj table { display: block; max-width: 100%; overflow-x: auto; }
        @media (max-width: 768px) {
          .clanak-layout { grid-template-columns: minmax(0, 1fr) !important; }
          .clanak-layout aside { display: none !important; }
        }
      `}</style>
    </>
  );
}
