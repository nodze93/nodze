"use client";

import Link from "next/link";
import { useState } from "react";

// v19 raspored — tačan redoslijed iz odobrenog dizajna
const navLinks = [
  { href: "/de", label: "🇩🇪 DE" },
  { href: "/bih", label: "🇧🇦 BiH" },
  { href: "/kategorija/svijet", label: "SVIJET" },
  { href: "/kategorija/viza", label: "Viza" },
  { href: "/kategorija/stan", label: "Stan" },
  { href: "/kategorija/zdravstvo", label: "Zdravstvo" },
  { href: "/kategorija/porodica", label: "Porodica" },
  { href: "/kategorija/finansije", label: "Finansije" },
  { href: "/kategorija/sport", label: "Sport" },
  { href: "/kategorija/gastarbajter", label: "Gastarbajter" },
];

// Kategorije za hamburger meni (BBC stil listing)
const meniKategorije = [
  { href: "/de", label: "🇩🇪 Njemačka" },
  { href: "/bih", label: "🇧🇦 Bosna i Hercegovina" },
  { href: "/kategorija/svijet", label: "Svijet" },
  { href: "/kategorija/viza", label: "Viza i boravak" },
  { href: "/kategorija/stan", label: "Stan i najam" },
  { href: "/kategorija/zdravstvo", label: "Zdravstvo" },
  { href: "/kategorija/porodica", label: "Porodica i djeca" },
  { href: "/kategorija/finansije", label: "Finansije" },
  { href: "/kategorija/sport", label: "Sport" },
  { href: "/kategorija/gastarbajter", label: "Gastarbajter" },
  { href: "/vodici", label: "📘 Vodiči" },
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
        <ul
          className="nav-desktop-links"
          style={{
            display: "flex",
            gap: 4,
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                style={{
                  fontSize: 13,
                  padding: "6px 10px",
                  borderRadius: 6,
                  color: "var(--tekst-muted)",
                  display: "block",
                  transition: "all 0.15s",
                }}
                className="hover:bg-bg hover:text-tekst"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Prazan prostor desno (balansira lijevu stranu — centrira traku) */}
        <span className="nav-spacer" aria-hidden="true" />
      </div>

      {/* ===== HAMBURGER DRAWER (BBC stil, lijevo) ===== */}
      {/* Backdrop */}
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

      {/* Panel */}
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
            style={{
              background: "none",
              border: "none",
              fontSize: 22,
              cursor: "pointer",
              lineHeight: 1,
              color: "var(--tekst-muted)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Lista kategorija */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {meniKategorije.map((k) => (
            <Link
              key={k.href}
              href={k.href}
              onClick={() => setMeniOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "15px 20px",
                borderBottom: "1px solid var(--border)",
                textDecoration: "none",
                color: "var(--tekst)",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              <span>{k.label}</span>
              <span style={{ color: "var(--zelena)", fontSize: 16 }}>→</span>
            </Link>
          ))}
        </div>

      </aside>

      {/* Scoped stilovi za responsive prebacivanje */}
      <style>{`
        /* Tri zone: [lijevo flex:1] [traka auto — centar] [desno flex:1] */
        .nav-hamburger { display: none; }
        .nav-logo { flex: 1 1 0; display: flex; align-items: center; justify-content: flex-start; min-width: 0; }
        .nav-desktop-links { flex: 0 0 auto; justify-content: center; }
        .nav-spacer { flex: 1 1 0; }
        @media (max-width: 768px) {
          .nav-hamburger { display: flex !important; flex: 1 1 0; align-items: center; justify-content: flex-start; }
          .nav-logo { justify-content: center; }
          .nav-desktop-links { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
