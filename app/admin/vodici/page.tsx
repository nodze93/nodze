"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Vodic {
  id: string;
  slug: string;
  naziv: string;
  opis: string;
  ikona: string;
  kategorija: string;
  min_citanja: number;
  aktivan: boolean;
  tekst: string | null;
  koraci: Array<{ broj: number; naslov: string; opis: string }> | null;
  updated_at: string;
}

export default function AdminVodiciPage() {
  const router = useRouter();
  const [vodici, setVodici] = useState<Vodic[]>([]);
  const [loading, setLoading] = useState(true);
  const [brisanje, setBrisanje] = useState<string | null>(null);

  async function ucitaj() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/vodici");
      const json = await res.json();
      setVodici(json.vodici ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { ucitaj(); }, []);

  async function obrisi(id: string, naziv: string) {
    if (!confirm(`Obrisati vodič "${naziv}"?`)) return;
    setBrisanje(id);
    try {
      await fetch(`/api/admin/vodici/${id}`, { method: "DELETE" });
      await ucitaj();
    } finally {
      setBrisanje(null);
    }
  }

  const aktivni = vodici.filter(v => v.aktivan);
  const neaktivni = vodici.filter(v => !v.aktivan);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Vodiči</h1>
          <p style={{ fontSize: 13, color: "#6b7280" }}>{aktivni.length} aktivnih vodiča na sajtu</p>
        </div>
        <Link
          href="/admin/vodici/novi"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px",
            background: "#1D9E75", color: "white", borderRadius: 8, fontSize: 14,
            fontWeight: 600, textDecoration: "none",
          }}
        >
          + Novi vodič
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>Učitavam...</div>
      ) : vodici.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "white", borderRadius: 12, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Nema vodiča</div>
          <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>
            Vodiči su sekcija s korak-po-korak uputama za dijasporu.<br />
            Dodaj prvi vodič ili uvezi postojeće iz <code>lib/data/vodici.ts</code>.
          </p>
          <Link href="/admin/vodici/novi" style={{ display: "inline-block", padding: "10px 20px", background: "#1D9E75", color: "white", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
            + Dodaj vodič
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {aktivni.map(v => (
            <VodicKartica
              key={v.id}
              vodic={v}
              onUredi={() => router.push(`/admin/vodici/${v.id}`)}
              onPogled={() => window.open(`/vodic/${v.slug}`, "_blank")}
              onObrisi={() => obrisi(v.id, v.naziv)}
              brisanje={brisanje === v.id}
            />
          ))}
          {neaktivni.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: "#9ca3af", margin: "12px 0 4px" }}>
                Arhivirani
              </div>
              {neaktivni.map(v => (
                <VodicKartica
                  key={v.id}
                  vodic={v}
                  dimmed
                  onUredi={() => router.push(`/admin/vodici/${v.id}`)}
                  onPogled={() => window.open(`/vodic/${v.slug}`, "_blank")}
                  onObrisi={() => obrisi(v.id, v.naziv)}
                  brisanje={brisanje === v.id}
                />
              ))}
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .vodic-kartica-akcije { flex-direction: column !important; }
          .vodic-kartica-akcije a, .vodic-kartica-akcije button { width: 100%; text-align: center; }
        }
      `}</style>
    </div>
  );
}

function VodicKartica({
  vodic,
  dimmed,
  onUredi,
  onPogled,
  onObrisi,
  brisanje,
}: {
  vodic: Vodic;
  dimmed?: boolean;
  onUredi: () => void;
  onPogled: () => void;
  onObrisi: () => void;
  brisanje: boolean;
}) {
  const brojKoraka = vodic.tekst
    ? null
    : (vodic.koraci?.length ?? 0);

  return (
    <div style={{
      background: "white", border: "1px solid #e5e7eb", borderRadius: 10,
      padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
      opacity: dimmed ? 0.5 : 1, transition: "opacity 0.2s",
    }}>
      {/* Ikona */}
      <div style={{
        width: 48, height: 48, borderRadius: 10, flexShrink: 0,
        background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24,
      }}>
        {vodic.ikona}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{vodic.naziv}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100,
            background: "#f0fdf4", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.5px",
          }}>{vodic.kategorija}</span>
        </div>
        <p style={{ fontSize: 12, color: "#6b7280", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {vodic.opis}
        </p>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
          {vodic.tekst ? "Rich tekst" : `${brojKoraka} koraka`} · {vodic.min_citanja} min · /{vodic.slug}
        </div>
      </div>

      {/* Akcije */}
      <div className="vodic-kartica-akcije" style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          onClick={onPogled}
          style={{ padding: "7px 12px", borderRadius: 7, border: "1px solid #e5e7eb", background: "white", fontSize: 13, cursor: "pointer", color: "#374151" }}
        >
          👁 Pregled
        </button>
        <button
          onClick={onUredi}
          style={{ padding: "7px 12px", borderRadius: 7, border: "1px solid #e5e7eb", background: "white", fontSize: 13, cursor: "pointer", color: "#374151" }}
        >
          ✏️ Uredi
        </button>
        <button
          onClick={onObrisi}
          disabled={brisanje}
          style={{ padding: "7px 12px", borderRadius: 7, border: "1px solid #fee2e2", background: "#fef2f2", fontSize: 13, cursor: "pointer", color: "#dc2626" }}
        >
          {brisanje ? "..." : "🗑"}
        </button>
      </div>
    </div>
  );
}
