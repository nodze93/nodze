"use client";

import Link from "next/link";
import { useState } from "react";

// Glavne rubrike PRIJE "Vodiči" (vijesti po rubrici)
const glavnePrije = [
  { href: "/de", label: "🇩🇪 Njemačka" },
  { href: "/kategorija/svijet", label: "Svijet" },
  { href: "/kategorija/sport", label: "Sport" },
  { href: "/kategorija/finansije", label: "Finansije" },
];

// Vodiči — SAMO vodiči, bez vijesti (praktične teme)
const vodici = [
  { href: "/kategorija/viza", label: "Viza i boravak" },
  { href: "/kategorija/stan", label: "Stan" },
  { href: "/kategorija/zdravstvo", label: "Zdravstvo" },
  { href: "/kategorija/porodica", label: "Porodica" },
];

// Glavne rubrike POSLIJE "Vodiči"
const glavnePoslije = [
  { href: "/kategorija/gastarbajter", label: "Gastarbajter" },
];

export default function Nav() {
  const [meniOpen, setMeniOpen] = useState(false);

  return (
    <nav
      style={{
        background: "var(--white)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          height: 56,
          gap: 12,
        }}
      >
        {/* Hamburger (samo mobitel) */}
        <button
          className="nav-hamburger"
          onClick={() => setMeniOpen(true)}
          aria-label="Otvori meni"
          style={{
            background: "none",
            border: "none",
            fontSize: 22,
            cursor: "pointer",
            padding: 4,
            lineHeight: 1,
            color: "var(--tekst)",
            textAlign: "left",
          }}
        >
          ☰
        </button>

        {/* Logo — fensi wordmark */}
        <Link href="/" className="nav-logo" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            style={{
              fontFamily: "Georgia, 'Playfair Display', 'Times New Roman', serif",
              fontStyle: "italic",
              fontSize: 25,
              fontWeight: 700,
              letterSpacing: "-0.5px",
              lineHeight: 1,
              display: "flex",
              alignItems: "baseline",
              gap: 5,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: "var(--tekst)" }}>Kod</span>
            <span style={{ color: "var(--zelena)" }}>nas</span>
            <span style={{ color: "var(--tekst-light)", fontWeight: 600 }}>u…</span>
          </div>
        </Link>

        {/* Nav links (desktop) */}
        <ul className="nav-desktop-links" style={{ display: "flex", gap: 4, listStyle: "none", margin: 0, padding: 0, alignItems: "center" }}>
          {glavnePrije.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="nav-link">{link.label}</Link>
            </li>
          ))}

          {/* Vodiči — hover padajući meni */}
          <li className="nav-vodici">
            <span className="nav-link nav-vodici-label">Vodiči ▾</span>
            <ul className="nav-vodici-menu">
              {vodici.map((v) => (
                <li key={v.href}>
                  <Link href={v.href} className="nav-vodici-item">{v.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/vodici" className="nav-vodici-item nav-vodici-svi">Svi vodiči →</Link>
              </li>
            </ul>
          </li>

          {glavnePoslije.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="nav-link">{link.label}</Link>
            </li>
          ))}
        </ul>

        {/* Prazan prostor desno (balansira lijevu stranu — centrira traku) */}
        <span className="nav-spacer" aria-hidden="true" />
      </div>

      {/* ===== HAMBURGER DRAWER (lijevo) ===== */}
      <div
        onClick={() => setMeniOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          opacity: meniOpen ? 1 : 0,
          visibility: meniOpen ? "visible" : "hidden",
          transition: "opacity 0.25s, visibility 0.25s",
          zIndex: 200,
        }}
      />

      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 300,
          maxWidth: "85vw",
          background: "var(--white)",
          boxShadow: "2px 0 16px rgba(0,0,0,0.15)",
          transform: meniOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          zIndex: 201,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Header drawera */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontFamily: "Georgia, 'Playfair Display', 'Times New Roman', serif",
              fontStyle: "italic",
              fontSize: 23,
              fontWeight: 700,
              letterSpacing: "-0.5px",
              display: "flex",
              alignItems: "baseline",
              gap: 5,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: "var(--tekst)" }}>Kod</span>
            <span style={{ color: "var(--zelena)" }}>nas</span>
            <span style={{ color: "var(--tekst-light)", fontWeight: 600 }}>u…</span>
          </div>
          <button
            onClick={() => setMeniOpen(false)}
            aria-label="Zatvori meni"
            style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", lineHeight: 1, color: "var(--tekst-muted)" }}
          >
            ✕
          </button>
        </div>

        {/* Glavne rubrike */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Link
            href="/"
            onClick={() => setMeniOpen(false)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "15px 20px", borderBottom: "1px solid var(--border)",
              textDecoration: "none", color: "var(--tekst)", fontSize: 15, fontWeight: 700,
            }}
          >
            <span>🏠 Naslovna</span>
            <span style={{ color: "var(--zelena)", fontSize: 16 }}>→</span>
          </Link>
          {glavnePrije.map((k) => (
            <Link
              key={k.href}
              href={k.href}
              onClick={() => setMeniOpen(false)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "15px 20px", borderBottom: "1px solid var(--border)",
                textDecoration: "none", color: "var(--tekst)", fontSize: 15, fontWeight: 700,
              }}
            >
              <span>{k.label}</span>
              <span style={{ color: "var(--zelena)", fontSize: 16 }}>→</span>
            </Link>
          ))}

          {/* VODIČI — naslov grupe + pod-teme stoje OTVORENE ispod (uvučene) */}
          <div style={{
            padding: "14px 20px 8px", fontSize: 12, fontWeight: 800, letterSpacing: "0.6px",
            textTransform: "uppercase", color: "var(--tekst-light)", background: "var(--bg)",
            borderBottom: "1px solid var(--border)",
          }}>
            📘 Vodiči
          </div>
          {vodici.map((v) => (
            <Link
              key={v.href}
              href={v.href}
              onClick={() => setMeniOpen(false)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "13px 20px 13px 34px", borderBottom: "1px solid var(--border)",
                textDecoration: "none", color: "var(--tekst)", fontSize: 14.5, fontWeight: 500,
              }}
            >
              <span>{v.label}</span>
              <span style={{ color: "var(--zelena)", fontSize: 15 }}>→</span>
            </Link>
          ))}
          <Link
            href="/vodici"
            onClick={() => setMeniOpen(false)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "13px 20px 13px 34px", borderBottom: "1px solid var(--border)",
              textDecoration: "none", color: "var(--zelena)", fontSize: 14.5, fontWeight: 700,
            }}
          >
            <span>Svi vodiči</span>
            <span style={{ fontSize: 15 }}>→</span>
          </Link>

          {glavnePoslije.map((k) => (
            <Link
              key={k.href}
              href={k.href}
              onClick={() => setMeniOpen(false)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "15px 20px", borderBottom: "1px solid var(--border)",
                textDecoration: "none", color: "var(--tekst)", fontSize: 15, fontWeight: 700,
              }}
            >
              <span>{k.label}</span>
              <span style={{ color: "var(--zelena)", fontSize: 16 }}>→</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Scoped stilovi */}
      <style>{`
        .nav-hamburger { display: none; }
        .nav-logo { flex: 1 1 0; display: flex; align-items: center; justify-content: flex-start; min-width: 0; }
        .nav-desktop-links { flex: 0 0 auto; justify-content: center; }
        .nav-spacer { flex: 1 1 0; }

        .nav-link {
          font-size: 13.5px; padding: 6px 11px; border-radius: 6px; color: var(--tekst-muted);
          display: block; text-decoration: none; transition: all 0.15s; cursor: pointer; white-space: nowrap;
        }
        .nav-link:hover { background: var(--bg); color: var(--tekst); }

        /* Vodiči dropdown (desktop, na hover) */
        .nav-vodici { position: relative; }
        .nav-vodici-menu {
          display: none; position: absolute; top: 100%; left: 0; margin: 0; padding: 6px;
          list-style: none; min-width: 210px; background: var(--white);
          border: 1px solid var(--border); border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12); z-index: 300;
        }
        .nav-vodici:hover .nav-vodici-menu { display: block; }
        .nav-vodici-item {
          display: block; padding: 9px 12px; border-radius: 7px; font-size: 13.5px;
          color: var(--tekst); text-decoration: none; white-space: nowrap;
        }
        .nav-vodici-item:hover { background: var(--bg); }
        .nav-vodici-svi { color: var(--zelena); font-weight: 700; border-top: 1px solid var(--border); margin-top: 4px; padding-top: 11px; }

        @media (max-width: 768px) {
          .nav-hamburger { display: flex !important; flex: 1 1 0; align-items: center; justify-content: flex-start; }
          .nav-logo { justify-content: center; }
          .nav-desktop-links { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
