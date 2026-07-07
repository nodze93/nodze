// ============================================================
// TRENDS — šta se trenutno traži u Njemačkoj (kontekst za filter)
// ============================================================
// Google Trends RSS zna biti nestabilan — zato imamo i fallback
// preko Google Autocomplete sugestija za dijaspora pojmove.
import { SEED_POJMOVI } from "./izvori";

export interface TrendsRezultat {
  svi: string[];
  relevantni: string[];
  seedPojmovi: string[];
}

export async function fetchTrends(): Promise<TrendsRezultat> {
  console.log("📈 Čitam trendove...");

  // 1. Pokušaj: Google Trends daily RSS (geo=DE)
  try {
    const res = await fetch(
      "https://trends.google.com/trends/trendingsearches/daily/rss?geo=DE",
      { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(8000) }
    );
    if (res.ok) {
      const xml = await res.text();
      const naslovi = [...xml.matchAll(/<title>(?:<!\[CDATA\[)?(.+?)(?:\]\]>)?<\/title>/g)]
        .map((m) => m[1])
        .filter((t) => t && t.length > 2 && !t.includes("Trends"))
        .slice(0, 20);
      if (naslovi.length > 0) {
        const relevantni = naslovi.filter((n) =>
          SEED_POJMOVI.some((p) => n.toLowerCase().includes(p.toLowerCase()))
        );
        console.log(`📈 Trends: ${naslovi.length} trending, ${relevantni.length} dijaspora-relevantnih`);
        return { svi: naslovi, relevantni, seedPojmovi: SEED_POJMOVI };
      }
    }
  } catch {
    /* nastavi na fallback */
  }

  // 2. Fallback: Google Autocomplete za seed pojmove (uvijek radi)
  // Rotiramo koje pojmove gledamo (po satu) da ne bude UVIJEK isti
  // ("Steuererklärung") — tako kontekst za filter varira kroz dan.
  try {
    const start = new Date().getHours() % SEED_POJMOVI.length;
    const rotirani = [...SEED_POJMOVI.slice(start), ...SEED_POJMOVI.slice(0, start)];
    const sugestije: string[] = [];
    for (const pojam of rotirani.slice(0, 4)) {
      const res = await fetch(
        `https://suggestqueries.google.com/complete/search?client=firefox&hl=de&q=${encodeURIComponent(pojam)}`,
        { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(5000) }
      );
      if (res.ok) {
        const data = (await res.json()) as [string, string[]];
        sugestije.push(...(data[1] || []).slice(0, 3));
      }
    }
    console.log(`📈 Trends (autocomplete fallback): ${sugestije.length} sugestija`);
    return { svi: sugestije, relevantni: sugestije, seedPojmovi: SEED_POJMOVI };
  } catch {
    console.warn("⚠️  Trendovi nedostupni — nastavljam bez njih.");
    return { svi: [], relevantni: [], seedPojmovi: SEED_POJMOVI };
  }
}
