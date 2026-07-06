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
  const [searchOpen, setSearchOpen] = useState(false);
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
          justifyContent: "space-between",
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
          }}
        >
          ☰
        </button>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", color: "inherit", flexShrink: 0 }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            dijaspora<span style={{ color: "var(--zelena)" }}>.ba</span>
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

        {/* Search (desktop) */}
        <div
          className="nav-search-desktop"
          onClick={() => setSearchOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: "6px 14px",
            fontSize: 13,
            color: "var(--tekst-light)",
            cursor: "pointer",
            transition: "border-color 0.15s",
          }}
          role="button"
          aria-label="Pretraži portal"
        >
          🔍 Pretraži portal...
        </div>

        {/* Search ikona (mobitel) */}
        <button
          onClick={() => setSearchOpen(true)}
          className="nav-search-mobile"
          aria-label="Pretraži"
          style={{
            fontSize: 18,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            lineHeight: 1,
          }}
        >
          🔍
        </button>
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
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>
            dijaspora<span style={{ color: "var(--zelena)" }}>.ba</span>
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

        {/* Pretraga na dnu */}
        <button
          onClick={() => {
            setMeniOpen(false);
            setSearchOpen(true);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "16px 20px",
            margin: "16px",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            color: "var(--tekst-light)",
            fontSize: 14,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          🔍 Pretraži portal...
        </button>
      </aside>

      {/* Scoped stilovi za responsive prebacivanje */}
      <style>{`
        .nav-hamburger { display: none; }
        .nav-search-mobile { display: none; }
        @media (max-width: 768px) {
          .nav-hamburger { display: flex !important; align-items: center; }
          .nav-desktop-links { display: none !important; }
          .nav-search-desktop { display: none !important; }
          .nav-search-mobile { display: inline-flex !important; align-items: center; }
        }
      `}</style>
    </nav>
  );
}
