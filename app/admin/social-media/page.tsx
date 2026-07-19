"use client";
// ============================================================
// ADMIN — Social Media Editor (mobile-friendly)
// ============================================================
import { useState, useEffect, useCallback } from "react";

// ── TIPOVI ───────────────────────────────────────────────────
type FbStatus = "ceka" | "odobreno" | "preskoceno" | "objavljeno";
type FbTip = "news" | "engage" | "original";
type Poruka = { tip: "ok" | "greska"; tekst: string };

interface FbPost {
  id: number;
  slug: string;
  naslov: string;
  excerpt: string | null;
  kategorija: string;
  status: string;
  slika: string | null;
  fb_tekst_news: string | null;
  fb_tekst_engage: string | null;
  fb_thumbnail_r1: string | null;
  fb_thumbnail_r2: string | null;
  fb_social_status: FbStatus;
  fb_tip: FbTip | null;
  fb_zakazano_za: string | null;
  fb_post_id: string | null;
  created_at: string;
}

// ── KONSTANTE ─────────────────────────────────────────────────
const TIPOVI: { value: FbTip; label: string; emoji: string; opis: string }[] = [
  { value: "news",     label: "Vijesti",    emoji: "📰", opis: "Klikovi na clanak" },
  { value: "engage",   label: "Engagement", emoji: "💬", opis: "Komentari/dijeljenje" },
  { value: "original", label: "Originalna", emoji: "🖼️", opis: "Bez thumbnailа" },
];

const STATUSI: { value: FbStatus | "sve"; label: string; boja: string }[] = [
  { value: "ceka",       label: "Ceka",       boja: "#F59E0B" },
  { value: "odobreno",   label: "Odobreno",   boja: "#3B82F6" },
  { value: "objavljeno", label: "Objavljeno", boja: "#10B981" },
  { value: "preskoceno", label: "Preskoceno", boja: "#6B7280" },
];

// ── HELPER: generiši thumbnail URL ───────────────────────────
function thumbnailUrl(post: FbPost, tip?: FbTip): string {
  const t = tip || post.fb_tip || "news";
  if (t === "original") return post.slika || "";
  const predlozak = t === "engage" ? "engagement" : "informative";
  const params = new URLSearchParams({
    t: predlozak,
    r1: post.fb_thumbnail_r1 || post.naslov.slice(0, 50),
    r2: post.fb_thumbnail_r2 || "kodnas.de",
  });
  if (post.slika) params.set("slika", post.slika);
  return `/api/og/thumbnail?${params.toString()}`;
}

// ── THUMBNAIL PREGLED ─────────────────────────────────────────
function ThumbnailPregled({ post, tip }: { post: FbPost; tip: FbTip }) {
  const url = thumbnailUrl(post, tip);
  if (!url) return (
    <div style={{
      width: "100%", aspectRatio: "1200/630", background: "#1f2937",
      borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
      color: "#6b7280", fontSize: 12,
    }}>Nema slike</div>
  );
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Thumbnail pregled"
      style={{ width: "100%", aspectRatio: "1200/630", objectFit: "cover", borderRadius: 8, display: "block" }}
      loading="lazy"
    />
  );
}

// ── KARTICA JEDNOG POSTA ──────────────────────────────────────
function PostKartica({
  post,
  onAzuriraj,
  onOdobri,
  onPreskoci,
  onObjavi,
}: {
  post: FbPost;
  onAzuriraj: (id: number, izmjene: Partial<FbPost>) => void;
  onOdobri: (id: number) => void;
  onPreskoci: (id: number) => void;
  onObjavi: (id: number) => Promise<Poruka | null>;
}) {
  const [tip, setTip]                     = useState<FbTip>(post.fb_tip || "news");
  const [uredi, setUredi]                 = useState(false);
  const [tekstNews, setTekstNews]         = useState(post.fb_tekst_news || "");
  const [tekstEngage, setTekstEngage]     = useState(post.fb_tekst_engage || "");
  const [r1, setR1]                       = useState(post.fb_thumbnail_r1 || "");
  const [r2, setR2]                       = useState(post.fb_thumbnail_r2 || "");
  const [objavljivanje, setObjavljivanje] = useState(false);
  const [poruka, setPoruka]               = useState<Poruka | null>(null);

  const aktivniTekst = tip === "engage" ? tekstEngage : tekstNews;

  async function sacuvaj() {
    const izmjene: Partial<FbPost> = {
      fb_tip:          tip,
      fb_tekst_news:   tekstNews || null,
      fb_tekst_engage: tekstEngage || null,
      fb_thumbnail_r1: r1 || null,
      fb_thumbnail_r2: r2 || null,
    };
    onAzuriraj(post.id, izmjene);
    await fetch("/api/admin/social-media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: post.id, ...izmjene }),
    });
    setUredi(false);
  }

  async function promijeniTip(noviTip: FbTip) {
    setTip(noviTip);
    onAzuriraj(post.id, { fb_tip: noviTip });
    await fetch("/api/admin/social-media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: post.id, fb_tip: noviTip }),
    });
  }

  async function objavi() {
    setObjavljivanje(true);
    setPoruka(null);
    const rezultat = await onObjavi(post.id);
    if (rezultat) setPoruka(rezultat);
    setObjavljivanje(false);
  }

  const jeObjavljeno = post.fb_social_status === "objavljeno";
  const jePreskoceno = post.fb_social_status === "preskoceno";

  const datum = new Date(post.created_at).toLocaleDateString("bs-BA", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div style={{
      background: "white", borderRadius: 12, border: "1px solid #e5e7eb",
      overflow: "hidden", opacity: jePreskoceno ? 0.55 : 1,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      {/* ── HEADER ── */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
          <span style={{
            background: "#f0fdf4", color: "#166534", fontSize: 11, fontWeight: 600,
            padding: "2px 8px", borderRadius: 100,
          }}>
            {post.kategorija}
          </span>
          <span style={{ color: "#9ca3af", fontSize: 12 }}>{datum}</span>
          {jeObjavljeno && (
            <span style={{
              background: "#ecfdf5", color: "#059669", fontSize: 11, fontWeight: 600,
              padding: "2px 10px", borderRadius: 100,
            }}>
              ✓ Objavljeno
            </span>
          )}
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", lineHeight: 1.4 }}>
          {post.naslov}
        </div>
      </div>

      {/* ── BODY: thumbnail + sadrzaj ── */}
      <div className="fb-kartica-body">
        {/* Thumbnail panel */}
        <div className="fb-thumb">
          <ThumbnailPregled
            post={{ ...post, fb_thumbnail_r1: r1 || post.fb_thumbnail_r1, fb_thumbnail_r2: r2 || post.fb_thumbnail_r2 }}
            tip={tip}
          />
          {uredi && tip !== "original" && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <label style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>NASLOV NA SLICI (R1)</label>
                <input
                  value={r1}
                  onChange={(e) => setR1(e.target.value)}
                  placeholder="Npr. NOVO PRAVILO OD JANUARA"
                  style={{
                    width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #d1d5db",
                    borderRadius: 6, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>PODNASLOV (R2)</label>
                <input
                  value={r2}
                  onChange={(e) => setR2(e.target.value)}
                  placeholder="Npr. Vijesti iz Njemacke"
                  style={{
                    width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #d1d5db",
                    borderRadius: 6, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sadrzaj panel */}
        <div className="fb-sadrzaj">
          {/* Tip selector */}
          <div style={{ display: "flex", gap: 6 }}>
            {TIPOVI.map((t) => (
              <button
                key={t.value}
                onClick={() => promijeniTip(t.value)}
                disabled={jeObjavljeno}
                style={{
                  flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: jeObjavljeno ? "default" : "pointer",
                  border: tip === t.value ? "2px solid #1D9E75" : "2px solid #e5e7eb",
                  background: tip === t.value ? "#f0fdf9" : "white",
                  color: tip === t.value ? "#1D9E75" : "#6b7280",
                  transition: "all 0.1s", lineHeight: 1.3, textAlign: "center",
                }}
              >
                {t.emoji} {t.label}
                <span style={{
                  fontSize: 10, display: "block", fontWeight: 400,
                  color: tip === t.value ? "#059669" : "#9ca3af",
                }}>
                  {t.opis}
                </span>
              </button>
            ))}
          </div>

          {/* Tekst posta */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>
                {tip === "engage" ? "💬 Engagement" : tip === "original" ? "🖼️ Originalni" : "📰 Vijesti post"}
              </label>
              {!jeObjavljeno && (
                <button
                  onClick={() => setUredi(!uredi)}
                  style={{
                    fontSize: 12, color: uredi ? "#1D9E75" : "#6b7280", background: "none",
                    border: "none", cursor: "pointer", fontWeight: 600,
                    padding: "6px 10px", minHeight: 36, borderRadius: 6,
                  }}
                >
                  {uredi ? "✕ Zatvori" : "✏️ Uredi"}
                </button>
              )}
            </div>

            {tip === "original" ? (
              <div style={{
                padding: 12, background: "#f9fafb", borderRadius: 8,
                fontSize: 13, color: "#6b7280", fontStyle: "italic", lineHeight: 1.5,
              }}>
                Koristice se originalna naslovna slika clanka bez thumbnail overlaya.
                Tekst posta: naslov + &ldquo;Cijeli clanak u prvom komentaru.&rdquo;
              </div>
            ) : uredi ? (
              <textarea
                value={tip === "engage" ? tekstEngage : tekstNews}
                onChange={(e) => tip === "engage" ? setTekstEngage(e.target.value) : setTekstNews(e.target.value)}
                rows={6}
                style={{
                  width: "100%", padding: "10px 12px", border: "1px solid #1D9E75",
                  borderRadius: 8, fontSize: 14, fontFamily: "inherit", resize: "vertical",
                  lineHeight: 1.6, boxSizing: "border-box",
                }}
              />
            ) : (
              <div style={{
                padding: "10px 12px", background: "#f9fafb", borderRadius: 8,
                fontSize: 13, color: "#374151", lineHeight: 1.6, whiteSpace: "pre-wrap",
                minHeight: 80,
              }}>
                {aktivniTekst || (
                  <span style={{ color: "#d1d5db", fontStyle: "italic" }}>Nema teksta za ovaj tip posta.</span>
                )}
              </div>
            )}

            {aktivniTekst && !uredi && (
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                {aktivniTekst.length} znakova
              </div>
            )}
          </div>

          {/* Poruka uspjeh/greška */}
          {poruka && (
            <div style={{
              padding: "10px 14px", borderRadius: 8, fontSize: 13,
              background: poruka.tip === "ok" ? "#ecfdf5" : "#fef2f2",
              color: poruka.tip === "ok" ? "#065f46" : "#991b1b",
              border: `1px solid ${poruka.tip === "ok" ? "#6ee7b7" : "#fca5a5"}`,
            }}>
              {poruka.tekst}
            </div>
          )}

          {/* ── AKCIJE ── */}
          {!jeObjavljeno && !jePreskoceno && (
            <div className="fb-akcije">
              {uredi ? (
                <>
                  <button onClick={sacuvaj} className="fb-btn fb-btn-primary">
                    Sacuvaj izmjene
                  </button>
                  <button onClick={() => setUredi(false)} className="fb-btn fb-btn-sekundarni">
                    Odustani
                  </button>
                </>
              ) : (
                <>
                  {post.fb_social_status !== "odobreno" && (
                    <button onClick={() => onOdobri(post.id)} className="fb-btn fb-btn-odobri">
                      ✓ Odobri
                    </button>
                  )}
                  <button
                    onClick={objavi}
                    disabled={objavljivanje}
                    className="fb-btn fb-btn-objavi"
                    style={{ opacity: objavljivanje ? 0.7 : 1, cursor: objavljivanje ? "not-allowed" : "pointer" }}
                  >
                    {objavljivanje ? "Objavljujem..." : "📘 Objavi odmah"}
                  </button>
                  <button onClick={() => onPreskoci(post.id)} className="fb-btn fb-btn-sekundarni">
                    Preskoci
                  </button>
                </>
              )}
            </div>
          )}

          {/* Link na objavljeni post */}
          {jeObjavljeno && post.fb_post_id && (
            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 10 }}>
              <a
                href={`https://facebook.com/${post.fb_post_id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 13, color: "#1877F2", fontWeight: 600 }}
              >
                Pogledaj na Facebooku →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── GLAVNA STRANICA ───────────────────────────────────────────
export default function SocialMediaPage() {
  const [aktivniStatus, setAktivniStatus] = useState<FbStatus | "sve">("ceka");
  const [postovi, setPostovi]             = useState<FbPost[]>([]);
  const [ucitavanje, setUcitavanje]       = useState(true);
  const [greska, setGreska]               = useState<string | null>(null);

  const fetchPostovi = useCallback(async (status: FbStatus | "sve") => {
    setUcitavanje(true);
    setGreska(null);
    try {
      const res = await fetch(`/api/admin/social-media?status=${status}&limit=50`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Greska pri ucitavanju");
      setPostovi(json.postovi || []);
    } catch (e) {
      setGreska((e as Error).message);
    } finally {
      setUcitavanje(false);
    }
  }, []);

  useEffect(() => {
    fetchPostovi(aktivniStatus);
  }, [aktivniStatus, fetchPostovi]);

  function azuriraj(id: number, izmjene: Partial<FbPost>) {
    setPostovi((prev) => prev.map((p) => (p.id === id ? { ...p, ...izmjene } : p)));
  }

  async function odobri(id: number) {
    azuriraj(id, { fb_social_status: "odobreno" });
    await fetch("/api/admin/social-media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, fb_social_status: "odobreno" }),
    });
    if (aktivniStatus === "ceka") {
      setPostovi((prev) => prev.filter((p) => p.id !== id));
    }
  }

  async function preskoci(id: number) {
    azuriraj(id, { fb_social_status: "preskoceno" });
    await fetch("/api/admin/social-media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, fb_social_status: "preskoceno" }),
    });
    setPostovi((prev) => prev.filter((p) => p.id !== id));
  }

  async function objavi(id: number): Promise<Poruka | null> {
    try {
      const res = await fetch("/api/admin/social-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { tip: "greska", tekst: json.error || "Greska pri objavljivanju" };
      }
      azuriraj(id, { fb_social_status: "objavljeno", fb_post_id: json.postId });
      if (aktivniStatus !== "objavljeno" && aktivniStatus !== "sve") {
        setTimeout(() => setPostovi((prev) => prev.filter((p) => p.id !== id)), 2500);
      }
      return { tip: "ok", tekst: json.poruka };
    } catch (e) {
      return { tip: "greska", tekst: (e as Error).message };
    }
  }

  const brPostaZaStatus = (s: FbStatus | "sve") =>
    s === aktivniStatus ? postovi.length : null;

  return (
    <div>
      {/* ── HEADER ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0 }}>
              📘 Facebook Red
            </h1>
            <p style={{ color: "#6b7280", fontSize: 13, margin: "3px 0 0" }}>
              Pregled, uredivanje i objavljivanje FB postova
            </p>
          </div>
          <button
            onClick={() => fetchPostovi(aktivniStatus)}
            style={{
              padding: "8px 16px", background: "white", border: "1px solid #e5e7eb",
              borderRadius: 8, fontSize: 13, color: "#374151", cursor: "pointer",
              fontWeight: 600, minHeight: 40,
            }}
          >
            ↻ Osvjezi
          </button>
        </div>

        <div style={{
          marginTop: 12, padding: "10px 14px", background: "#fffbeb",
          border: "1px solid #fde68a", borderRadius: 8, fontSize: 12, color: "#92400e",
        }}>
          💡 Preporucena rotacija: 2x thumbnail (Vijesti/Engagement), 1x Originalna slika
        </div>
      </div>

      {/* ── TAB NAVIGACIJA — horizontal scroll na mobileu ── */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 18,
        overflowX: "auto", paddingBottom: 4,
      }}>
        {STATUSI.map((s) => (
          <button
            key={s.value}
            onClick={() => setAktivniStatus(s.value)}
            style={{
              padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: "pointer", border: "none", transition: "all 0.15s", flexShrink: 0,
              background: aktivniStatus === s.value ? s.boja : "#f3f4f6",
              color: aktivniStatus === s.value ? "white" : "#6b7280",
              minHeight: 40,
            }}
          >
            {s.label}
            {brPostaZaStatus(s.value) !== null && (
              <span style={{
                marginLeft: 6, background: "rgba(255,255,255,0.25)",
                padding: "1px 7px", borderRadius: 100, fontSize: 11,
              }}>
                {brPostaZaStatus(s.value)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── SADRZAJ ── */}
      {ucitavanje ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
          Ucitavam postove...
        </div>
      ) : greska ? (
        <div style={{
          padding: 20, background: "#fef2f2", borderRadius: 8,
          color: "#991b1b", border: "1px solid #fca5a5",
        }}>
          {greska}
        </div>
      ) : postovi.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          background: "white", borderRadius: 12, border: "1px solid #e5e7eb",
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>
            {aktivniStatus === "ceka" ? "🎉" : aktivniStatus === "objavljeno" ? "📊" : "📭"}
          </div>
          <div style={{ color: "#6b7280", fontSize: 15 }}>
            {aktivniStatus === "ceka"
              ? "Nema novih postova koji cekaju pregled. Bot ce generisati nove pri sljedecem pokretanju."
              : aktivniStatus === "odobreno"
              ? "Nema odobrenih postova koji cekaju objavu."
              : aktivniStatus === "objavljeno"
              ? "Jos nema objavljenih postova."
              : "Nema preskocenih postova."}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {postovi.map((post) => (
            <PostKartica
              key={post.id}
              post={post}
              onAzuriraj={azuriraj}
              onOdobri={odobri}
              onPreskoci={preskoci}
              onObjavi={objavi}
            />
          ))}
        </div>
      )}

      {/* ── RESPONSIVE CSS ── */}
      <style>{`
        /* Desktop: thumbnail lijevo (260px), sadrzaj desno */
        .fb-kartica-body {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
        }
        .fb-thumb {
          width: 260px;
          flex-shrink: 0;
          padding: 14px;
          border-right: 1px solid #f3f4f6;
          box-sizing: border-box;
        }
        .fb-sadrzaj {
          flex: 1;
          min-width: 0;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .fb-akcije {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          border-top: 1px solid #f3f4f6;
          padding-top: 12px;
        }

        /* Zajednicke klase za dugmice */
        .fb-btn {
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          min-height: 44px;
          font-family: inherit;
          transition: opacity 0.15s;
        }
        .fb-btn-primary    { background: #1D9E75; color: white; border: none; }
        .fb-btn-odobri     { background: #EFF6FF; color: #1d4ed8; border: 1px solid #bfdbfe; }
        .fb-btn-objavi     { background: #1877F2; color: white; border: none; font-weight: 700; }
        .fb-btn-sekundarni { background: white; color: #6b7280; border: 1px solid #e5e7eb; }

        /* Mobitel: stacked layout */
        @media (max-width: 640px) {
          .fb-kartica-body {
            flex-direction: column;
          }
          .fb-thumb {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #f3f4f6;
            padding: 12px;
          }
          .fb-sadrzaj {
            padding: 12px;
          }
          .fb-akcije {
            flex-direction: column;
            gap: 8px;
          }
          .fb-btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
