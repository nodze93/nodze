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
  const [zakazivanje, setZakazivanje] = useState<{ id: number; naslov: string } | null>(null);
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
      body: JSON.stringify({ status: "published", zakazano_za: null }),
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

  // ── ZAKAZIVANJE OBJAVE (⏰) ────────────────────────────────
  function localDatetimeValue(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function jeZakazan(c: any): boolean {
    return c.status === "published" && !!c.zakazanoZa && new Date(c.zakazanoZa).getTime() > Date.now();
  }
  function otvoriZakazivanje(c: any) {
    // Ako je već zakazan — popuni postojećim terminom (lako se mijenja); inače +1h.
    const base = jeZakazan(c) ? new Date(c.zakazanoZa) : new Date(Date.now() + 60 * 60 * 1000);
    setZakazVrijeme(localDatetimeValue(base));
    setZakazivanje({ id: c.id, naslov: c.naslov });
  }
  async function potvrdiZakazivanje() {
    if (!zakazivanje || !zakazVrijeme) return;
    const iso = new Date(zakazVrijeme).toISOString();
    setAkcija({ id: zakazivanje.id, tip: "zakazivanje" });
    await fetch(`/api/admin/clanci/${zakazivanje.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published", zakazano_za: iso }),
    });
    setZakazivanje(null);
    await ucitaj();
    setAkcija(null);
  }
  // Oznaka statusa (draft / objavljen / zakazan u budućnosti)
  function statusOznaka(c: any): { tekst: string; bg: string; fg: string } {
    const zakazan = c.status === "published" && c.zakazanoZa && new Date(c.zakazanoZa).getTime() > Date.now();
    if (zakazan) return { tekst: "⏰ Zakazan", bg: "#dbeafe", fg: "#1e40af" };
    if (c.status === "published") return { tekst: "Objavljeno", bg: "#d1fae5", fg: "#065f46" };
    return { tekst: "Na čekanju", bg: "#fef3c7", fg: "#92400e" };
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
      <div className="clanci-filteri" style={{ display: "flex", gap: 12, marginBottom: 20 }}>
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

      {/* Tabela (desktop) */}
      <div className="clanci-tabela" style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
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
                      {(() => { const so = statusOznaka(c); const z = jeZakazan(c); return (
                        <span
                          onClick={z ? () => otvoriZakazivanje(c) : undefined}
                          title={z ? "Klikni da promijeniš vrijeme" : undefined}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                            background: so.bg, color: so.fg, cursor: z ? "pointer" : "default",
                          }}
                        >
                          <span style={{ fontSize: 8 }}>●</span>
                          {so.tekst}
                        </span>
                      ); })()}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#6b7280" }}>
                      {c.procitano?.toLocaleString("bs-BA") || "0"}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        {(c.status === "draft" || jeZakazan(c)) && (
                          <button
                            onClick={() => objavi(c.id)}
                            disabled={jeAktivan}
                            title={jeZakazan(c) ? "Objavi odmah (otkaži termin)" : "Objavi članak"}
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
                        {(c.status === "draft" || jeZakazan(c)) && (
                          <button
                            onClick={() => otvoriZakazivanje(c)}
                            title={jeZakazan(c) ? "Promijeni vrijeme" : "Zakaži objavu"}
                            style={{ padding: "6px 10px", background: "#eff6ff", color: "#1e40af", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
                          >
                            ⏰
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

      {/* Kartice (mobitel) */}
      <div className="clanci-kartice" style={{ display: "none", flexDirection: "column", gap: 10 }}>
        {loading ? (
          <div style={{ padding: "30px 14px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>Učitavanje...</div>
        ) : clanci.length === 0 ? (
          <div style={{ padding: "30px 14px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>Nema članaka za ove filtere</div>
        ) : (
          clanci.map((c) => {
            const jeAktivan = akcija?.id === c.id;
            return (
              <div key={c.id} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111", lineHeight: 1.35, marginBottom: 6 }}>
                  {c.faktcheck && <span style={{ marginRight: 6 }}>{FAKTCHECK_IKONA[c.faktcheck] || ""}</span>}
                  {c.naslov}
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10 }}>
                  {c.izvor || "Ručno"} · {c.minCitanja} min · {c.datum} · 👁 {c.procitano?.toLocaleString("bs-BA") || "0"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                  <span style={{
                    display: "inline-block", padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: `${TAG_BOJE[c.kategorija] || "#999"}18`, color: TAG_BOJE[c.kategorija] || "#999",
                  }}>{c.kategorija}</span>
                  {(() => { const so = statusOznaka(c); const z = jeZakazan(c); return (
                    <span
                      onClick={z ? () => otvoriZakazivanje(c) : undefined}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: so.bg, color: so.fg, cursor: z ? "pointer" : "default",
                      }}
                    >
                      <span style={{ fontSize: 8 }}>●</span>
                      {so.tekst}
                    </span>
                  ); })()}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {(c.status === "draft" || jeZakazan(c)) && (
                    <button
                      onClick={() => objavi(c.id)}
                      disabled={jeAktivan}
                      style={{ flex: 1, padding: "11px 12px", background: "#1D9E75", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: jeAktivan ? "not-allowed" : "pointer" }}
                    >
                      {jeAktivan && akcija?.tip === "objava" ? "..." : "✅ Objavi"}
                    </button>
                  )}
                  {(c.status === "draft" || jeZakazan(c)) && (
                    <button
                      onClick={() => otvoriZakazivanje(c)}
                      style={{ padding: "11px 14px", background: "#eff6ff", color: "#1e40af", border: "none", borderRadius: 8, fontSize: 15, cursor: "pointer" }}
                    >
                      ⏰
                    </button>
                  )}
                  <Link
                    href={`/admin/clanci/${c.id}`}
                    style={{ flex: 1, padding: "11px 12px", background: "#f3f4f6", color: "#374151", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center" }}
                  >
                    ✏️ Uredi
                  </Link>
                  <button
                    onClick={() => obrisi(c.id, c.naslov)}
                    disabled={jeAktivan}
                    style={{ padding: "11px 14px", background: "#fff1f2", color: "#be123c", border: "none", borderRadius: 8, fontSize: 15, cursor: jeAktivan ? "not-allowed" : "pointer" }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: zakaži objavu */}
      {zakazivanje && (
        <div
          onClick={() => setZakazivanje(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 14, padding: 22, width: "100%", maxWidth: 380 }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, color: "#111" }}>⏰ Zakaži objavu</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16, lineHeight: 1.4 }}>{zakazivanje.naslov}</div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Objavi automatski u:</label>
            <input
              type="datetime-local"
              value={zakazVrijeme}
              onChange={(e) => setZakazVrijeme(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, marginBottom: 18, boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setZakazivanje(null)} style={{ flex: 1, padding: "11px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Otkaži</button>
              <button onClick={potvrdiZakazivanje} style={{ flex: 1, padding: "11px", background: "#1D9E75", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Zakaži</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .clanci-tabela { display: none; }
          .clanci-kartice { display: flex !important; }
          .clanci-filteri { flex-wrap: wrap; }
          .clanci-filteri select { flex: 1; }
        }
      `}</style>
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
