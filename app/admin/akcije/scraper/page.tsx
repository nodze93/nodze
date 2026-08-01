"use client";

import { useEffect, useState } from "react";

const WORKFLOW = "https://github.com/nodze93/nodze/actions/workflows/akcije-scraper.yml";

interface Run {
  store: string;
  plz: string;
  datum: string;
  artikala: number;
  trajanje: string;
  status: string;
  error: string | null;
  vrijeme: string;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  ok: { label: "U redu", cls: "ok" },
  empty: { label: "Prazno", cls: "bad" },
  error: { label: "Greška", cls: "bad" },
};

export default function AkcijeScraper() {
  const [items, setItems] = useState<Run[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/akcije/scraper", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setItems(j.items || []));
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Scraper</h1>
          <div style={{ color: "#6b7280", fontSize: 13.5, margin: "4px 0 18px" }}>
            Historija prolaza (ak_scrape_runs). Cron se pali dnevno na GitHub Actions.
          </div>
        </div>
        <a href={WORKFLOW} target="_blank" rel="noopener noreferrer" style={runBtn}>▶ Pokreni / Log na GitHubu</a>
      </div>

      <div style={panel}>
        {!items ? (
          <div style={empty}>Učitavam…</div>
        ) : items.length === 0 ? (
          <div style={empty}>Još nema zapisa o prolazima.</div>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Vrijeme</th>
                <th style={th}>Prodavnica</th>
                <th style={th}>PLZ</th>
                <th style={{ ...th, textAlign: "right" }}>Artikala</th>
                <th style={{ ...th, textAlign: "right" }}>Trajanje</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r, i) => {
                const st = STATUS[r.status] || { label: r.status, cls: "bad" };
                return (
                  <tr key={i}>
                    <td style={{ ...td, color: "#6b7280", whiteSpace: "nowrap" }}>{r.vrijeme}</td>
                    <td style={{ ...td, fontWeight: 700 }}>{r.store}</td>
                    <td style={{ ...td, color: "#9ca3af" }}>{r.plz}</td>
                    <td style={{ ...td, textAlign: "right", color: r.artikala === 0 ? "#dc2626" : "#111" }}>{r.artikala}</td>
                    <td style={{ ...td, textAlign: "right", color: "#6b7280" }}>{r.trajanje}</td>
                    <td style={td}>
                      <span className={"scr-b " + st.cls} title={r.error || ""}>{st.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .scr-b { display:inline-block; font-size:12px; font-weight:600; padding:3px 10px; border-radius:999px; }
        .scr-b.ok { background:#ecfdf3; color:#16a34a; }
        .scr-b.bad { background:#fef2f2; color:#dc2626; }
      `}</style>
    </div>
  );
}

const runBtn: React.CSSProperties = { padding: "10px 16px", background: "#2563eb", color: "#fff", borderRadius: 9, fontSize: 13.5, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" };
const panel: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "8px 14px", overflowX: "auto" };
const empty: React.CSSProperties = { color: "#6b7280", fontSize: 13.5, padding: "22px 4px" };
const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 560 };
const th: React.CSSProperties = { textAlign: "left", fontSize: 11, letterSpacing: 0.4, textTransform: "uppercase", color: "#9ca3af", fontWeight: 700, padding: 10, borderBottom: "1px solid #f0f1f3" };
const td: React.CSSProperties = { padding: "12px 10px", borderBottom: "1px solid #f4f5f6" };
