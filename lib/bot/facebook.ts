// ============================================================
// FACEBOOK AUTO-OBJAVA — nativni foto-post + link u prvom komentaru
// ============================================================
// Taktika koja daje BOLJI doseg: objavi sliku + udarnu rečenicu direktno
// na FB stranicu, a link stavi u prvi KOMENTAR (FB manje koči takve postove
// nego gole linkove).
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
  // ── SOCIAL MEDIA POLJA (opcionalna — nazad-kompatibilno) ──
  fb_tekst_news?: string | null;    // generirani vijesti post
  fb_tekst_engage?: string | null;  // generirani engagement post
  thumbnail_url?: string | null;    // pre-generisani thumbnail URL (/api/og/thumbnail?...)
  tip?: "news" | "engage" | "original"; // tip posta koji admin odabrao
}

export interface FbRezultat {
  ok: boolean;
  postId?: string;
  greska?: string;
  preskoceno?: boolean;
  komentarOk?: boolean;      // je li link uspješno objavljen u prvom komentaru
  komentarGreska?: string;   // ako komentar nije prošao — zašto
}

/**
 * Objavi članak na Facebook stranicu (foto-post + link u komentaru).
 *
 * Redoslijed odabira teksta posta:
 *  - tip='news'    → fb_tekst_news (AI generirani vijesti post)
 *  - tip='engage'  → fb_tekst_engage (AI generirani engagement post)
 *  - tip='original'→ fallback na naslov (bez thumbnailа, originalna slika)
 *  - nije zadano   → fallback na naslov (nazad-kompatibilno)
 *
 * Redoslijed odabira slike:
 *  - tip != 'original' i thumbnail_url postoji → branded thumbnail
 *  - inače → originalna slika clanka (slika) ili og-default.jpg
 */
export async function objaviNaFacebook(clanak: FbClanak): Promise<FbRezultat> {
  const PAGE = process.env.FB_PAGE_ID;
  const TOKEN = process.env.FB_PAGE_TOKEN;
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://kodnas.de";

  if (!PAGE || !TOKEN) {
    return { ok: false, preskoceno: true, greska: "FB nije konfigurisan (FB_PAGE_ID / FB_PAGE_TOKEN)" };
  }

  const link = `${SITE}/clanak/${clanak.slug}`;

  // Odaberi tekst posta
  let tekst: string;
  if (clanak.tip === "news" && clanak.fb_tekst_news) {
    tekst = clanak.fb_tekst_news;
  } else if (clanak.tip === "engage" && clanak.fb_tekst_engage) {
    tekst = clanak.fb_tekst_engage;
  } else {
    // Fallback — originalni način (nazad-kompatibilno)
    tekst = `${clanak.naslov}\n\n👇 Cijeli članak u prvom komentaru.`;
  }

  // Odaberi sliku: branded thumbnail ili originalna slika
  const koristiThumbnail = clanak.tip !== "original" && clanak.thumbnail_url;
  const slika = koristiThumbnail
    ? clanak.thumbnail_url!
    : (clanak.slika || `${SITE}/og-default.jpg`);

  try {
    // 1) Nativni foto-post sa tekstom
    const r1 = await fetch(`${GRAF}/${PAGE}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: slika, caption: tekst, access_token: TOKEN }),
    });
    const d1 = (await r1.json()) as { id?: string; post_id?: string; error?: { message?: string } };
    if (!r1.ok || (!d1.post_id && !d1.id)) {
      return { ok: false, greska: d1.error?.message || "Greška pri objavi slike na FB" };
    }
    // Za komentar treba post_id (feed post), ne id (fotografija).
    const postId = d1.post_id || d1.id!;

    // 2) Link kao PRVI komentar. Post ostaje i ako komentar padne, ali sada
    //    provjeravamo odgovor i javljamo je li link stvarno objavljen (da se
    //    u adminu vidi zašto linka nema — npr. fali dozvola/token istekao).
    let komentarOk = false;
    let komentarGreska: string | undefined;
    try {
      const r2 = await fetch(`${GRAF}/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `📎 Cijeli članak: ${link}`, access_token: TOKEN }),
      });
      const d2 = (await r2.json()) as { id?: string; error?: { message?: string } };
      if (r2.ok && d2.id) {
        komentarOk = true;
      } else {
        komentarGreska = d2.error?.message || "Komentar s linkom nije objavljen.";
      }
    } catch (e) {
      komentarGreska = (e as Error).message;
    }

    return { ok: true, postId, komentarOk, komentarGreska };
  } catch (e) {
    return { ok: false, greska: (e as Error).message };
  }
}
