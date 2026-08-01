"use client";

// ============================================================
// AKCIJE-KONZOL — svijetli samostalni admin za akcije (po skici).
// Sidebar: Pregled · Scraper · Slike · Popusti · Prodavnice ·
//          PLZ pokrivenost · Kategorije · Dozvole
// Rute koje još nisu napravljene stoje kao "uskoro" (sive, ne vode nikud),
// da se gradi dio po dio bez 404.
// ============================================================

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface NavItem {
  label: string;
  icon: string;
  href?: string; // ako fali → "uskoro"
  exact?: boolean;
}

const NAV: NavItem[] = [
  { label: "Pregled", icon: "▦", href: "/admin/akcije/pregled" },
  { label: "Scraper", icon: "📈" },
  { label: "Slike", icon: "🖼️" },
  { label: "Popusti", icon: "🏷️", href: "/admin/akcije", exact: true },
  { label: "Prodavnice", icon: "🏪" },
  { label: "PLZ pokrivenost", icon: "📍" },
  { label: "Kategorije", icon: "🗂️" },
  { label: "Dozvole", icon: "🛡️" },
];

export default function AkcijeAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [odjava, setOdjava] = useState(false);

  async function logout() {
    setOdjava(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    router.push("/admin/login");
  }

  return (
    <div className="ak-adm">
      <div className="ak-adm-ov" onClick={() => setOpen(false)} style={{ opacity: open ? 1 : 0, visibility: open ? "visible" : "hidden" }} />

      <aside className={`ak-adm-side${open ? " open" : ""}`}>
        <div className="ak-adm-brand">
          <span className="ak-adm-logo">kodnas<span>.de</span></span>
          <span className="ak-adm-tag">ADMIN</span>
          <button className="ak-adm-x" onClick={() => setOpen(false)} aria-label="Zatvori">✕</button>
        </div>

        <nav className="ak-adm-nav">
          {NAV.map((it) => {
            const active = it.href && (it.exact ? pathname === it.href : pathname.startsWith(it.href));
            if (!it.href) {
              return (
                <div key={it.label} className="ak-adm-link soon" title="Uskoro">
                  <span className="ak-adm-ico">{it.icon}</span>
                  <span>{it.label}</span>
                  <span className="ak-adm-soon">uskoro</span>
                </div>
              );
            }
            return (
              <Link
                key={it.label}
                href={it.href}
                onClick={() => setOpen(false)}
                className={`ak-adm-link${active ? " active" : ""}`}
              >
                <span className="ak-adm-ico">{it.icon}</span>
                <span>{it.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ak-adm-foot">
          <div className="ak-adm-user">Prijavljen: <b>nodze</b></div>
          <button onClick={logout} disabled={odjava} className="ak-adm-logout">
            {odjava ? "Odjava…" : "Odjava"}
          </button>
        </div>
      </aside>

      <div className="ak-adm-main">
        <button className="ak-adm-burger" onClick={() => setOpen(true)} aria-label="Meni">☰ Meni</button>
        {children}
      </div>

      <style>{`
        .ak-adm { display: flex; min-height: 100vh; background: #f3f4f6; font-family: 'Inter', -apple-system, system-ui, sans-serif; color: #111827; }
        .ak-adm-side {
          width: 248px; background: #fff; border-right: 1px solid #e5e7eb;
          position: fixed; top: 0; left: 0; height: 100vh; display: flex; flex-direction: column;
          z-index: 100; transition: transform .25s ease;
        }
        .ak-adm-main { margin-left: 248px; flex: 1; min-width: 0; padding: 26px 30px 60px; }
        .ak-adm-brand { display: flex; align-items: center; gap: 8px; padding: 20px 20px 16px; border-bottom: 1px solid #f0f1f3; }
        .ak-adm-logo { font-weight: 800; font-size: 17px; color: #111827; }
        .ak-adm-logo span { color: #2563eb; }
        .ak-adm-tag { font-size: 10.5px; font-weight: 700; letter-spacing: .8px; color: #9ca3af; }
        .ak-adm-x { display: none; margin-left: auto; background: none; border: none; font-size: 18px; color: #9ca3af; cursor: pointer; }
        .ak-adm-nav { padding: 12px; flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .ak-adm-link {
          display: flex; align-items: center; gap: 11px; padding: 10px 12px; border-radius: 9px;
          text-decoration: none; color: #4b5563; font-size: 14px; font-weight: 500;
        }
        .ak-adm-link:hover { background: #f6f7f9; }
        .ak-adm-link.active { background: #eff4ff; color: #2563eb; font-weight: 700; }
        .ak-adm-ico { width: 20px; text-align: center; font-size: 15px; }
        .ak-adm-link.soon { color: #b6bcc4; cursor: default; }
        .ak-adm-link.soon:hover { background: transparent; }
        .ak-adm-soon { margin-left: auto; font-size: 10px; font-weight: 700; color: #c4c9d0; background: #f3f4f6; padding: 2px 6px; border-radius: 6px; }
        .ak-adm-foot { padding: 14px 16px; border-top: 1px solid #f0f1f3; }
        .ak-adm-user { font-size: 12.5px; color: #6b7280; margin-bottom: 6px; }
        .ak-adm-logout { background: none; border: none; padding: 0; color: #6b7280; font-size: 12.5px; cursor: pointer; text-decoration: underline; }
        .ak-adm-burger { display: none; margin-bottom: 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 12px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .ak-adm-ov { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 90; transition: opacity .25s, visibility .25s; }
        @media (max-width: 860px) {
          .ak-adm-side { transform: translateX(-100%); box-shadow: 2px 0 16px rgba(0,0,0,.25); }
          .ak-adm-side.open { transform: translateX(0); }
          .ak-adm-main { margin-left: 0; padding: 16px 14px 60px; }
          .ak-adm-x { display: block; }
          .ak-adm-burger { display: inline-block; }
        }
      `}</style>
    </div>
  );
}
