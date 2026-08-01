"use client";

// ============================================================
// AKCIJE — PREGLED (dashboard). Stat-kartice + Zdravlje scrapera
// iz stvarnih podataka (/api/admin/akcije/dashboard).
// "Pokreni scrape" / "Log" vode na GitHub Actions (tamo se pali cron).
// ============================================================

import { useCallback, useEffect, useState } from "react";

const AKCIJE_WORKFLOW =
  "https://github.com/nodze93/nodze/actions/workflows/akcije-scraper.yml";

interface HealthRow {
  store: string;
  plz: string;
  danas: number;
  juce: number;
  promjena: number | null;
  trajanje: string;
  status: string;
  ok: boolean;
}
interface Dash {
  plz: string;
  plzList: string[];
  datum: string | null;
  zadnjiScrape: string;
  pali: number;
  ponudaDanas: number;
  ponudaJuce: number;
  ponudaDelta: number;
  saSlikom: number;
  saSlikomPct: number;
  popusti: number;
  zdravlje: HealthRow[];
  greska?: string;
}

function datumBs(d: string | null): string {
  if (!d) return "—";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("bs-BA", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

export default function AkcijePregled() {
  const [plz, setPlz] = useState<string>("");
  const [d, setD] = useState<Dash | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p?: string) => {
    setLoading(true);
    const url = "/api/admin/akcije/dashboard" + (p ? `?plz=${p}` : "");
    const r = await fetch(url, { cache: "no-store" });
    const j: Dash = await r.json();
    setD(j);
    setPlz(j.plz);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      {/* Zaglavlje */}
      <div className="pg-hd">
        <div>
          <h1 className="pg-h1">Pregled</h1>
          <div className="pg-sub">
            {d ? datumBs(d.datum) : "…"} · zadnji scrape {d?.zadnjiScrape ?? "—"}
          </div>
        </div>
        <div className="pg-actions">
          {d && d.plzList.length > 0 && (
            <select
              value={plz}
              onChange={(e) => {
                setPlz(e.target.value);
                load(e.target.value);
              }}
              className="pg-select"
            >
              {d.plzList.map((p) => (
                <option key={p} value={p}>
                  PLZ: {p}
                </option>
              ))}
            </select>
          )}
          <a href={AKCIJE_WORKFLOW} target="_blank" rel="noopener noreferrer" className="pg-run">
            ▶ Pokreni scrape
          </a>
        </div>
      </div>

      {d?.greska && (
        <div className="pg-err">
          Baza još ne odgovara ili šema nije postavljena. ({d.greska})
        </div>
      )}

      {/* Stat kartice */}
      <div className="pg-cards">
        <Card
          title="Zadnji scrape"
          value={d?.zadnjiScrape ?? "—"}
          sub={d && d.pali > 0 ? `⚠ ${d.pali} ${d.pali === 1 ? "prodavnica pala" : "prodavnice pale"}` : "sve u redu"}
          bad={!!d && d.pali > 0}
        />
        <Card
          title="Ponuda danas"
          value={d ? String(d.ponudaDanas) : "—"}
          sub={
            d
              ? d.ponudaDelta === 0
                ? "isto kao juče"
                : `${d.ponudaDelta > 0 ? "↑" : "↓"} ${Math.abs(d.ponudaDelta)} u odnosu na juče`
              : ""
          }
          bad={!!d && d.ponudaDelta < 0}
        />
        <Card
          title="Sa slikom"
          value={d ? `${d.saSlikomPct}%` : "—"}
          sub={d ? `${d.saSlikom} od ${d.ponudaDanas}` : ""}
        />
        <Card
          title="Izračunatih popusta"
          value={d ? String(d.popusti) : "—"}
          sub={d ? "artikala sa starom cijenom" : ""}
        />
      </div>

      {/* Zdravlje scrapera */}
      <div className="pg-panel">
        <div className="pg-panel-hd">
          <div>
            <b>Zdravlje scrapera</b>
            <span className="pg-panel-sub"> poređenje sa jučerašnjim danom · pad preko 40% se označava</span>
          </div>
          <a href={AKCIJE_WORKFLOW} target="_blank" rel="noopener noreferrer" className="pg-log">
            Log / Ponovi pale ↗
          </a>
        </div>

        {loading ? (
          <div className="pg-empty">Učitavam…</div>
        ) : !d || d.zdravlje.length === 0 ? (
          <div className="pg-empty">
            Nema zapisa o scrape-u za ovaj PLZ. (Prazno dok scraper ne upiše prvi prolaz.)
          </div>
        ) : (
          <table className="pg-table">
            <thead>
              <tr>
                <th>Prodavnica</th>
                <th>PLZ</th>
                <th className="r">Danas</th>
                <th className="r">Juče</th>
                <th className="r">Promjena</th>
                <th className="r">Trajanje</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {d.zdravlje.map((z) => (
                <tr key={z.store}>
                  <td className="b">{z.store}</td>
                  <td className="muted">{z.plz}</td>
                  <td className="r">{z.danas}</td>
                  <td className="r muted">{z.juce}</td>
                  <td className={"r " + (z.promjena == null ? "muted" : z.promjena < 0 ? "neg" : "pos")}>
                    {z.promjena == null ? "—" : `${z.promjena > 0 ? "+" : ""}${z.promjena}%`}
                  </td>
                  <td className="r muted">{z.trajanje}</td>
                  <td>
                    <span className={"pg-badge " + (z.ok ? "ok" : "bad")}>
                      <i /> {z.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="pg-note">
        Napomena: prikazani su samo lanci koje stvarno skidamo (Aldi Süd, Aldi Nord, Kaufland).
        Ostali (Lidl, REWE, Netto, Edeka, dm, OBI) pojaviće se kad im dodamo izvor (marktguru uvoz / crawler).
      </div>

      <style>{`
        .pg-hd { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
        .pg-h1 { font-size: 26px; font-weight: 800; margin: 0; }
        .pg-sub { color: #6b7280; font-size: 13.5px; margin-top: 4px; }
        .pg-actions { display: flex; gap: 10px; align-items: center; }
        .pg-select { padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 9px; background: #fff; font-size: 13.5px; font-weight: 600; cursor: pointer; }
        .pg-run { padding: 10px 16px; background: #2563eb; color: #fff; border-radius: 9px; font-size: 13.5px; font-weight: 700; text-decoration: none; white-space: nowrap; }
        .pg-err { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; border-radius: 10px; padding: 12px 14px; font-size: 13px; margin-bottom: 16px; }
        .pg-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
        .pg-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 18px 18px 16px; }
        .pg-card-t { font-size: 12.5px; color: #6b7280; font-weight: 600; }
        .pg-card-v { font-size: 30px; font-weight: 800; margin: 6px 0 4px; letter-spacing: -.5px; }
        .pg-card-s { font-size: 12px; color: #6b7280; }
        .pg-card-s.bad { color: #dc2626; }
        .pg-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 18px 20px; }
        .pg-panel-hd { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
        .pg-panel-sub { color: #9ca3af; font-size: 12.5px; font-weight: 400; }
        .pg-log { font-size: 12.5px; color: #2563eb; text-decoration: none; font-weight: 600; }
        .pg-empty { color: #6b7280; font-size: 13.5px; padding: 18px 4px; }
        .pg-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
        .pg-table th { text-align: left; font-size: 11px; letter-spacing: .5px; text-transform: uppercase; color: #9ca3af; font-weight: 700; padding: 8px 10px; border-bottom: 1px solid #f0f1f3; }
        .pg-table th.r, .pg-table td.r { text-align: right; }
        .pg-table td { padding: 12px 10px; border-bottom: 1px solid #f4f5f6; }
        .pg-table tr:last-child td { border-bottom: none; }
        .pg-table td.b { font-weight: 700; }
        .pg-table td.muted { color: #9ca3af; }
        .pg-table td.pos { color: #16a34a; font-weight: 700; }
        .pg-table td.neg { color: #dc2626; font-weight: 700; }
        .pg-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; padding: 3px 10px; border-radius: 999px; }
        .pg-badge i { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
        .pg-badge.ok { background: #ecfdf3; color: #16a34a; } .pg-badge.ok i { background: #16a34a; }
        .pg-badge.bad { background: #fef2f2; color: #dc2626; } .pg-badge.bad i { background: #dc2626; }
        .pg-note { color: #9ca3af; font-size: 12px; margin-top: 14px; line-height: 1.5; }
        @media (max-width: 860px) { .pg-cards { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 520px) { .pg-cards { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

function Card({ title, value, sub, bad }: { title: string; value: string; sub?: string; bad?: boolean }) {
  return (
    <div className="pg-card">
      <div className="pg-card-t">{title}</div>
      <div className="pg-card-v">{value}</div>
      {sub ? <div className={"pg-card-s" + (bad ? " bad" : "")}>{sub}</div> : null}
    </div>
  );
}
