"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export interface HeroClanak {
  slug: string;
  kategorija: string;
  label: string;
  naslov: string;
  excerpt: string;
  meta: string;
  datum: string;
  slika?: string;
  danasnji?: boolean;
}

// Koliko dugo stoji jedna vijest prije rotacije (10 minuta)
const INTERVAL_MS = 10 * 60 * 1000;

interface Props {
  // Kandidati za GLAVNU (lijevu) vijest — rotiraju se
  glavniInitial: HeroClanak[];
  glavniFallback: HeroClanak[];
  // Tri BOČNE kartice — fiksne (ručno se postavljaju, ne rotiraju)
  bocni: HeroClanak[];
}

// Iz liste izdvoji današnje; ako nema današnjih, uzmi sve
function danasnjiPrvo(lista: HeroClanak[]): HeroClanak[] {
  const danas = lista.filter((k) => k.danasnji);
  return danas.length >= 1 ? danas : lista;
}

export default function HeroRotator({ glavniInitial, glavniFallback, bocni }: Props) {
  const [glavniList, setGlavniList] = useState<HeroClanak[]>(
    glavniInitial.length >= 1 ? glavniInitial : glavniFallback
  );
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let ziv = true;

    async function osvjezi() {
      try {
        const r = await fetch("/api/hero", { cache: "no-store" });
        if (!r.ok) return;
        const j = await r.json();
        const svi: HeroClanak[] = j?.clanci || [];
        const kandidati = danasnjiPrvo(svi);
        if (ziv && kandidati.length >= 1) setGlavniList(kandidati);
      } catch {
        /* ostavi trenutnu listu */
      }
    }

    const t = setInterval(() => {
      if (!ziv) return;
      setIdx((i) => i + 1); // pomjeri glavnu na sljedeću vijest
      osvjezi(); // i povuci najsvježije iz baze
    }, INTERVAL_MS);

    return () => {
      ziv = false;
      clearInterval(t);
    };
  }, []);

  const n = glavniList.length;
  if (n === 0) return null;

  const glavni = glavniList[idx % n];

  return (
    <div style={{ background: "var(--white)", borderBottom: "1px solid var(--border)" }}>
      <div
        className="hero-inner"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          minHeight: 320,
        }}
      >
        {/* Glavni članak — ROTIRA se; slika sa naslovom preko (Klix stil) */}
        <Link
          key={idx}
          href={`/clanak/${glavni.slug}`}
          className="hero-fade hero-glavni"
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            borderRight: "1px solid var(--border)",
            cursor: "pointer",
            minHeight: 320,
            overflow: "hidden",
            // Slika kao pozadina; ako nema slike — blagi gradient
            backgroundColor: "var(--border)",
            backgroundImage: glavni.slika
              ? `url('${glavni.slika}')`
              : "linear-gradient(135deg, #1f4d3a 0%, #2a6b4f 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Tamni preljev radi čitljivosti teksta */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 42%, rgba(0,0,0,0.12) 100%)",
            }}
          />

          {/* Sadržaj preko slike */}
          <div style={{ position: "relative", padding: "28px 28px 26px 24px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--zelena)",
                color: "white",
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 11px",
                borderRadius: 20,
                marginBottom: 14,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {glavni.label} · Novo
            </div>

            <h1
              style={{
                fontSize: 27,
                fontWeight: 800,
                lineHeight: 1.25,
                letterSpacing: "-0.5px",
                marginBottom: 10,
                maxWidth: 560,
                color: "#fff",
                textShadow: "0 1px 12px rgba(0,0,0,0.4)",
              }}
            >
              {glavni.naslov}
            </h1>

            {glavni.excerpt && (
              <p
                className="hero-excerpt"
                style={{
                  fontSize: 14.5,
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 1.55,
                  marginBottom: 14,
                  maxWidth: 500,
                  textShadow: "0 1px 8px rgba(0,0,0,0.4)",
                }}
              >
                {glavni.excerpt}
              </p>
            )}

            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{glavni.meta}</div>
          </div>
        </Link>

        {/* Bočni članci — FIKSNI (ne rotiraju) */}
        <div style={{ display: "flex", flexDirection: "column" }} className="hero-side">
          {bocni.map((item, i) => (
            <Link
              key={`${item.slug}-${i}`}
              href={`/clanak/${item.slug}`}
              style={{
                padding: "14px 18px",
                borderBottom: i < bocni.length - 1 ? "1px solid var(--border)" : "none",
                cursor: "pointer",
                transition: "background 0.15s",
                flex: 1,
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
              className="hover:bg-[#fafafa]"
            >
              {/* Thumbnail (siva kutija ako nema slike) */}
              <div
                style={{
                  width: 74,
                  height: 74,
                  borderRadius: 8,
                  flexShrink: 0,
                  backgroundColor: "var(--border)",
                  backgroundImage: item.slika ? `url('${item.slika}')` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span
                  className={`tag-pill tag-${item.kategorija}`}
                  style={{ marginBottom: 5, display: "inline-block" }}
                >
                  {item.label}
                </span>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: 1.35,
                    marginBottom: 5,
                    color: "var(--tekst)",
                  }}
                >
                  {item.naslov}
                </div>
                <div style={{ fontSize: 11, color: "var(--tekst-light)" }}>{item.meta}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .hero-fade { animation: hero-fade-in 0.5s ease; }
        @keyframes hero-fade-in {
          from { opacity: 0.3; }
          to   { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-fade { animation: none; }
        }
        @media (max-width: 768px) {
          .hero-inner { grid-template-columns: 1fr !important; }
          .hero-side { display: none !important; }
          /* Na telefonu preko slike ostaje samo naslov (+ sitni datum) */
          .hero-excerpt { display: none !important; }
        }
      `}</style>
    </div>
  );
}
