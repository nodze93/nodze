# KODNAS.DE — PROJECT MEMORY

## KO SAM JA
- Nisam developer, objašnjavaj mi na bosanskom
- Budžet: MAX ~€15/mj Claude API
- Domena: kodnas.de

## CILJ
News portal za NAŠU dijasporu u NJEMAČKOJ (Austrija maknuta). Bot piše vijesti
automatski. Cilj: pusti da radi sam sa minimalnim mojim učešćem, ali ja moderiram.
- POZICIONIRANJE: "sve njemačke vijesti na našem jeziku, iz minute u minutu".
- LOGO (wordmark): "DNEVNI FILTER njemačkih vijesti" (verzal, varijanta D).
  Staro "Kod nas u…" / "dijaspora.ba" IZBAČENO svuda.

## STACK
- Next.js 15 (App Router, ^15.3.0), TypeScript, Tailwind
- Supabase (baza), Claude API (Haiku 4.5), Vercel Hobby, GitHub Actions (bot cron)

## MODELI
- MODEL_BRZI = claude-haiku-4-5
- MODEL_PISAC = claude-haiku-4-5 (bio Sonnet — promijenjeno radi ušteda)
- MODEL_GRAMATIKA = env prekidač (default Haiku; "claude-sonnet-4-5" za bolju
  gramatiku bez izmjene koda). Koristi ga završni gramatički prolaz (gramatika.ts).
- Realan trošak: ~4 EUR centa po članku (Haiku $1/$5 po M tokena, više poziva/članku).

## ⚙️ KAKO SE MIJENJA KOD (VAŽNO — novi način!)
- Claude piše fajlove DIREKTNO u moj folder preko mosta:
  C:\Users\dzena\Documents\GitHub\nodze
- Ja samo: GitHub Desktop → Commit → Push. NEMA više copy-paste.
- IZUZETAK: `.github/workflows/*.yml` su ZAŠTIĆENI od strane GitHub-a —
  most ih NE MOŽE pisati. Taj fajl (bot-cron.yml) Claude mi pošalje,
  a JA ga ručno kopiram u folder.
- Claude NE MOŽE sam push (cloud 403) i NE MOŽE lokalno build/test
  (nema npm registry) — zato izmjene testiram na Vercel PREVIEW-u.
  (Claude može provjeriti SINTAKSU preko TypeScripta, ali ne pravi build.)

## ⚠️ PRAVILA
1. Radi na PREVIEW branchu, pa merge u main tek kad potvrdim
2. Objasni mi jednostavno, korak po korak
3. Nikad ne otkrivaj javno da "bot piše" ili "prati izvore" (neozbiljno)
4. Desktop verzija se NE dira kad radimo mobilne izmjene (i obrnuto)

## SUPABASE
- Project ID (20 znakova): nfqhnhtktktlyqlwhcsj
- URL: https://nfqhnhtktktlyqlwhcsj.supabase.co
- Ključevi (novi format): sb_publishable_ (anon) / sb_secret_ (service role)
- SQL šeme: supabase/schema.sql (osnovni — VEĆ pokrenut, ne dirati)
             supabase/moderacija.sql (redoslijed, je_naslovna, zakazano_za)

## ENV VARIJABLE
### Vercel (Production + Preview):
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- ANTHROPIC_API_KEY, CRON_SECRET, ADMIN_SECRET, NEXT_PUBLIC_SITE_URL=https://kodnas.de
- GITHUB_TOKEN (za "Pokreni odmah" dugme — repo scope)
- (opciono) GOOGLE_SITE_VERIFICATION, BING_SITE_VERIFICATION, UNSPLASH_ACCESS_KEY
### GitHub Actions Secrets (za bota):
- ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, (UNSPLASH_ACCESS_KEY)

## BOT
- Pokreće se preko GitHub Actions (.github/workflows/bot-cron.yml)
- Raspored: 3x dnevno — 06:00 / 12:30 / 20:00 (Berlin). Cron UTC: "0 4", "30 10", "0 18"
  (Napomena: koristi se i cron-job.org koji češće okida — pazi na to zbog troška.)
- Kvote po pokretanju (env u workflowu): CLANCI_DE=1, CLANCI_BIH=1, CLANCI_SVIJET=1
  CLANCI_SPORT = 1 ujutro/navečer, 0 u podne (uslovno preko github.event.schedule)
- DE i BiH ODVOJENI (filter dijeli dijaspora izvore po jeziku: de vs bs)
- Skip fact-check za sport/svijet; dijaspora (DE+BiH) ide kroz fact-check
- CONTEXT agent je ISKLJUČEN (ušteda) — nije se koristio u adminu
- DEDUPE: sve vijesti koje prođu kroz filter se pamte (oznaciObradjeneBatch),
  pa bot NE troši Claude na ponovno ocjenjivanje istih vijesti svaki run
- Writer maxTokens=3800, Jezik(lektor) maxTokens=4500 (da se tekst ne siječe)
- Writer i lektor imaju stroga bosanska gramatička pravila + "obećanje mora biti razriješeno"
- ZAVRŠNI GRAMATIČKI PROLAZ (gramatika.ts) nakon lektora — samo gramatika;
  model = MODEL_GRAMATIKA (Haiku; env prekidač na Sonnet). GRAMATIKA_PROLAZ=off isključi.
- SLIKE: prvo Wikimedia (slike-wikimedia.ts), Unsplash samo rezerva.
- Piše DRAFTOVE — ja ih objavim u adminu ("Uredi članke" → 🚀)
- Raspored/kvote se podešavaju IZ ADMINA (bot_config: vremena + kvote_de/bih/svijet/sport),
  ne iz koda. Cilj obima ~20/dan. cron-job.org kuca /api/cron/tick svakih ~15 min.

## BOT 2.0 — "LIJEVAK" (pipeline2) — GLAVNI OD 2026-07-12
- Nova arhitektura: pročitaj mnogo, objavi malo. AI skupo radi ~8 članaka/dan.
- Tok: ~1500 RSS → dedupe link → PRAVILA (bez AI) → KLJUČNE RIJEČI+tier (bez AI, top 40)
  → AI TRIAŽA (JEDAN poziv, samo naslov+opis) → dedupe tema → za pobjednike writer
  čita cijeli tekst → fact-check/jezik → draft. Trošak: centi/dan.
- Fajlovi: lib/bot/izvori-prosireni.ts (izvori po sloju/tier), lib/bot/lijevak/pravila.ts,
  lib/bot/lijevak/kljucne.ts, lib/bot/agenti/triaza.ts, lib/bot/pipeline2.ts. Dok: BOT-LIJEVAK.md.
- PALJENJE: scripts/run-bot.ts sad PODRAZUMIJEVANO zove lijevak (nije potreban env).
  Povratak na stari bot: NOVI_PIPELINE=off. (pipeline.ts ima i NOVI_PIPELINE=on prekidač.)
- Env štimanje (opciono): PRAG_TRIAZA=68, BROJ_OBJAVA=8, TOP_ZA_TRIAZU=40, MAX_STAROST_SATI=36.
  Za "strože/više članaka" najlakše da Claude promijeni default u kodu (env treba YAML-prolaz).
- MEMORIJA: publisher.ts ucitajNedavneNaslove() → signal triaži (vec_poznato spusti
  duplikat; NOVI razvoj iste teme = nova vijest). NE ažurira stare članke (odluka).
- TVRĐA DEDUPE: dedupe.ts normLink() + istaTemaStrogo(); pipeline2 preskoči već objavljeno.
- ⚠️ STARI pipeline.ts/izvori.ts/filter.ts/publisher.ts JOŠ imaju BiH — lijevak je čist.

## SLIKE (IMPLEMENTIRANO — Wikimedia)
- lib/bot/slike-wikimedia.ts: izvuče IMENA iz naslova → Wikipedia (de/en) glavna
  slika (~1200px) → licenca s Commons; rezerva Commons full-text. null ako nema
  dobrog pogotka (apstraktne teme → zadrži staru/Unsplash sliku).
- Bot (pipeline.ts): Wikimedia PRVO, Unsplash REZERVA. Oznaka: autor + licenca.
- Admin dugme za STARE članke: /admin/slike (pregled → primijeni), API
  /api/admin/slike-wikimedia (preview/apply). Radi po naslovu → najbolje za
  poznata imena/mjesta; arhivska slika (nije današnji kadar) — to je ok.
- og:image iz izvora ODBAČEN — pravno rizično (Abmahnung). Pexels nije rađen.

## KLJUČNE DATOTEKE
- lib/bot/pipeline.ts — srce bota (dedupe batch, context off)
- lib/bot/izvori.ts — RSS izvori
- lib/bot/agenti/{claude,filter,writer,factcheck,jezik,gramatika}.ts
  (gramatika.ts = NOVO, završni gramatički prolaz)
- lib/bot/slike-wikimedia.ts — NOVO, Wikimedia/Wikipedia slike (glavno)
- lib/bot/publisher.ts — upis u Supabase + oznaciObradjeneBatch + oznaka slike
- lib/data.ts — javni data sloj (poštuje redoslijed/zakazivanje)
- lib/live.ts — DE/BiH/Svijet/Sport feed (naši objavljeni članci, sa slikama)
- lib/data/vodici.ts — vodiči (hard-kodirani, sada 31 vodič: viza 7, stan 8,
  zdravstvo 8, porodica 8, posao 3, +1 finansije/porez/penzija/gastarbajter)
- lib/bot/pipeline2.ts + lib/bot/lijevak/{pravila,kljucne}.ts + lib/bot/agenti/triaza.ts
  + lib/bot/izvori-prosireni.ts — NOVI LIJEVAK (glavni bot). BOT-LIJEVAK.md = dok.
- lib/useIsMobile.ts — hook za mobilnu detekciju (NOVO)
- components/MobilnaNaslovna.tsx — 4 jednake kutije na telefonu (NOVO)
- components/KategorijaMobilna.tsx — kategorije na telefonu kao naslovna (NOVO)
- app/admin/slike/page.tsx + app/api/admin/slike-wikimedia/route.ts — zamjena slika (NOVO)
- components/{HeroRotator,KategorijBar,LiveVijesti}.tsx — naslovna
- components/admin/AdminModeracija.tsx — admin traka + Article Manager (mobilno)
- app/admin/* — admin (layout s hamburgerom, clanci, pipeline...)
- app/clanak/[slug]/page.tsx — stranica članka (popravljen horizontalni scroll)
- app/page.tsx — naslovna (mobilno vs desktop preko hide-mob/samo-mob)
- .github/workflows/bot-cron.yml — raspored bota (ZAŠTIĆEN, ručno kopirati)

## MOBILNI OBRAZAC (kako radimo mobilne izmjene bez diranja desktopa)
- lib/useIsMobile.ts hook u client komponentama
- CSS klase u app/page.tsx: `.hide-mob` (sakrij na telefonu), `.samo-mob` (samo telefon)
- Sve mobilne izmjene su izolovane — desktop ostaje identičan

## MODERACIJA (kako radim)
- Uloguj se na /admin/login → na dnu svake stranice crna admin traka
- "Uredi članke" → reorder (▲▼/drag), ★ naslovna, 🚀 objavi, ✏️ uredi, ⏰ zakaži, 🗑️ obriši, + dodaj
- NA TELEFONU: kartice + veliko "🚀 Objavi" dugme + filter "Na čekanju" (brzo odobravanje)
- Filter po kategoriji automatski (gdje si, to uređuješ)
- Mockup primjeri (u kodu) se NE mogu moderirati; samo pravi članci (bot/ručno)

## KADA POČNEŠ NOVI CHAT
1. Pročitaj PROJECT_MEMORY.md, PROGRESS.md, CURRENT_TASK.md
2. Reci: "Razumijem projekat. Šta radimo?"
3. NE mijenjaj kod dok ne dogovorimo plan.
