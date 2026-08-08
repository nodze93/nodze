"use client";

// ============================================================
// VODIČI — app-stil (Ekran 1 + 2): kategorije + kartice s ilustracijama
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
  // datum zadnje provjere činjenica ('YYYY-MM-DD') — samo dugi vodiči iz baze
  provjereno?: string | null;
}

// "2026-08-08" -> "8. 8. 2026."
function kratkiDatum(iso: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  return `${Number(m[3])}. ${Number(m[2])}. ${m[1]}.`;
}

function Sat() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Bookmark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#C4C9D0" strokeWidth="2">
      <path d="M6 4h12v16l-6-4-6 4z" strokeLinejoin="round" />
    </svg>
  );
}

export default function VodiciKlijent({ vodici }: { vodici: VodicKartica[] }) {
  const [aktivna, setAktivna] = useState("sve");

  const grupa = VODIC_KATEGORIJE.find((k) => k.key === aktivna);
  const filtrirani =
    !grupa || grupa.cats === null
      ? vodici
      : vodici.filter((v) => grupa.cats!.includes(v.kategorija));

  // Detaljni (dugi, provjereni) vodiči idu na vrh — to je novi sadržaj sajta.
  const detaljni = filtrirani.filter((v) => v.imaTekst);
  const prikazani = [...detaljni, ...filtrirani.filter((v) => !v.imaTekst)];

  const naslovSekcije = aktivna === "sve" ? "Svi vodiči" : grupa?.label ?? "Vodiči";

  return (
    <div className="vd-wrap">
      {/* Naslovni blok */}
      <div className="vd-head">
        <div className="vd-head-ico">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5z" strokeLinejoin="round" />
            <path d="M4 20.5A2.5 2.5 0 016.5 18H20" />
          </svg>
        </div>
        <div>
          <h1 className="vd-title">Vodiči za život u Njemačkoj</h1>
          <p className="vd-sub">Praktični savjeti i uputstva za našu dijasporu.</p>
        </div>
      </div>

      {/* Kategorije (tile-ovi, horizontalno) */}
      <div className="vd-tiles">
        {VODIC_KATEGORIJE.map((k) => (
          <button
            key={k.key}
            onClick={() => setAktivna(k.key)}
            className={`vd-tile${aktivna === k.key ? " active" : ""}`}
          >
            <span className="vd-tile-ico">{k.icon}</span>
            <span className="vd-tile-lbl">{k.label}</span>
          </button>
        ))}
      </div>

      {/* Sekcija */}
      <div className="vd-sec">
        <span className="vd-sec-title">{naslovSekcije}</span>
        <span className="vd-sec-count">{prikazani.length}</span>
      </div>

      {/* Lista */}
      <div className="vd-list">
        {prikazani.length === 0 && <p className="vd-empty">Nema vodiča u ovoj kategoriji.</p>}
        {prikazani.map((v) => {
          const dk = displejKategorija(v.kategorija);
          const boja = KAT_BOJA[dk.key] || KAT_BOJA.ostalo;
          return (
            <Link key={v.slug} href={`/vodic/${v.slug}`} className="vd-card">
              <span className="vd-card-thumb" style={{ background: boja.bg }}>
                <img src={`/vodic-ilustracije/${dk.key}.svg`} alt="" loading="lazy" />
              </span>
              <span className="vd-card-body">
                <span className="vd-card-naslov">{v.naziv}</span>
                <span className="vd-card-opis">{v.opis}</span>
                <span className="vd-card-meta">
                  <span className="vd-tag" style={{ background: boja.bg, color: boja.tekst }}>
                    {dk.label}
                  </span>
                  <span className="vd-min">
                    <Sat /> {v.imaTekst ? `${v.min_citanja} min` : `${v.brojKoraka} koraka`}
                  </span>
                  {v.imaTekst && (
                    <span className="vd-badge-novo">
                      {v.provjereno ? `Ažurirano ${kratkiDatum(v.provjereno)}` : "Detaljan vodič"}
                    </span>
                  )}
                </span>
              </span>
              <span className="vd-card-bm"><Bookmark /></span>
            </Link>
          );
        })}
      </div>

      <style>{`
        .vd-wrap { max-width: 760px; margin: 0 auto; padding: 16px 14px 24px; }
        .vd-head { display: flex; align-items: center; gap: 13px; margin-bottom: 18px; }
        .vd-head-ico {
          width: 48px; height: 48px; border-radius: 13px; background: #1a8a4a;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(26,138,74,.25);
        }
        .vd-title { font-size: 21px; font-weight: 800; line-height: 1.2; color: #111827; letter-spacing: -0.3px; }
        .vd-sub { font-size: 13px; color: #6B7280; margin-top: 3px; }

        .vd-tiles {
          display: flex; gap: 10px; overflow-x: auto; padding: 4px 2px 14px;
          -webkit-overflow-scrolling: touch; scrollbar-width: none;
        }
        .vd-tiles::-webkit-scrollbar { display: none; }
        .vd-tile {
          flex: 0 0 auto; width: 78px; display: flex; flex-direction: column; align-items: center; gap: 7px;
          padding: 12px 6px; border-radius: 15px; border: 1.5px solid #EEF0F2; background: #fff;
          cursor: pointer; transition: all .15s;
        }
        .vd-tile-ico {
          width: 40px; height: 40px; border-radius: 11px; background: #F1F5F9;
          display: flex; align-items: center; justify-content: center; font-size: 20px;
        }
        .vd-tile-lbl { font-size: 11px; font-weight: 600; color: #6B7280; text-align: center; line-height: 1.2; }
        .vd-tile.active { border-color: #1a8a4a; background: #F0FBF4; }
        .vd-tile.active .vd-tile-ico { background: #1a8a4a; }
        .vd-tile.active .vd-tile-lbl { color: #1a8a4a; font-weight: 700; }

        .vd-sec { display: flex; align-items: center; gap: 8px; margin: 4px 2px 12px; }
        .vd-sec-title { font-size: 16px; font-weight: 800; color: #111827; }
        .vd-sec-count {
          font-size: 12px; font-weight: 700; color: #1a8a4a; background: #E7F6EE;
          padding: 2px 9px; border-radius: 999px;
        }

        .vd-list { display: flex; flex-direction: column; gap: 11px; }
        .vd-empty { color: #6B7280; font-size: 14px; padding: 20px 4px; }
        .vd-card {
          display: flex; gap: 13px; align-items: center; padding: 12px;
          background: #fff; border: 1px solid #EEF0F2; border-radius: 16px;
          text-decoration: none; color: inherit; box-shadow: 0 1px 3px rgba(0,0,0,.03);
          transition: border-color .15s, box-shadow .15s;
        }
        .vd-card:active { background: #fafafa; }
        @media (hover: hover) { .vd-card:hover { border-color: #1a8a4a; box-shadow: 0 3px 12px rgba(0,0,0,.07); } }
        .vd-card-thumb {
          width: 76px; height: 76px; border-radius: 14px; flex-shrink: 0; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .vd-card-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .vd-card-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
        .vd-card-naslov {
          font-size: 15px; font-weight: 700; line-height: 1.3; color: #111827;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .vd-card-opis {
          font-size: 12.5px; color: #6B7280; line-height: 1.4;
          display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
        }
        .vd-card-meta { display: flex; align-items: center; gap: 10px; margin-top: 3px; }
        .vd-tag { font-size: 10.5px; font-weight: 700; padding: 3px 9px; border-radius: 6px; white-space: nowrap; }
        .vd-min { display: inline-flex; align-items: center; gap: 4px; font-size: 11.5px; color: #9CA3AF; white-space: nowrap; }
        .vd-badge-novo {
          font-size: 10px; font-weight: 800; letter-spacing: .3px; white-space: nowrap;
          background: #1a8a4a; color: #fff; padding: 3px 8px; border-radius: 999px;
        }
        .vd-card-bm { flex-shrink: 0; align-self: flex-start; padding-top: 2px; }
      `}</style>
    </div>
  );
}
