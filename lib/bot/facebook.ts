// ============================================================
// FACEBOOK AUTO-OBJAVA — nativni foto-post sa linkom u tekstu
// ============================================================
// Objavljuje sliku + naslov + link na članak direktno u tekstu posta.
// (Ne koristi komentar — za to Facebook traži posebnu dozvolu
//  pages_manage_engagement koju nemamo; ovako radi sa pages_manage_posts.)
//
// Radi samo ako su postavljene env varijable:
//   FB_PAGE_ID     — ID tvoje Facebook stranice
//   FB_PAGE_TOKEN  — dugotrajni Page access token
// Ako fale, funkcija tiho ne radi ništa (ne ruši objavu članka).

const GRAF = "https://graph.facebook.com/v21.0";

export interface FbClanak {
  naslov: string;
  slug: string;
  slika?: string | null;
  excerpt?: string | null;
}

export interface FbRezultat {
  ok: boolean;
  postId?: string;
  greska?: string;
  preskoceno?: boolean;
}

/**
 * Objavi članak na Facebook stranicu (nativni foto-post sa linkom u tekstu).
 */
export async function objaviNaFacebook(clanak: FbClanak): Promise<FbRezultat> {
  const PAGE = process.env.FB_PAGE_ID;
  const TOKEN = process.env.FB_PAGE_TOKEN;
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://kodnas.de";

  if (!PAGE || !TOKEN) {
    return { ok: false, preskoceno: true, greska: "FB nije konfigurisan (FB_PAGE_ID / FB_PAGE_TOKEN)" };
  }

  const link = `${SITE}/clanak/${clanak.slug}`;
  const slika = clanak.slika || `${SITE}/og-default.jpg`;
  // Naslov + link direktno u tekstu posta (klikabilan).
  const tekst = `${clanak.naslov}\n\n📎 Cijeli članak 👉 ${link}`;

  try {
    // Nativni foto-post sa tekstom i linkom
    const r1 = await fetch(`${GRAF}/${PAGE}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: slika, caption: tekst, access_token: TOKEN }),
    });
    const d1 = (await r1.json()) as { id?: string; post_id?: string; error?: { message?: string } };
    if (!r1.ok || (!d1.post_id && !d1.id)) {
      return { ok: false, greska: d1.error?.message || "Greška pri objavi slike na FB" };
    }
    const postId = d1.post_id || d1.id!;

    return { ok: true, postId };
  } catch (e) {
    return { ok: false, greska: (e as Error).message };
  }
}
