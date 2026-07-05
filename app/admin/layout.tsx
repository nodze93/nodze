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

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', -apple-system, sans-serif", background: "#f8f9fa" }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: "#111827",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: sidebarOpen ? 0 : undefined,
        height: "100vh",
        zIndex: 100,
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Link href="/" target="_blank" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "#1D9E75",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 800,
                fontSize: 16,
                flexShrink: 0,
              }}>D</div>
              <div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>dijaspora.ba</div>
                <div style={{ color: "#6b7280", fontSize: 11 }}>Admin panel</div>
              </div>
            </div>
          </Link>
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  textDecoration: "none",
                  marginBottom: 2,
                  background: active ? "rgba(29,158,117,0.15)" : "transparent",
                  color: active ? "#1D9E75" : "#9ca3af",
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  transition: "all 0.15s",
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
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 8,
              textDecoration: "none",
              color: "#9ca3af",
              fontSize: 13,
              marginBottom: 4,
            }}
          >
            <span>🌐</span> Pogledaj portal
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 8,
              background: "transparent",
              border: "none",
              color: "#9ca3af",
              fontSize: 13,
              cursor: "pointer",
              width: "100%",
            }}
          >
            <span>🚪</span> {loggingOut ? "Odjava..." : "Odjavi se"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ marginLeft: 240, flex: 1, minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "0 32px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ fontSize: 13, color: "#9ca3af" }}>
            {new Date().toLocaleDateString("bs-BA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/admin/clanci/novi"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 16px",
                background: "#1D9E75",
                color: "white",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              + Novi članak
            </Link>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: "32px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
