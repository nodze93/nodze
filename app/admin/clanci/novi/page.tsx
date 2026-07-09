"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUpload from "@/components/admin/ImageUpload";
import RichEditor from "@/components/admin/RichEditor";
import { ocistiHtml } from "@/lib/sanitize";

const KATEGORIJE = ["viza", "posao", "stan", "zdravstvo", "porodica", "porez", "penzija", "povratak"];

export default function NoviClanakPage() {
  const router = useRouter();

  const [naslov, setNaslov] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [sadrzaj, setSadrzaj] = useState("");
  const [kategorija, setKategorija] = useState("viza");
  const [naslovnaSlika, setNaslovnaSlika] = useState("");
  const [autor, setAutor] = useState("Redakcija kodnas.de");
  const [tagovi, setTagovi] = useState("");
  const [preview, setPreview] = useState(false);
  const [sprema, setSprema] = useState(false);
  const [greska, setGreska] = useState("");

  async function kreiraj(statusObjave: "draft" | "published") {
    if (!naslov.trim()) { setGreska("Naslov je obavezan."); return; }
    if (!sadrzaj.trim()) { setGreska("Sadržaj je obavezan."); return; }

    setSprema(true);
    setGreska("");
    try {
      const res = await fetch("/api/admin/clanci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          naslov, excerpt, sadrzaj, kategorija, status: statusObjave,
          slika: naslovnaSlika, autor,
          tagovi: tagovi.split(",").map(t => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push(statusObjave === "published" ? "/admin/clanci?status=published" : "/admin/clanci?status=draft");
      } else {
        setGreska(data.error || "Greška pri kreiranju.");
      }
    } catch {
      setGreska("Greška. Provjeri konekciju.");
    } finally {
      setSprema(false);
    }
  }

  return (
    <div>
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/admin/clanci" style={{ color: "#9ca3af", textDecoration: "none", fontSize: 13 }}>← Natrag</Link>
          <span style={{ color: "#e5e7eb" }}>|</span>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>Novi članak</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setPreview(!preview)} style={{ padding: "9px 16px", background: preview ? "#1D9E75" : "#f3f4f6", color: preview ? "white" : "#374151", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {preview ? "✏️ Uredi" : "👁 Preview"}
          </button>
          <button onClick={() => kreiraj("draft")} disabled={sprema} style={{ padding: "9px 16px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            💾 Spremi draft
          </button>
          <button onClick={() => kreiraj("published")} disabled={sprema} style={{ padding: "9px 20px", background: "#1D9E75", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            ✅ Objavi odmah
          </button>
        </div>
      </div>

      {greska && (
        <div style={{ padding: "12px 16px", borderRadius: 8, marginBottom: 20, background: "#fee2e2", color: "#991b1b", fontSize: 14, fontWeight: 600 }}>❌ {greska}</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        {!preview ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Naslov *</label>
              <textarea
                value={naslov}
                onChange={e => setNaslov(e.target.value)}
                placeholder="Upiši naslov članka..."
                rows={2}
                autoFocus
                style={{ width: "100%", padding: "12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 20, fontWeight: 700, resize: "none", outline: "none", lineHeight: 1.4, fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Kratki uvod *</label>
              <textarea
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="2-3 rečenice koje opisuju članak..."
                rows={3}
                style={{ width: "100%", padding: "12px", border: `1.5px solid ${excerpt.length > 200 ? "#ef4444" : "#e5e7eb"}`, borderRadius: 8, fontSize: 14, resize: "none", outline: "none", lineHeight: 1.6, fontFamily: "inherit", boxSizing: "border-box" }}
              />
              <div style={{ textAlign: "right", fontSize: 11, color: excerpt.length > 200 ? "#ef4444" : "#9ca3af", marginTop: 4 }}>{excerpt.length} / 200</div>
            </div>

            <RichEditor value={sadrzaj} onChange={setSadrzaj} />
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 32 }}>
            <div style={{ marginBottom: 12, fontSize: 12, color: "#9ca3af" }}>👁 Preview</div>
            {naslovnaSlika && <img src={naslovnaSlika} alt={naslov} style={{ width: "100%", height: 240, objectFit: "cover", borderRadius: 10, marginBottom: 20 }} />}
            <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: "#1D9E7518", color: "#1D9E75", marginBottom: 12 }}>{kategorija}</span>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111", lineHeight: 1.3, marginBottom: 12 }}>{naslov || "Naslov članka"}</h1>
            {excerpt && <p style={{ fontSize: 16, color: "#4b5563", lineHeight: 1.7, padding: "14px 18px", borderLeft: "3px solid #1D9E75", background: "#f0fdf4", borderRadius: "0 8px 8px 0", marginBottom: 24 }}>{excerpt}</p>}
            <div dangerouslySetInnerHTML={{ __html: ocistiHtml(sadrzaj) }} style={{ fontSize: 15, lineHeight: 1.8, color: "#374151" }} />
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ImageUpload value={naslovnaSlika} onChange={setNaslovnaSlika} label="Naslovna slika" />

          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 12 }}>Kategorija *</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {KATEGORIJE.map(k => (
                <button key={k} onClick={() => setKategorija(k)} style={{
                  padding: "6px 12px", borderRadius: 20,
                  border: kategorija === k ? "2px solid #1D9E75" : "1.5px solid #e5e7eb",
                  background: kategorija === k ? "#f0fdf4" : "white",
                  color: kategorija === k ? "#1D9E75" : "#6b7280",
                  fontSize: 12, fontWeight: kategorija === k ? 700 : 500, cursor: "pointer",
                }}>
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
            <label style={{ display: "block", fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 10 }}>Autor</label>
            <input type="text" value={autor} onChange={e => setAutor(e.target.value)} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
            <label style={{ display: "block", fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 6 }}>Tagovi</label>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>Odvojeni zarezom</div>
            <input type="text" value={tagovi} onChange={e => setTagovi(e.target.value)} placeholder="Elterngeld, Kindergeld, Porodica" style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ background: "#fffbeb", borderRadius: 12, border: "1px solid #fcd34d", padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#92400e", marginBottom: 10 }}>💡 Savjeti</div>
            <ul style={{ fontSize: 12, color: "#92400e", lineHeight: 1.8, paddingLeft: 16, margin: 0 }}>
              <li>Naslov: 6–12 riječi, specifičan</li>
              <li>Excerpt: do 200 znakova</li>
              <li>Dodaj naslovnu sliku za bolji CTR</li>
              <li>Koristi H2 za sekcije u tekstu</li>
              <li>Umetni sliku u tekst za vizualni break</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
