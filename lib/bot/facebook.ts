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
  // Udarni tekst = naslov (već je klikabilan). Link NE ide u tekst nego u komentar.
  const tekst = `${clanak.naslov}\n\n👇 Cijeli članak u prvom komentaru.`;

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
