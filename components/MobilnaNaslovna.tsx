import Link from "next/link";
import {
  dajLiveDE, dajLiveSvijet, dajLiveSport,
  MOCK_DE, MOCK_SVIJET, MOCK_SPORT,
  type LiveStavka,
} from "@/lib/live";

// ============================================================
// MOBILNA NASLOVNA — 4 jednake kutije (DE, BiH, Svijet, Sport)
// ============================================================
// Prikazuje se SAMO na telefonu (klasa "samo-mob" u page.tsx).
// Sve kutije istog izgleda: slika (klix stil) + izvor + naslov + vrijeme,
// idu skroz do ivica ekrana. Slika je siva kutija kad članak nema sliku.

function Kutija({
  naslov, emoji, href, stavke,
}: {
  naslov: string;
  emoji: string;
  href: string;
  stavke: LiveStavka[];
}) {
  const lista = stavke.slice(0, 5);
  if (lista.length === 0) return null;

  return (
    <div className="mob-box">
      <div className="mob-box-head">
        <span className="mob-box-title">
          <span className="mob-box-emoji">{emoji}</span> {naslov}
        </span>
        <Link href={href} className="mob-box-sve">Sve →</Link>
      </div>
      {lista.map((v, i) => {
        const link = v.link || "#";
        const jeInterni = link.startsWith("/");
        const sadrzaj = (
          <>
            {v.slika ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v.slika} alt="" className="mob-thumb" />
            ) : (
              <span className="mob-thumb" />
            )}
            <span className="mob-txt">
              <span className="mob-izvor">{v.izvor}</span>
              <span className="mob-naslov">{v.naslov}</span>
              <span className="mob-vrijeme">{v.vrijemeAgo}</span>
            </span>
          </>
        );
        return jeInterni ? (
          <Link key={i} href={link} className="mob-item">{sadrzaj}</Link>
        ) : (
          <a key={i} href={link !== "#" ? link : undefined} target="_blank" rel="noopener noreferrer" className="mob-item">{sadrzaj}</a>
        );
      })}
    </div>
  );
}

export default async function MobilnaNaslovna() {
  const [de, svijet, sport] = await Promise.all([
    dajLiveDE(5), dajLiveSvijet(5), dajLiveSport(5),
  ]);

  return (
    <div className="samo-mob mob-kutije">
      <Kutija naslov="Vijesti iz Njemačke" emoji="🇩🇪" href="/de" stavke={de.length ? de : MOCK_DE} />
      <Kutija naslov="Iz svijeta" emoji="🌍" href="/kategorija/svijet" stavke={svijet.length ? svijet : MOCK_SVIJET} />
      <Kutija naslov="Sport" emoji="⚽" href="/kategorija/sport" stavke={sport.length ? sport : MOCK_SPORT} />

      <style>{`
        .mob-kutije { flex-direction: column; gap: 10px; padding: 0; background: var(--bg); }
        .mob-box { background: #fff; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .mob-box-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-bottom: 1px solid var(--border); }
        .mob-box-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px; display: flex; align-items: center; gap: 8px; color: var(--tekst); }
        .mob-box-emoji { font-size: 18px; line-height: 1; }
        .mob-box-sve { font-size: 12px; font-weight: 700; color: var(--zelena); white-space: nowrap; }
        .mob-item { display: flex; gap: 12px; align-items: center; padding: 11px 14px; border-bottom: 1px solid #f3f4f6; text-decoration: none; color: inherit; }
        .mob-item:last-of-type { border-bottom: none; }
        .mob-item:active { background: var(--bg); }
        .mob-thumb { width: 116px; height: 82px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background-color: #e5e7eb; display: block; }
        .mob-txt { flex: 1; min-width: 0; display: block; }
        .mob-izvor { font-size: 10px; font-weight: 700; color: var(--zelena-tamna); background: var(--zelena-svijetla); padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 5px; }
        .mob-naslov { font-size: 14px; font-weight: 600; line-height: 1.35; color: var(--tekst); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .mob-vrijeme { font-size: 11px; color: var(--tekst-light); margin-top: 5px; display: block; }
      `}</style>
    </div>
  );
}
