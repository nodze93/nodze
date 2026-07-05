import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Ticker from "@/components/Ticker";
import { getVodic, vodici } from "@/lib/data/vodici";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vodic = getVodic(slug);
  if (!vodic) return { title: "Vodič — Dijaspora.ba" };
  return {
    title: `${vodic.naziv} — Dijaspora.ba`,
    description: vodic.opis,
  };
}

export async function generateStaticParams() {
  return vodici.map((v) => ({ slug: v.slug }));
}

export default async function VodicPage({ params }: Props) {
  const { slug } = await params;
  const vodic = getVodic(slug);
  if (!vodic) notFound();

  return (
    <>
      <Nav />
      <Ticker />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "1fr 260px", gap: 40 }} className="vodic-layout">
        <article>
          {/* Breadcrumb */}
          <div style={{ fontSize: 12, color: "var(--tekst-muted)", marginBottom: 16 }}>
            <Link href="/" style={{ color: "var(--zelena)" }}>Početna</Link> →{" "}
            <Link href="/vodici" style={{ color: "var(--zelena)" }}>Vodiči</Link>
          </div>

          {/* Header */}
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 28 }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: "var(--zelena-svijetla)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
              {vodic.ikona}
            </div>
            <div>
              <span className={`tag-pill tag-${vodic.kategorija}`} style={{ marginBottom: 8, display: "inline-block" }}>{vodic.kategorija}</span>
              <h1 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.5px", marginBottom: 8 }}>
                {vodic.naziv}
              </h1>
              <p style={{ fontSize: 14, color: "var(--tekst-muted)" }}>{vodic.opis}</p>
              <div style={{ fontSize: 13, color: "var(--zelena)", fontWeight: 600, marginTop: 6 }}>
                {vodic.koraci.length} koraka · {vodic.minCitanja} min čitanja
              </div>
            </div>
          </div>

          {/* Pregled koraka */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--tekst-muted)", marginBottom: 12 }}>Pregled koraka</div>
            {vodic.koraci.map((korak) => (
              <a key={korak.broj} href={`#korak-${korak.broj}`} style={{ display: "flex", gap: 10, padding: "6px 0", textDecoration: "none", color: "var(--tekst-muted)", fontSize: 13, transition: "color 0.15s" }} className="hover:text-zelena">
                <span style={{ color: "var(--zelena)", fontWeight: 700, minWidth: 20 }}>{korak.broj}.</span>
                {korak.naslov}
              </a>
            ))}
          </div>

          {/* Koraci */}
          <div>
            {vodic.koraci.map((korak, i) => (
              <div
                key={korak.broj}
                id={`korak-${korak.broj}`}
                style={{ marginBottom: 28, paddingBottom: 28, borderBottom: i < vodic.koraci.length - 1 ? "1px solid var(--border)" : "none" }}
              >
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--zelena)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                    {korak.broj}
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3, paddingTop: 6 }}>{korak.naslov}</h2>
                </div>
                <div style={{ marginLeft: 52 }}>
                  <p style={{ fontSize: 15, lineHeight: 1.75, color: "var(--tekst)", marginBottom: korak.savjet ? 12 : 0 }}>
                    {korak.opis}
                  </p>
                  {korak.savjet && (
                    <div style={{ background: "var(--zelena-svijetla)", border: "1px solid var(--zelena)", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 16 }}>💡</span>
                      <span style={{ fontSize: 13, color: "var(--zelena-tamna)", lineHeight: 1.5 }}>{korak.savjet}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA na kraju — Newsletter */}
          <div style={{ background: "var(--zelena-svijetla)", border: "1px solid var(--zelena)", borderRadius: 12, padding: 24, marginTop: 8 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--zelena-tamna)" }}>Ostani informisan</h3>
            <p style={{ fontSize: 13, color: "var(--zelena-tamna)", marginBottom: 14, lineHeight: 1.5, opacity: 0.85 }}>
              Svake nedjelje ujutro šaljemo najvažnije vijesti i promjene za dijasporu.
            </p>
            <a href="/newsletter" style={{ display: "inline-block", padding: "10px 20px", background: "var(--zelena)", color: "white", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              Pretplati se na digest →
            </a>
          </div>
        </article>

        {/* Sidebar */}
        <aside>
          <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", position: "sticky", top: 76 }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--tekst-muted)" }}>
              Ostali vodiči
            </div>
            {vodici.filter(v => v.slug !== vodic.slug).slice(0, 5).map((v, i) => (
              <Link
                key={v.id}
                href={`/vodic/${v.slug}`}
                style={{ display: "flex", gap: 10, padding: "12px 16px", borderBottom: i < 4 ? "1px solid var(--border)" : "none", textDecoration: "none", color: "inherit", transition: "background 0.15s", alignItems: "center" }}
                className="hover:bg-[#fafafa]"
              >
                <span style={{ fontSize: 18 }}>{v.ikona}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{v.naziv}</div>
                  <div style={{ fontSize: 10, color: "var(--zelena)", marginTop: 2 }}>{v.koraci.length} koraka</div>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>

      <Footer />
      <style>{`
        @media (max-width: 768px) {
          .vodic-layout { grid-template-columns: 1fr !important; }
          .vodic-layout aside { display: none !important; }
        }
      `}</style>
    </>
  );
}
