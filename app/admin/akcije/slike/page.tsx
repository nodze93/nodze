"use client";

// ============================================================
// AKCIJE — SLIKE (moderacija). Tabovi + Potvrdi/Odbaci + pokrivenost.
// "Okači svoju" = zalijepi URL slike (bez file-storagea zasad).
// ============================================================

import { useCallback, useEffect, useState } from "react";

type Tab = "nesigurno" | "bez-slike" | "odbaceno" | "potvrdjene";

interface Item {
  product_key: string;
  artikal: string;
  prodavnica: string;
  ean: string | null;
  image_url: string | null;
  izvor: string;
  licenca: string;
  poklapanje: string;
  score?: number | null;
  bezSlike?: boolean;
}
interface Cover {
  source: string;
  licence: string;
  broj: number;
  udio: number;
}
interface Data {
  tab: Tab;
  datum: string | null;
  brojaci: { nesigurno: number; bezSlike: number; odbaceno: number; potvrdjene: number };
  items: Item[];
  pokrivenost: Cover[];
  ukupno: number;
  greska?: string;
}

const TABS: { key: Tab; label: string }[] = [
  { key: "nesigurno", label: "Nesigurno spajanje" },
  { key: "bez-slike", label: "Bez slike" },
  { key: "odbaceno", label: "Odbačeno" },
  { key: "potvrdjene", label: "Potvrđene" },
];

export default function AkcijeSlike() {
  const [tab, setTab] = useState<Tab>("nesigurno");
  const [d, setD] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async (t: Tab) => {
    setLoading(true);
    const r = await fetch(`/api/admin/akcije/slike?tab=${t}`, { cache: "no-store" });
    setD(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  async function act(product_key: string, body: Record<string, unknown>) {
    setBusy(product_key);
    await fetch("/api/admin/akcije/slike", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_key, ...body }),
    });
    setBusy(null);
    load(tab);
  }

  function okaciSvoju(product_key: string) {
    const url = window.prompt("Zalijepi URL slike (mora biti https://…):");
    if (url && /^https?:\/\//i.test(url)) act(product_key, { image_url: url.trim() });
    else if (url) alert("URL mora počinjati sa http(s)://");
  }

  const b = d?.brojaci;

  return (
    <div>
      <div className="sl-hd">
        <div>
          <h1 className="sl-h1">Slike</h1>
          <div className="sl-sub">
            {b ? `${b.nesigurno + b.bezSlike} artikala traže odluku` : "…"} · svaka slika nosi izvor i osnov korištenja
          </div>
        </div>
      </div>

      {d?.greska && <div className="sl-err">Baza ne odgovara / šema nije tu. ({d.greska})</div>}

      {/* Tabovi */}
      <div className="sl-tabs">
        {TABS.map((t) => {
          const n =
            t.key === "nesigurno" ? b?.nesigurno : t.key === "bez-slike" ? b?.bezSlike : t.key === "odbaceno" ? b?.odbaceno : b?.potvrdjene;
          return (
            <button key={t.key} className={`sl-tab${tab === t.key ? " active" : ""}`} onClick={() => setTab(t.key)}>
              {t.label} {n != null && <b>{n}</b>}
            </button>
          );
        })}
      </div>

      {/* Tabela */}
      <div className="sl-panel">
        {loading ? (
          <div className="sl-empty">Učitavam…</div>
        ) : !d || d.items.length === 0 ? (
          <div className="sl-empty">Nema stavki u ovom tabu.</div>
        ) : (
          <table className="sl-table">
            <thead>
              <tr>
                <th>Prijedlog</th>
                <th>Artikal</th>
                <th>Prodavnica</th>
                <th>EAN</th>
                <th>Izvor / osnov</th>
                <th>Poklapanje</th>
                <th className="r">Radnja</th>
              </tr>
            </thead>
            <tbody>
              {d.items.map((it) => (
                <tr key={it.product_key}>
                  <td>
                    {it.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="sl-thumb" src={it.image_url} alt="" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="sl-thumb sl-thumb-x">?</span>
                    )}
                  </td>
                  <td className="b">{it.artikal}</td>
                  <td className="muted">{it.prodavnica}</td>
                  <td className="muted">{it.ean ? it.ean.slice(0, 8) + "…" : "—"}</td>
                  <td>
                    <div className="sl-src">{it.izvor}</div>
                    <div className="sl-lic">{it.licenca}</div>
                  </td>
                  <td>
                    <span className={"sl-match " + matchClass(it)}>{it.poklapanje}</span>
                  </td>
                  <td className="r">
                    <div className="sl-actions">
                      {it.bezSlike ? (
                        <button className="sl-btn ghost" disabled={busy === it.product_key} onClick={() => okaciSvoju(it.product_key)}>
                          ↑ Okači svoju
                        </button>
                      ) : tab === "potvrdjene" ? (
                        <button className="sl-btn ghost" disabled={busy === it.product_key} onClick={() => act(it.product_key, { action: "reject" })}>
                          Odbaci
                        </button>
                      ) : tab === "odbaceno" ? (
                        <button className="sl-btn primary" disabled={busy === it.product_key} onClick={() => act(it.product_key, { action: "confirm" })}>
                          Ipak prihvati
                        </button>
                      ) : (
                        <>
                          <button className="sl-btn primary" disabled={busy === it.product_key} onClick={() => act(it.product_key, { action: "confirm" })}>
                            Potvrdi
                          </button>
                          <button className="sl-btn ghost" disabled={busy === it.product_key} onClick={() => act(it.product_key, { action: "reject" })}>
                            Odbaci
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pokrivenost slikama */}
      {d && d.pokrivenost.length > 0 && (
        <div className="sl-panel" style={{ marginTop: 18 }}>
          <div className="sl-cover-hd">
            <b>Pokrivenost slikama</b> <span className="muted">danas · {d.ukupno} artikala</span>
          </div>
          <table className="sl-table">
            <thead>
              <tr>
                <th>Izvor</th>
                <th className="r">Artikala</th>
                <th className="r">Udio</th>
                <th>Osnov korištenja</th>
              </tr>
            </thead>
            <tbody>
              {d.pokrivenost.map((c) => (
                <tr key={c.source}>
                  <td className="b">{c.source}</td>
                  <td className="r">{c.broj}</td>
                  <td className="r muted">{c.udio}%</td>
                  <td className="muted">{c.licence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="sl-note">
        Trenutno realno imamo <b>Open Food Facts</b> + ilustraciju. Icecat (brendirana roba) i Stock/Pexels
        (generička roba) nisu još povezani — to je sljedeći korak. „Okači svoju" zasad prima URL slike.
      </div>

      <style>{`
        .sl-h1 { font-size: 26px; font-weight: 800; margin: 0; }
        .sl-sub { color: #6b7280; font-size: 13.5px; margin: 4px 0 18px; }
        .sl-err { background:#fef2f2; color:#b91c1c; border:1px solid #fecaca; border-radius:10px; padding:12px 14px; font-size:13px; margin-bottom:16px; }
        .sl-tabs { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
        .sl-tab { background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:9px 14px; font-size:13.5px; font-weight:600; color:#4b5563; cursor:pointer; }
        .sl-tab b { color:#2563eb; margin-left:4px; }
        .sl-tab.active { background:#eff4ff; border-color:#bfdbfe; color:#2563eb; }
        .sl-panel { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:8px 12px; overflow-x:auto; }
        .sl-empty { color:#6b7280; font-size:13.5px; padding:22px 8px; }
        .sl-table { width:100%; border-collapse:collapse; font-size:13.5px; min-width:720px; }
        .sl-table th { text-align:left; font-size:11px; letter-spacing:.4px; text-transform:uppercase; color:#9ca3af; font-weight:700; padding:10px; border-bottom:1px solid #f0f1f3; }
        .sl-table th.r, .sl-table td.r { text-align:right; }
        .sl-table td { padding:12px 10px; border-bottom:1px solid #f4f5f6; vertical-align:middle; }
        .sl-table tr:last-child td { border-bottom:none; }
        .sl-table td.b { font-weight:700; }
        .sl-table td.muted { color:#9ca3af; }
        .sl-thumb { width:44px; height:44px; border-radius:9px; object-fit:contain; background:#f6f7f9; border:1px solid #eef0f2; display:inline-block; }
        .sl-thumb-x { display:inline-flex; align-items:center; justify-content:center; color:#c4c9d0; font-weight:700; }
        .sl-src { font-weight:600; font-size:12.5px; }
        .sl-lic { font-size:11px; color:#9ca3af; }
        .sl-match { font-size:11.5px; font-weight:600; padding:3px 9px; border-radius:999px; white-space:nowrap; }
        .sl-match.ok { background:#ecfdf3; color:#16a34a; }
        .sl-match.warn { background:#fff7ed; color:#c2620c; }
        .sl-match.bad { background:#fef2f2; color:#dc2626; }
        .sl-actions { display:inline-flex; gap:6px; justify-content:flex-end; }
        .sl-btn { padding:7px 13px; border-radius:8px; font-size:12.5px; font-weight:700; cursor:pointer; border:1px solid transparent; }
        .sl-btn.primary { background:#2563eb; color:#fff; }
        .sl-btn.ghost { background:#fff; color:#4b5563; border-color:#e5e7eb; }
        .sl-btn:disabled { opacity:.5; cursor:default; }
        .sl-cover-hd { padding:10px; }
        .sl-note { color:#9ca3af; font-size:12px; margin-top:14px; line-height:1.5; }
      `}</style>
    </div>
  );
}

function matchClass(it: Item): string {
  if (it.bezSlike) return "bad";
  if (/EAN, tačno|ručno/.test(it.poklapanje)) return "ok";
  if (it.score != null && it.score < 0.5) return "bad";
  return "warn";
}
