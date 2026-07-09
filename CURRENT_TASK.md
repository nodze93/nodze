# TRENUTNI ZADATAK

## Datum: 2026-07-09

## ŠTA SMO RADILI (ova sesija)
Veliki set izmjena — sve upisano u folder (osim bot-cron.yml koji je zaštićen):

1. BOT — jeftinije + tačnije + bolja gramatika
   - Dedupe popravka (pamti sve filtrirane vijesti) → ~85-90% manje Claude poziva
   - Context agent isključen (1 poziv manje po članku)
   - Writer 3800 / lektor 4500 tokena (da se tekst ne siječe)
   - Bosanska gramatička pravila + "obećanje se mora razriješiti"
   - Bolje čitanje izvora (li/h2/h3 + rezerva)
   - Fajlovi: pipeline.ts, publisher.ts, writer.ts, jezik.ts, claude.ts

2. ADMIN ZA TELEFON (desktop netaknut)
   - NOVO lib/useIsMobile.ts
   - Hamburger sidebar (layout.tsx), kartice + veliko "Objavi" + filter "Na čekanju"
     (AdminModeracija.tsx, clanci/page.tsx), responsive dashboard (page.tsx)

3. NASLOVNA ZA TELEFON (desktop netaknut)
   - NOVO components/MobilnaNaslovna.tsx — 4 jednake kutije do ivica, sa slikama
   - lib/live.ts (slika + sport feed), page.tsx (hide-mob/samo-mob, kategorije iznad slike,
     Ticker sakriven), HeroRotator.tsx (samo naslov+datum), KategorijBar.tsx (swipe)

4. STRANICA ČLANKA — popravljen horizontalni scroll (app/clanak/[slug]/page.tsx)

5. VODIČI — 12 → 17, svi provjereni (fact-check 2026), 11 ispravki + hackovi (lib/data/vodici.ts)

## STANJE
- Portal LIVE: kodnas.de
- Bot: radi preko GitHub Actions (piše draftove) — sada jeftiniji i tačniji
- SVE izmjene ove sesije su u folderu, spremne za push na PREVIEW
- Desktop verzija NIJE dirana (sve mobilne izmjene su izolovane)

## ⚠️ RUČNI KORACI KOJI ČEKAJU MENE
1. GitHub Desktop → Commit → Push na PREVIEW → testirati NA TELEFONU → merge u main
2. (Ako nije ranije) bot-cron.yml ručno kopirati; GITHUB_TOKEN u Vercel; moderacija.sql u Supabase

## SLJEDEĆI KORACI / OPCIJE
1. SLIKE: implementirati Wikimedia (glavno) + Pexels (rezerva), penzionisati Unsplash
   (og:image iz izvora ODBAČEN — pravno rizično)
2. Nova serija vodiča: Bürgergeld, Wohngeld, penzija BiH–Njemačka, otvaranje firme, Minijob
3. Uskladiti stari vodič "trudnoća" ako još negdje spominje Kindergeld za dijete u BiH
4. GSC + Bing verifikacija + submit sitemap → pa Indexing API

## PROMPT ZA SLJEDEĆI CHAT
"Otvori PROJECT_MEMORY.md, PROGRESS.md, CURRENT_TASK.md. Šta smo radili? Šta je sljedeći korak?"

## STATUS
🟡 Sve izmjene spremne u folderu — čeka push na preview + test na telefonu
