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
        {/* Glavni članak — ROTIRA se */}
        <Link
          key={idx}
          href={`/clanak/${glavni.slug}`}
          className="hover:bg-[#fafafa] hero-fade"
          style={{
            padding: "32px 32px 32px 24px",
            borderRight: "1px solid var(--border)",
            cursor: "pointer",
            transition: "background 0.15s",
            display: "block",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--zelena-svijetla)",
              color: "var(--zelena-tamna)",
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 20,
              marginBottom: 14,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: "var(--zelena)",
                borderRadius: "50%",
                display: "inline-block",
              }}
            />
            {glavni.label} · Novo
          </div>

          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              lineHeight: 1.3,
              letterSpacing: "-0.5px",
              marginBottom: 12,
              maxWidth: 520,
              color: "var(--tekst)",
            }}
          >
            {glavni.naslov}
          </h1>

          {glavni.excerpt && (
            <p
              style={{
                fontSize: 15,
                color: "var(--tekst-muted)",
                lineHeight: 1.6,
                marginBottom: 20,
                maxWidth: 480,
              }}
            >
              {glavni.excerpt}
            </p>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 12,
              color: "var(--tekst-light)",
            }}
          >
            <span>{glavni.meta}</span>
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
        }
      `}</style>
    </div>
  );
}
