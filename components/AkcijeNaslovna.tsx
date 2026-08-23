"use client";

// ============================================================
//  AKCIJE NA NASLOVNOJ (dodano 20.8.2026.)
// ------------------------------------------------------------
//  Do sada Akcija na naslovnoj nije bilo NIGDJE — ni jedne kartice,
//  ni linka u gornjoj traci. A to je jedini dio sajta koji se sam
//  ažurira svaki dan. Ovo je traka sa današnjim najjačim popustima.
//
//  Namjerno NE koristi `akcije.css` (koji je prefiksiran sa `.ak`) —
//  da naslovna ne zavisi od stilova te sekcije i da se ništa ne
//  može sudariti. Stilovi su lokalni, ispod.
//
//  PLZ čita iz istog localStorage ključa kao i sekcija Akcije
//  ('akcije.plz'), pa ako je korisnik već birao grad, ovdje ga vidi.
//  Ako nije, koristi se isti podrazumijevani PLZ kao tamo.
// ============================================================

import { useEffect, useState } from "react";
import Link from "next/link";

const PLZ_KEY = "akcije.plz";
const PLZ_DEFAULT = "85737";

interface Ponuda {
  id: string;
  product_name: string;
  new_price: number;
  old_price: number | null;
  discount_percent: number | null;
  store: string;
  image_url: string | null;
}

const eur = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export default function AkcijeNaslovna() {
  const [ponude, setPonude] = useState<Ponuda[]>([]);

  useEffect(() => {
    let otkazano = false;
    let plz = PLZ_DEFAULT;
    try {
      const spremljen = window.localStorage.getItem(PLZ_KEY);
      if (spremljen && /^\d{5}$/.test(spremljen)) plz = spremljen;
    } catch {
      /* privatni prozor — ostaje podrazumijevani PLZ */
    }

    fetch(`/api/akcije/discounts?plz=${plz}&sort=percent&limit=8`)
      .then((r) => r.json())
      .then((d: { items?: Ponuda[] }) => {
        if (!otkazano) setPonude((d.items ?? []).slice(0, 8));
      })
      .catch(() => {
        /* baza ne odgovara — traka se jednostavno ne prikaže */
      });

    return () => {
      otkazano = true;
    };
  }, []);

  // Bolje ništa nego prazan naslov koji nešto obećava.
  if (ponude.length === 0) return null;

  return (
    <section className="ak-nas">
      <div className="ak-nas-hd">
        <h2>🏷️ Akcije danas</h2>
        <Link href="/akcije">Sve akcije →</Link>
      </div>
      <p className="ak-nas-sub">
        Popusti iz njemačkih prodavnica — skupljamo ih svaki dan, sami.
      </p>

      <div className="ak-nas-traka">
        {ponude.map((p) => (
          <Link key={p.id} href={`/akcije/ponuda/${p.id}`} className="ak-nas-kartica">
            <div className="ak-nas-slika">
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt={p.product_name} loading="lazy" />
              ) : (
                <span className="ak-nas-bez">🛒</span>
              )}
              {p.discount_percent !== null ? (
                <span className="ak-nas-pct">-{Math.round(p.discount_percent)}%</span>
              ) : null}
            </div>
            <div className="ak-nas-ime">{p.product_name}</div>
            <div className="ak-nas-cijene">
              {p.old_price !== null ? <s>{eur.format(p.old_price)}</s> : null}
              <b>{eur.format(p.new_price)}</b>
            </div>
            <div className="ak-nas-lanac">{p.store}</div>
          </Link>
        ))}
      </div>

      <style>{`
        .ak-nas { margin: 0 0 28px; }
        .ak-nas-hd { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
        .ak-nas-hd h2 { font-size: 19px; font-weight: 800; letter-spacing: -0.3px; }
        .ak-nas-hd a { font-size: 13px; font-weight: 700; color: var(--zelena, #1a8a4a); text-decoration: none; white-space: nowrap; }
        .ak-nas-sub { font-size: 13px; color: var(--tekst-muted, #6b7280); margin: 4px 0 14px; }
        .ak-nas-traka {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .ak-nas-kartica {
          display: flex; flex-direction: column;
          background: var(--white, #fff);
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 10px;
          padding: 10px;
          text-decoration: none;
          color: inherit;
        }
        .ak-nas-kartica:hover { border-color: var(--zelena, #1a8a4a); }
        .ak-nas-slika { position: relative; height: 96px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
        .ak-nas-slika img { max-height: 96px; max-width: 100%; object-fit: contain; }
        .ak-nas-bez { font-size: 30px; opacity: 0.35; }
        .ak-nas-pct {
          position: absolute; top: 0; left: 0;
          background: #d92d20; color: #fff;
          font-size: 11px; font-weight: 800;
          padding: 2px 5px; border-radius: 5px;
        }
        .ak-nas-ime {
          font-size: 12.5px; font-weight: 600; line-height: 1.3;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden; min-height: 32px;
        }
        .ak-nas-cijene { display: flex; align-items: baseline; gap: 6px; margin-top: 6px; }
        .ak-nas-cijene s { font-size: 12px; color: var(--tekst-light, #9ca3af); }
        .ak-nas-cijene b { font-size: 15px; font-weight: 800; color: #d92d20; letter-spacing: -0.03em; }
        .ak-nas-lanac { font-size: 11px; color: var(--tekst-muted, #6b7280); margin-top: 4px; }

        @media (max-width: 900px) { .ak-nas-traka { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 640px) {
          .ak-nas { padding: 0 12px; }
          .ak-nas-traka { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </section>
  );
}
