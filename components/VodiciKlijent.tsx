"use client";

// ============================================================
// VODIČI — app-stil lista s filter-čipovima (Ekran 1 + 2)
// ============================================================

import { useState } from "react";
import Link from "next/link";
import { VODIC_KATEGORIJE, KAT_BOJA, displejKategorija } from "@/lib/data/vodic-kategorije";

export interface VodicKartica {
  slug: string;
  naziv: string;
  opis: string;
  ikona: string;
  kategorija: string;
  min_citanja: number;
  brojKoraka: number;
  imaTekst: boolean;
}

export default function VodiciKlijent({ vodici }: { vodici: VodicKartica[] }) {
  const [aktivna, setAktivna] = useState("sve");

  const grupa = VODIC_KATEGORIJE.find((k) => k.key === aktivna);
  const prikazani =
    !grupa || grupa.cats === null
      ? vodici
      : vodici.filter((v) => grupa.cats!.includes(v.kategorija));

  return (
    <div className="vod-wrap">
      {/* Naslovni blok */}
      <div className="vod-head">
        <div className="vod-head-ico">📖</div>
        <div>
          <h1 className="vod-title">Vodiči za život u Njemačkoj</h1>
          <p className="vod-sub">Praktični savjeti i uputstva za našu dijasporu.</p>
        </div>
      </div>

      {/* Filter-čipovi */}
      <div className="vod-chips">
        {VODIC_KATEGORIJE.map((k) => (
          <button
            key={k.key}
            onClick={() => setAktivna(k.key)}
            className={`vod-chip${aktivna === k.key ? " active" : ""}`}
          >
            <span className="vod-chip-ico">{k.icon}</span>
            {k.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="vod-list">
        {prikazani.length === 0 && (
          <p className="vod-empty">Nema vodiča u ovoj kategoriji.</p>
        )}
        {prikazani.map((v) => {
          const dk = displejKategorija(v.kategorija);
          const boja = KAT_BOJA[dk.key] || KAT_BOJA.ostalo;
          return (
            <Link key={v.slug} href={`/vodic/${v.slug}`} className="vod-card">
              <span className="vod-card-thumb" style={{ background: boja.bg }}>
                {v.ikona}
              </span>
              <span className="vod-card-body">
                <span className="vod-card-naslov">{v.naziv}</span>
                <span className="vod-card-opis">{v.opis}</span>
                <span className="vod-card-meta">
                  <span className="vod-tag" style={{ background: boja.bg, color: boja.tekst }}>
                    {dk.label}
                  </span>
                  <span className="vod-min">
                    ⏱ {v.imaTekst ? `${v.min_citanja} min` : `${v.brojKoraka} koraka`}
                  </span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      <style>{`
        .vod-wrap { max-width: 760px; margin: 0 auto; padding: 18px 14px 24px; }
        .vod-head { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
        .vod-head-ico {
          width: 46px; height: 46px; border-radius: 12px; background: #EAF7EE;
          display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;
        }
        .vod-title { font-size: 21px; font-weight: 800; line-height: 1.2; color: #111827; letter-spacing: -0.3px; }
        .vod-sub { font-size: 13px; color: #6B7280; margin-top: 3px; }

        .vod-chips {
          display: flex; gap: 8px; overflow-x: auto; padding: 2px 2px 12px;
          -webkit-overflow-scrolling: touch; scrollbar-width: none;
        }
        .vod-chips::-webkit-scrollbar { display: none; }
        .vod-chip {
          display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
          padding: 8px 14px; border-radius: 999px; border: 1px solid #E5E7EB;
          background: #fff; color: #374151; font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all .15s;
        }
        .vod-chip .vod-chip-ico { font-size: 14px; }
        .vod-chip.active { background: #1a8a4a; border-color: #1a8a4a; color: #fff; }

        .vod-list { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }
        .vod-empty { color: #6B7280; font-size: 14px; padding: 20px 4px; }
        .vod-card {
          display: flex; gap: 12px; align-items: center; padding: 12px;
          background: #fff; border: 1px solid #EEF0F2; border-radius: 14px;
          text-decoration: none; color: inherit; box-shadow: 0 1px 3px rgba(0,0,0,.03);
          transition: border-color .15s, box-shadow .15s;
        }
        .vod-card:active { background: #fafafa; }
        @media (hover: hover) { .vod-card:hover { border-color: #1a8a4a; box-shadow: 0 2px 10px rgba(0,0,0,.06); } }
        .vod-card-thumb {
          width: 68px; height: 68px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 30px;
        }
        .vod-card-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
        .vod-card-naslov {
          font-size: 15px; font-weight: 700; line-height: 1.3; color: #111827;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .vod-card-opis {
          font-size: 12.5px; color: #6B7280; line-height: 1.4;
          display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
        }
        .vod-card-meta { display: flex; align-items: center; gap: 10px; margin-top: 2px; }
        .vod-tag { font-size: 10.5px; font-weight: 700; padding: 3px 8px; border-radius: 6px; white-space: nowrap; }
        .vod-min { font-size: 11.5px; color: #9CA3AF; white-space: nowrap; }
      `}</style>
    </div>
  );
}
