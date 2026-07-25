import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import VodicShare from "@/components/VodicShare";
import { getVodicBySlug } from "@/lib/vodici-db";
import { displejKategorija, KAT_BOJA } from "@/lib/data/vodic-kategorije";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vodic = await getVodicBySlug(slug);
  if (!vodic) return { title: "Vodič — kodnas.de" };
  const url = `/vodic/${vodic.slug}`;
  return {
    title: `${vodic.naziv} — kodnas.de`,
    description: vodic.opis,
    alternates: { canonical: url },
    openGraph: {
      title: vodic.naziv,
      description: vodic.opis,
      url,
      siteName: "kodnas.de",
      locale: "bs_BA",
      type: "article",
      images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: vodic.naziv }],
    },
    twitter: {
      card: "summary_large_image",
      title: vodic.naziv,
      description: vodic.opis,
      images: ["/og-default.jpg"],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function VodicPage({ params }: Props) {
  const { slug } = await params;
  const vodic = await getVodicBySlug(slug);
  if (!vodic) notFound();

  const dk = displejKategorija(vodic.kategorija);
  const boja = KAT_BOJA[dk.key] || KAT_BOJA.ostalo;
  const koraci = vodic.koraci ?? [];
  const imaKoraka = koraci.length > 0;
  const metaTekst = vodic.tekst
    ? `${vodic.min_citanja} min čitanja`
    : `${imaKoraka ? koraci.length + " koraka · " : ""}${vodic.min_citanja} min čitanja`;

  return (
    <>
      <Nav />

      <main className="vd">
        {/* Nazad */}
        <Link href="/vodici" className="vd-back">← Vodiči</Link>

        {/* HERO */}
        <div
          className="vd-hero"
          style={{ background: `linear-gradient(160deg, ${boja.bg} 0%, #ffffff 100%)` }}
        >
          <span className="vd-hero-ico">{vodic.ikona}</span>
        </div>

        <span className="vd-tag" style={{ background: boja.bg, color: boja.tekst }}>
          {dk.label}
        </span>
        <h1 className="vd-title">{vodic.naziv}</h1>
        <p className="vd-opis">{vodic.opis}</p>
        <div className="vd-meta">⏱ {metaTekst}</div>

        {/* U OVOM VODIČU (poglavlja) */}
        {imaKoraka && (
          <div className="vd-toc">
            <div className="vd-toc-head">U ovom vodiču:</div>
            {koraci.map((korak) => (
              <a key={korak.broj} href={`#korak-${korak.broj}`} className="vd-toc-item">
                <span className="vd-toc-num">{korak.broj}</span>
                <span className="vd-toc-txt">{korak.naslov}</span>
                <span className="vd-toc-chev">›</span>
              </a>
            ))}
          </div>
        )}

        {/* Akcije */}
        <div className="vd-actions">
          <a href="#sadrzaj" className="vd-btn-primary">📖 Pogledaj kompletan vodič</a>
          <VodicShare naziv={vodic.naziv} slug={vodic.slug} />
        </div>

        {/* SADRŽAJ */}
        <div id="sadrzaj" className="vd-content">
          {vodic.tekst ? (
            <div className="vodic-rich-tekst" dangerouslySetInnerHTML={{ __html: vodic.tekst }} />
          ) : imaKoraka ? (
            koraci.map((korak, i) => (
              <div
                key={korak.broj}
                id={`korak-${korak.broj}`}
                className="vd-korak"
                style={{ borderBottom: i < koraci.length - 1 ? "1px solid #eef0f2" : "none" }}
              >
                <div className="vd-korak-head">
                  <span className="vd-korak-num">{korak.broj}</span>
                  <h2 className="vd-korak-naslov">{korak.naslov}</h2>
                </div>
                <p className="vd-korak-opis">{korak.opis}</p>
                {korak.savjet && (
                  <div className="vd-savjet">
                    <span>💡</span>
                    <span>{korak.savjet}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p style={{ color: "#6B7280", fontSize: 15 }}>Sadržaj vodiča uskoro...</p>
          )}
        </div>

        {/* Newsletter CTA */}
        <div className="vd-cta">
          <h3>Ostani informisan</h3>
          <p>Svake nedjelje ujutro šaljemo najvažnije vijesti i promjene za dijasporu.</p>
          <a href="/newsletter" className="vd-cta-btn">Pretplati se na digest →</a>
        </div>
      </main>

      <Footer />

      <style>{`
        .vd { max-width: 760px; margin: 0 auto; padding: 12px 16px 28px; }
        .vd-back { display: inline-block; font-size: 14px; font-weight: 600; color: #1a8a4a; text-decoration: none; padding: 6px 0 10px; }
        .vd-hero {
          border-radius: 16px; height: 180px; display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px; border: 1px solid #eef0f2;
        }
        .vd-hero-ico { font-size: 76px; line-height: 1; filter: drop-shadow(0 6px 14px rgba(0,0,0,.12)); }
        .vd-tag { display: inline-block; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 7px; }
        .vd-title { font-size: 24px; font-weight: 800; line-height: 1.25; letter-spacing: -0.4px; color: #111827; margin: 10px 0 8px; }
        .vd-opis { font-size: 15px; color: #4B5563; line-height: 1.6; }
        .vd-meta { font-size: 13px; color: #9CA3AF; font-weight: 600; margin-top: 10px; }

        .vd-toc { background: #fff; border: 1px solid #eef0f2; border-radius: 14px; padding: 8px; margin-top: 20px; }
        .vd-toc-head { font-size: 13px; font-weight: 800; color: #111827; padding: 8px 10px 6px; }
        .vd-toc-item { display: flex; align-items: center; gap: 12px; padding: 11px 10px; text-decoration: none; color: inherit; border-radius: 10px; }
        .vd-toc-item:active { background: #f6f7f9; }
        .vd-toc-num { width: 24px; height: 24px; border-radius: 7px; background: #EAF7EE; color: #15803D; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .vd-toc-txt { flex: 1; font-size: 14px; font-weight: 600; color: #1f2937; }
        .vd-toc-chev { color: #C4C9D0; font-size: 20px; font-weight: 700; }

        .vd-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
        .vd-btn-primary {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px 16px; border-radius: 12px; background: #1a8a4a; color: #fff;
          font-size: 15px; font-weight: 700; text-decoration: none;
        }
        .vd-btn-primary:active { background: #167a42; }

        .vd-content { margin-top: 30px; }
        .vd-korak { padding-bottom: 24px; margin-bottom: 24px; }
        .vd-korak-head { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 10px; }
        .vd-korak-num { width: 34px; height: 34px; border-radius: 50%; background: #1a8a4a; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; flex-shrink: 0; }
        .vd-korak-naslov { font-size: 18px; font-weight: 700; line-height: 1.3; padding-top: 5px; color: #111827; }
        .vd-korak-opis { font-size: 15px; line-height: 1.75; color: #374151; margin-left: 48px; }
        .vd-savjet { display: flex; gap: 8px; align-items: flex-start; margin: 12px 0 0 48px; background: #EAF7EE; border: 1px solid #C7EAD5; border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #166534; line-height: 1.5; }

        .vd-cta { background: #EAF7EE; border: 1px solid #C7EAD5; border-radius: 14px; padding: 20px; margin-top: 30px; }
        .vd-cta h3 { font-size: 16px; font-weight: 800; color: #166534; margin-bottom: 6px; }
        .vd-cta p { font-size: 13px; color: #166534; opacity: .85; line-height: 1.5; margin-bottom: 14px; }
        .vd-cta-btn { display: inline-block; padding: 11px 20px; background: #1a8a4a; color: #fff; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; }

        /* Rich tekst */
        .vodic-rich-tekst { font-size: 15px; line-height: 1.75; color: #374151; }
        .vodic-rich-tekst h2 { font-size: 21px; font-weight: 700; margin: 34px 0 14px; color: #111827; letter-spacing: -0.3px; border-bottom: 2px solid #EAF7EE; padding-bottom: 8px; }
        .vodic-rich-tekst h3 { font-size: 17px; font-weight: 700; margin: 22px 0 10px; color: #374151; }
        .vodic-rich-tekst p { margin-bottom: 14px; }
        .vodic-rich-tekst ul, .vodic-rich-tekst ol { padding-left: 22px; margin-bottom: 16px; }
        .vodic-rich-tekst li { margin-bottom: 6px; }
        .vodic-rich-tekst strong { font-weight: 700; }
        .vodic-rich-tekst a { color: #1a8a4a; text-decoration: underline; }
        .vodic-rich-tekst code { background: #f3f4f6; padding: 1px 5px; border-radius: 4px; font-size: 13px; }
        .vodic-rich-tekst table.vd-tabela { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 14px; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
        .vodic-rich-tekst table.vd-tabela th { background: #f0fdf4; color: #166534; font-weight: 700; padding: 10px 14px; text-align: left; border-bottom: 1px solid #d1fae5; }
        .vodic-rich-tekst table.vd-tabela td { padding: 9px 14px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
        .vodic-rich-tekst table.vd-tabela tr:last-child td { border-bottom: none; }
        .vodic-rich-tekst table.vd-tabela tr:nth-child(even) td { background: #fafafa; }
      `}</style>
    </>
  );
}
