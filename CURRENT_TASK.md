# TRENUTNI ZADATAK

## Datum: 2026-07-06

## ŠTA SMO RADILI (ovaj period)
Veliki set izmjena — sve upisano u folder (osim bot-cron.yml koji je zaštićen):
- Sigurnosni audit (rate limit, XSS, admin login, cron)
- Bot optimizacija (Haiku, caching, skip fact-check) → ~€13/mj
- DE/BiH odvojene kvote + 3x dnevno raspored
- "Pokreni odmah" preko GitHub Actions
- Moderacija na stranici (Article Manager: reorder, pin, uredi, zakaži, obriši, dodaj)
- SEO (sitemap, robots, verifikacioni tagovi)
- 4 nova vodiča za vize (Chancenkarte, Blue Card, Westbalkan, Spajanje porodice)
- /de i /bih preuređeni u stil Viza/Stan (thumbnail + izvor badge)
- Naslovna: Iz svijeta na vrhu (pokazuje izvor), Najnovije ispod
- Očišćen tekst koji odaje automatizaciju ("bot piše", "klikabilno", "prati izvore")

## STANJE
- Portal LIVE: kodnas.de
- Bot: radi preko GitHub Actions (piše draftove)
- Sve izmjene su u folderu, spremne za push na PREVIEW

## ⚠️ RUČNI KORACI KOJI ČEKAJU MENE
1. Kopirati `.github/workflows/bot-cron.yml` ručno (Claude ga pošalje) — za 3x/dnevno
2. Dodati `GITHUB_TOKEN` u Vercel env — za "Pokreni odmah" dugme
3. Pokrenuti `supabase/moderacija.sql` u Supabase (ako nije) — za moderaciju
4. Commit + push sve na preview → testirati → merge u main

## SLJEDEĆI KORACI / OPCIJE
1. Unsplash ključ → prave slike uz članke (sad su sive kutije)
2. Veliki hero na naslovnoj → dinamički (da pin-naslovna radi)
3. GSC + Bing verifikacija + submit sitemap → pa Indexing API
4. Više vodiča (Anerkennung, stalni boravak, državljanstvo)

## PROMPT ZA SLJEDEĆI CHAT
"Otvori PROJECT_MEMORY.md, PROGRESS.md, CURRENT_TASK.md. Šta smo radili? Šta je sljedeći korak?"

## STATUS
🟡 Sve izmjene spremne u folderu — čeka push na preview + 3 ručna koraka gore
