// ============================================================
// RATE LIMIT — jednostavan in-memory limiter po ključu (IP)
// ============================================================
// NAPOMENA: na Vercel serverless-u memorija NIJE dijeljena između
// instanci i resetuje se na hladni start. Ovo je PRVI sloj zaštite
// protiv brzih navala s iste instance — ne apsolutna granica.
// Za tvrdu globalnu granicu treba vanjski store (npr. Upstash Redis).

type Bucket = { count: number; reset: number };
const store = new Map<string, Bucket>();

/**
 * Vrati {ok:false} ako je ključ prešao `limit` zahtjeva u `windowMs`.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfter: number } {
  const now = Date.now();

  // Povremeno očisti istekle unose da Map ne raste bez granice.
  if (store.size > 5000) {
    for (const [k, v] of store) {
      if (now > v.reset) store.delete(k);
    }
  }

  const b = store.get(key);
  if (!b || now > b.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((b.reset - now) / 1000)) };
  }
  b.count++;
  return { ok: true, retryAfter: 0 };
}

/** Klijentov IP iz proxy headera (Vercel postavlja x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") || "";
  const prvi = xff.split(",")[0].trim();
  return prvi || req.headers.get("x-real-ip") || "unknown";
}
