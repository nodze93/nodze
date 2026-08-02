import { NextResponse } from "next/server";

// ============================================================
// AI CHAT — NAMJERNO UGAŠEN (2.8.2026)
//
// Ruta je bila JAVNO dostupna i svaki poziv je trošio Anthropic
// tokene (pravi novac), a nijedan dio sajta je ne koristi —
// nigdje u aplikaciji ne postoji ekran koji je zove. Rate limit
// je bio po instanci (na Vercelu se resetuje kad god se funkcija
// ugasi), pa nije bio stvarna zaštita budžeta.
//
// Ako ikad zatreba: puna verzija je u git istoriji ovog fajla.
// ============================================================

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { odgovor: "AI razgovor je isključen." },
    { status: 410 },
  );
}
