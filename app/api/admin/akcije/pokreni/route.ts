// ============================================================
// POST /api/admin/akcije/pokreni
// ------------------------------------------------------------
// Ručno pali GitHub Actions posao "Akcije — dnevni scraper".
// Koristi se poslije JSON uvoza: taj posao usput pusti i
// Open Food Facts dopunu slika, pa uvezeni artikli dobiju
// fotografije bez čekanja noćnog prolaza.
//
// Zašto GitHub Actions, a ne ovdje: Vercel funkcija se gasi
// nakon ~60 s, a OFF upit traje ~6,5 s po artiklu.
// ============================================================

import { NextResponse } from "next/server";
import { dispatchWorkflow } from "@/lib/github-dispatch";

export async function POST() {
  const rezultat = await dispatchWorkflow("akcije-scraper.yml");

  if (!rezultat.ok) {
    return NextResponse.json(
      { error: rezultat.error ?? "Pokretanje nije uspjelo" },
      { status: rezultat.status ?? 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    poruka:
      "Pokrenuto na GitHub Actions (traje ~2 min): skine ponude, primijeni trajni sloj i dopuni slike. " +
      "Osvježi stranicu za koju minutu — na sajtu se vidi nakon isteka keša (2 min).",
  });
}
