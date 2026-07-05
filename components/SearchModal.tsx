"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { clanci } from "@/lib/data/clanci";
import { vodici } from "@/lib/data/vodici";

export default function SearchModal() {
  const [otvoren, setOtvoren] = useState(false);
  const [upit, setUpit] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOtvoren((prev) => !prev);
      }
      if (e.key === "Escape") setOtvoren(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (otvoren) setTimeout(() => inputRef.current?.focus(), 50);
  }, [otvoren]);

  const rezultati = upit.length > 1
    ? [
        ...clanci.filter((c) =>
          c.naslov.toLowerCase().includes(upit.toLowerCase()) ||
          c.excerpt.toLowerCase().includes(upit.toLowerCase())
        ).slice(0, 5).map((c) => ({ tip: "clanak" as const, slug: c.slug, naslov: c.naslov, kategorija: c.kategorija })),
        ...vodici.filter((v) =>
          v.naziv.toLowerCase().includes(upit.toLowerCase()) ||
          v.opis.toLowerCase().includes(upit.toLowerCase())
        ).slice(0, 3).map((v) => ({ tip: "vodic" as const, slug: v.slug, naslov: v.naziv, kategorija: v.kategorija })),
      ]
    : [];

  const idi = (tip: "clanak" | "vodic", slug: string) => {
    router.push(`/${tip}/${slug}`);
    setOtvoren(false);
    setUpit("");
  };

  if (!otvoren) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 2000, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 80 }}
      onClick={() => setOtvoren(false)}
    >
      <div
        style={{ background: "white", borderRadius: 12, width: "100%", maxWidth: 560, boxShadow: "0 8px 40px rgba(0,0,0,0.2)", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 18 }}>🔍</span>
          <input
            ref={inputRef}
            value={upit}
            onChange={(e) => setUpit(e.target.value)}
            placeholder="Pretraži portal — vijesti, vodiče, teme..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 16, color: "var(--tekst)" }}
          />
          <kbd style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "2px 8px", fontSize: 11, color: "var(--tekst-muted)" }}>ESC</kbd>
        </div>

        {/* Rezultati */}
        {rezultati.length > 0 ? (
          <div>
            {rezultati.map((r, i) => (
              <button
                key={i}
                onClick={() => idi(r.tip, r.slug)}
                style={{ width: "100%", display: "flex", gap: 12, padding: "12px 16px", borderBottom: i < rezultati.length - 1 ? "1px solid var(--border)" : "none", textAlign: "left", background: "none", border: "none", cursor: "pointer", transition: "background 0.15s", alignItems: "center" }}
                className="hover:bg-[#fafafa]"
              >
                <span style={{ fontSize: 18 }}>{r.tip === "vodic" ? "📋" : "📰"}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{r.naslov}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className={`tag-pill tag-${r.kategorija}`}>{r.kategorija}</span>
                    <span style={{ fontSize: 11, color: "var(--tekst-light)" }}>{r.tip === "vodic" ? "Vodič" : "Članak"}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : upit.length > 1 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--tekst-muted)", fontSize: 14 }}>
            Nema rezultata za &quot;{upit}&quot;
          </div>
        ) : (
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--tekst-muted)", marginBottom: 8 }}>Popularne teme</div>
            {["radna viza", "Elterngeld", "Steuerklasse", "stan München", "Kindergeld"].map((t) => (
              <button key={t} onClick={() => setUpit(t)} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 0", fontSize: 13, color: "var(--zelena)", background: "none", border: "none", cursor: "pointer" }}>
                → {t}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
