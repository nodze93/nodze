"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [lozinka, setLozinka] = useState("");
  const [greska, setGreska] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setGreska("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lozinka }),
      });

      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        setGreska("Pogrešna lozinka. Pokušaj ponovo.");
        setLozinka("");
      }
    } catch {
      setGreska("Greška pri prijavi. Pokušaj ponovo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f5f5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <div style={{
        background: "white",
        borderRadius: 16,
        padding: "48px 40px",
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#1D9E75",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              fontSize: 18,
            }}>D</div>
            <span style={{ fontWeight: 800, fontSize: 20, color: "#111" }}>kodnas.de</span>
          </div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Admin panel</div>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 28, color: "#111" }}>
          Prijavi se
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 6 }}>
              Lozinka
            </label>
            <input
              type="password"
              value={lozinka}
              onChange={e => setLozinka(e.target.value)}
              placeholder="Upiši admin lozinku"
              autoFocus
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                border: greska ? "1.5px solid #e53e3e" : "1.5px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 15,
                outline: "none",
                transition: "border-color 0.15s",
                boxSizing: "border-box",
              }}
              onFocus={e => { if (!greska) e.target.style.borderColor = "#1D9E75"; }}
              onBlur={e => { if (!greska) e.target.style.borderColor = "#e5e7eb"; }}
            />
            {greska && (
              <div style={{ fontSize: 13, color: "#e53e3e", marginTop: 6 }}>{greska}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !lozinka}
            style={{
              width: "100%",
              padding: "13px",
              background: loading || !lozinka ? "#a0d5be" : "#1D9E75",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: loading || !lozinka ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}
          >
            {loading ? "Prijavljivanje..." : "Prijavi se →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#bbb" }}>
          Lozinka se podešava u .env kao ADMIN_SECRET
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
