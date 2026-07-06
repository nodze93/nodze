"use client";
import { useCallback, useEffect, useState } from "react";

// ============================================================
// ADMIN MODERACIJA — traka na svim stranicama + Article Manager
// ============================================================
// Prikazuje se SAMO ako si ulogovan admin (provjera /api/admin/me).
// Za javne posjetioce vraća null (ništa se ne mijenja na sajtu).

interface Clanak {
  id: string;
  slug: string;
  naslov: string;
  excerpt: string;
  kategorija: string;
  status: string;
  slika: string | null;
  jeNaslovna: boolean;
  zakazanoZa: string | null;
}

const KATEGORIJE = [
  "viza", "posao", "stan", "zdravstvo", "porodica", "porez", "penzija",
  "povratak", "svijet", "bih", "sport", "finansije", "gastarbajter", "biznis", "vijesti",
];

// ISO → vrijednost za <input type="datetime-local"> (lokalno vrijeme)
function zaInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function AdminModeracija() {
  const [admin, setAdmin] = useState(false);
  const [otvoren, setOtvoren] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => setAdmin(r.ok))
      .catch(() => setAdmin(false));
  }, []);

  async function odjava() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    window.location.href = "/";
  }

  if (!admin) return null;

  return (
    <>
      {/* ADMIN TRAKA (dole, fiksna) */}
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 9998, background: "#111827", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", fontSize: 13, gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ background: "#1D9E75", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>⚙️ Admin</span>
          <span style={{ color: "#9ca3af", fontSize: 12 }}>Ulogovan si kao admin</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => setOtvoren(true)} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#1D9E75", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📋 Uredi članke</button>
          <a href="/admin" style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "white", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Admin panel →</a>
          <button onClick={odjava} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#fca5a5", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Odjava</button>
        </div>
      </div>

      {otvoren && <Manager onClose={() => setOtvoren(false)} />}
    </>
  );
}

function Manager({ onClose }: { onClose: () => void }) {
  const [clanci, setClanci] = useState<Clanak[]>([]);
  const [loading, setLoading] = useState(true);
  const [poruka, setPoruka] = useState("");
  const [dirtyOrder, setDirtyOrder] = useState(false);
  const [uredjivan, setUredjivan] = useState<Clanak | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  // Ako smo na /kategorija/<slug>, filtriraj automatski na tu kategoriju.
  const [filterKat, setFilterKat] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const m = window.location.pathname.match(/\/kategorija\/([^/?#]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  });

  const ucitaj = useCallback(async () => {
    setLoading(true);
    try {
      const q = filterKat ? `?kategorija=${encodeURIComponent(filterKat)}` : "";
      const r = await fetch(`/api/admin/clanci${q}`);
      const d = await r.json();
      setClanci(d.clanci || []);
      setDirtyOrder(false);
    } catch {
      setPoruka("Greška pri učitavanju.");
    } finally {
      setLoading(false);
    }
  }, [filterKat]);

  useEffect(() => { ucitaj(); }, [ucitaj]);

  function pomjeri(i: number, smjer: -1 | 1) {
    const j = i + smjer;
    if (j < 0 || j >= clanci.length) return;
    const kopija = [...clanci];
    [kopija[i], kopija[j]] = [kopija[j], kopija[i]];
    setClanci(kopija);
    setDirtyOrder(true);
  }

  function onDrop(i: number) {
    if (dragIdx === null || dragIdx === i) return;
    const kopija = [...clanci];
    const [premjesten] = kopija.splice(dragIdx, 1);
    kopija.splice(i, 0, premjesten);
    setClanci(kopija);
    setDragIdx(null);
    setDirtyOrder(true);
  }

  async function sacuvajRedoslijed() {
    setPoruka("Snimam redoslijed...");
    try {
      await fetch("/api/admin/redoslijed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: clanci.map((c) => c.id) }),
      });
      setDirtyOrder(false);
      setPoruka("✅ Redoslijed sačuvan.");
    } catch {
      setPoruka("❌ Greška pri snimanju redoslijeda.");
    }
  }

  async function postaviNaslovnu(id: string, trenutno: boolean) {
    try {
      await fetch("/api/admin/naslovna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: trenutno ? null : id }),
      });
      await ucitaj();
    } catch {
      setPoruka("❌ Greška pri postavljanju naslovne.");
    }
  }

  async function promijeniStatus(c: Clanak) {
    const novi = c.status === "published" ? "draft" : "published";
    try {
      await fetch(`/api/admin/clanci/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novi }),
      });
      await ucitaj();
    } catch {
      setPoruka("❌ Greška pri promjeni statusa.");
    }
  }

  async function obrisi(c: Clanak) {
    if (!confirm(`Obrisati članak?\n\n"${c.naslov.slice(0, 60)}"\n\nOvo se ne može poništiti.`)) return;
    try {
      await fetch(`/api/admin/clanci/${c.id}`, { method: "DELETE" });
      await ucitaj();
    } catch {
      setPoruka("❌ Greška pri brisanju.");
    }
  }

  async function dodajNovi() {
    try {
      const r = await fetch("/api/admin/clanci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          naslov: "Novi članak — klikni Uredi",
          excerpt: "Kratki opis članka.",
          sadrzaj: "<p>Sadržaj članka ide ovdje...</p>",
          kategorija: "vijesti",
          status: "draft",
        }),
      });
      const d = await r.json();
      await ucitaj();
      if (d.clanak) {
        setUredjivan({
          id: d.clanak.id, slug: d.clanak.slug, naslov: d.clanak.naslov,
          excerpt: d.clanak.excerpt || "", kategorija: d.clanak.kategorija,
          status: d.clanak.status, slika: d.clanak.slika || null,
          jeNaslovna: false, zakazanoZa: null,
        });
      }
    } catch {
      setPoruka("❌ Greška pri dodavanju.");
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#f3f4f6", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ background: "#111827", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 60, position: "sticky", top: 0, zIndex: 10, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "white" }}>📋 Upravljanje člancima</h2>
          <p style={{ fontSize: 12, color: "#9ca3af" }}>▲▼ ili prevuci za redoslijed · ★ naslovna · ✏️ uredi · 🗑️ obriši</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select value={filterKat} onChange={(e) => setFilterKat(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #374151", background: "#1f2937", color: "white", fontSize: 12, fontWeight: 600 }}>
            <option value="">Sve kategorije</option>
            {KATEGORIJE.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <span style={{ background: "rgba(255,255,255,0.12)", color: "#9ca3af", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>{clanci.length} članaka</span>
          {dirtyOrder && (
            <button onClick={sacuvajRedoslijed} style={{ padding: "9px 16px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "#f59e0b", color: "white" }}>💾 Sačuvaj redoslijed</button>
          )}
          <button onClick={dodajNovi} style={{ padding: "9px 16px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "#1D9E75", color: "white" }}>+ Dodaj novi</button>
          <button onClick={onClose} style={{ padding: "9px 16px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "#374151", color: "white" }}>✓ Gotovo</button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px 80px" }}>
        {poruka && <div style={{ marginBottom: 12, fontSize: 13, color: "#374151", fontWeight: 600 }}>{poruka}</div>}
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Učitavanje...</div>
        ) : (
          clanci.map((c, i) => (
            <div
              key={c.id}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "white", border: "1.5px solid #e5e7eb", borderRadius: 10, marginBottom: 7 }}
            >
              {/* Reorder */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <button onClick={() => pomjeri(i, -1)} title="Gore" style={strelica}>▲</button>
                <button onClick={() => pomjeri(i, 1)} title="Dole" style={strelica}>▼</button>
              </div>
              <span style={{ cursor: "grab", color: "#cbd5e1", fontSize: 18 }} title="Prevuci">⠿</span>

              {/* Tag + naslov */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className={`tag-pill tag-${c.kategorija}`}>{c.kategorija}</span>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111", lineHeight: 1.4, marginTop: 3 }}>{c.naslov}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, color: c.status === "published" ? "#059669" : "#d97706" }}>
                    {c.status === "published" ? "● Objavljen" : "○ Draft"}
                  </span>
                  {c.jeNaslovna && <span style={{ color: "#d97706", fontWeight: 700 }}>★ Naslovna</span>}
                  {c.zakazanoZa && new Date(c.zakazanoZa) > new Date() && (
                    <span style={{ color: "#7c3aed", fontWeight: 700 }}>⏰ Zakazan {new Date(c.zakazanoZa).toLocaleString("bs-BA", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                  )}
                </div>
              </div>

              {/* Akcije */}
              <div style={{ display: "flex", gap: 5, alignItems: "center", flexShrink: 0 }}>
                <button onClick={() => postaviNaslovnu(c.id, c.jeNaslovna)} title="Naslovna" style={{ ...akcija, color: c.jeNaslovna ? "#d97706" : "#9ca3af" }}>★</button>
                <button onClick={() => promijeniStatus(c)} title={c.status === "published" ? "Skini s objave" : "Objavi"} style={akcija}>{c.status === "published" ? "👁" : "🚀"}</button>
                <button onClick={() => setUredjivan(c)} title="Uredi" style={akcija}>✏️</button>
                <button onClick={() => obrisi(c)} title="Obriši" style={{ ...akcija, color: "#ef4444" }}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {uredjivan && (
        <EditModal
          clanak={uredjivan}
          onClose={() => setUredjivan(null)}
          onSaved={async () => { setUredjivan(null); await ucitaj(); }}
        />
      )}
    </div>
  );
}

function EditModal({ clanak, onClose, onSaved }: { clanak: Clanak; onClose: () => void; onSaved: () => void }) {
  const [naslov, setNaslov] = useState(clanak.naslov);
  const [excerpt, setExcerpt] = useState(clanak.excerpt);
  const [kategorija, setKategorija] = useState(clanak.kategorija);
  const [slika, setSlika] = useState(clanak.slika || "");
  const [status, setStatus] = useState(clanak.status);
  const [zakazano, setZakazano] = useState(zaInput(clanak.zakazanoZa));
  const [snima, setSnima] = useState(false);

  async function spasi() {
    if (!naslov.trim()) { alert("Naslov ne može biti prazan."); return; }
    setSnima(true);
    try {
      await fetch(`/api/admin/clanci/${clanak.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          naslov: naslov.trim(),
          excerpt: excerpt.trim(),
          kategorija,
          slika: slika.trim() || null,
          status,
          zakazano_za: zakazano ? new Date(zakazano).toISOString() : null,
        }),
      });
      onSaved();
    } catch {
      alert("Greška pri snimanju.");
      setSnima(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, padding: 24, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18, color: "#111" }}>Uredi članak</h3>

        <Polje label="Naslov"><input style={inp} value={naslov} onChange={(e) => setNaslov(e.target.value)} /></Polje>
        <Polje label="Kratki opis (excerpt)"><textarea style={{ ...inp, resize: "vertical" }} rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} /></Polje>
        <Polje label="Kategorija">
          <select style={inp} value={kategorija} onChange={(e) => setKategorija(e.target.value)}>
            {KATEGORIJE.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Polje>
        <Polje label="Slika (URL, opcionalno)"><input style={inp} value={slika} onChange={(e) => setSlika(e.target.value)} placeholder="https://..." /></Polje>
        <Polje label="Status">
          <select style={inp} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft (nije javno)</option>
            <option value="published">Objavljen</option>
          </select>
        </Polje>
        <Polje label="Zakaži objavu (opcionalno — ostavi prazno za odmah)">
          <input type="datetime-local" style={inp} value={zakazano} onChange={(e) => setZakazano(e.target.value)} />
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>Ako postaviš vrijeme u budućnosti i status je „Objavljen", članak se sam pojavi u to vrijeme.</div>
        </Polje>

        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <button onClick={spasi} disabled={snima} style={{ flex: 1, padding: 11, background: "#1D9E75", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{snima ? "Snimam..." : "Sačuvaj"}</button>
          <button onClick={onClose} style={{ padding: "11px 18px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Otkaži</button>
        </div>
      </div>
    </div>
  );
}

function Polje({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "white" };
const strelica: React.CSSProperties = { width: 22, height: 18, border: "1px solid #e5e7eb", borderRadius: 4, background: "white", cursor: "pointer", fontSize: 9, lineHeight: 1, color: "#6b7280", padding: 0 };
const akcija: React.CSSProperties = { width: 30, height: 30, border: "1px solid #e5e7eb", borderRadius: 6, background: "white", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" };
