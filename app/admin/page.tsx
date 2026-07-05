"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  ukupnoClanci: number;
  objavljeno: number;
  naČekanju: number;
  ukupnoVodica: number;
  ukupnoPregleda: number;
  pipelineLogs: Array<{
    datum: string;
    status: string;
    clanci: number;
    greska: string | null;
  }>;
  sljedećiPipeline: string;
}

function StatCard({ label, value, sub, color, icon, href }: {
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  icon: string;
  href?: string;
}) {
  const content = (
    <div style={{
      background: "white",
      borderRadius: 12,
      padding: "24px",
      border: "1px solid #e5e7eb",
      transition: "box-shadow 0.15s",
      cursor: href ? "pointer" : "default",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
        }}>{icon}</div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#111", lineHeight: 1, marginBottom: 6 }}>
        {typeof value === "number" ? value.toLocaleString("bs-BA") : value}
      </div>
      <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: color, marginTop: 6, fontWeight: 600 }}>{sub}</div>}
    </div>
  );

  if (href) return <Link href={href} style={{ textDecoration: "none", display: "block" }}>{content}</Link>;
  return content;
}

function PipelineStatus({ status }: { status: string }) {
  const ok = status === "uspjeh";
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: ok ? "#d1fae5" : "#fee2e2",
      color: ok ? "#065f46" : "#991b1b",
    }}>
      <span style={{ fontSize: 8 }}>●</span>
      {ok ? "Uspjeh" : "Greška"}
    </span>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pokretamPipeline, setPokretamPipeline] = useState(false);
  const [pipelineMsg, setPipelineMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(setStats);
  }, []);

  async function pokreniPipeline() {
    if (!confirm("Pokrenuti pipeline odmah? Claude će napisati 3-5 novih članaka.")) return;
    setPokretamPipeline(true);
    setPipelineMsg("");
    try {
      const res = await fetch("/api/admin/pipeline", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPipelineMsg(`✅ Uspješno! Napisano ${data.napisano || "?"} članaka.`);
      } else {
        setPipelineMsg("❌ Greška pri pokretanju. Provjeri CRON_SECRET.");
      }
    } catch {
      setPipelineMsg("❌ Greška pri pokretanju pipeline-a.");
    } finally {
      setPokretamPipeline(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111", marginBottom: 6 }}>
          Dobro jutro 👋
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280" }}>
          Pregled portala dijaspora.ba
        </p>
      </div>

      {/* Upozorenje ako ima članaka na čekanju */}
      {stats && stats.naČekanju > 0 && (
        <Link href="/admin/clanci?status=draft" style={{ textDecoration: "none" }}>
          <div style={{
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: 10,
            padding: "14px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#92400e" }}>
                {stats.naČekanju} {stats.naČekanju === 1 ? "članak čeka" : "članka čekaju"} na odobrenje
              </div>
              <div style={{ fontSize: 13, color: "#b45309" }}>Klikni da pregledaš i objaviš →</div>
            </div>
          </div>
        </Link>
      )}

      {/* Stat kartice */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        <StatCard
          label="Objavljeni članci"
          value={stats?.objavljeno ?? "—"}
          icon="📰"
          color="#1D9E75"
          href="/admin/clanci?status=published"
          sub="Klikni za upravljanje"
        />
        <StatCard
          label="Na čekanju"
          value={stats?.naČekanju ?? "—"}
          icon="⏳"
          color="#f59e0b"
          href="/admin/clanci?status=draft"
          sub={stats?.naČekanju ? "Trebaju odobrenje!" : "Sve odobreno ✓"}
        />
        <StatCard
          label="Vodiči"
          value={stats?.ukupnoVodica ?? "—"}
          icon="📖"
          color="#6366f1"
          href="/admin/clanci"
        />
        <StatCard
          label="Ukupno čitanja"
          value={stats?.ukupnoPregleda ?? "—"}
          icon="👁"
          color="#ec4899"
        />
      </div>

      {/* Donji red */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

        {/* Pipeline log */}
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>Pipeline historija</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Automatsko pisanje članaka</div>
            </div>
            <button
              onClick={pokreniPipeline}
              disabled={pokretamPipeline}
              style={{
                padding: "8px 16px",
                background: pokretamPipeline ? "#d1fae5" : "#1D9E75",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: pokretamPipeline ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {pokretamPipeline ? "⏳ Pokrećem..." : "⚡ Pokreni odmah"}
            </button>
          </div>

          {pipelineMsg && (
            <div style={{ padding: "12px 20px", background: pipelineMsg.startsWith("✅") ? "#d1fae5" : "#fee2e2", fontSize: 13, fontWeight: 600, color: pipelineMsg.startsWith("✅") ? "#065f46" : "#991b1b" }}>
              {pipelineMsg}
            </div>
          )}

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Datum i vrijeme</th>
                <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Članci</th>
                <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Detalji</th>
              </tr>
            </thead>
            <tbody>
              {stats?.pipelineLogs.map((log, i) => (
                <tr key={i} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px 20px", fontSize: 13, color: "#374151" }}>
                    {new Date(log.datum).toLocaleString("bs-BA", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td style={{ padding: "12px 20px" }}>
                    <PipelineStatus status={log.status} />
                  </td>
                  <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 600, color: log.clanci > 0 ? "#1D9E75" : "#9ca3af" }}>
                    {log.clanci > 0 ? `+${log.clanci}` : "—"}
                  </td>
                  <td style={{ padding: "12px 20px", fontSize: 12, color: "#9ca3af" }}>
                    {log.greska || "—"}
                  </td>
                </tr>
              ))}
              {!stats && (
                <tr><td colSpan={4} style={{ padding: "24px 20px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Učitavanje...</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Desna kolona */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Sljedeći pipeline */}
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 12 }}>⚡ Automatski pipeline</div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1D9E75", marginTop: 5, flexShrink: 0 }} />
              <div style={{ fontSize: 13, color: "#374151" }}>Sljedeće pokretanje: <strong>{stats?.sljedećiPipeline || "—"}</strong></div>
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>
              Claude čita RSS feedove, analizira trendove i piše 3–5 članaka automatski svaki dan.
            </div>
            <Link href="/admin/pipeline" style={{ display: "block", marginTop: 14, fontSize: 13, color: "#1D9E75", fontWeight: 600, textDecoration: "none" }}>
              Upravljaj pipeline-om →
            </Link>
          </div>

          {/* Brze akcije */}
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 16 }}>Brze akcije</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href="/admin/clanci/novi" style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                background: "#f0fdf4", borderRadius: 8, textDecoration: "none", color: "#111",
                fontSize: 13, fontWeight: 500,
              }}>
                <span>✍️</span> Napiši novi članak
              </Link>
              <Link href="/admin/clanci?status=draft" style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                background: "#fffbeb", borderRadius: 8, textDecoration: "none", color: "#111",
                fontSize: 13, fontWeight: 500,
              }}>
                <span>⏳</span> Odobreni članci
              </Link>
              <Link href="/admin/newsletter" style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                background: "#f0f9ff", borderRadius: 8, textDecoration: "none", color: "#111",
                fontSize: 13, fontWeight: 500,
              }}>
                <span>📧</span> Newsletter pretplatnici
              </Link>
              <Link href="/" target="_blank" style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                background: "#f9fafb", borderRadius: 8, textDecoration: "none", color: "#111",
                fontSize: 13, fontWeight: 500,
              }}>
                <span>🌐</span> Pogledaj portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
