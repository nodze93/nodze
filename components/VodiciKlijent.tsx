"use client";

// ============================================================
// VODIČI — nova struktura: 8 grupa-pločica + 3 zasebna vodiča.
// * Pločica NE filtrira nego ODMAH otvara tekst te grupe.
// * Na listi stoji SAMO 11 vodiča iz mape (mapa-vodica.html) —
//   stari se više ne prikazuju (linkovi im rade dok spajanja ne
//   završe; preusmjerenja: next.config.ts).
// * Svaka kartica nosi SVOJU ikonicu (v.ikona iz baze/koda),
//   ne više istu ilustraciju kategorije na svima.
// * Prikazuje se samo ono što stvarno postoji, pa ako neki SQL
//   još nije pokrenut, ta pločica/kartica se sama sakrije.
// ============================================================

import Link from "next/link";
import { KAT_BOJA, displejKategorija } from "@/lib/data/vodic-kategorije";

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

// 8 grupa — redoslijed, natpisi i ikonice pločica.
const GRUPE = [
  { emoji: "🛂", label: "Viza i dolazak", slug: "radna-viza-njemacka" },
  { emoji: "🏥", label: "Zdravstvo", slug: "krankenkasse" },
  { emoji: "💶", label: "Novac i porezi", slug: "porezi-njemacka" },
  { emoji: "🔑", label: "Stan", slug: "stan-u-njemackoj" },
  { emoji: "👶", label: "Porodica", slug: "porodica-u-njemackoj" },
  { emoji: "🎓", label: "Posao i diploma", slug: "priznavanje-diplome-anerkennung" },
  { emoji: "🧳", label: "Penzija i povratak", slug: "penzija-i-povratak" },
  { emoji: "🚗", label: "Vozačka i auto", slug: "zamjena-vozacke-njemacka" },
];

// Zasebni vodiči ispod grupa (prevelike teme da se utope u grupu).
const ZASEBNI = ["prijavljivanje-adrese", "spajanje-porodice", "njemacko-drzavljanstvo-einburgerung"];

// Ikonice kartica — svaka SVOJA (nadjačava ikonu iz baze/koda ako treba).
const IKONA: Record<string, string> = {
  "radna-viza-njemacka": "🛂",
  "krankenkasse": "🏥",
  "porezi-njemacka": "💶",
  "stan-u-njemackoj": "🔑",
  "porodica-u-njemackoj": "👶",
  "priznavanje-diplome-anerkennung": "🎓",
  "penzija-i-povratak": "🧳",
  "zamjena-vozacke-njemacka": "🚗",
  "prijavljivanje-adrese": "🏠",
  "spajanje-porodice": "👨‍👩‍👧",
  "njemacko-drzavljanstvo-einburgerung": "🇩🇪",
};

function Sat() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function VodiciKlijent({ vodici }: { vodici: VodicKartica[] }) {
  const poSlugu = new Map(vodici.map((v) => [v.slug, v]));

  // Samo ono što stvarno postoji (kod ili baza).
  const grupe = GRUPE.filter((g) => poSlugu.has(g.slug));
  const lista = [...GRUPE.map((g) => g.slug), ...ZASEBNI]
    .map((slug) => poSlugu.get(slug))
    .filter((v): v is VodicKartica => !!v);

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
          <p className="vd-sub">Sve po temama — bez traženja po deset članaka.</p>
        </div>
      </div>

      {/* 8 GRUPA — pločica odmah otvara tekst */}
      <div className="vd-grupe">
        {grupe.map((g) => (
          <Link key={g.slug} href={`/vodic/${g.slug}`} className="vd-grupa">
            <span className="vd-grupa-ico">{g.emoji}</span>
            <span className="vd-grupa-lbl">{g.label}</span>
          </Link>
        ))}
      </div>

      {/* Ista ta lista, s opisima */}
      <div className="vd-sec">
        <span className="vd-sec-title">Svi vodiči</span>
        <span className="vd-sec-count">{lista.length}</span>
      </div>

      <div className="vd-list">
        {lista.map((v) => {
          const dk = displejKategorija(v.kategorija);
          const boja = KAT_BOJA[dk.key] || KAT_BOJA.ostalo;
          const ikona = IKONA[v.slug] || v.ikona || "📄";
          return (
            <Link key={v.slug} href={`/vodic/${v.slug}`} className="vd-card">
              <span className="vd-card-thumb" style={{ background: boja.bg }}>
                <span className="vd-card-emoji">{ikona}</span>
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
                  {v.imaTekst && v.provjereno && (
                    <span className="vd-badge-novo">Ažurirano {kratkiDatum(v.provjereno)}</span>
                  )}
                </span>
              </span>
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

        /* Grupe: 2 kolone na telefonu, 4 na desktopu */
        .vd-grupe { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 22px; }
        @media (min-width: 640px) { .vd-grupe { grid-template-columns: repeat(4, 1fr); } }
        .vd-grupa {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 16px 8px 13px; border-radius: 16px; border: 1.5px solid #EEF0F2;
          background: #fff; text-decoration: none; transition: all .15s;
          box-shadow: 0 1px 3px rgba(0,0,0,.03);
        }
        .vd-grupa:active { background: #F0FBF4; }
        @media (hover: hover) { .vd-grupa:hover { border-color: #1a8a4a; box-shadow: 0 3px 12px rgba(0,0,0,.07); } }
        .vd-grupa-ico {
          width: 44px; height: 44px; border-radius: 12px; background: #F0FBF4;
          display: flex; align-items: center; justify-content: center; font-size: 22px;
        }
        .vd-grupa-lbl { font-size: 12.5px; font-weight: 700; color: #111827; text-align: center; line-height: 1.25; }

        .vd-sec { display: flex; align-items: center; gap: 8px; margin: 4px 2px 12px; }
        .vd-sec-title { font-size: 16px; font-weight: 800; color: #111827; }
        .vd-sec-count {
          font-size: 12px; font-weight: 700; color: #1a8a4a; background: #E7F6EE;
          padding: 2px 9px; border-radius: 999px;
        }

        .vd-list { display: flex; flex-direction: column; gap: 11px; }
        .vd-card {
          display: flex; gap: 13px; align-items: center; padding: 12px;
          background: #fff; border: 1px solid #EEF0F2; border-radius: 16px;
          text-decoration: none; color: inherit; box-shadow: 0 1px 3px rgba(0,0,0,.03);
          transition: border-color .15s, box-shadow .15s;
        }
        .vd-card:active { background: #fafafa; }
        @media (hover: hover) { .vd-card:hover { border-color: #1a8a4a; box-shadow: 0 3px 12px rgba(0,0,0,.07); } }
        .vd-card-thumb {
          width: 64px; height: 64px; border-radius: 14px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .vd-card-emoji { font-size: 30px; line-height: 1; }
        .vd-card-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
        .vd-card-naslov {
          font-size: 15px; font-weight: 700; line-height: 1.3; color: #111827;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .vd-card-opis {
          font-size: 12.5px; color: #6B7280; line-height: 1.4;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .vd-card-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 3px; }
        .vd-tag { font-size: 10.5px; font-weight: 700; padding: 3px 9px; border-radius: 6px; white-space: nowrap; }
        .vd-min { display: inline-flex; align-items: center; gap: 4px; font-size: 11.5px; color: #9CA3AF; white-space: nowrap; }
        .vd-badge-novo {
          font-size: 10px; font-weight: 800; letter-spacing: .3px; white-space: nowrap;
          background: #1a8a4a; color: #fff; padding: 3px 8px; border-radius: 999px;
        }
      `}</style>
    </div>
  );
}
