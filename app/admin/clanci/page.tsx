"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusFilter = searchParams.get("status") || "sve";
  const [clanci, setClanci] = useState<any[]>([]);
  const [ukupno, setUkupno] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pretrage, setPretrage] = useState("");
  const [kategorija, setKategorija] = useState("sve");
  const [akcija, setAkcija] = useState<{ id: number; tip: string } | null>(null);
  const [zakazivan, setZakazivan] = useState<any | null>(null);
  const [zakazVrijeme, setZakazVrijeme] = useState("");

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

  // Zakazivanje objave za određeno vrijeme
  function otvoriZakazivanje(c: any) {
    const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const p = (n: number) => String(n).padStart(2, "0");
    setZakazVrijeme(`${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`);
    setZakazivan(c);
  }

  async function potvrdiZakazivanje() {
    if (!zakazivan || !zakazVrijeme) return;
    const kada = new Date(zakazVrijeme);
    if (isNaN(kada.getTime()) || kada.getTime() <= Date.now()) { alert("Vrijeme mora biti u budućnosti."); return; }
    await fetch(`/api/admin/clanci/${zakazivan.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published", zakazano_za: kada.toISOString() }),
    });
    setZakazivan(null);
    setZakazVrijeme("");
    await ucitaj();
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
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
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="🔍 Pretraži po naslovu..."
          value={pretrage}
          onChange={e => setPretrage(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 14px",
            border: "1.5px solid #e5e7eb",
            borderRadius: 8,
            fontSize: 14,
            outline: "none",
          }}
        />
        <select
          value={kategorija}
          onChange={e => setKategorija(e.target.value)}
          style={{
            padding: "10px 14px",
            border: "1.5px solid #e5e7eb",
            borderRadius: 8,
            fontSize: 14,
            background: "white",
            cursor: "pointer",
          }}
        >
          {KATEGORIJE.map(k => (
            <option key={k} value={k}>{k === "sve" ? "Sve kategorije" : k.charAt(0).toUpperCase() + k.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Tabela */}
      <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                        {c.status === "draft" && (
                          <button
                            onClick={() => otvoriZakazivanje(c)}
                            title="Zakaži objavu za određeno vrijeme"
                            style={{ padding: "6px 12px", background: "white", color: "#7c3aed", border: "1.5px solid #7c3aed", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                          >
                            ⏰ Zakaži
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

      {/* Prozor za zakazivanje objave */}
      {zakazivan && (
        <div
          onClick={() => setZakazivan(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 14, padding: 22, width: "100%", maxWidth: 420, boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#111", marginBottom: 6 }}>⏰ Zakaži objavu</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 14, lineHeight: 1.4 }}>
              Članak će se sam pojaviti na sajtu u zadato vrijeme (do tada je sakriven).
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12, padding: "8px 10px", background: "#f9fafb", borderRadius: 8 }}>
              {zakazivan.naslov}
            </div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Vrijeme objave</label>
            <input
              type="datetime-local"
              value={zakazVrijeme}
              onChange={(e) => setZakazVrijeme(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 14, marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setZakazivan(null)}
                style={{ flex: 1, padding: "11px", border: "1.5px solid #d1d5db", borderRadius: 10, background: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", color: "#374151" }}
              >Otkaži</button>
              <button
                onClick={potvrdiZakazivanje}
                style={{ flex: 2, padding: "11px", border: "none", borderRadius: 10, background: "#7c3aed", color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
              >⏰ Zakaži objavu</button>
            </div>
          </div>
        </div>
      )}
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
