import Link from "next/link";
import { dajLiveDE, MOCK_DE, type LiveStavka } from "@/lib/live";

// ============================================================
// LIVE VIJESTI — 🇩🇪 Njemačka (puna širina), 6 vijesti, LIVE badge.
// BiH kutija uklonjena (portal fokusiran na Njemačku/svijet/sport).
// ============================================================

function Stavka({ v, de }: { v: LiveStavka; de?: boolean }) {
  const sadrzaj = (
    <>
      <span className={`live-izvor${de ? " de" : ""}`}>{v.izvor}</span>
      <span className="live-naslov">{v.naslov}</span>
      <span className="live-vrijeme">{v.vrijemeAgo}</span>
    </>
  );

  // Naši članci (i fallback) su interni linkovi → koristi Next Link,
  // ne otvaraj novi tab. Vanjske linkove (ako ih ikad bude) otvori vani.
  if (v.link.startsWith("/")) {
    return (
      <Link href={v.link} className="live-item">
        {sadrzaj}
      </Link>
    );
  }
  return (
    <a
      href={v.link !== "#" ? v.link : undefined}
      target="_blank"
      rel="noopener noreferrer"
      className="live-item"
    >
      {sadrzaj}
    </a>
  );
}

export default async function LiveVijesti() {
  const deRss = await dajLiveDE(6);
  const de = deRss.length > 0 ? deRss : MOCK_DE;

  return (
    <div className="live-wrap">
      <div className="live-grid" style={{ gridTemplateColumns: "1fr" }}>
        {/* 🇩🇪 NJEMAČKA — puna širina */}
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
      </div>
    </div>
  );
}
