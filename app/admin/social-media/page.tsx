"use client";
// ============================================================
// ADMIN — Social Media Editor
// Stranica za pregled, uređivanje i objavljivanje FB postova.
// ============================================================
import { useState, useEffect, useCallback } from "react";

// ── TIPOVI ───────────────────────────────────────────────────
type FbStatus = "ceka" | "odobreno" | "preskoceno" | "objavljeno";
type FbTip = "news" | "engage" | "original";

interface FbPost {
  id: number;
  slug: string;
  naslov: string;
  excerpt: string | null;
  kategorija: string;
  status: string;
  izvor: string | null;
  slika: string | null;
  fb_slika_url: string | null;
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
  { value: "engage",   label: "Engagement", emoji: "💬", opis: "Komentari i dijeljenje" },
  { value: "original", label: "Originalna", emoji: "🖼️", opis: "Bez thumbnailа, orig. slika" },
];

const STATUSI: { value: FbStatus | "sve"; label: string; boja: string }[] = [
  { value: "ceka",       label: "Ceka",       boja: "#F59E0B" },
  { value: "odobreno",   label: "Odobreno",   boja: "#3B82F6" },
  { value: "objavljeno", label: "Objavljeno", boja: "#10B981" },
  { value: "preskoceno", label: "Preskoceno", boja: "#6B7280" },
];

// ── HELPER: default izvor (R2) — "Izvor: {izvor}" po defaultu ─
function defaultR2(post: FbPost): string {
  if (post.fb_thumbnail_r2) return post.fb_thumbnail_r2;
  return post.izvor ? `Izvor: ${post.izvor}` : "kodnas.de";
}

// ── HELPER: generiši thumbnail URL ───────────────────────────
function thumbnailUrl(post: FbPost, tip?: FbTip): string {
  const t = tip || post.fb_tip || "news";
  // Ručno dodani URL ima prednost; inače originalna slika članka.
  const pozadina = post.fb_slika_url || post.slika || "";
  if (t === "original") return pozadina;
  const predlozak = t === "engage" ? "engagement" : "informative";
  const params = new URLSearchParams({
    t: predlozak,
    r1: post.fb_thumbnail_r1 || post.naslov.slice(0, 50),
    r2: defaultR2(post),
  });
  if (pozadina) params.set("slika", pozadina);
  return `/api/og/thumbnail?${params.toString()}`;
}

// ── THUMBNAIL PREGLED ─────────────────────────────────────────
function ThumbnailPregled({ post, tip }: { post: FbPost; tip: FbTip }) {
  const url = thumbnailUrl(post, tip);
  if (!url) return (
    <div style={{
      width: "100%", aspectRatio: "1080/1350", background: "#1f2937",
      borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
      color: "#6b7280", fontSize: 12,
    }}>Nema slike</div>
  );
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Thumbnail pregled"
      style={{ width: "100%", aspectRatio: "1080/1350", objectFit: "cover", borderRadius: 8, display: "block" }}
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
  onObjavi: (id: number) => Promise<void>;
}) {
  const [tip, setTip] = useState<FbTip>(post.fb_tip || "news");
  const [uredi, setUredi] = useState(false);
  const [tekstNews, setTekstNews]         = useState(post.fb_tekst_news || "");
  const [tekstEngage, setTekstEngage]     = useState(post.fb_tekst_engage || "");
  const [r1, setR1]                       = useState(post.fb_thumbnail_r1 || "");
  const [r2, setR2]                       = useState(post.fb_thumbnail_r2 || (post.izvor ? `Izvor: ${post.izvor}` : ""));
  const [slikaUrl, setSlikaUrl]           = useState(post.fb_slika_url || "");
  const [objavljivanje, setObjavljivanje]  = useState(false);
  const [poruka, setPoruka]               = useState<{ tip: "ok" | "greska"; tekst: string } | null>(null);

  const aktivniTekst = tip === "engage" ? tekstEngage : tekstNews;

  // Sacuvaj izmjene
  async function sacuvaj() {
    const izmjene: Partial<FbPost> = {
      fb_tip:          tip,
      fb_tekst_news:   tekstNews || null,
      fb_tekst_engage: tekstEngage || null,
      fb_thumbnail_r1: r1 || null,
      fb_thumbnail_r2: r2 || null,
      fb_slika_url:    slikaUrl.trim() || null,
    };
    onAzuriraj(post.id, izmjene);
    await fetch("/api/admin/social-media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: post.id, ...izmjene }),
    });
    setUredi(false);
  }

  // Promijeni tip bez uredivanja
  async function promijeniTip(noviTip: FbTip) {
    setTip(noviTip);
    onAzuriraj(post.id, { fb_tip: noviTip });
    await fetch("/api/admin/social-media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: post.id, fb_tip: noviTip }),
    });
  }

  // Objavi odmah
  async function objavi() {
    setObjavljivanje(true);
    setPoruka(null);
    await onObjavi(post.id);
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
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
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
                Objavljeno
              </span>
            )}
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", lineHeight: 1.4 }}>
            {post.naslov}
          </div>
        </div>
      </div>

      {/* ── THUMBNAIL + TEKST ── */}
      <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
        {/* Thumbnail (lijevo) */}
        <div style={{ width: 280, flexShrink: 0, padding: 16, borderRight: "1px solid #f3f4f6" }}>
          <ThumbnailPregled
            post={{
              ...post,
              fb_thumbnail_r1: r1 || post.fb_thumbnail_r1,
              fb_thumbnail_r2: r2 || post.fb_thumbnail_r2,
              fb_slika_url: slikaUrl.trim() || post.fb_slika_url,
            }}
            tip={tip}
          />

          {/* Thumbnail tekst polja (samo u mode uredivanja) */}
          {uredi && tip !== "original" && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <label style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>NASLOV NA SLICI (R1)</label>
                <input
                  value={r1}
                  onChange={(e) => setR1(e.target.value)}
                  placeholder="Npr. NOVO PRAVILO OD JANUARA"
                  style={{
                    width: "100%", marginTop: 4, padding: "6px 10px", border: "1px solid #d1d5db",
                    borderRadius: 6, fontSize: 12, fontFamily: "inherit", boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>PODNASLOV / IZVOR (R2)</label>
                <input
                  value={r2}
                  onChange={(e) => setR2(e.target.value)}
                  placeholder="Npr. Izvor: Spiegel"
                  style={{
                    width: "100%", marginTop: 4, padding: "6px 10px", border: "1px solid #d1d5db",
                    borderRadius: 6, fontSize: 12, fontFamily: "inherit", boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          )}

          {/* Slika URL — koristi se kad članak nema sliku ili je želiš zamijeniti */}
          {uredi && (
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>SLIKA URL (opciono)</label>
              <input
                value={slikaUrl}
                onChange={(e) => setSlikaUrl(e.target.value)}
                placeholder="https://... (ostavi prazno = slika članka)"
                style={{
                  width: "100%", marginTop: 4, padding: "6px 10px", border: "1px solid #d1d5db",
                  borderRadius: 6, fontSize: 12, fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
              <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>
                Ako je uneseno, koristi se umjesto slike članka (i za thumbnail i za originalnu).
              </div>
            </div>
          )}
        </div>

        {/* Desna strana: tip selector + tekst */}
        <div style={{ flex: 1, minWidth: 0, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Tip selector */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {TIPOVI.map((t) => (
              <button
                key={t.value}
                onClick={() => promijeniTip(t.value)}
                disabled={jeObjavljeno}
                style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: tip === t.value ? "2px solid #1D9E75" : "2px solid #e5e7eb",
                  background: tip === t.value ? "#f0fdf9" : "white",
                  color: tip === t.value ? "#1D9E75" : "#6b7280",
                  transition: "all 0.1s",
                }}
              >
                {t.emoji} {t.label}
                <span style={{ fontSize: 10, display: "block", fontWeight: 400, color: tip === t.value ? "#059669" : "#9ca3af" }}>
                  {t.opis}
                </span>
              </button>
            ))}
          </div>

          {/* Tekst posta */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>
                {tip === "engage" ? "💬 Engagement post" : tip === "original" ? "🖼️ Originalni post" : "📰 Vijesti post"}
              </label>
              {!jeObjavljeno && (
                <button
                  onClick={() => setUredi(!uredi)}
                  style={{
                    fontSize: 11, color: uredi ? "#1D9E75" : "#6b7280", background: "none",
                    border: "none", cursor: "pointer", fontWeight: 600,
                  }}
                >
                  {uredi ? "Zatvori" : "Uredi"}
                </button>
              )}
            </div>

            {tip === "original" ? (
              <div style={{
                padding: 12, background: "#f9fafb", borderRadius: 8,
                fontSize: 13, color: "#6b7280", fontStyle: "italic",
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
                  borderRadius: 8, fontSize: 13, fontFamily: "inherit", resize: "vertical",
                  lineHeight: 1.5, boxSizing: "border-box",
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

          {/* Poruka (uspjeh/greška) */}
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
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
              {uredi ? (
                <>
                  <button
                    onClick={sacuvaj}
                    style={{
                      padding: "8px 18px", background: "#1D9E75", color: "white",
                      border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Sacuvaj izmjene
                  </button>
                  <button
                    onClick={() => setUredi(false)}
                    style={{
                      padding: "8px 16px", background: "white", color: "#6b7280",
                      border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, cursor: "pointer",
                    }}
                  >
                    Odustani
                  </button>
                </>
              ) : (
                <>
                  {post.fb_social_status !== "odobreno" && (
                    <button
                      onClick={() => onOdobri(post.id)}
                      style={{
                        padding: "8px 18px", background: "#EFF6FF", color: "#1d4ed8",
                        border: "1px solid #bfdbfe", borderRadius: 8, fontSize: 13,
                        fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      Odobri
                    </button>
                  )}
                  <button
                    onClick={objavi}
                    disabled={objavljivanje}
                    style={{
                      padding: "8px 20px",
                      background: objavljivanje ? "#9ca3af" : "#1877F2",
                      color: "white", border: "none", borderRadius: 8, fontSize: 13,
                      fontWeight: 700, cursor: objavljivanje ? "not-allowed" : "pointer",
                    }}
                  >
                    {objavljivanje ? "Objavljujem..." : "Objavi odmah"}
                  </button>
                  <button
                    onClick={() => onPreskoci(post.id)}
                    style={{
                      padding: "8px 14px", background: "white", color: "#6b7280",
                      border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Preskoci
                  </button>
                </>
              )}
            </div>
          )}

          {/* Link na objavljeni post */}
          {jeObjavljeno && post.fb_post_id && (
            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
              <a
                href={`https://facebook.com/${post.fb_post_id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 13, color: "#1877F2", fontWeight: 600 }}
              >
                Pogledaj na Facebooku
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── GLAVNA STRANICA ──────────────────────────────────────────
export default function SocialMediaPage() {
  const [aktivniStatus, setAktivniStatus]  = useState<FbStatus | "sve">("ceka");
  const [postovi, setPostovi]              = useState<FbPost[]>([]);
  const [ucitavanje, setUcitavanje]        = useState(true);
  const [greska, setGreska]                = useState<string | null>(null);
  const [poruke, setPoruke]                = useState<Record<number, { tip: "ok" | "greska"; tekst: string }>>({});

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

  // Lokalno azuriraj post (optimisticno)
  function azuriraj(id: number, izmjene: Partial<FbPost>) {
    setPostovi((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...izmjene } : p))
    );
  }

  // Odobri
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

  // Preskoci
  async function preskoci(id: number) {
    azuriraj(id, { fb_social_status: "preskoceno" });
    await fetch("/api/admin/social-media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, fb_social_status: "preskoceno" }),
    });
    setPostovi((prev) => prev.filter((p) => p.id !== id));
  }

  // Objavi
  async function objavi(id: number) {
    try {
      const res = await fetch("/api/admin/social-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPoruke((prev) => ({ ...prev, [id]: { tip: "greska", tekst: json.error || "Greska" } }));
        return;
      }
      azuriraj(id, { fb_social_status: "objavljeno", fb_post_id: json.postId });
      setPoruke((prev) => ({ ...prev, [id]: { tip: "ok", tekst: json.poruka } }));
      if (aktivniStatus !== "objavljeno" && aktivniStatus !== "sve") {
        setTimeout(() => setPostovi((prev) => prev.filter((p) => p.id !== id)), 2500);
      }
    } catch (e) {
      setPoruke((prev) => ({ ...prev, [id]: { tip: "greska", tekst: (e as Error).message } }));
    }
  }

  const brPostaZaStatus = (s: FbStatus | "sve") =>
    s === aktivniStatus ? postovi.length : null;

  return (
    <div>
      {/* ── HEADER ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>
              Facebook Red
            </h1>
            <p style={{ color: "#6b7280", fontSize: 14, margin: "4px 0 0" }}>
              Pregled, uredivanje i objavljivanje AI-generisanih Facebook postova
            </p>
          </div>
          <button
            onClick={() => fetchPostovi(aktivniStatus)}
            style={{
              padding: "8px 16px", background: "white", border: "1px solid #e5e7eb",
              borderRadius: 8, fontSize: 13, color: "#374151", cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Osvjezi
          </button>
        </div>

        {/* Rotacija savjet */}
        <div style={{
          marginTop: 16, padding: "10px 16px", background: "#fffbeb",
          border: "1px solid #fde68a", borderRadius: 8, fontSize: 12, color: "#92400e",
        }}>
          Preporucena rotacija: 2x thumbnail post (Vijesti ili Engagement), 1x Originalna slika — mijesaj tipove da feed ne izgleda jednolicno.
        </div>
      </div>

      {/* ── TAB NAVIGACIJA ── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
        {STATUSI.map((s) => (
          <button
            key={s.value}
            onClick={() => setAktivniStatus(s.value)}
            style={{
              padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: "pointer", border: "none", transition: "all 0.15s",
              background: aktivniStatus === s.value ? s.boja : "#f3f4f6",
              color: aktivniStatus === s.value ? "white" : "#6b7280",
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
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
    </div>
  );
}
