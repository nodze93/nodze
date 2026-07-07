"use client";
import { useEffect, useState } from "react";

interface PipelineLog {
  id: number;
  datum: string;
  status: string;
  clanci_napisano: number;
  rss_vijesti: number;
  trending_tema: string | null;
  greska: string | null;
  trajanje_sekundi: number;
}

interface BotConfig {
  aktivan: boolean;
  vremena: string[];
  kvota_de: number;
  kvota_bih: number;
  kvota_svijet: number;
  kvota_sport: number;
  zadnji_slot: string | null;
}

export default function PipelinePage() {
  const [logs, setLogs] = useState<PipelineLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pokrecem, setPokrecem] = useState(false);
  const [poruka, setPoruka] = useState("");

  // Raspored bota
  const [cfg, setCfg] = useState<BotConfig | null>(null);
  const [snimam, setSnimam] = useState(false);
  const [cfgPoruka, setCfgPoruka] = useState("");
  const [tickUrl, setTickUrl] = useState("");

  useEffect(() => {
    fetch("/api/admin/pipeline")
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs || []);
        setLoading(false);
      });
    fetch("/api/admin/bot-config")
      .then((r) => r.json())
      .then((data) => data.config && setCfg(data.config))
      .catch(() => {});
    if (typeof window !== "undefined") {
      setTickUrl(`${window.location.origin}/api/cron/tick`);
    }
  }, []);

  const ukupnoClanci = logs.reduce((sum, l) => sum + l.clanci_napisano, 0);
  const uspjehRate =
    logs.length > 0
      ? Math.round((logs.filter((l) => l.status === "uspjeh").length / logs.length) * 100)
      : 0;

  async function pokreniPipeline() {
    if (!confirm("Pokrenuti bota na GitHub Actions? Članci se pišu za 2-3 minute.")) return;
    setPokrecem(true);
    setPoruka("");
    try {
      const res = await fetch("/api/admin/pipeline", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok !== false) {
        setPoruka(data.poruka || "✅ Bot pokrenut. Osvježi listu članaka za par minuta.");
      } else {
        setPoruka(`❌ ${data.error || "Nije moguće pokrenuti bota."}`);
      }
    } catch {
      setPoruka("❌ Nije moguće pokrenuti bota.");
    } finally {
      setPokrecem(false);
    }
  }

  // ── Raspored: pomoćne funkcije ──
  function postavi<K extends keyof BotConfig>(k: K, v: BotConfig[K]) {
    setCfg((c) => (c ? { ...c, [k]: v } : c));
  }
  function promijeniVrijeme(i: number, v: string) {
    setCfg((c) => {
      if (!c) return c;
      const vremena = [...c.vremena];
      vremena[i] = v;
      return { ...c, vremena };
    });
  }
  function dodajVrijeme() {
    setCfg((c) => (c ? { ...c, vremena: [...c.vremena, "12:00"] } : c));
  }
  function obrisiVrijeme(i: number) {
    setCfg((c) => (c ? { ...c, vremena: c.vremena.filter((_, j) => j !== i) } : c));
  }

  async function snimiRaspored() {
    if (!cfg) return;
    setSnimam(true);
    setCfgPoruka("");
    try {
      const res = await fetch("/api/admin/bot-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.config) {
        setCfg(data.config);
        setCfgPoruka("✅ Raspored snimljen.");
      } else {
        setCfgPoruka(`❌ ${data.error || "Nije moguće snimiti."}`);
      }
    } catch {
      setCfgPoruka("❌ Nije moguće snimiti.");
    } finally {
      setSnimam(false);
    }
  }

  const kvote: { k: keyof BotConfig; naziv: string }[] = [
    { k: "kvota_de", naziv: "🇩🇪 DE" },
    { k: "kvota_bih", naziv: "🇧🇦 BiH" },
    { k: "kvota_svijet", naziv: "🌍 Svijet" },
    { k: "kvota_sport", naziv: "⚽ Sport" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111", marginBottom: 4 }}>Pipeline</h1>
        <p style={{ fontSize: 13, color: "#6b7280" }}>Automatsko pisanje i objava članaka pomoću Claude AI</p>
      </div>

      {/* ===== RASPORED BOTA (kontrola iz admina) ===== */}
      <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>🕒 Raspored bota</div>
          {cfg && (
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", color: "#374151" }}>
              <input
                type="checkbox"
                checked={cfg.aktivan}
                onChange={(e) => postavi("aktivan", e.target.checked)}
                style={{ width: 16, height: 16 }}
              />
              {cfg.aktivan ? "Uključen" : "Isključen"}
            </label>
          )}
        </div>

        {!cfg ? (
          <div style={{ color: "#9ca3af", fontSize: 13 }}>Učitavanje rasporeda...</div>
        ) : (
          <>
            {/* Vremena pokretanja */}
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
              Vremena pokretanja (Berlin) — koliko redova, toliko puta dnevno:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
              {cfg.vremena.map((v, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 8px" }}>
                  <input
                    type="time"
                    value={v}
                    onChange={(e) => promijeniVrijeme(i, e.target.value)}
                    style={{ border: "none", background: "transparent", fontSize: 14, fontWeight: 600, color: "#111" }}
                  />
                  <button
                    onClick={() => obrisiVrijeme(i)}
                    title="Obriši termin"
                    style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer", fontSize: 16, lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={dodajVrijeme}
                style={{ border: "1px dashed #9ca3af", background: "white", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}
              >
                + Dodaj termin
              </button>
            </div>

            {/* Kvote */}
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
              Koliko članaka po pokretanju:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
              {kvote.map(({ k, naziv }) => (
                <div key={k} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>{naziv}</div>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={cfg[k] as number}
                    onChange={(e) => postavi(k, Number(e.target.value) as never)}
                    style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 6, padding: "6px 8px", fontSize: 14, fontWeight: 700, color: "#111" }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={snimiRaspored}
                disabled={snimam}
                style={{
                  padding: "10px 20px",
                  background: snimam ? "#d1fae5" : "#1D9E75",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: snimam ? "not-allowed" : "pointer",
                }}
              >
                {snimam ? "Snimam..." : "💾 Snimi raspored"}
              </button>
              {cfgPoruka && (
                <span style={{ fontSize: 13, fontWeight: 600, color: cfgPoruka.startsWith("✅") ? "#065f46" : "#991b1b" }}>
                  {cfgPoruka}
                </span>
              )}
            </div>

            {/* Uputa za pouzdano pokretanje */}
            <div style={{ marginTop: 16, padding: "12px 16px", background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe", fontSize: 12.5, color: "#1e40af", lineHeight: 1.6 }}>
              <strong>Da bi se pokretalo tačno na vrijeme:</strong> besplatan servis (npr. cron-job.org)
              treba svakih ~15 min pozvati ovaj link:
              <div style={{ marginTop: 6, fontFamily: "monospace", fontSize: 12, background: "white", border: "1px solid #dbeafe", borderRadius: 6, padding: "6px 8px", wordBreak: "break-all", color: "#111" }}>
                {tickUrl || ".../api/cron/tick"}
              </div>
              <div style={{ marginTop: 6 }}>
                U tom servisu dodaj header <code>x-cron-secret</code> sa vrijednošću tvog{" "}
                <code>CRON_SECRET</code>-a. Ovaj link samo <em>provjeri</em> raspored gore i pokrene bota
                kad je termin na redu — ti mijenjaš vremena ovdje, servis se ne dira.
              </div>
            </div>
          </>
        )}
      </div>

      {/* Kako radi */}
      <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 16 }}>⚡ Kako funkcioniše automatski pipeline</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { br: "1", naslov: "RSS čitanje", opis: "Čita Klix.ba, N1, Slobodna Europa i filtrira vijesti relevantne za dijasporu", ikona: "📡" },
            { br: "2", naslov: "Trend analiza", opis: "Provjerava Google Autocomplete za pojmove: Bosanci Njemačka, Elterngeld, Kindergeld...", ikona: "📈" },
            { br: "3", naslov: "AI pisanje", opis: "Claude piše originalne članke na bosanskom, prilagođene dijaspori", ikona: "✍️" },
            { br: "4", naslov: "Objava", opis: "Članci se snimaju u Supabase kao 'draft' — ti ih odobriš ili urediš", ikona: "🚀" },
          ].map((korak) => (
            <div key={korak.br} style={{ padding: 16, background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{korak.ikona}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#1D9E75", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{korak.br}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{korak.naslov}</span>
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{korak.opis}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistike */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Članci (zadnjih 20)</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#111" }}>{ukupnoClanci}</div>
          <div style={{ fontSize: 13, color: "#1D9E75", fontWeight: 600, marginTop: 4 }}>automatski napisanih</div>
        </div>
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Uspješnost</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: uspjehRate >= 90 ? "#1D9E75" : "#f59e0b" }}>{uspjehRate}%</div>
          <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600, marginTop: 4 }}>pokretanja bez greške</div>
        </div>
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Ručno pokretanje</div>
          <button
            onClick={pokreniPipeline}
            disabled={pokrecem}
            style={{
              marginTop: 8,
              padding: "12px 20px",
              background: pokrecem ? "#d1fae5" : "#1D9E75",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: pokrecem ? "not-allowed" : "pointer",
              width: "100%",
            }}
          >
            {pokrecem ? "⏳ Pokrećem..." : "⚡ Pokreni odmah"}
          </button>
        </div>
      </div>

      {poruka && (
        <div style={{ padding: "12px 16px", borderRadius: 8, marginBottom: 20, background: poruka.startsWith("✅") ? "#d1fae5" : "#fee2e2", color: poruka.startsWith("✅") ? "#065f46" : "#991b1b", fontSize: 14, fontWeight: 600 }}>
          {poruka}
        </div>
      )}

      {/* Log tabela */}
      <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>Log pokretanja</div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Datum</th>
              <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
              <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Članci</th>
              <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Trending tema</th>
              <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Trajanje</th>
              <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Greška</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "#9ca3af" }}>Učitavanje...</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 20px", fontSize: 13, color: "#374151" }}>
                  {new Date(log.datum).toLocaleString("bs-BA", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td style={{ padding: "12px 20px" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: log.status === "uspjeh" ? "#d1fae5" : "#fee2e2",
                    color: log.status === "uspjeh" ? "#065f46" : "#991b1b",
                  }}>
                    <span style={{ fontSize: 8 }}>●</span>
                    {log.status === "uspjeh" ? "Uspjeh" : "Greška"}
                  </span>
                </td>
                <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 700, color: log.clanci_napisano > 0 ? "#1D9E75" : "#9ca3af" }}>
                  {log.clanci_napisano > 0 ? `+${log.clanci_napisano}` : "—"}
                </td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "#6b7280" }}>
                  {log.trending_tema || "—"}
                </td>
                <td style={{ padding: "12px 20px", fontSize: 13, color: "#6b7280" }}>
                  {log.trajanje_sekundi}s
                </td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "#ef4444" }}>
                  {log.greska || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
