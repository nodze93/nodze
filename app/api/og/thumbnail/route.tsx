// ============================================================
// THUMBNAIL GENERATOR — next/og (Satori + resvg, bundled u Next.js 15)
// GET /api/og/thumbnail?t=informative&r1=TEKST&r2=PODNASLOV&slika=URL
//
// Parametri:
//   t      — predložak: "breaking" (crveni) | "informative" (plavi) | "engagement" (ljubičasti)
//   r1     — udarna rečenica (r1, piše se na thumbnail slici)
//   r2     — podnaslov / kategorija (r2, manji tekst ispod)
//   slika  — URL pozadinske slike (Unsplash/Supabase) — opcionalno
//
// Vraća PNG 1200×630px. Bez troška (server-side, bundled u Next.js).
// ============================================================
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Tri predloška (boja, overlay, akcentna boja, labela)
const PREDLOZACI = {
  breaking: {
    gradijent: "linear-gradient(135deg, #7F0000 0%, #C0392B 60%, #E74C3C 100%)",
    overlay: "rgba(120, 10, 10, 0.78)",
    akcent: "#FF6B6B",
    labelaBoja: "#7F0000",
    labela: "BREAKING",
  },
  informative: {
    gradijent: "linear-gradient(135deg, #0F2D60 0%, #1a4a8a 60%, #2563EB 100%)",
    overlay: "rgba(10, 30, 70, 0.80)",
    akcent: "#60A5FA",
    labelaBoja: "#1E3A6E",
    labela: "VIJESTI",
  },
  engagement: {
    gradijent: "linear-gradient(135deg, #3B0764 0%, #6B21A8 60%, #9333EA 100%)",
    overlay: "rgba(50, 5, 90, 0.82)",
    akcent: "#C084FC",
    labelaBoja: "#4A0E85",
    labela: "TEMA DANA",
  },
} as const;

type Predlozak = keyof typeof PREDLOZACI;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const t = (searchParams.get("t") || "informative") as Predlozak;
  const r1 = (searchParams.get("r1") || "").slice(0, 80);
  const r2 = (searchParams.get("r2") || "").slice(0, 60);
  const slika = searchParams.get("slika") || "";

  const p = PREDLOZACI[t] || PREDLOZACI.informative;

  // Dinamička veličina fonta za r1 (kraće = veće)
  const r1Velicina =
    r1.length <= 18 ? 88
    : r1.length <= 28 ? 74
    : r1.length <= 40 ? 62
    : r1.length <= 55 ? 52
    : 44;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          position: "relative",
          fontFamily: "system-ui, -apple-system, Arial, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Pozadinska slika (ako postoji) */}
        {slika ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slika}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1200,
              height: 630,
              objectFit: "cover",
            }}
          />
        ) : (
          // Fallback: čisti gradijent ako nema slike
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1200,
              height: 630,
              background: p.gradijent,
            }}
          />
        )}

        {/* Tamni overlay — vidljiv samo kad postoji slika */}
        {slika && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1200,
              height: 630,
              background: p.overlay,
            }}
          />
        )}

        {/* Lagani vignette (bottom) za čitljivost teksta */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 1200,
            height: 300,
            background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
          }}
        />

        {/* ── GORNJI BAR: logo + predložak labela ── */}
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 56,
            right: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo kodnas.de */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: "#1D9E75",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 900,
                fontSize: 22,
              }}
            >
              K
            </div>
            <span
              style={{
                color: "white",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: -0.5,
                textShadow: "0 1px 8px rgba(0,0,0,0.5)",
              }}
            >
              kodnas.de
            </span>
          </div>

          {/* Labela predloška */}
          <div
            style={{
              background: p.akcent,
              color: p.labelaBoja,
              padding: "7px 22px",
              borderRadius: 100,
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: 2,
            }}
          >
            {p.labela}
          </div>
        </div>

        {/* ── CENTRALNI TEKST ── */}
        <div
          style={{
            position: "absolute",
            top: 120,
            left: 56,
            right: 56,
            bottom: 100,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {/* R1 — udarna rečenica */}
          <div
            style={{
              color: "white",
              fontSize: r1Velicina,
              fontWeight: 900,
              lineHeight: 1.15,
              textShadow: "0 2px 24px rgba(0,0,0,0.7)",
              maxWidth: 1000,
            }}
          >
            {r1}
          </div>

          {/* R2 — podnaslov */}
          {r2 && (
            <div
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 30,
                fontWeight: 400,
                marginTop: 22,
                lineHeight: 1.4,
                textShadow: "0 1px 12px rgba(0,0,0,0.6)",
              }}
            >
              {r2}
            </div>
          )}
        </div>

        {/* ── DONJI AKCENTNI BAR ── */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 1200,
            height: 8,
            background: p.akcent,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
