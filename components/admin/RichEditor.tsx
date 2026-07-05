"use client";
import { useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

const TOOLBAR_ITEMS = [
  { label: "H2", title: "Naslov (H2)", html: (sel: string) => `<h2>${sel || "Naslov sekcije"}</h2>` },
  { label: "H3", title: "Podnaslov (H3)", html: (sel: string) => `<h3>${sel || "Podnaslov"}</h3>` },
  { label: "§", title: "Pasus", html: (sel: string) => `<p>${sel || "Tekst paragrafa..."}</p>` },
  { sep: true },
  { label: "B", title: "Bold", html: (sel: string) => `<strong>${sel || "tekst"}</strong>`, style: "font-weight:700" },
  { label: "I", title: "Italic", html: (sel: string) => `<em>${sel || "tekst"}</em>`, style: "font-style:italic" },
  { sep: true },
  { label: "• Lista", title: "Lista (ul)", html: (sel: string) => `<ul>\n  <li>${sel || "Stavka 1"}</li>\n  <li>Stavka 2</li>\n  <li>Stavka 3</li>\n</ul>` },
  { label: "1. Lista", title: "Numerisana lista (ol)", html: (sel: string) => `<ol>\n  <li>${sel || "Prva stavka"}</li>\n  <li>Druga stavka</li>\n  <li>Treća stavka"</li>\n</ol>` },
  { sep: true },
  { label: "🔗 Link", title: "Dodaj link", special: "link" },
  { label: "🖼 Slika", title: "Umetni sliku u tekst", special: "image" },
  { sep: true },
  { label: "Tabela", title: "Tabela 2 kolone", html: () => `<table>\n  <tr>\n    <th>Kolona 1</th>\n    <th>Kolona 2</th>\n  </tr>\n  <tr>\n    <td>Podatak</td>\n    <td>Podatak</td>\n  </tr>\n  <tr>\n    <td>Podatak</td>\n    <td>Podatak</td>\n  </tr>\n</table>` },
  { label: "💡 Tip", title: "Info box / savjet", html: () => `<div class="info-box">\n  <strong>💡 Važno:</strong> Ovdje upiši savjet ili upozorenje za čitatelje.\n</div>` },
];

export default function RichEditor({ value, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkHref, setLinkHref] = useState("https://");
  const [linkTekst, setLinkTekst] = useState("");
  const [imgUrl, setImgUrl] = useState("https://");
  const [imgAlt, setImgAlt] = useState("");
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const imgFileRef = useRef<HTMLInputElement>(null);

  function insertAtCursor(tekst: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const selected = value.slice(start, end);
    onChange(before + "\n" + tekst + "\n" + after);
    // Vrati focus i postavi cursor
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + tekst.length + 2, start + tekst.length + 2);
    }, 0);
  }

  function handleToolbar(item: any) {
    if (item.special === "link") {
      const ta = textareaRef.current;
      if (ta) {
        const sel = value.slice(ta.selectionStart, ta.selectionEnd);
        setLinkTekst(sel || "");
      }
      setShowLinkDialog(true);
      return;
    }
    if (item.special === "image") {
      setShowImageDialog(true);
      return;
    }
    if (item.html) {
      const ta = textareaRef.current;
      const sel = ta ? value.slice(ta.selectionStart, ta.selectionEnd) : "";
      insertAtCursor(item.html(sel));
    }
  }

  function insertLink() {
    insertAtCursor(`<a href="${linkHref}" target="_blank" rel="noopener">${linkTekst || linkHref}</a>`);
    setShowLinkDialog(false);
    setLinkHref("https://");
    setLinkTekst("");
  }

  async function insertImage() {
    let url = imgUrl;

    if (imgFile) {
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", imgFile);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url) url = data.url;
      } catch {
        url = imgUrl;
      } finally {
        setUploading(false);
      }
    }

    const alt = imgAlt || "Slika";
    insertAtCursor(`<figure>\n  <img src="${url}" alt="${alt}" style="width:100%;border-radius:8px;" />\n  <figcaption>${alt}</figcaption>\n</figure>`);
    setShowImageDialog(false);
    setImgUrl("https://");
    setImgAlt("");
    setImgFile(null);
  }

  const minCitanja = Math.max(1, Math.ceil(value.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 200));

  return (
    <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Sadržaj članka *
        </label>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>≈ {minCitanja} min čitanja</span>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, padding: "10px 12px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", alignItems: "center" }}>
        {TOOLBAR_ITEMS.map((item, i) => {
          if ('sep' in item) return <div key={i} style={{ width: 1, height: 20, background: "#e5e7eb", margin: "0 4px" }} />;
          return (
            <button
              key={i}
              title={item.title}
              onClick={() => handleToolbar(item)}
              style={{
                padding: "5px 11px",
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                color: "#374151",
                ...(item.style ? { } : {}),
                whiteSpace: "nowrap",
                transition: "all 0.1s",
              }}
              onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = "#f0fdf4"; (e.target as HTMLButtonElement).style.borderColor = "#1D9E75"; }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = "white"; (e.target as HTMLButtonElement).style.borderColor = "#e5e7eb"; }}
            >
              <span style={item.style ? { fontWeight: 700 } : {}}>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={`<h2>Uvod</h2>\n<p>Tekst članka ovdje...</p>\n\n<h2>Druga sekcija</h2>\n<p>Nastavak teksta...</p>`}
        style={{
          width: "100%",
          minHeight: 420,
          padding: "16px",
          border: "none",
          outline: "none",
          fontSize: 13,
          lineHeight: 1.8,
          fontFamily: "'Fira Code', 'Courier New', monospace",
          resize: "vertical",
          color: "#1a1a1a",
          background: "white",
          display: "block",
          boxSizing: "border-box",
        }}
      />

      {/* Link dialog */}
      {showLinkDialog && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 14, padding: 28, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>🔗 Dodaj link</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>URL *</label>
              <input
                type="url"
                value={linkHref}
                onChange={e => setLinkHref(e.target.value)}
                autoFocus
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 7, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "#1D9E75"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>Tekst linka</label>
              <input
                type="text"
                value={linkTekst}
                onChange={e => setLinkTekst(e.target.value)}
                placeholder="Prikaži URL ako ostane prazno"
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 7, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "#1D9E75"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowLinkDialog(false)} style={{ padding: "9px 18px", background: "#f3f4f6", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>Odustani</button>
              <button onClick={insertLink} style={{ padding: "9px 20px", background: "#1D9E75", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Umetni link</button>
            </div>
          </div>
        </div>
      )}

      {/* Image dialog */}
      {showImageDialog && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 14, padding: 28, width: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>🖼️ Umetni sliku u tekst</div>

            {/* Upload tab */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>Učitaj sa računara</label>
              <div
                onClick={() => imgFileRef.current?.click()}
                style={{
                  border: `2px dashed ${imgFile ? "#1D9E75" : "#e5e7eb"}`,
                  borderRadius: 8,
                  padding: "20px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: imgFile ? "#f0fdf4" : "#fafafa",
                }}
              >
                {imgFile ? (
                  <div style={{ fontSize: 13, color: "#1D9E75", fontWeight: 600 }}>✅ {imgFile.name}</div>
                ) : (
                  <div style={{ fontSize: 13, color: "#9ca3af" }}>Klikni ili prevuci sliku · JPG, PNG, WebP</div>
                )}
              </div>
              <input ref={imgFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { setImgFile(e.target.files?.[0] || null); setImgUrl(""); }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
              <span style={{ fontSize: 11, color: "#9ca3af" }}>ili URL</span>
              <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>URL slike</label>
              <input
                type="url"
                value={imgUrl}
                onChange={e => { setImgUrl(e.target.value); setImgFile(null); }}
                placeholder="https://..."
                disabled={!!imgFile}
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 7, fontSize: 14, outline: "none", boxSizing: "border-box", opacity: imgFile ? 0.5 : 1 }}
                onFocus={e => e.target.style.borderColor = "#1D9E75"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>Opis slike (alt tekst)</label>
              <input
                type="text"
                value={imgAlt}
                onChange={e => setImgAlt(e.target.value)}
                placeholder="Kratki opis slike za pristupačnost..."
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 7, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "#1D9E75"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => { setShowImageDialog(false); setImgFile(null); }} style={{ padding: "9px 18px", background: "#f3f4f6", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>Odustani</button>
              <button
                onClick={insertImage}
                disabled={uploading || (!imgFile && !imgUrl.startsWith("http"))}
                style={{ padding: "9px 20px", background: uploading ? "#a0d5be" : "#1D9E75", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                {uploading ? "Uploading..." : "Umetni sliku"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
