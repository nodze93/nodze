"use client";

import { useState } from "react";

export default function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Supabase insert
    setSubmitted(true);
  };

  return (
    <div
      style={{
        background: "var(--zelena)",
        color: "white",
        borderRadius: 8,
        padding: 20,
      }}
    >
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
        Tjedni digest
      </h3>
      <p
        style={{
          fontSize: 12,
          opacity: 0.85,
          marginBottom: 14,
          lineHeight: 1.5,
        }}
      >
        Najvažnije vijesti za dijasporu svake nedjelje ujutro.
      </p>

      {submitted ? (
        <div
          style={{
            background: "rgba(255,255,255,0.2)",
            borderRadius: 6,
            padding: "10px 12px",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          ✓ Hvala! Dobićeš potvrdu na email.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="tvoj@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: 6,
              border: "none",
              fontSize: 13,
              marginBottom: 8,
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 9,
              background: "rgba(255,255,255,0.2)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            className="hover:bg-white/30"
          >
            Pretplati se →
          </button>
        </form>
      )}
    </div>
  );
}
