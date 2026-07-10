"use client";
// ============================================================
// ADMIN — Zamjena slika sa Wikimedia (objavljeni članci)
// ============================================================
// 1) "Pronađi slike" prolazi kroz objavljene članke u malim grupama
//    (da Vercel ne istekne) i skuplja PRIJEDLOGE — ništa ne mijenja.
// 2) Pregledaš staru vs novu sliku, odznačiš šta ne želiš.
// 3) "Primijeni označene" tek tada upiše nove slike.
import { useState } from "react";

interface Prijedlog {
  id: string;
  naslov: string;
  kategorija: string | null;
  staraSlika: string | null;
  vecWiki: boolean;
  novaSlika: string;
  autor: string;
  licenca: string;
}

const ZELENA = "#1D9E75";

export default function SlikeStranica() {
  const [trazim, setTrazim] = useState(false);
  const [progres, setProgres] = useState<{ obradjeno: number; total: number } | null>(null);
  const [prijedlozi, setPrijedlozi] = useState<Prijedlog[]>([]);
  const [oznaceni, setOznaceni] = useState<Set<string>>(new Set());
  const [primjenjujem, setPrimjenjujem] = useState(false);
  const [poruka, setPoruka] = useState<string | null>(null);
  const [greska, setGreska] = useState<string | null>(null);

  async function pronadji() {
    setTrazim(true);
    setGreska(null);
    setPoruka(null);
    setPrijedlozi([]);
    setOznaceni(new Set());
    const limit = 8;
    let offset = 0;
    let total = 0;
    const skupljeni: Prijedlog[] = [];
    try {
      // Prolazi kroz stranice dok ima još
      // (do bezbjednosne granice od 500 članaka)
      for (let i = 0; i < 70; i++) {
        const r = await fetch("/api/admin/slike-wikimedia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "preview", offset, limit }),
        });
        const d = await r.json();
        if (!r.ok) {
          setGreska(d.error || "Greška pri pretrazi.");
          break;
        }
        total = d.total || 0;
        if (Array.isArray(d.prijedlozi)) {
          skupljeni.push(...(d.prijedlozi as Prijedlog[]));
          setPrijedlozi([...skupljeni]);
          setOznaceni(new Set(skupljeni.map((p) => p.id)));
        }
        setProgres({ obradjeno: Math.min(d.sljedeciOffset || 0, total), total });
        if (!d.ima_jos) break;
        offset = d.sljedeciOffset;
      }
    } catch (e) {
      setGreska((e as Error).message);
    } finally {
      setTrazim(false);
    }
  }

  function prebaci(id: string) {
    setOznaceni((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  }

  function sviIliNijedan() {
    setOznaceni((prev) =>
      prev.size === prijedlozi.length ? new Set() : new Set(prijedlozi.map((p) => p.id))
    );
  }

  async function primijeni() {
    const stavke = prijedlozi
      .filter((p) => oznaceni.has(p.id))
      .map((p) => ({ id: p.id, url: p.novaSlika, autor: p.autor, licenca: p.licenca }));
    if (stavke.length === 0) return;
    setPrimjenjujem(true);
    setGreska(null);
    setPoruka(null);
    try {
      let primijenjeno = 0;
      // U grupama po 10 (brzo, ali da ne bude ogroman zahtjev)
      for (let i = 0; i < stavke.length; i += 10) {
        const grupa = stavke.slice(i, i + 10);
        const r = await fetch("/api/admin/slike-wikimedia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "apply", stavke: grupa }),
        });
        const d = await r.json();
        if (!r.ok) {
          setGreska(d.error || "Greška pri primjeni.");
          break;
        }
        primijenjeno += d.primijenjeno || 0;
      }
      setPoruka(`Zamijenjeno slika: ${primijenjeno}. Osvježi portal da vidiš promjene.`);
      // Ukloni primijenjene iz liste
      const primijenjeniIds = new Set(stavke.map((s) => s.id));
      setPrijedlozi((prev) => prev.filter((p) => !primijenjeniIds.has(p.id)));
      setOznaceni(new Set());
    } catch (e) {
      setGreska((e as Error).message);
    } finally {
      setPrimjenjujem(false);
    }
  }

  const brojOznacenih = oznaceni.size;

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>🖼️ Zamjena slika (Wikimedia)</h1>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
        Traži prave slike na Wikimedia Commons za objavljene članke. Prvo pregledaš prijedloge, pa
        primijeniš samo one koje želiš. Za apstraktne teme možda neće naći ništa — takvi članci
        zadrže postojeću sliku.
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        <button
          onClick={pronadji}
          disabled={trazim || primjenjujem}
          style={{
            padding: "10px 18px",
            background: ZELENA,
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: trazim ? "default" : "pointer",
            opacity: trazim ? 0.7 : 1,
          }}
        >
          {trazim ? "Tražim..." : "🔍 Pronađi slike (pregled)"}
        </button>

        {progres && (
          <span style={{ fontSize: 13, color: "#6b7280" }}>
            Provjereno {progres.obradjeno}/{progres.total} • pronađeno prijedloga: {prijedlozi.length}
          </span>
        )}
      </div>

      {greska && (
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          ⚠️ {greska}
        </div>
      )}
      {poruka && (
        <div style={{ background: "#ecfdf5", color: "#065f46", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          ✅ {poruka}
        </div>
      )}

      {prijedlozi.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <button
              onClick={sviIliNijedan}
              style={{ background: "none", border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer" }}
            >
              {oznaceni.size === prijedlozi.length ? "Odznači sve" : "Označi sve"}
            </button>
            <button
              onClick={primijeni}
              disabled={primjenjujem || brojOznacenih === 0}
              style={{
                padding: "9px 18px",
                background: brojOznacenih === 0 ? "#9ca3af" : ZELENA,
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: brojOznacenih === 0 ? "default" : "pointer",
              }}
            >
              {primjenjujem ? "Primjenjujem..." : `✅ Primijeni označene (${brojOznacenih})`}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {prijedlozi.map((p) => {
              const cek = oznaceni.has(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => prebaci(p.id)}
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    background: "white",
                    border: `2px solid ${cek ? ZELENA : "#e5e7eb"}`,
                    borderRadius: 12,
                    padding: 12,
                    cursor: "pointer",
                  }}
                >
                  <input type="checkbox" checked={cek} readOnly style={{ width: 18, height: 18, flexShrink: 0 }} />

                  {/* Stara slika */}
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 4 }}>SADA</div>
                    {p.staraSlika ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.staraSlika} alt="" style={{ width: 110, height: 74, objectFit: "cover", borderRadius: 6, opacity: 0.6 }} />
                    ) : (
                      <div style={{ width: 110, height: 74, borderRadius: 6, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#9ca3af" }}>nema</div>
                    )}
                  </div>

                  <div style={{ fontSize: 20, color: "#9ca3af", flexShrink: 0 }}>→</div>

                  {/* Nova slika */}
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 10, color: ZELENA, marginBottom: 4, fontWeight: 700 }}>NOVA</div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.novaSlika} alt="" style={{ width: 110, height: 74, objectFit: "cover", borderRadius: 6 }} />
                  </div>

                  {/* Info */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {p.naslov}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {p.kategorija ? `${p.kategorija} • ` : ""}Foto: {p.autor} ({p.licenca})
                      {p.vecWiki ? " • već Wikimedia" : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {!trazim && progres && prijedlozi.length === 0 && (
        <div style={{ color: "#6b7280", fontSize: 14, padding: 20, textAlign: "center", background: "#f9fafb", borderRadius: 12 }}>
          Nije pronađena nijedna relevantna Wikimedia slika za objavljene članke. Članci zadržavaju
          postojeće slike.
        </div>
      )}
    </div>
  );
}
