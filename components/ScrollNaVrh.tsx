"use client";

import { useEffect } from "react";

// Kad se stranica OSVJEŽI (F5 / pull-to-refresh) na TELEFONU — vrati na vrh,
// a ne ostavi tamo gdje je korisnik bio. Namjerno NE dira "nazad" navigaciju
// (tamo je dobro da vrati na mjesto gdje si stao).
export default function ScrollNaVrh() {
  useEffect(() => {
    try {
      const nav = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      const jeReload = nav?.type === "reload";
      const jeMobilni = window.matchMedia("(max-width: 768px)").matches;
      if (jeReload && jeMobilni) window.scrollTo(0, 0);
    } catch {
      /* stara pretraga bez Navigation Timing API — samo preskoči */
    }
  }, []);

  return null;
}
