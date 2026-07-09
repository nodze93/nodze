"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useIsMobile } from "@/lib/useIsMobile";

const KATEGORIJE = ["sve", "viza", "posao", "stan", "zdravstvo", "porodica", "porez", "penzija", "finansije", "vijesti", "bih", "sport", "svijet", "povratak"];

const TAG_BOJE: Record<string, string> = {
  viza: "#3b82f6",
  posao: "#f97316",
  stan: "#ef4444",
  zdravstvo: "#1D9E75",
  porodica: "#8b5cf6",
  porez: "#0ea5e9",
  penzija: "#64748b",
  povratak: "#d97706",
  finansije: "#059669",
  vijesti: "#6b7280",
  bih: "#7c3aed",
  sport: "#2563eb",
  svijet: "#1e40af",
};

// Fact-check semafor: 🟢 objavi odmah, 🟡 pogledaj, 🔴 ne objavljuj bez ispravke
const FAKTCHECK_IKONA: Record<string, string> = { zeleno: "🟢", zuto: "🟡", crveno: "🔴" };

function ClanciContent() {
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusFilter = searchParams.get("status") || "sve";
  const [clanci, setClanci] = useState<any[]>([]);
  const [ukupno, setUkupno] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pretrage, setPretrage] = useState("");
  const [kategorija, setKategorija] = useState("sve");
  const [akcija, setAkcija] = useState<{ id: number; tip: string } | null>(null);

  const ucitaj = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "sve") params.set("status", statusFilter);
    if (kategorija !== "sve") params.set("kategorija", kategorija);
    if (pretrage) params.set("q", pretrage);

    const res = await fetch(`/api/admin/clanci?${params}`);
    const data = await res.json();
    setClanci(data.clanci || []);
    setUkupno(data.ukupno || 0);
    setLoading(false);
  }, [statusFilter, kategorija, pretrage]);

  useEffect(() => { ucitaj(); }, [ucitaj]);

  async function objavi(id: number) {
    setAkcija({ id, tip: "objava" });
    await fetch(`/api/admin/clanci/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });
    await ucitaj();
    setAkcija(null);
  }

  async function obrisi(id: number, naslov: string) {
    if (!confirm(`Obrisati članak "${naslov}"?\n\nOva akcija je nepovratna.`)) return;
    setAkcija({ id, tip: "brisanje" });
    await fetch(`/api/admin/clanci/${id}`, { method: "DELETE" });
    await ucitaj();
    setAkcija(null);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111", marginBottom: 4 }}>Članci</h1>
          <p style={{ fontSize: 13, color: "#6b7280" }}>{ukupno} {ukupno === 1 ? "članak" : "članaka"}</p>
        </div>
        <Link href="/admin/clanci/novi" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 20px", background: "#1D9E75", color: "white",
          borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none",
        }}>
          + Novi članak
        </Link>
      </div>

      {/* Tabs: status */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#f3f4f6", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {["sve", "draft", "published"].map(s => (
          <button
            key={s}
            onClick={() => router.push(s === "sve" ? "/admin/clanci" : `/admin/clanci?status=${s}`)}
            style={{
              padding: "7px 18px",
              borderRadius: 7,
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              background: statusFilter === s ? "white" : "transparent",
              color: statusFilter === s ? "#111" : "#6b7280",
              boxShadow: statusFilter === s ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
            }}
          >
            {s === "sve" ? "Svi" : s === "draft" ? "⏳ Na čekanju" : "✅ Objavljeni"}
          </button>
        ))}
      </div>

      {/* Filteri */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="🔍 Pretraži po naslovu..."
          value={pretrage}
          onChange={e => setPretrage(e.target.value)}
          style={{
            flex: 1,
            padding: "11px 14px",
            border: "1.5px solid #e5e7eb",
            borderRadius: 8,
            fontSize: isMobile ? 16 : 14,
            outline: "none",
          }}
        />
        <select
          value={kategorija}
          onChange={e => setKategorija(e.target.value)}
          style={{
            padding: "11px 14px",
            border: "1.5px solid #e5e7eb",
            borderRadius: 8,
            fontSize: isMobile ? 16 : 14,
            background: "white",
            cursor: "pointer",
          }}
        >
          {KATEGORIJE.map(k => (
            <option key={k} value={k}>{k === "sve" ? "Sve kategorije" : k.charAt(0).toUpperCase() + k.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Tabela (desktop) / kartice (telefon) */}
      {isMobile ? (
        <MobileClanci clanci={clanci} loading={loading} akcija={akcija} objavi={objavi} obrisi={obrisi} />
      ) : (
      <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Naslov</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", width: 100 }}>Kat.</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", width: 90 }}>Datum</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", width: 100 }}>Status</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", width: 60 }}>👁</th>
              <th style={{ padding: "12px 20px", textAlign: "right", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", width: 180 }}>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: "40px 20px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>Učitavanje...</td></tr>
            ) : clanci.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: "40px 20px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>Nema članaka za ove filtere</td></tr>
            ) : (
              clanci.map((c) => {
                const jeAktivan = akcija?.id === c.id;
                return (
                  <tr key={c.id} style={{ borderTop: "1px solid #f3f4f6", background: jeAktivan ? "#f9fafb" : "white" }}>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#111", lineHeight: 1.4, marginBottom: 3 }}>
                        {c.faktcheck && <span title={`Fact-check: ${c.faktcheck}`} style={{ marginRight: 6 }}>{FAKTCHECK_IKONA[c.faktcheck] || ""}</span>}
                        {c.naslov}
                      </div>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>
                        {c.izvor || "Ručno"} · {c.minCitanja} min čitanja
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        background: `${TAG_BOJE[c.kategorija] || "#999"}18`,
                        color: TAG_BOJE[c.kategorija] || "#999",
                      }}>
                        {c.kategorija}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#6b7280" }}>{c.datum}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: c.status === "published" ? "#d1fae5" : "#fef3c7",
                        color: c.status === "published" ? "#065f46" : "#92400e",
                      }}>
                        <span style={{ fontSize: 8 }}>●</span>
                        {c.status === "published" ? "Objavljeno" : "Na čekanju"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#6b7280" }}>
                      {c.procitano?.toLocaleString("bs-BA") || "0"}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        {c.status === "draft" && (
                          <button
                            onClick={() => objavi(c.id)}
                            disabled={jeAktivan}
                            title="Objavi članak"
                            style={{
                              padding: "6px 12px",
                              background: "#1D9E75",
                              color: "white",
                              border: "none",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: jeAktivan ? "not-allowed" : "pointer",
                            }}
                          >
                            {jeAktivan && akcija?.tip === "objava" ? "..." : "✅ Objavi"}
                          </button>
                        )}
                        <Link
                          href={`/admin/clanci/${c.id}`}
                          style={{
                            padding: "6px 12px",
                            background: "#f3f4f6",
                            color: "#374151",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          ✏️ Uredi
                        </Link>
                        <button
                          onClick={() => obrisi(c.id, c.naslov)}
                          disabled={jeAktivan}
                          title="Obriši članak"
                          style={{
                            padding: "6px 10px",
                            background: "#fff1f2",
                            color: "#be123c",
                            border: "none",
                            borderRadius: 6,
                            fontSize: 12,
                            cursor: jeAktivan ? "not-allowed" : "pointer",
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}

// ── Mobilna lista članaka (kartice s velikim dugmadima) ──────────
function MobileClanci({ clanci, loading, akcija, objavi, obrisi }: {
  clanci: any[];
  loading: boolean;
  akcija: { id: number; tip: string } | null;
  objavi: (id: number) => void;
  obrisi: (id: number, naslov: string) => void;
}) {
  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>Učitavanje...</div>;
  if (clanci.length === 0) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>Nema članaka za ove filtere.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {clanci.map((c) => {
        const jeAktivan = akcija?.id === c.id;
        return (
          <div key={c.id} style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
              <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${TAG_BOJE[c.kategorija] || "#999"}18`, color: TAG_BOJE[c.kategorija] || "#999" }}>{c.kategorija}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.status === "published" ? "#d1fae5" : "#fef3c7", color: c.status === "published" ? "#065f46" : "#92400e" }}>
                <span style={{ fontSize: 8 }}>●</span>{c.status === "published" ? "Objavljeno" : "Na čekanju"}
              </span>
              {c.faktcheck && <span title={`Fact-check: ${c.faktcheck}`}>{FAKTCHECK_IKONA[c.faktcheck] || ""}</span>}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#111", lineHeight: 1.4, marginBottom: 4 }}>{c.naslov}</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>{c.izvor || "Ručno"} · {c.minCitanja} min · 👁 {c.procitano?.toLocaleString("bs-BA") || "0"}</div>

            {c.status === "draft" && (
              <button onClick={() => objavi(c.id)} disabled={jeAktivan} style={{ width: "100%", padding: 13, marginBottom: 8, background: "#1D9E75", color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: jeAktivan ? "not-allowed" : "pointer" }}>
                {jeAktivan && akcija?.tip === "objava" ? "Objavljujem..." : "🚀 Objavi članak"}
              </button>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <Link href={`/admin/clanci/${c.id}`} style={{ flex: 1, padding: "12px 8px", background: "white", color: "#374151", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>✏️ Uredi</Link>
              <button onClick={() => obrisi(c.id, c.naslov)} disabled={jeAktivan} style={{ width: 52, padding: "12px 8px", background: "#fff1f2", color: "#be123c", border: "1.5px solid #fecdd3", borderRadius: 10, fontSize: 15, cursor: jeAktivan ? "not-allowed" : "pointer" }}>🗑️</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ClanciPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Učitavanje...</div>}>
      <ClanciContent />
    </Suspense>
  );
}
