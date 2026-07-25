"use client";

import { useState } from "react";

// Dugme "Podijeli vodič" — Web Share API (mobilni), fallback: kopiraj link.
export default function VodicShare({ naziv, slug }: { naziv: string; slug: string }) {
  const [poruka, setPoruka] = useState("");

  async function podijeli() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/vodic/${slug}`
        : `https://kodnas.de/vodic/${slug}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: naziv, url });
      } catch {
        /* korisnik odustao */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setPoruka("Link kopiran!");
        setTimeout(() => setPoruka(""), 2000);
      } catch {
        /* ignoriši */
      }
    }
  }

  return (
    <button onClick={podijeli} className="vodic-share-btn">
      <span>🔗</span> {poruka || "Podijeli vodič"}
      <style>{`
        .vodic-share-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 13px 16px; border-radius: 12px; border: 1.5px solid #E5E7EB;
          background: #fff; color: #374151; font-size: 15px; font-weight: 700; cursor: pointer;
        }
        .vodic-share-btn:active { background: #f3f4f6; }
      `}</style>
    </button>
  );
}
