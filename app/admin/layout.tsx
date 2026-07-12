"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/clanci", label: "Članci", icon: "📰" },
  { href: "/admin/pipeline", label: "Pipeline", icon: "⚡" },
  { href: "/admin/newsletter", label: "Newsletter", icon: "📧" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (pathname === "/admin/login") return <>{children}</>;

  const zatvori = () => setSidebarOpen(false);

  return (
    <div className="admin-shell">
      {/* Overlay (samo mobitel, kad je meni otvoren) */}
      <div
        className="admin-overlay"
        onClick={zatvori}
        style={{ opacity: sidebarOpen ? 1 : 0, visibility: sidebarOpen ? "visible" : "hidden" }}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" target="_blank" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8, background: "#1D9E75",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 800, fontSize: 16, flexShrink: 0,
              }}>K</div>
              <div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>kodnas.de</div>
                <div style={{ color: "#6b7280", fontSize: 11 }}>Admin panel</div>
              </div>
            </div>
          </Link>
          {/* Zatvori (samo mobitel) */}
          <button
            className="admin-close"
            onClick={zatvori}
            aria-label="Zatvori meni"
            style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 22, cursor: "pointer", lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", color: "#4b5563", textTransform: "uppercase", padding: "0 8px", marginBottom: 8 }}>
            Navigacija
          </div>
          {navItems.map(item => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={zatvori}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 12px", borderRadius: 8, textDecoration: "none", marginBottom: 2,
                  background: active ? "rgba(29,158,117,0.15)" : "transparent",
                  color: active ? "#1D9E75" : "#9ca3af",
                  fontSize: 14, fontWeight: active ? 600 : 400, transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Link
            href="/"
            target="_blank"
            onClick={zatvori}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 8, textDecoration: "none", color: "#9ca3af", fontSize: 13, marginBottom: 4 }}
          >
            <span>🌐</span> Pogledaj portal
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 8, background: "transparent", border: "none", color: "#9ca3af", fontSize: 13, cursor: "pointer", width: "100%" }}
          >
            <span>🚪</span> {loggingOut ? "Odjava..." : "Odjavi se"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar" style={{
          background: "white", borderBottom: "1px solid #e5e7eb",
          height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            {/* Hamburger (samo mobitel) */}
            <button
              className="admin-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Otvori meni"
              style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#111827", lineHeight: 1, padding: 4 }}
            >
              ☰
            </button>
            <div className="admin-datum" style={{ fontSize: 13, color: "#9ca3af", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {new Date().toLocaleDateString("bs-BA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <Link
              href="/admin/clanci/novi"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px",
                background: "#1D9E75", color: "white", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap",
              }}
            >
              + Novi
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>

      {/* Responsivni stilovi */}
      <style>{`
        .admin-shell { display: flex; min-height: 100vh; font-family: 'Inter', -apple-system, sans-serif; background: #f8f9fa; }
        .admin-sidebar {
          width: 240px; background: #111827; display: flex; flex-direction: column;
          position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
          transform: translateX(0); transition: transform 0.25s ease;
        }
        .admin-main { margin-left: 240px; flex: 1; min-width: 0; }
        .admin-topbar { padding: 0 32px; }
        .admin-content { padding: 32px; }
        .admin-close { display: none; }
        .admin-hamburger { display: none; }
        .admin-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 90;
          transition: opacity 0.25s, visibility 0.25s;
        }
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(-100%); box-shadow: 2px 0 16px rgba(0,0,0,0.3); }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-main { margin-left: 0; }
          .admin-topbar { padding: 0 14px; }
          .admin-content { padding: 16px 14px; }
          .admin-close { display: block; }
          .admin-hamburger { display: inline-flex; align-items: center; }
          .admin-datum { display: none; }
        }
      `}</style>
    </div>
  );
}
