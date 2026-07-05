"use client";
import { useEffect, useState } from "react";

interface Pretplatnik {
  id: number;
  email: string;
  datum: string;
  aktivan: boolean;
}

interface NewsletterData {
  pretplatnici: Pretplatnik[];
  ukupno: number;
  aktivnih: number;
  neaktivnih: number;
  ovoMjesec: number;
}

export default function NewsletterPage() {
  const [data, setData] = useState<NewsletterData | null>(null);
  const [pretraga, setPretraga] = useState("");
  const [filter, setFilter] = useState<"svi" | "aktivni" | "neaktivni">("svi");

  useEffect(() => {
    fetch("/api/admin/newsletter")
      .then(r => r.json())
      .then(setData);
  }, []);

  function exportCSV() {
    if (!data) return;
    const rows = ["Email,Datum prijave,Status"];
    data.pretplatnici.forEach(p => {
      rows.push(`${p.email},${p.datum},${p.aktivan ? "Aktivan" : "Neaktivan"}`);
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-pretplatnici-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  const filtrirani = (data?.pretplatnici || [])
    .filter(p => {
      if (filter === "aktivni") return p.aktivan;
      if (filter === "neaktivni") return !p.aktivan;
      return true;
    })
    .filter(p => !pretraga || p.email.toLowerCase().includes(pretraga.toLowerCase()));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111", marginBottom: 4 }}>Newsletter</h1>
          <p style={{ fontSize: 13, color: "#6b7280" }}>Upravljanje pretplatnicima</p>
        </div>
        <button
          onClick={exportCSV}
          style={{
            padding: "10px 20px",
            background: "white",
            border: "1.5px solid #e5e7eb",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            color: "#374151",
          }}
        >
          📥 Export CSV
        </button>
      </div>

      {/* Stat kartice */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Ukupno pretplatnika", value: data?.ukupno, color: "#1D9E75", icon: "📧" },
          { label: "Aktivnih", value: data?.aktivnih, color: "#22c55e", icon: "✅" },
          { label: "Neaktivnih", value: data?.neaktivnih, color: "#ef4444", icon: "❌" },
          { label: "Ovaj mjesec", value: data?.ovoMjesec, color: "#6366f1", icon: "📅" },
        ].map(stat => (
          <div key={stat.label} style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#111" }}>{stat.value ?? "—"}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Rast grafikon (simuliran) */}
      <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 16 }}>Rast pretplatnika (zadnjih 30 dana)</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
          {[2, 1, 3, 2, 4, 2, 1, 3, 5, 2, 3, 4, 2, 1, 3, 2, 4, 6, 3, 2, 4, 3, 5, 2, 3, 4, 2, 3, 1, 2].map((v, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${(v / 6) * 100}%`,
                background: i >= 25 ? "#1D9E75" : "#e5e7eb",
                borderRadius: "3px 3px 0 0",
                transition: "background 0.15s",
              }}
              title={`Dan ${i + 1}: +${v} pretplatnika`}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
          <span>1. jun</span>
          <span>Danas</span>
        </div>
      </div>

      {/* Lista pretplatnika */}
      <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", gap: 12, alignItems: "center" }}>
          <input
            type="text"
            placeholder="🔍 Pretraži email..."
            value={pretraga}
            onChange={e => setPretraga(e.target.value)}
            style={{ flex: 1, padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: 7, fontSize: 13, outline: "none" }}
          />
          <div style={{ display: "flex", gap: 4, background: "#f3f4f6", borderRadius: 8, padding: 3 }}>
            {(["svi", "aktivni", "neaktivni"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "5px 12px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: filter === f ? "white" : "transparent",
                color: filter === f ? "#111" : "#6b7280",
                boxShadow: filter === f ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email</th>
              <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", width: 140 }}>Datum prijave</th>
              <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", width: 120 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {!data ? (
              <tr><td colSpan={3} style={{ padding: "30px", textAlign: "center", color: "#9ca3af" }}>Učitavanje...</td></tr>
            ) : filtrirani.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: "30px", textAlign: "center", color: "#9ca3af" }}>Nema pretplatnika za ovaj filter</td></tr>
            ) : filtrirani.map(p => (
              <tr key={p.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 20px", fontSize: 14, color: "#111", fontWeight: 500 }}>
                  {p.email}
                </td>
                <td style={{ padding: "12px 20px", fontSize: 13, color: "#6b7280" }}>
                  {p.datum}
                </td>
                <td style={{ padding: "12px 20px" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: p.aktivan ? "#d1fae5" : "#f3f4f6",
                    color: p.aktivan ? "#065f46" : "#6b7280",
                  }}>
                    <span style={{ fontSize: 8 }}>●</span>
                    {p.aktivan ? "Aktivan" : "Neaktivan"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data && (
          <div style={{ padding: "12px 20px", borderTop: "1px solid #f3f4f6", fontSize: 12, color: "#9ca3af" }}>
            Prikazano {filtrirani.length} od {data.ukupno} pretplatnika
          </div>
        )}
      </div>
    </div>
  );
}
