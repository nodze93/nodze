"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface VodicForm {
  slug: string;
  naziv: string;
  opis: string;
  ikona: string;
  kategorija: string;
  min_citanja: number;
  tagovi: string;       // comma-separated string u formi
  tekst: string;        // HTML sadržaj
}

const KATEGORIJE = ["viza", "posao", "stan", "zdravstvo", "porodica", "porez", "penzija", "finansije", "obrazovanje", "vozacka", "povratak"];

const PRAZNO: VodicForm = {
  slug: "", naziv: "", opis: "", ikona: "📋",
  kategorija: "viza", min_citanja: 10, tagovi: "", tekst: "",
};

export default function AdminVodicEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNovi = id === "novi";
  const router = useRouter();

  const [forma, setForma] = useState<VodicForm>(PRAZNO);
  const [vodicId, setVodicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNovi);
  const [snimanje, setSnimanje] = useState(false);
  const [poruka, setPoruka] = useState<{ tip: "ok" | "greska"; tekst: string } | null>(null);
  const [tab, setTab] = useState<"meta" | "tekst">("meta");
  const [pregled, setPregled] = useState(false);

  // Učitaj postojeći vodič
  useEffect(() => {
    if (isNovi) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(`/api/admin/vodici/${id}`);
        if (!res.ok) { router.push("/admin/vodici"); return; }
        const json = await res.json();
        const v = json.vodic;
        setVodicId(v.id);
        setForma({
          slug: v.slug ?? "",
          naziv: v.naziv ?? "",
          opis: v.opis ?? "",
          ikona: v.ikona ?? "📋",
          kategorija: v.kategorija ?? "viza",
          min_citanja: v.min_citanja ?? 10,
          tagovi: (v.tagovi ?? []).join(", "),
          tekst: v.tekst ?? "",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isNovi, router]);

  function set(field: keyof VodicForm, value: string | number) {
    setForma(f => ({ ...f, [field]: value }));
    setPoruka(null);
  }

  // Auto-generisi slug iz naziva
  function generirajSlug(naziv: string) {
    return naziv
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[čć]/g, "c")
      .replace(/[šđ]/g, d => d === "š" ? "s" : "d")
      .replace(/ž/g, "z")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function spremi() {
    if (!forma.naziv.trim() || !forma.slug.trim()) {
      setPoruka({ tip: "greska", tekst: "Naziv i slug su obavezni." });
      return;
    }
    setSnimanje(true);
    setPoruka(null);
    try {
      const payload = {
        ...forma,
        tagovi: forma.tagovi.split(",").map(t => t.trim()).filter(Boolean),
        tekst: forma.tekst || null,
        koraci: null,
        min_citanja: Number(forma.min_citanja),
      };

      let res: Response;
      if (isNovi) {
        res = await fetch("/api/admin/vodici", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        res = await fetch(`/api/admin/vodici/${vodicId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Greška");
      }

      const json = await res.json();
      if (isNovi) {
        router.push(`/admin/vodici/${json.vodic.id}`);
      } else {
        setPoruka({ tip: "ok", tekst: "Snimljeno ✓" });
        setTimeout(() => setPoruka(null), 3000);
      }
    } catch (err: unknown) {
      setPoruka({ tip: "greska", tekst: err instanceof Error ? err.message : "Greška" });
    } finally {
      setSnimanje(false);
    }
  }

  if (loading) return (
    <div style={{ textAlign: "center", padding: 80, color: "#9ca3af" }}>Učitavam...</div>
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <Link href="/admin/vodici" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          ← Vodiči
        </Link>
        <span style={{ color: "#d1d5db" }}>|</span>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
          {isNovi ? "Novi vodič" : forma.naziv || "Uredi vodič"}
        </h1>
        {!isNovi && forma.slug && (
          <a
            href={`/vodic/${forma.slug}`}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 12, color: "#1D9E75", textDecoration: "none", marginLeft: "auto" }}
          >
            👁 Pogledaj na sajtu →
          </a>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid #e5e7eb", paddingBottom: 0 }}>
        {(["meta", "tekst"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "9px 18px", border: "none", background: "none", cursor: "pointer", fontSize: 14,
              fontWeight: tab === t ? 600 : 400,
              color: tab === t ? "#1D9E75" : "#6b7280",
              borderBottom: tab === t ? "2px solid #1D9E75" : "2px solid transparent",
              marginBottom: -1, fontFamily: "inherit",
            }}
          >
            {t === "meta" ? "📋 Meta" : "📝 Sadržaj (HTML)"}
          </button>
        ))}
      </div>

      {/* ── META TAB ── */}
      {tab === "meta" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Naziv */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Naziv vodiča *</label>
            <input
              value={forma.naziv}
              onChange={e => {
                set("naziv", e.target.value);
                if (isNovi) set("slug", generirajSlug(e.target.value));
              }}
              placeholder="npr. Radna viza za Njemačku"
              style={inputStyle}
            />
          </div>

          {/* Slug */}
          <div>
            <label style={labelStyle}>Slug (URL) *</label>
            <input
              value={forma.slug}
              onChange={e => set("slug", e.target.value.toLowerCase().replace(/\s/g, "-"))}
              placeholder="radna-viza-njemacka"
              style={inputStyle}
            />
            <span style={{ fontSize: 11, color: "#9ca3af" }}>kodnas.de/vodic/{forma.slug || "..."}</span>
          </div>

          {/* Kategorija */}
          <div>
            <label style={labelStyle}>Kategorija</label>
            <select value={forma.kategorija} onChange={e => set("kategorija", e.target.value)} style={inputStyle}>
              {KATEGORIJE.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          {/* Opis (SEO) */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Opis / podnaslov (SEO meta description)</label>
            <input
              value={forma.opis}
              onChange={e => set("opis", e.target.value)}
              placeholder="Od ugovora do prvog dana na poslu — kompletan vodič"
              style={inputStyle}
            />
          </div>

          {/* Ikona + Min čitanja */}
          <div>
            <label style={labelStyle}>Ikona (emoji)</label>
            <input value={forma.ikona} onChange={e => set("ikona", e.target.value)} style={{ ...inputStyle, width: 80, fontSize: 22 }} />
          </div>
          <div>
            <label style={labelStyle}>Procijenjeno čitanje (min)</label>
            <input
              type="number" min={1} max={90}
              value={forma.min_citanja}
              onChange={e => set("min_citanja", Number(e.target.value))}
              style={{ ...inputStyle, width: 80 }}
            />
          </div>

          {/* Tagovi */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Tagovi (odvojeni zarezom)</label>
            <input
              value={forma.tagovi}
              onChange={e => set("tagovi", e.target.value)}
              placeholder="viza, Fachkräfte, Anerkennung"
              style={inputStyle}
            />
          </div>
        </div>
      )}

      {/* ── SADRŽAJ TAB ── */}
      {tab === "tekst" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
              Unesi HTML sadržaj vodiča. Koristi &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;table&gt;, &lt;blockquote&gt; za strukturu.
            </p>
            <button
              onClick={() => setPregled(p => !p)}
              style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontSize: 12, color: "#374151" }}
            >
              {pregled ? "✎ Uredi" : "👁 Pregled"}
            </button>
          </div>

          {pregled ? (
            <div
              style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: "24px 28px", minHeight: 400 }}
              className="vodic-pregled-sadrzaj"
              dangerouslySetInnerHTML={{ __html: forma.tekst || "<em style='color:#9ca3af'>Nema sadržaja</em>" }}
            />
          ) : (
            <textarea
              value={forma.tekst}
              onChange={e => set("tekst", e.target.value)}
              placeholder={"<p>Uvod vodiča...</p>\n\n<h2>Naslov sekcije</h2>\n<p>Tekst...</p>"}
              style={{
                width: "100%", minHeight: 520, padding: "14px 16px",
                border: "1px solid #d1d5db", borderRadius: 10, fontSize: 13,
                fontFamily: "monospace", lineHeight: 1.6, resize: "vertical",
                boxSizing: "border-box", color: "#111827",
              }}
            />
          )}

          {/* Brzi HTML snippeti */}
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[
              ["H2", "<h2></h2>"],
              ["H3", "<h3></h3>"],
              ["§", "<p></p>"],
              ["Tabela", "<table class=\"vd-tabela\">\n<thead><tr><th>Kolona 1</th><th>Kolona 2</th></tr></thead>\n<tbody><tr><td></td><td></td></tr></tbody>\n</table>"],
              ["Savjet", "<blockquote class=\"vd-savjet\"><strong>💡 Savjet:</strong> </blockquote>"],
              ["Upozorenje", "<blockquote class=\"vd-upozorenje\"><strong>⚠️ Važno:</strong> </blockquote>"],
              ["Lista", "<ul>\n<li></li>\n<li></li>\n</ul>"],
            ].map(([label, html]) => (
              <button
                key={label}
                onClick={() => set("tekst", forma.tekst + "\n\n" + html)}
                style={{ padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: 5, background: "white", fontSize: 11, cursor: "pointer", color: "#374151" }}
              >
                + {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Save bar */}
      <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={spremi}
          disabled={snimanje}
          style={{
            padding: "11px 24px", background: "#1D9E75", color: "white",
            border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600,
            cursor: snimanje ? "wait" : "pointer",
          }}
        >
          {snimanje ? "Snimam..." : isNovi ? "Kreiraj vodič" : "💾 Spremi"}
        </button>
        {!isNovi && forma.slug && (
          <a
            href={`/vodic/${forma.slug}`}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 13, color: "#1D9E75", textDecoration: "none" }}
          >
            Pogledaj na sajtu →
          </a>
        )}
        {poruka && (
          <span style={{ fontSize: 13, color: poruka.tip === "ok" ? "#1D9E75" : "#dc2626", fontWeight: 500 }}>
            {poruka.tekst}
          </span>
        )}
      </div>

      <style>{`
        .vodic-pregled-sadrzaj h2 { font-size: 20px; font-weight: 700; margin: 28px 0 12px; color: #111827; }
        .vodic-pregled-sadrzaj h3 { font-size: 16px; font-weight: 700; margin: 22px 0 8px; color: #374151; }
        .vodic-pregled-sadrzaj p { font-size: 15px; line-height: 1.75; margin-bottom: 14px; color: #374151; }
        .vodic-pregled-sadrzaj table.vd-tabela { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
        .vodic-pregled-sadrzaj table.vd-tabela th { background: #f0fdf4; color: #1D9E75; font-weight: 700; padding: 10px 12px; border: 1px solid #d1fae5; text-align: left; }
        .vodic-pregled-sadrzaj table.vd-tabela td { padding: 9px 12px; border: 1px solid #e5e7eb; vertical-align: top; }
        .vodic-pregled-sadrzaj table.vd-tabela tr:nth-child(even) td { background: #f9fafb; }
        .vodic-pregled-sadrzaj blockquote.vd-savjet { background: #f0fdf4; border-left: 3px solid #1D9E75; border-radius: 0 8px 8px 0; padding: 12px 16px; margin: 16px 0; font-size: 14px; color: #166534; }
        .vodic-pregled-sadrzaj blockquote.vd-upozorenje { background: #fff7ed; border-left: 3px solid #f97316; border-radius: 0 8px 8px 0; padding: 12px 16px; margin: 16px 0; font-size: 14px; color: #9a3412; }
        .vodic-pregled-sadrzaj ul, .vodic-pregled-sadrzaj ol { padding-left: 22px; margin-bottom: 14px; }
        .vodic-pregled-sadrzaj li { font-size: 15px; line-height: 1.7; margin-bottom: 4px; color: #374151; }
        .vodic-pregled-sadrzaj strong { font-weight: 700; }
        .vodic-pregled-sadrzaj a { color: #1D9E75; }
        @media (max-width: 640px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 1fr 1fr"] > div[style*="grid-column"] { grid-column: auto !important; }
        }
      `}</style>
    </div>
  );
}

// ── Style helpers ──────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 8,
  fontSize: 14, fontFamily: "inherit", color: "#111827", background: "white",
  boxSizing: "border-box",
};
