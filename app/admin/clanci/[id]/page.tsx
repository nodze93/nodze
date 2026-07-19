"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUpload from "@/components/admin/ImageUpload";
import RichEditor from "@/components/admin/RichEditor";
import { ocistiHtml } from "@/lib/sanitize";

const KATEGORIJE = ["viza", "posao", "stan", "zdravstvo", "porodica", "porez", "penzija", "povratak"];

interface Props {
  params: Promise<{ id: string }>;
}

export default function UrediClanakPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading]     = useState(true);
  const [sprema, setSprema]       = useState(false);
  const [poruka, setPoruka]       = useState<{ tip: "uspjeh" | "greška"; tekst: string } | null>(null);
  const [preview, setPreview]     = useState(false);
  const [aktivniTab, setAktivniTab] = useState<"sadrzaj" | "seo">("sadrzaj");

  const [naslov, setNaslov]             = useState("");
  const [excerpt, setExcerpt]           = useState("");
  const [sadrzaj, setSadrzaj]           = useState("");
  const [kategorija, setKategorija]     = useState("viza");
  const [status, setStatus]             = useState("draft");
  const [naslovnaSlika, setNaslovnaSlika] = useState("");
  const [autor, setAutor]               = useState("");
  const [seoNaslov, setSeoNaslov]       = useState("");
  const [seoOpis, setSeoOpis]           = useState("");
  const [tagovi, setTagovi]             = useState("");

  useEffect(() => {
    fetch(`/api/admin/clanci/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.clanak) {
          const c = data.clanak;
          setNaslov(c.naslov || "");
          setExcerpt(c.excerpt || "");
          setSadrzaj(c.sadrzaj || "");
          setKategorija(c.kategorija || "viza");
          setStatus(c.status || "draft");
          setNaslovnaSlika(c.slika || "");
          setAutor(c.autor || "Redakcija kodnas.de");
          setSeoNaslov(c.seoNaslov || c.naslov || "");
          setSeoOpis(c.seoOpis || c.excerpt || "");
        }
        setLoading(false);
      });
  }, [id]);

  async function spremi(noviStatus?: string) {
    setSprema(true);
    setPoruka(null);
    try {
      const res = await fetch(`/api/admin/clanci/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          naslov, excerpt, sadrzaj, kategorija,
          status: noviStatus || status,
          slika: naslovnaSlika,
          autor,
          seoNaslov: seoNaslov || naslov,
          seoOpis: seoOpis || excerpt,
          tagovi: tagovi.split(",").map(t => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        if (noviStatus) setStatus(noviStatus);
        setPoruka({ tip: "uspjeh", tekst: data.poruka || "Sačuvano!" });
        setTimeout(() => setPoruka(null), 3000);
      } else {
        setPoruka({ tip: "greška", tekst: "Greška pri snimanju." });
      }
    } catch {
      setPoruka({ tip: "greška", tekst: "Greška pri snimanju." });
    } finally {
      setSprema(false);
    }
  }

  async function obrisi() {
    if (!confirm(`Obrisati "${naslov}"?\n\nNepovratno!`)) return;
    await fetch(`/api/admin/clanci/${id}`, { method: "DELETE" });
    router.push("/admin/clanci");
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#9ca3af" }}>
      Učitavanje...
    </div>
  );

  const statusBadge = (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px",
      borderRadius: 20, fontSize: 12, fontWeight: 600, flexShrink: 0,
      background: status === "published" ? "#d1fae5" : "#fef3c7",
      color: status === "published" ? "#065f46" : "#92400e",
    }}>
      <span style={{ fontSize: 8 }}>●</span>
      {status === "published" ? "Objavljeno" : "Draft"}
    </span>
  );

  return (
    <div>
      {/* ── TOPBAR ── */}
      <div className="uredi-topbar">
        {/* Red 1: natrag + naslov + status */}
        <div className="uredi-naslov-red">
          <Link href="/admin/clanci" style={{ color: "#9ca3af", textDecoration: "none", fontSize: 13, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            ← Natrag
          </Link>
          <span style={{ color: "#e5e7eb" }}>|</span>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: "#111", margin: 0, whiteSpace: "nowrap" }}>Uredi članak</h1>
          {statusBadge}
        </div>

        {/* Red 2: akcije */}
        <div className="uredi-akcije">
          <button
            onClick={() => setPreview(!preview)}
            className="uredi-btn"
            style={{ background: preview ? "#1D9E75" : "#f3f4f6", color: preview ? "white" : "#374151", border: "none" }}
          >
            {preview ? "✏️ Uredi" : "👁 Preview"}
          </button>
          <button
            onClick={() => spremi()}
            disabled={sprema}
            className="uredi-btn"
            style={{ background: "#f3f4f6", color: "#374151", border: "none" }}
          >
            {sprema ? "Sprema..." : "💾 Spremi"}
          </button>
          {/* Objavi/Povuci — samo desktop, na mobileu je u sticky baru */}
          {status === "draft" ? (
            <button
              onClick={() => spremi("published")}
              disabled={sprema}
              className="uredi-btn uredi-btn-desktop-only"
              style={{ background: "#1D9E75", color: "white", border: "none", fontWeight: 700 }}
            >
              ✅ Objavi na portalu
            </button>
          ) : (
            <button
              onClick={() => spremi("draft")}
              disabled={sprema}
              className="uredi-btn uredi-btn-desktop-only"
              style={{ background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" }}
            >
              ↩ Povuci objavu
            </button>
          )}
        </div>
      </div>

      {/* Poruka */}
      {poruka && (
        <div style={{ padding: "12px 16px", borderRadius: 8, marginBottom: 16, background: poruka.tip === "uspjeh" ? "#d1fae5" : "#fee2e2", color: poruka.tip === "uspjeh" ? "#065f46" : "#991b1b", fontSize: 14, fontWeight: 600 }}>
          {poruka.tip === "uspjeh" ? "✅" : "❌"} {poruka.tekst}
        </div>
      )}

      {/* ── GLAVNI GRID ── */}
      <div className="uredi-grid">
        {/* Lijeva kolona — editor */}
        {!preview ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Naslov */}
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Naslov *</label>
              <textarea
                value={naslov}
                onChange={e => setNaslov(e.target.value)}
                placeholder="Upiši naslov članka..."
                rows={2}
                style={{ width: "100%", padding: "12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 20, fontWeight: 700, resize: "none", outline: "none", lineHeight: 1.4, fontFamily: "inherit", boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
                <span>{naslov.length > 0 && naslov.split(" ").length < 5 ? "⚠️ Naslov je kratak" : naslov.length > 0 && naslov.split(" ").length > 15 ? "⚠️ Predugačak" : naslov.length > 0 ? "✅ Dobar naslov" : ""}</span>
                <span>{naslov.split(" ").filter(Boolean).length} riječi</span>
              </div>
            </div>

            {/* Excerpt */}
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Kratki uvod (excerpt) *</label>
              <textarea
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="2-3 rečenice koje opisuju članak."
                rows={3}
                style={{ width: "100%", padding: "12px", border: `1.5px solid ${excerpt.length > 200 ? "#ef4444" : "#e5e7eb"}`, borderRadius: 8, fontSize: 14, resize: "none", outline: "none", lineHeight: 1.6, fontFamily: "inherit", boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 6 }}>
                <span style={{ color: excerpt.length > 200 ? "#ef4444" : "#9ca3af" }}>
                  {excerpt.length > 200 ? `⚠️ Premaši 200 znakova (${excerpt.length - 200} previše)` : ""}
                </span>
                <span style={{ color: excerpt.length > 200 ? "#ef4444" : "#9ca3af" }}>{excerpt.length} / 200</span>
              </div>
            </div>

            {/* Tabs: Sadržaj / SEO */}
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
                {(["sadrzaj", "seo"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setAktivniTab(tab)}
                    style={{
                      flex: 1, padding: "12px", border: "none",
                      background: aktivniTab === tab ? "white" : "#f9fafb",
                      fontSize: 13, fontWeight: aktivniTab === tab ? 700 : 500,
                      color: aktivniTab === tab ? "#111" : "#6b7280",
                      cursor: "pointer",
                      borderBottom: aktivniTab === tab ? "2px solid #1D9E75" : "2px solid transparent",
                    }}
                  >
                    {tab === "sadrzaj" ? "📝 Sadržaj" : "🔍 SEO"}
                  </button>
                ))}
              </div>

              {aktivniTab === "sadrzaj" ? (
                <div style={{ padding: 0 }}>
                  <RichEditor value={sadrzaj} onChange={setSadrzaj} />
                </div>
              ) : (
                <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>
                      SEO naslov <span style={{ color: "#9ca3af", fontWeight: 400 }}>(Google rezultati)</span>
                    </label>
                    <input
                      type="text"
                      value={seoNaslov}
                      onChange={e => setSeoNaslov(e.target.value)}
                      placeholder={naslov || "SEO naslov..."}
                      style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${seoNaslov.length > 60 ? "#ef4444" : "#e5e7eb"}`, borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                    />
                    <div style={{ fontSize: 11, color: seoNaslov.length > 60 ? "#ef4444" : "#9ca3af", marginTop: 4, textAlign: "right" }}>
                      {seoNaslov.length} / 60
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>
                      SEO opis <span style={{ color: "#9ca3af", fontWeight: 400 }}>(meta description)</span>
                    </label>
                    <textarea
                      value={seoOpis}
                      onChange={e => setSeoOpis(e.target.value)}
                      placeholder={excerpt || "SEO opis..."}
                      rows={3}
                      style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${seoOpis.length > 155 ? "#ef4444" : "#e5e7eb"}`, borderRadius: 8, fontSize: 14, resize: "none", outline: "none", boxSizing: "border-box" }}
                    />
                    <div style={{ fontSize: 11, color: seoOpis.length > 155 ? "#ef4444" : "#9ca3af", marginTop: 4, textAlign: "right" }}>
                      {seoOpis.length} / 155
                    </div>
                  </div>
                  {/* Google preview */}
                  <div style={{ padding: 16, background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", marginBottom: 10, textTransform: "uppercase" }}>Google pregled</div>
                    <div style={{ fontSize: 18, color: "#1a0dab", marginBottom: 3 }}>{seoNaslov || naslov || "Naslov članka"}</div>
                    <div style={{ fontSize: 13, color: "#006621", marginBottom: 3 }}>kodnas.de › clanak › ...</div>
                    <div style={{ fontSize: 13, color: "#545454", lineHeight: 1.5 }}>
                      {(seoOpis || excerpt || "Opis članka koji se prikazuje ispod naslova u Google pretragama.").slice(0, 155)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* PREVIEW */
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24 }}>
            <div style={{ marginBottom: 12, fontSize: 12, color: "#9ca3af" }}>👁 Preview — ovako izgleda na portalu</div>
            {naslovnaSlika && (
              <img src={naslovnaSlika} alt={naslov} style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 10, marginBottom: 20 }} />
            )}
            <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: "#1D9E7518", color: "#1D9E75", marginBottom: 12 }}>{kategorija}</span>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111", lineHeight: 1.3, marginBottom: 12 }}>{naslov || "Naslov članka"}</h1>
            <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>✍️ {autor || "Redakcija"} · 📅 {new Date().toLocaleDateString("bs-BA")}</div>
            {excerpt && (
              <p style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.7, padding: "14px 18px", borderLeft: "3px solid #1D9E75", background: "#f0fdf4", borderRadius: "0 8px 8px 0", marginBottom: 24 }}>
                {excerpt}
              </p>
            )}
            <div
              dangerouslySetInnerHTML={{ __html: ocistiHtml(sadrzaj) }}
              style={{ fontSize: 15, lineHeight: 1.8, color: "#374151" }}
            />
          </div>
        )}

        {/* Desna kolona — sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Objava */}
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 14 }}>Objava</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Status:</span>
                <strong style={{ color: status === "published" ? "#1D9E75" : "#f59e0b" }}>
                  {status === "published" ? "Objavljeno" : "Draft"}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Čitanje:</span>
                <strong>≈ {Math.max(1, Math.ceil(sadrzaj.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 200))} min</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Riječi:</span>
                <strong>{sadrzaj.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length}</strong>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => spremi()} disabled={sprema} className="uredi-btn" style={{ background: "#f3f4f6", color: "#374151", border: "none", width: "100%" }}>
                💾 Spremi draft
              </button>
              {status === "draft" ? (
                <button onClick={() => spremi("published")} disabled={sprema} className="uredi-btn" style={{ background: "#1D9E75", color: "white", border: "none", width: "100%", fontWeight: 700 }}>
                  ✅ Objavi na portalu
                </button>
              ) : (
                <button onClick={() => spremi("draft")} disabled={sprema} className="uredi-btn" style={{ background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", width: "100%" }}>
                  ↩ Povuci objavu
                </button>
              )}
            </div>
          </div>

          {/* Naslovna slika */}
          <ImageUpload value={naslovnaSlika} onChange={setNaslovnaSlika} label="Naslovna slika" />

          {/* Kategorija */}
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 12 }}>Kategorija *</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {KATEGORIJE.map(k => (
                <button key={k} onClick={() => setKategorija(k)} style={{
                  padding: "7px 13px", borderRadius: 20,
                  border: kategorija === k ? "2px solid #1D9E75" : "1.5px solid #e5e7eb",
                  background: kategorija === k ? "#f0fdf4" : "white",
                  color: kategorija === k ? "#1D9E75" : "#6b7280",
                  fontSize: 13, fontWeight: kategorija === k ? 700 : 500, cursor: "pointer",
                  minHeight: 36,
                }}>
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Autor */}
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
            <label style={{ display: "block", fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 10 }}>Autor</label>
            <input
              type="text"
              value={autor}
              onChange={e => setAutor(e.target.value)}
              placeholder="Redakcija kodnas.de"
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Tagovi */}
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
            <label style={{ display: "block", fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 6 }}>Tagovi</label>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>Odvojeni zarezom</div>
            <input
              type="text"
              value={tagovi}
              onChange={e => setTagovi(e.target.value)}
              placeholder="Elterngeld, Kindergeld, Porodica"
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Obriši */}
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #fecaca", padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#991b1b", marginBottom: 12 }}>Opasna zona</div>
            <button onClick={obrisi} style={{ width: "100%", padding: "10px", background: "#fff1f2", color: "#be123c", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>
              🗑️ Obriši ovaj članak
            </button>
          </div>
        </div>
      </div>

      {/* ── STICKY BOTTOM BAR (samo mobitel) ── */}
      <div className="uredi-sticky-bar">
        <button
          onClick={() => spremi()}
          disabled={sprema}
          style={{ flex: 1, background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 48, fontFamily: "inherit" }}
        >
          {sprema ? "Sprema..." : "💾 Spremi"}
        </button>
        {status === "draft" ? (
          <button
            onClick={() => spremi("published")}
            disabled={sprema}
            style={{ flex: 2, background: "#1D9E75", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", minHeight: 48, fontFamily: "inherit" }}
          >
            ✅ Objavi
          </button>
        ) : (
          <button
            onClick={() => spremi("draft")}
            disabled={sprema}
            style={{ flex: 2, background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 48, fontFamily: "inherit" }}
          >
            ↩ Povuci objavu
          </button>
        )}
      </div>

      {/* ── RESPONSIVE CSS ── */}
      <style>{`
        /* Desktop */
        .uredi-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .uredi-naslov-red {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .uredi-akcije {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .uredi-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 20px;
        }
        .uredi-btn {
          padding: 9px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          min-height: 40px;
          font-family: inherit;
          transition: opacity 0.15s;
        }
        .uredi-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .uredi-btn-desktop-only { display: inline-flex; }
        .uredi-sticky-bar { display: none; }

        /* Mobitel */
        @media (max-width: 680px) {
          .uredi-topbar {
            flex-direction: column;
            align-items: flex-start;
            margin-bottom: 14px;
            gap: 10px;
          }
          .uredi-naslov-red {
            width: 100%;
          }
          .uredi-akcije {
            width: 100%;
          }
          .uredi-btn-desktop-only {
            display: none;
          }
          .uredi-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .uredi-btn {
            min-height: 44px;
            flex: 1;
          }
          .uredi-sticky-bar {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 10px 14px;
            padding-bottom: calc(10px + env(safe-area-inset-bottom));
            background: white;
            border-top: 1px solid #e5e7eb;
            gap: 10px;
            z-index: 200;
            box-shadow: 0 -4px 12px rgba(0,0,0,0.08);
          }
          /* Extra space da sticky bar ne pokrije sadrzaj */
          .uredi-grid {
            padding-bottom: 80px;
          }
        }
      `}</style>
    </div>
  );
}
