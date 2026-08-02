import { NextResponse } from "next/server";

// ============================================================
// UPLOAD SLIKA — NAMJERNO ISKLJUČEN (odluka korisnika, 2.8.2026)
//
// Politika sajta je da se slike NE ČUVAJU kod nas nego samo
// HOTLINKAJU (pravni razlog — čuvanje tuđe slike je umnožavanje
// po §16 UrhG, hotlink nije). Zato ova ruta ne smije primati
// fajlove.
//
// Ranije je ovdje stajala atrapa: vraćala je "uspjeh" i UVIJEK
// istu Unsplash sliku, pa se sve što admin okači tiho gubilo, a
// članak dobije pogrešnu sliku. Pošten odgovor je bolji od lažnog
// uspjeha.
//
// U editoru već postoji dugme za URL slike — to je predviđeni put.
// ============================================================

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Upload je isključen — slike se ne čuvaju na našem serveru (pravna odluka: samo hotlink). " +
        "Koristi opciju 'URL slike' i zalijepi link.",
    },
    { status: 501 },
  );
}
