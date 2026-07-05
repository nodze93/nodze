"use client";
import { useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = "Naslovna slika" }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [greska, setGreska] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  async function uploadFile(file: File) {
    setUploading(true);
    setGreska("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      } else {
        setGreska(data.error || "Greška pri uploadu");
      }
    } catch {
      setGreska("Greška pri uploadu. Provjeri konekciju.");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function applyUrl() {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput("");
      setShowUrlInput(false);
    }
  }

  return (
    <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
        {label}
      </label>

      {value ? (
        /* Slika je odabrana */
        <div style={{ position: "relative" }}>
          <img
            src={value}
            alt="Naslovna slika"
            style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 8, display: "block" }}
          />
          <div style={{
            position: "absolute", bottom: 8, right: 8, display: "flex", gap: 6,
          }}>
            <button
              onClick={() => fileRef.current?.click()}
              style={{ padding: "6px 12px", background: "white", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}
            >
              🔄 Promijeni
            </button>
            <button
              onClick={() => onChange("")}
              style={{ padding: "6px 10px", background: "#fff1f2", border: "1px solid #fecaca", borderRadius: 6, fontSize: 12, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}
            >
              🗑️
            </button>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: "#9ca3af", wordBreak: "break-all" }}>
            {value.length > 60 ? value.slice(0, 60) + "..." : value}
          </div>
        </div>
      ) : (
        /* Zona za upload */
        <div>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? "#1D9E75" : "#e5e7eb"}`,
              borderRadius: 10,
              padding: "32px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: dragging ? "#f0fdf4" : "#fafafa",
              transition: "all 0.15s",
              marginBottom: 10,
            }}
          >
            {uploading ? (
              <div>
                <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>Uploadanje...</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                  Prevuci sliku ovdje
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>
                  ili klikni za odabir · JPG, PNG, WebP · max 5MB
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
            <span style={{ fontSize: 11, color: "#9ca3af" }}>ili</span>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          </div>

          {showUrlInput ? (
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <input
                type="url"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://..."
                autoFocus
                onKeyDown={e => e.key === "Enter" && applyUrl()}
                style={{ flex: 1, padding: "8px 12px", border: "1.5px solid #1D9E75", borderRadius: 7, fontSize: 13, outline: "none" }}
              />
              <button onClick={applyUrl} style={{ padding: "8px 14px", background: "#1D9E75", color: "white", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Dodaj</button>
              <button onClick={() => setShowUrlInput(false)} style={{ padding: "8px 10px", background: "#f3f4f6", border: "none", borderRadius: 7, cursor: "pointer" }}>✕</button>
            </div>
          ) : (
            <button
              onClick={() => setShowUrlInput(true)}
              style={{ width: "100%", marginTop: 10, padding: "8px", background: "transparent", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, color: "#6b7280", cursor: "pointer" }}
            >
              🔗 Upiši URL slike
            </button>
          )}
        </div>
      )}

      {greska && <div style={{ marginTop: 8, fontSize: 12, color: "#ef4444" }}>❌ {greska}</div>}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
