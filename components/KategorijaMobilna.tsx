import Link from "next/link";

// ============================================================
// KATEGORIJA — MOBILNI IZGLED (kao naslovna)
// ============================================================
// Prikazuje se SAMO na telefonu (klasa "kat-mob"). Gore jedan naslovni
// članak (zadnji objavljeni) s velikom slikom, ispod ostali kao kartice
// sa slikom + naslov + vrijeme — ista forma kao kutije na naslovnoj.
// Kutije idu skroz do ivica ekrana (klix stil).

export interface KatMobStavka {
  slug: string;
  naslov: string;
  slika?: string | null;
  meta: string; // npr. "5. jul · 4 min čitanja"
  oznaka?: string; // izvor ili kategorija (samo na naslovnom članku)
}

export default function KategorijaMobilna({ stavke }: { stavke: KatMobStavka[] }) {
  if (!stavke || stavke.length === 0) return null;
  const hero = stavke[0];
  const ostali = stavke.slice(1);

  return (
    <div className="kat-mob">
      {/* Naslovni članak */}
      <Link href={`/clanak/${hero.slug}`} className="katm-hero">
        {hero.slika ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero.slika} alt="" className="katm-hero-img" />
        ) : (
          <span className="katm-hero-img" />
        )}
        <span className="katm-hero-txt">
          {hero.oznaka ? <span className="katm-hero-oznaka">{hero.oznaka}</span> : null}
          <span className="katm-hero-naslov">{hero.naslov}</span>
          <span className="katm-hero-meta">{hero.meta}</span>
        </span>
      </Link>

      {/* Ostali članci — kartice */}
      {ostali.length > 0 && (
        <div className="katm-lista">
          {ostali.map((c) => (
            <Link key={c.slug} href={`/clanak/${c.slug}`} className="katm-item">
              {c.slika ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.slika} alt="" className="katm-thumb" />
              ) : (
                <span className="katm-thumb" />
              )}
              <span className="katm-txt">
                <span className="katm-naslov">{c.naslov}</span>
                <span className="katm-meta">{c.meta}</span>
              </span>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .kat-mob { display: none; }
        @media (max-width: 768px) {
          .kat-mob { display: block; background: var(--bg); }
        }
        .katm-hero { display: block; text-decoration: none; color: inherit; background: #fff; border-bottom: 1px solid var(--border); }
        .katm-hero-img { width: 100%; height: 210px; object-fit: cover; display: block; background-color: #e5e7eb; }
        .katm-hero-txt { display: block; padding: 12px 14px 15px; }
        .katm-hero-oznaka { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px; color: var(--zelena-tamna); background: var(--zelena-svijetla); padding: 3px 7px; border-radius: 4px; display: inline-block; margin-bottom: 8px; }
        .katm-hero-naslov { font-size: 20px; font-weight: 800; line-height: 1.3; color: var(--tekst); display: block; margin-bottom: 7px; }
        .katm-hero-meta { font-size: 12px; color: var(--tekst-light); display: block; }
        .katm-lista { background: #fff; margin-top: 10px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .katm-item { display: flex; gap: 12px; align-items: center; padding: 11px 14px; border-bottom: 1px solid #f3f4f6; text-decoration: none; color: inherit; }
        .katm-item:last-of-type { border-bottom: none; }
        .katm-item:active { background: var(--bg); }
        .katm-thumb { width: 116px; height: 82px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background-color: #e5e7eb; display: block; }
        .katm-txt { flex: 1; min-width: 0; display: block; }
        .katm-naslov { font-size: 14px; font-weight: 600; line-height: 1.35; color: var(--tekst); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .katm-meta { font-size: 11px; color: var(--tekst-light); margin-top: 5px; display: block; }
      `}</style>
    </div>
  );
}
