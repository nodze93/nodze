"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const GRADOVI: Array<{ v: string; l: string }> = [
  { v: "00000", l: "Sve gradove (nacionalno)" },
  { v: "85737", l: "85737 — Ismaning" },
  { v: "80331", l: "80331 — München" },
  { v: "80807", l: "80807 — München" },
  { v: "70173", l: "70173 — Stuttgart" },
  { v: "60311", l: "60311 — Frankfurt" },
  { v: "10115", l: "10115 — Berlin" },
];

interface ManualItem {
  id: string;
  product_name: string;
  new_price: number;
  old_price: number | null;
  plz: string;
  valid_to: string | null;
  image_url: string | null;
  category: string | null;
  store: string;
}

const box: React.CSSProperties = {
  background: "white", borderRadius: 12, padding: 20, border: "1px solid #e5e7eb", marginBottom: 20,
};
const input: React.CSSProperties = {
  width: "100%", padding: "9px 11px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, marginTop: 4,
};
const label: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#374151" };
const btn: React.CSSProperties = {
  padding: "10px 18px", background: "#16a34a", color: "white", border: 0, borderRadius: 8,
  fontWeight: 700, fontSize: 14, cursor: "pointer",
};

export default function AdminAkcije() {
  const [f, setF] = useState({
    productName: "", store: "", newPrice: "", oldPrice: "", category: "", plz: "00000", validTo: "", imageUrl: "",
  });
  const [bulk, setBulk] = useState("");
  const [items, setItems] = useState<ManualItem[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch("/api/admin/akcije");
    if (r.ok) setItems((await r.json()).items ?? []);
  }
  useEffect(() => { load(); }, []);

  async function submitOne(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const r = await fetch("/api/admin/akcije", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f),
    });
    const j = await r.json();
    setBusy(false);
    if (r.ok && j.upisano) {
      setMsg(`Upisano: ${f.productName}`);
      setF({ ...f, productName: "", store: f.store, newPrice: "", oldPrice: "", category: "", validTo: "", imageUrl: "" });
      load();
    } else {
      setMsg(`Greška: ${j.error || (j.preskoceno || []).join(", ") || "provjeri polja"}`);
    }
  }

  async function submitBulk() {
    setBusy(true); setMsg("");
    let offers: unknown;
    try {
      offers = JSON.parse(bulk);
      if (!Array.isArray(offers)) offers = [offers];
    } catch {
      setBusy(false); setMsg("Neispravan JSON u polju za lijepljenje"); return;
    }
    const r = await fetch("/api/admin/akcije", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ offers }),
    });
    const j = await r.json();
    setBusy(false);
    if (r.ok) {
      setMsg(`Upisano ${j.upisano}, preskočeno ${(j.preskoceno || []).length}`);
      setBulk(""); load();
    } else setMsg(`Greška: ${j.error}`);
  }

  // Koliko ponuda ide u jednom zahtjevu. Nije 3000 (koliko server prima) jer
  // marktguru ponuda vrijedi u više gradova, pa se na serveru razmnoži u više
  // redova: 500 ponuda ≈ 2.000 redova, što stane u jedan zahtjev bez isteka.
  const KOMAD = 500;

  async function submitFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset da se isti fajl može ponovo izabrati
    if (!file) return;
    setBusy(true); setMsg("Čitam fajl…");

    let offers: unknown[];
    let sweptPlz: unknown[] = [];
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      // Fajl može biti goli niz ILI omotan ({"offers":[...]}). Ranije se
      // omotani fajl umotavao JOŠ jednom → server je vidio jedan artikal bez
      // naziva i javljao "upisano 0, preskočeno 1".
      const omotac = parsed as { offers?: unknown; items?: unknown; data?: unknown; sweptPlz?: unknown };
      const ugnijezdjen = [omotac?.offers, omotac?.items, omotac?.data].find(Array.isArray);
      offers = (Array.isArray(parsed) ? parsed : (ugnijezdjen ?? [parsed])) as unknown[];
      // Spisak skeniranih gradova NE SMIJE ispasti: po njemu server prepoznaje
      // ponudu koja vrijedi u cijeloj Njemačkoj i upiše je jednom umjesto 18 puta.
      if (Array.isArray(omotac?.sweptPlz)) sweptPlz = omotac.sweptPlz;
    } catch {
      setBusy(false); setMsg(`Neispravan JSON u fajlu "${file.name}"`); return;
    }

    // VELIKI FAJL IDE U KOMADIMA. Cijeli uvoz od 13.000 ponuda u jednom
    // zahtjevu bi istekao na pola posla i ostavio bazu napola napunjenu.
    const komadi: unknown[][] = [];
    for (let i = 0; i < offers.length; i += KOMAD) komadi.push(offers.slice(i, i + KOMAD));

    let upisano = 0;
    const preskoceno: string[] = [];
    for (let i = 0; i < komadi.length; i++) {
      setMsg(`Uvozim… komad ${i + 1}/${komadi.length} · redova do sad: ${upisano}`);
      const r = await fetch("/api/admin/akcije", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // reset SAMO na prvom komadu: izbaci prošli uvoz jednim potezom, pa
        // ostali komadi samo dopunjuju. Ručno ukucane ponude se ne diraju.
        body: JSON.stringify({ offers: komadi[i], sweptPlz, reset: i === 0 }),
      });
      const j = await r.json();
      if (!r.ok) {
        setBusy(false);
        setMsg(`Stalo na komadu ${i + 1}/${komadi.length} (upisano ${upisano}): ${j.error}`);
        load();
        return;
      }
      upisano += Number(j.upisano || 0);
      preskoceno.push(...((j.preskoceno as string[]) || []));
    }

    setBusy(false);
    setMsg(
      `Iz fajla "${file.name}": ${offers.length} ponuda → upisano ${upisano} redova` +
        (preskoceno.length ? `, preskočeno ${preskoceno.length} (npr. ${preskoceno[0]})` : ""),
    );
    load();
  }

  async function del(id: string) {
    await fetch(`/api/admin/akcije?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Link href="/admin" style={{ color: "#6b7280", textDecoration: "none" }}>← Admin</Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Ručni unos akcija</h1>
      </div>

      {msg && (
        <div style={{ ...box, background: msg.startsWith("Greška") ? "#fef2f2" : "#f0fdf4", color: msg.startsWith("Greška") ? "#b91c1c" : "#15803d", fontWeight: 600 }}>
          {msg}
        </div>
      )}

      {/* Jedna ponuda */}
      <form onSubmit={submitOne} style={box}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Dodaj jednu akciju</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><span style={label}>Naziv artikla *</span><input style={input} value={f.productName} onChange={(e) => setF({ ...f, productName: e.target.value })} required /></div>
          <div><span style={label}>Prodavnica *</span><input style={input} value={f.store} onChange={(e) => setF({ ...f, store: e.target.value })} placeholder="Lidl, REWE…" required /></div>
          <div><span style={label}>Nova cijena (€) *</span><input style={input} value={f.newPrice} onChange={(e) => setF({ ...f, newPrice: e.target.value })} placeholder="1,99" required /></div>
          <div><span style={label}>Stara cijena (€)</span><input style={input} value={f.oldPrice} onChange={(e) => setF({ ...f, oldPrice: e.target.value })} placeholder="npr. 3,49" /></div>
          <div><span style={label}>Kategorija</span><input style={input} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} placeholder="Fleisch, Getraenke…" /></div>
          <div><span style={label}>Grad</span>
            <select style={input} value={f.plz} onChange={(e) => setF({ ...f, plz: e.target.value })}>
              {GRADOVI.map((g) => <option key={g.v} value={g.v}>{g.l}</option>)}
            </select>
          </div>
          <div><span style={label}>Važi do</span><input type="date" style={input} value={f.validTo} onChange={(e) => setF({ ...f, validTo: e.target.value })} /></div>
          <div><span style={label}>Slika (URL)</span><input style={input} value={f.imageUrl} onChange={(e) => setF({ ...f, imageUrl: e.target.value })} placeholder="https://…" /></div>
        </div>
        <button type="submit" style={{ ...btn, marginTop: 14, opacity: busy ? 0.6 : 1 }} disabled={busy}>Dodaj akciju</button>
      </form>

      {/* Bulk */}
      <div style={box}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Zalijepi više odjednom (JSON)</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
          Niz objekata. Prepoznaje: <code>title/product/productName</code>, <code>publisherName/store</code>,
          <code> mainPrice/price/newPrice</code>, <code>oldPrice</code>, <code>category</code>,
          <code> imageUrl</code>, <code>validUntil/validTo</code>, <code>plz</code> (prazno = svi gradovi).
        </div>
        <textarea value={bulk} onChange={(e) => setBulk(e.target.value)} rows={7}
          style={{ ...input, fontFamily: "monospace", fontSize: 12.5 }}
          placeholder='[{"title":"Nutella 450g","publisherName":"Lidl","mainPrice":1.99,"oldPrice":2.99}]' />
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={submitBulk} style={{ ...btn, opacity: busy ? 0.6 : 1 }} disabled={busy}>Uvezi zalijepljeno</button>
          <label style={{ ...btn, background: "#1a56db", display: "inline-flex", alignItems: "center", gap: 6, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}>
            ⤒ Uploaduj .json fajl
            <input type="file" accept=".json,application/json" onChange={submitFile} disabled={busy} style={{ display: "none" }} />
          </label>
        </div>
        <div style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 8 }}>
          Prepoznaje i <code>validFrom</code>/<code>validSince</code> (važi od) i <code>offerId</code>/<code>offerUrl</code>.
          Slike agregatora (marktguru…) se namjerno preskaču — za slike ide Open Food Facts.
        </div>
      </div>

      {/* Lista */}
      <div style={box}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Ručne akcije ({items.length})</div>
        {items.length === 0 ? (
          <div style={{ color: "#6b7280", fontSize: 14 }}>Još nema ručnih akcija.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map((it) => (
              <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 10px", border: "1px solid #f3f4f6", borderRadius: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.product_name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {it.store} · {Number(it.new_price).toFixed(2)} €{it.old_price ? ` (bilo ${Number(it.old_price).toFixed(2)})` : ""} · {it.plz === "00000" ? "svi gradovi" : it.plz}
                    {it.valid_to ? ` · do ${it.valid_to}` : ""}
                  </div>
                </div>
                <button onClick={() => del(it.id)} style={{ padding: "6px 12px", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 7, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Obriši</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
