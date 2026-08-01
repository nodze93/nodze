"use client";

import { useEffect, useState } from "react";

interface Store {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  ponuda: number;
  saSlikomPct: number;
}

export default function AkcijeProdavnice() {
  const [items, setItems] = useState<Store[] | null>(null);
  const [datum, setDatum] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/akcije/liste?what=prodavnice", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        setItems(j.items || []);
        setDatum(j.datum);
      });
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Prodavnice</h1>
      <div style={{ color: "#6b7280", fontSize: 13.5, margin: "4px 0 18px" }}>
        Sve prodavnice u sistemu · brojevi za {datum || "danas"}
      </div>

      <div style={panel}>
        {!items ? (
          <div style={empty}>Učitavam…</div>
        ) : items.length === 0 ? (
          <div style={empty}>Još nema prodavnica.</div>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Prodavnica</th>
                <th style={th}>Slug</th>
                <th style={{ ...th, textAlign: "right" }}>Ponuda danas</th>
                <th style={{ ...th, textAlign: "right" }}>Sa slikom</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td style={{ ...td, fontWeight: 700 }}>{s.name}</td>
                  <td style={{ ...td, color: "#9ca3af" }}>{s.slug}</td>
                  <td style={{ ...td, textAlign: "right", color: s.ponuda === 0 ? "#dc2626" : "#111" }}>{s.ponuda}</td>
                  <td style={{ ...td, textAlign: "right", color: "#6b7280" }}>{s.ponuda ? s.saSlikomPct + "%" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const panel: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "8px 14px", overflowX: "auto" };
const empty: React.CSSProperties = { color: "#6b7280", fontSize: 13.5, padding: "22px 4px" };
const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 480 };
const th: React.CSSProperties = { textAlign: "left", fontSize: 11, letterSpacing: 0.4, textTransform: "uppercase", color: "#9ca3af", fontWeight: 700, padding: 10, borderBottom: "1px solid #f0f1f3" };
const td: React.CSSProperties = { padding: "12px 10px", borderBottom: "1px solid #f4f5f6" };
