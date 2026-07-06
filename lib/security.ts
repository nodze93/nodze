// ============================================================
// SIGURNOSNI HELPERI — rade i u Node i u Edge (middleware) runtime-u
// ============================================================
// Koristi SAMO Web API-je (TextEncoder, globalThis.crypto.subtle),
// nema Node-only importa — da može i u Edge middleware-u.

/**
 * Konstantno-vremensko poređenje stringova (otporno na timing napade).
 * Ne otkriva gdje se stringovi razlikuju kroz vrijeme izvršavanja.
 */
export function safeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  // Uključi i razliku dužina, ali prođi kroz max dužinu da vrijeme ne curi.
  let diff = ab.length ^ bb.length;
  const len = Math.max(ab.length, bb.length);
  for (let i = 0; i < len; i++) {
    diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return diff === 0;
}

/**
 * Izvedeni session token iz ADMIN_SECRET (SHA-256 hex).
 * U cookie ide OVO, ne sirova tajna — pa čak i da cookie procuri,
 * ne otkriva admin lozinku. Isti izračun radi login ruta i middleware.
 */
export async function derivedToken(secret: string): Promise<string> {
  const data = new TextEncoder().encode(`dijaspora-admin::v1::${secret}`);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Osnovna, ali stroža validacija email adrese. */
export function validEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  const e = email.trim();
  if (e.length < 3 || e.length > 254) return false;
  // jedan @, tekst prije i poslije, tačka u domenu
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
