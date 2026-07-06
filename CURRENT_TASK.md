# TRENUTNI ZADATAK

## Datum: 2026-07-06

## ŠTA RADIM SADA
Mijenjam LIVE widget na naslovnoj (Vijesti iz Njemačke / Vijesti iz BiH) da
pokazuje NAŠE objavljene članke umjesto sirovih vanjskih RSS naslova.
Badge treba zadržati originalni izvor (npr. N1 BiH, Spiegel) iz kojeg je
članak nastao — to je polje `izvor` u bazi. Klik vodi na /clanak/[slug].

## KONTEKST
- Portal LIVE: DA — kodnas.de
- Bot radi: DA — kompletno (piše, sprema, admin objavi, izlazi na sajt)
- Bot se pokreće preko GitHub Actions 2x dnevno (Node 22, npx tsx scripts/run-bot.ts)
- Supabase URL tačan: https://nfqhnhtktktlyqlwhcsj.supabase.co
- Vercel ključevi popravljeni (sb_secret_ / sb_publishable_)
- Trenutni branch: main

## FAJLOVI ZA OVAJ ZADATAK
- components/LiveVijesti.tsx — prikazuje widget (sada čita iz lib/live RSS)
- lib/live.ts — trenutno povlači vanjski RSS; treba zamijeniti čitanjem naših članaka
- lib/data.ts — ima funkcije: dajNajnovije, dajSvijet, dajPoKategoriji, dajNajcitanije
  (naši članci imaju polje `izvor` = originalni portal, i `slug` za link)

## SLJEDEĆI KORACI
1. Prepraviti LiveVijesti da čita naše objavljene članke (preko lib/data)
2. Lijeva kolona = dijaspora/Njemačka članci, desna = BiH/svijet
3. Badge = c.izvor (N1, Spiegel...), link = /clanak/c.slug
4. Fallback ako nema dovoljno članaka (dok bot ne napuni bazu)
5. Poslati fajlove korisniku → kopira → push → provjeriti na kodnas.de

## PROMPT KOJI KORISTIM (za sljedeći chat)
"Otvori PROJECT_MEMORY.md, PROGRESS.md, CURRENT_TASK.md. Šta smo radili? Šta je sljedeći korak?"

## STATUS
🟡 U toku — prebacujem LIVE widget na naše članke sa badge-om izvora
