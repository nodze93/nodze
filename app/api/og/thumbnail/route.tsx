// ============================================================
// THUMBNAIL GENERATOR — next/og (Satori + resvg, bundled u Next.js 15)
// GET /api/og/thumbnail?t=informative&r1=TEKST&r2=IZVOR&slika=URL
//
// Parametri (kompatibilnost zadržana — t se prima ali više ne mijenja izgled):
//   t      — predložak (news/informative | engage/engagement | breaking) — IGNORIŠE se za stil
//   r1     — naslov (udarna rečenica na slici)
//   r2     — mala linija ispod naslova (npr. "Izvor: Spiegel")
//   slika  — URL pozadinske slike (Unsplash/Supabase) — ako fali, koristi se tamni fallback
//
// Vraća PNG 1080×1350px (portret 4:5 — jači doseg u FB feedu).
// JEDAN dizajn: puna fotografija + tamni sloj, KN logo gore, naslov dolje,
// izvor sa zelenom tačkom, i "LINK U KOMENTARU" traka.
// ============================================================
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const ZELENA = "#1D9E75";
const ZELENA_SVIJETLA = "#23C88C";
const CRVENA = "#DC2626";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const r1 = (searchParams.get("r1") || "").slice(0, 90);
  const r2 = (searchParams.get("r2") || "").slice(0, 60);
  const slika = searchParams.get("slika") || "";

  // Dinamička veličina naslova (kraće = veće)
  const r1Velicina =
    r1.length <= 18 ? 92
    : r1.length <= 30 ? 78
    : r1.length <= 45 ? 66
    : r1.length <= 60 ? 56
    : 48;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1350,
          display: "flex",
          position: "relative",
          fontFamily: "system-ui, -apple-system, Arial, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Pozadinska slika ili tamni fallback */}
        {slika ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slika}
            alt=""
            style={{ position: "absolute", top: 0, left: 0, width: 1080, height: 1350, objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              position: "absolute", top: 0, left: 0, width: 1080, height: 1350,
              background: "linear-gradient(135deg, #0f2016 0%, #123626 55%, #1D9E75 100%)",
            }}
          />
        )}

        {/* Blago zatamnjenje cijele slike (tekst prvo pada u oko) */}
        <div
          style={{
            position: "absolute", top: 0, left: 0, width: 1080, height: 1350,
            background: "rgba(8, 11, 18, 0.34)",
          }}
        />

        {/* Jaki tamni gradijent pri dnu (ispod teksta) */}
        <div
          style={{
            position: "absolute", bottom: 0, left: 0, width: 1080, height: 760,
            background: "linear-gradient(to top, rgba(6,9,16,0.96) 0%, rgba(6,9,16,0.72) 34%, rgba(6,9,16,0) 100%)",
          }}
        />

        {/* Lagano zatamnjenje pri vrhu (za logo) */}
        <div
          style={{
            position: "absolute", top: 0, left: 0, width: 1080, height: 240,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)",
          }}
        />

        {/* ── SADRŽAJ (logo gore, tekst dolje) ── */}
        <div
          style={{
            position: "absolute", top: 0, left: 0, width: 1080, height: 1350,
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            padding: "56px 60px 60px",
          }}
        >
          {/* GORE: KN logo + kodnas.de */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 84, height: 84, borderRadius: 20, background: ZELENA,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 900, fontSize: 40,
              }}
            >
              KN
            </div>
            <div
              style={{
                marginLeft: 22, color: "white", fontSize: 46, fontWeight: 800,
                letterSpacing: -1, textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              }}
            >
              kodnas.de
            </div>
          </div>

          {/* DOLE: naslov + izvor + link */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Naslov (r1) */}
            <div
              style={{
                display: "flex", color: "white", fontSize: r1Velicina, fontWeight: 900,
                lineHeight: 1.12, letterSpacing: -0.5, maxWidth: 960,
                textShadow: "0 2px 24px rgba(0,0,0,0.75)",
              }}
            >
              {r1}
            </div>

            {/* Izvor (r2) sa zelenom tačkom */}
            {r2 ? (
              <div style={{ display: "flex", alignItems: "center", marginTop: 24 }}>
                <div style={{ width: 18, height: 18, borderRadius: 9, background: ZELENA_SVIJETLA }} />
                <div
                  style={{
                    marginLeft: 14, color: "rgba(235,238,242,0.95)", fontSize: 30, fontWeight: 700,
                    textShadow: "0 1px 10px rgba(0,0,0,0.6)",
                  }}
                >
                  {r2}
                </div>
              </div>
            ) : null}

            {/* LINK U KOMENTARU traka */}
            <div style={{ display: "flex", marginTop: 26 }}>
              <div
                style={{
                  display: "flex", alignItems: "center", background: CRVENA,
                  borderRadius: 12, padding: "14px 26px", color: "white",
                  fontSize: 28, fontWeight: 900, letterSpacing: 1,
                }}
              >
                LINK U KOMENTARU
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
    }
  );
}
