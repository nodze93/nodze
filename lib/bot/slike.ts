// ============================================================
// SLIKE — Unsplash API (samo URL, slike se NE čuvaju u Supabase)
// ============================================================
// Besplatni Unsplash API ključ: https://unsplash.com/developers
// (Demo tier: 50 zahtjeva/sat — više nego dovoljno za 6 članaka/dan)
//
// Ako UNSPLASH_ACCESS_KEY nije postavljen ili pretraga ne uspije,
// članak ide bez slike — ništa se ne ruši.

export interface UnsplashSlika {
  url: string;        // regular size (~1080px) — samo URL string
  autor: string;      // ime fotografa (Unsplash traži attribuciju)
  autorLink: string;
}

export async function nadjiSliku(pojmovi: string, seed = 0): Promise<UnsplashSlika | null> {
  const kljuc = process.env.UNSPLASH_ACCESS_KEY;
  if (!kljuc || !pojmovi) return null;

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(pojmovi)}&per_page=8&orientation=landscape&content_filter=high`;
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${kljuc}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.warn(`⚠️  Unsplash HTTP ${res.status}`);
      return null;
    }
    const data = (await res.json()) as {
      results?: { urls?: { regular?: string }; user?: { name?: string; links?: { html?: string } } }[];
    };
    // seed bira različitu fotku (da članci iste kategorije ne budu identični)
    const validne = (data.results || []).filter((f) => f.urls?.regular);
    if (validne.length === 0) return null;
    const foto = validne[((seed % validne.length) + validne.length) % validne.length];

    console.log(`   🖼  Slika nađena za "${pojmovi}"`);
    return {
      url: foto.urls!.regular!,
      autor: foto.user?.name || "Unsplash",
      autorLink: foto.user?.links?.html || "https://unsplash.com",
    };
  } catch (err) {
    console.warn(`⚠️  Unsplash greška: ${(err as Error).message}`);
    return null;
  }
}
