"use client";

import { useEffect } from "react";

// Kad se stranica OSVJEŽI (F5 / pull-to-refresh) → vrati na VRH.
// Kod "nazad/naprijed" navigacije NE dira (tamo je dobro da vrati na mjesto
// gdje si stao). Glavni problem je bio što pregledač ima vlastito "vraćanje
// pozicije" (scroll restoration) koje se okine POSLIJE našeg skrola i vrati
// te dole — zato ga na reload privremeno isključimo pa forsiramo vrh.
export default function ScrollNaVrh() {
  useEffect(() => {
    let tip: string | undefined;
    try {
      const nav = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      tip = nav?.type;
    } catch {
      /* stari pregledač bez Navigation Timing API */
    }

    // Fallback za starije preglede (deprecated API, ali još radi na nekim mobilnim)
    let legacyReload = false;
    try {
      const legacy = (performance as unknown as { navigation?: { type?: number } })
        .navigation;
      legacyReload = legacy?.type === 1;
    } catch {
      /* ignoriši */
    }

    const jeReload = tip === "reload" || legacyReload;
    const jeNazad = tip === "back_forward";

    // Nazad/naprijed → pusti pregledaču da vrati poziciju (to je poželjno).
    if (jeNazad || !jeReload) return;

    // Reload → spriječi vraćanje stare pozicije i idi na VRH više puta,
    // da pobijedi i kasno vraćanje pregledača i sadržaj koji se dograđuje.
    try {
      history.scrollRestoration = "manual";
    } catch {
      /* ignoriši */
    }
    const gore = () => window.scrollTo(0, 0);
    gore();
    requestAnimationFrame(gore);
    setTimeout(gore, 80);
    setTimeout(gore, 300);

    // Vrati "auto" da NAZAD navigacija ubuduće opet pamti poziciju.
    setTimeout(() => {
      try {
        history.scrollRestoration = "auto";
      } catch {
        /* ignoriši */
      }
    }, 600);
  }, []);

  return null;
}
