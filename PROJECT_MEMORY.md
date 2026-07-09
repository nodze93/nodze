# KODNAS.DE — PROJECT MEMORY

## KO SAM JA
- Nisam developer, objašnjavaj mi na bosanskom
- Budžet: MAX ~€15/mj Claude API
- Domena: kodnas.de

## CILJ
News portal za Bosance u Njemačkoj i Austriji. Bot piše vijesti automatski.
Cilj: pusti da radi sam sa minimalnim mojim učešćem, ali ja moderiram.

## STACK
- Next.js 15 (App Router, ^15.3.0), TypeScript, Tailwind
- Supabase (baza), Claude API (Haiku 4.5), Vercel Hobby, GitHub Actions (bot cron)

## MODELI
- MODEL_BRZI = claude-haiku-4-5
- MODEL_PISAC = claude-haiku-4-5 (bio Sonnet — promijenjeno radi ušteda)

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
- Piše DRAFTOVE — ja ih objavim u adminu ("Uredi članke" → 🚀)

## SLIKE (PLAN — još nije implementirano)
- Sad: Unsplash (generičke stock slike, nisu vezane za vijest) — planiramo penzionisati
- DOGOVORENI plan: Wikimedia Commons (prave fotke poznatih osoba/mjesta, pravno čisto)
  kao GLAVNO, Pexels kao REZERVA (bolji stock od Unsplasha)
- og:image iz izvora ODBAČEN — pravno rizično (autorska prava, njemački Abmahnung)

## KLJUČNE DATOTEKE
- lib/bot/pipeline.ts — srce bota (dedupe batch, context off)
- lib/bot/izvori.ts — RSS izvori
- lib/bot/agenti/{claude,filter,writer,factcheck,jezik}.ts
- lib/bot/publisher.ts — upis u Supabase + oznaciObradjeneBatch
- lib/data.ts — javni data sloj (poštuje redoslijed/zakazivanje)
- lib/live.ts — DE/BiH/Svijet/Sport feed (naši objavljeni članci, sa slikama)
- lib/data/vodici.ts — vodiči (hard-kodirani, sada 17 vodiča, provjereni)
- lib/useIsMobile.ts — hook za mobilnu detekciju (NOVO)
- components/MobilnaNaslovna.tsx — 4 jednake kutije na telefonu (NOVO)
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
