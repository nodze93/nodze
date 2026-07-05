"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Ticker from "@/components/Ticker";
import { useState } from "react";

export default function KontaktPage() {
  const [forma, setForma] = useState({ ime: "", email: "", poruka: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const posalji = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(forma),
      });
      if (res.ok) setStatus("done");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <Nav />
      <Ticker />
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.5px" }}>Kontakt</h1>
        <p style={{ fontSize: 15, color: "var(--tekst-muted)", marginBottom: 32 }}>
          Imaš prijedlog, ispravku ili suradnju? Javi nam se.
        </p>

        {status === "done" ? (
          <div style={{ background: "var(--zelena-svijetla)", border: "1px solid var(--zelena)", borderRadius: 12, padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8, color: "var(--zelena-tamna)" }}>Poruka primljena!</h3>
            <p style={{ fontSize: 14, color: "var(--zelena-tamna)" }}>Javit ćemo se u roku od 48 sati.</p>
          </div>
        ) : (
          <form onSubmit={posalji} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Ime i prezime</label>
              <input
                required
                value={forma.ime}
                onChange={(e) => setForma({ ...forma, ime: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, outline: "none" }}
                className="focus:border-zelena"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email adresa</label>
              <input
                type="email"
                required
                value={forma.email}
                onChange={(e) => setForma({ ...forma, email: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, outline: "none" }}
                className="focus:border-zelena"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Poruka</label>
              <textarea
                required
                rows={5}
                value={forma.poruka}
                onChange={(e) => setForma({ ...forma, poruka: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, outline: "none", resize: "vertical" }}
                className="focus:border-zelena"
              />
            </div>
            {status === "error" && (
              <div style={{ color: "var(--crvena-tekst)", fontSize: 13, background: "var(--crvena-bg)", padding: "8px 12px", borderRadius: 6 }}>
                Greška pri slanju. Pokušaj ponovo ili nas kontaktiraj direktno.
              </div>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              style={{ padding: "12px 24px", background: "var(--zelena)", color: "white", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: status === "sending" ? 0.7 : 1 }}
            >
              {status === "sending" ? "Šaljem..." : "Pošalji poruku →"}
            </button>
          </form>
        )}
      </div>
      <Footer />
    </>
  );
}
