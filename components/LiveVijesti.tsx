import Link from "next/link";
import { dajLiveDE, dajLiveBIH, MOCK_DE, MOCK_BIH, type LiveStavka } from "@/lib/live";

// ============================================================
// LIVE VIJESTI (v19) — 🇩🇪 lijevo, 🇧🇦 desno, po 6 vijesti,
// LIVE badge, linkovi vode na ORIGINALNE članke (RSS wire).
// ============================================================

function Stavka({ v, de }: { v: LiveStavka; de?: boolean }) {
  const vanjski = v.link !== "#";
  return (
    <a
      href={vanjski ? v.link : "#"}
      target={vanjski ? "_blank" : undefined}
      rel={vanjski ? "noopener noreferrer" : undefined}
      className="live-item"
    >
      <span className={`live-izvor${de ? " de" : ""}`}>{v.izvor}</span>
      <span className="live-naslov">{v.naslov}</span>
      <span className="live-vrijeme">{v.vrijemeAgo}</span>
    </a>
  );
}

export default async function LiveVijesti() {
  const [deRss, bihRss] = await Promise.all([dajLiveDE(6), dajLiveBIH(6)]);
  const de = deRss.length > 0 ? deRss : MOCK_DE;
  const bih = bihRss.length > 0 ? bihRss : MOCK_BIH;

  return (
    <div className="live-wrap">
      <div className="live-grid">
        {/* 🇩🇪 NJEMAČKA — LIJEVO */}
        <div className="live-box">
          <div className="live-header">
            <span className="live-flag">🇩🇪</span>
            <span className="live-title">Vijesti iz Njemačke</span>
            <span className="live-dot" />
            <span className="live-badge">LIVE</span>
          </div>
          <div className="live-list">
            {de.map((v, i) => (
              <Stavka key={i} v={v} de />
            ))}
          </div>
          <Link href="/de" className="live-vise">
            Sve vijesti iz Njemačke →
          </Link>
        </div>

        {/* 🇧🇦 BIH — DESNO */}
        <div className="live-box">
          <div className="live-header">
            <span className="live-flag">🇧🇦</span>
            <span className="live-title">Vijesti iz BiH</span>
            <span className="live-dot" />
            <span className="live-badge">LIVE</span>
          </div>
          <div className="live-list">
            {bih.map((v, i) => (
              <Stavka key={i} v={v} />
            ))}
          </div>
          <Link href="/bih" className="live-vise">
            Sve vijesti iz BiH →
          </Link>
        </div>
      </div>
    </div>
  );
}
