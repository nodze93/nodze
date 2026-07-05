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

export default function Nav() {
  const [searchOpen, setSearchOpen] = useState(false);

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
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
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

        {/* Nav links */}
        <ul
          style={{
            display: "flex",
            gap: 4,
            listStyle: "none",
          }}
          className="hidden md:flex"
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

        {/* Search */}
        <div
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
          className="hover:border-zelena"
          role="button"
          aria-label="Pretraži portal"
        >
          🔍 Pretraži portal...
        </div>
      </div>
    </nav>
  );
}
