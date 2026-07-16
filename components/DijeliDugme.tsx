"use client";

// ============================================================
// PODIJELI DUGME — otvara telefonski meni za dijeljenje
// ============================================================
// Na mobitelu koristi Web Share API (navigator.share) → iskoči
// nativni meni (WhatsApp, Poruke, Viber...). Na desktopu, gdje
// toga nema, kopira link u clipboard. Svako uspješno dijeljenje
// tiho javi serveru da poveća brojač (vidi /api/clanak/[slug]/dijeli).

import { useState } from "react";

export default function DijeliDugme({ slug, naslov }: { slug: string; naslov: string }) {
  const [kopirano, setKopirano] = useState(false);

  async function zabiljezi() {
    // Prebroj dijeljenje — tiho; ako zakaže, korisnik ništa ne primijeti.
    try {
      await fetch(`/api/clanak/${slug}/dijeli`, { method: "POST" });
    } catch {
      /* nebitno za korisnika */
    }
    // Ako je Google Analytics aktivan, zabilježi i tamo.
    try {
      (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.("event", "share", {
        method: "web_share",
        item_id: slug,
      });
    } catch {
      /* GA nije obavezan */
    }
  }

  async function podijeli() {
    const url = `${window.location.origin}/clanak/${slug}`;
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };

    if (typeof nav.share === "function") {
      try {
        await nav.share({ title: naslov, url });
        await zabiljezi(); // korisnik je stvarno podijelio
      } catch {
        /* korisnik otkazao meni — ne brojimo */
      }
    } else {
      // Desktop fallback — kopiraj link u clipboard.
      try {
        await navigator.clipboard.writeText(url);
        setKopirano(true);
        await zabiljezi();
        setTimeout(() => setKopirano(false), 2000);
      } catch {
        /* stari browser bez clipboard API-ja */
      }
    }
  }

  return (
    <button
      onClick={podijeli}
      aria-label="Podijeli članak"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 18px",
        borderRadius: 999,
        border: "1px solid var(--border)",
        background: "var(--white)",
        color: "var(--tekst)",
        fontSize: 14,
        fontWeight: 600,
        lineHeight: 1,
        cursor: "pointer",
      }}
      className="hover:bg-[#fafafa]"
    >
      {/* iOS-style share ikona (strelica iz kutije) */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3v13" />
        <path d="m7 8 5-5 5 5" />
        <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
      </svg>
      {kopirano ? "Link kopiran!" : "Podijeli"}
    </button>
  );
}
