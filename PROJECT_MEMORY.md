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

## MODELI (lib/bot/agenti/claude.ts)
- MODEL_BRZI  = claude-haiku-4-5 (triaža, fact-check, context)
- MODEL_PISAC = claude-haiku-4-5 (pisanje članaka)
- MODEL_LEKTOR = **claude-sonnet-5** (SAMO lektor/gramatika — najjači za bosanski; ~8 poziva/dan)
  NAPOMENA: aktuelni Sonnet API naziv je "claude-sonnet-5" (stari "claude-sonnet-4-5" povučen).

## ⚙️ KAKO SE MIJENJA KOD (VAŽNO — novi način!)
- Claude piše fajlove DIREKTNO u moj folder preko mosta:
  C:\Users\dzena\Documents\GitHub\nodze
- Ja samo: GitHub Desktop → Commit → Push. NEMA više copy-paste.
- IZUZETAK: `.github/workflows/*.yml` su ZAŠTIĆENI od strane GitHub-a —
  most ih NE MOŽE pisati. Taj fajl (bot-cron.yml) Claude mi pošalje,
  a JA ga ručno kopiram u folder.
- Claude NE MOŽE sam push (cloud 403) i NE MOŽE lokalno build/test
  (nema npm registry) — zato izmjene testiram na Vercel PREVIEW-u.
- Claude sada VIZUELNO provjerava (renderuje screenshotove kroz Playwright/Chromium)
  prije isporuke, i normalizuje kraj-linija (CRLF) da diff bude čist na Windowsu.

## ⚠️ PRAVILA
1. Radi na PREVIEW branchu, pa merge u main tek kad potvrdim
2. Objasni mi jednostavno, korak po korak
3. Nikad ne otkrivaj javno da "bot piše" ili "prati izvore" (neozbiljno)

## SUPABASE
- Project ID (20 znakova): nfqhnhtktktlyqlwhcsj
- URL: https://nfqhnhtktktlyqlwhcsj.supabase.co
- Ključevi (novi format): sb_publishable_ (anon) / sb_secret_ (service role)
- SQL šeme: supabase/schema.sql (osnovni — VEĆ pokrenut, ne dirati)
             supabase/moderacija.sql (redoslijed, je_naslovna, zakazano_za)

## DOMENA / DNS / EMAIL
- Domena kodnas.de je na **Namecheapu** (nameserveri dns1/dns2.registrar-servers.com), A zapis → Vercel.
- Email **info@kodnas.de** još NE radi (nema MX). Postavlja se preko Namecheap "Redirect Email" (forwarding na gmail).

## ENV VARIJABLE
### Vercel (Production + Preview):
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- ANTHROPIC_API_KEY, CRON_SECRET, ADMIN_SECRET, NEXT_PUBLIC_SITE_URL=https://kodnas.de
- GITHUB_TOKEN (za "Pokreni odmah" dugme — repo scope)
- (opciono) GOOGLE_SITE_VERIFICATION, BING_SITE_VERIFICATION, UNSPLASH_ACCESS_KEY
### GitHub Actions Secrets (za bota):
- ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, (UNSPLASH_ACCESS_KEY)
### GitHub Actions Secrets (za AKCIJE scraper):
- DATABASE_URL (Supabase → Settings → Database → Connection string → Session pooler)

## BOT
- Pokreće se preko GitHub Actions (.github/workflows/bot-cron.yml)
- Raspored: 3x dnevno — 06:00 / 12:30 / 20:00 (Berlin). Cron UTC: "0 4", "30 10", "0 18"
- Kvote po pokretanju (env u workflowu): CLANCI_DE=1, CLANCI_BIH=1, CLANCI_SVIJET=1
  CLANCI_SPORT = 1 ujutro/navečer, 0 u podne (uslovno preko github.event.schedule)
- DE i BiH ODVOJENI (filter dijeli dijaspora izvore po jeziku: de vs bs)
- Skip fact-check za sport/svijet; dijaspora (DE+BiH) ide kroz fact-check
- Piše DRAFTOVE — ja ih objavim u adminu ("Uredi članke" → 🚀)

## KLJUČNE DATOTEKE
- lib/bot/pipeline.ts — srce bota
- lib/bot/izvori.ts — RSS izvori
- lib/bot/agenti/{claude,filter,writer,factcheck,jezik}.ts
- lib/data.ts — javni data sloj (poštuje redoslijed/zakazivanje)
- lib/live.ts — DE/BiH/Svijet feed (dijeli po izvoru)
- lib/data/vodici.ts — vodiči (hard-kodirani)
- components/admin/AdminModeracija.tsx — admin traka + Article Manager
- app/api/admin/* — admin API (auth, clanci, pipeline, me, redoslijed, naslovna...)
- .github/workflows/bot-cron.yml — raspored bota (ZAŠTIĆEN, ručno kopirati)
- components/BottomNav.tsx — donja app-traka (mobilni)
- components/InstallPrompt.tsx — install baner (Android dugme / iOS uputstvo) + brojač
- app/brutto-netto/page.tsx + public/kalkulator-app/* — kalkulator (iframe)
- components/VodiciKlijent.tsx, VodicShare.tsx, lib/data/vodic-kategorije.ts, public/vodic-ilustracije/* — vodiči app-dizajn
- app/impressum/page.tsx, app/datenschutz/page.tsx — pravne stranice
- app/api/track-install/route.ts — brojač PWA instalacija
- lib/revalidate.ts (osvjeziSajt) — poništavanje keša na objavu

## MODERACIJA (kako radim)
- Uloguj se na /admin/login → na dnu svake stranice crna admin traka
- "Uredi članke" → reorder (▲▼/drag), ★ naslovna, 🚀 objavi, ✏️ uredi, ⏰ zakaži, 🗑️ obriši, + dodaj
- Filter po kategoriji automatski (gdje si, to uređuješ)
- Mockup primjeri (u kodu) se NE mogu moderirati; samo pravi članci (bot/ručno)

## AKTUELNO — sve URAĐENO i push-ovano na main
Ranije sesije: pwa · vodici · calc · datenshutzetc · appinstall · isoinstall · akcije (temelj)

### Google
- Google Analytics: NEXT_PUBLIC_GA_ID postavljen u Vercelu (radi).
- Search Console: verifikovan preko fajla `public/google4c6a50a83f529ec1.html` (NE BRISATI!).
  Sitemap poslat (sitemap.xml). "Couldn't fetch" na početku je normalno.

### PWA (aplikacija)
- `public/manifest.json`, `public/sw.js` (bez keširanja), ikonice `public/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`
- `components/BottomNav.tsx` = donja traka (mobilni): Vijesti (/) · **Akcije** (/akcije) · Vodiči (/vodici) · Brutto-Netto (/brutto-netto)
- `layout.tsx`: manifest + theme-color #1a8a4a + appleWebApp + <BottomNav/> + registracija SW
- Instalacija: Android/desktop Chrome/Edge = 1 klik; iPhone = ručno (Safari: Podijeli → Dodaj na početni ekran)

### Brutto-Netto kalkulator
- Korisnikovi statični fajlovi: `public/kalkulator-app/{index.html, admin.html, params.json, favicon.svg}`
- Ruta `app/brutto-netto/page.tsx` = iframe (allow="web-share") + <InstallPrompt/>
- Admin kalkulatora: link u admin meniju ISPOD "Facebook" (`app/admin/layout.tsx`) → /kalkulator-app/admin.html (lozinka netto2026)
- `vercel.json`: X-Frame-Options DENY → **SAMEORIGIN** (bez toga iframe kalkulatora je prazan!)
- ⚠️ Dizajn kalkulatora NE dirati bez izričite potrebe (korisnikov je).

### Vodiči — app dizajn
- `lib/data/vodic-kategorije.ts`, `components/VodiciKlijent.tsx`, `components/VodicShare.tsx`, `public/vodic-ilustracije/*.svg`
- `/vodici` i `/vodic/[slug]` u app-stilu; lista SPAJA bazu + hard-kodirane (svih 38); detalj fallback na kod

### Impressum + Datenschutz (obavezno u Njemačkoj)
- `app/impressum/page.tsx`, `app/datenschutz/page.tsx` (njemački, DSGVO), linkovi u Footer
- Podaci: **Dzena Karg, Korbinianstraße 1, 80807 München, info@kodnas.de**
- ⚠️ Cookie-baner prije GA (pristanak) — NIJE još urađeno (preporučeno).

### Install baner + brojač (`components/InstallPrompt.tsx`)
- Pojavi se kad korisnik vidi REZULTAT kalkulatora (iframe šalje postMessage "kodnas-calc-result")
- Android/desktop: dugme "Instaliraj aplikaciju"; iPhone: uputstvo; već instalirano: ništa
- Brojač u adminu: `/api/track-install` + kartica "📲 App instalacije"
- ⚠️ TREBA Supabase tabela: `app_instalacije (id uuid pk default gen_random_uuid(), created_at timestamptz default now(), platforma text)`

### Vercel CPU (Hobby: Fluid Active CPU 4h/mj = JEDINI limit koji PAUZIRA sajt na 100%)
- Bot piše na GitHub Actions → NE troši Vercel CPU. Vercel CPU troši POSLUŽIVANJE stranica.
- `app/clanak/[slug]` zaostali `force-dynamic` UKLONJEN → ISR (keš). `app/vodic/[slug]` i `app/vodici` → revalidate=600.
- `osvjeziSajt()` (lib/revalidate.ts) se zove na objavu → svježina očuvana.
- `/api/akcije/*` keš 30 min → akcije NE troše CPU.

### AKCIJE (/akcije) — popusti iz njemačkih PRODAVNICA (direktno, NE KaufDA)
- Četvrta kartica u donjoj nav traci: Vijesti · **Akcije** · Vodiči · Brutto-Netto
- Stranice: `/akcije`, `/akcije/ponude`, `/akcije/favoriti`, `/akcije/ponuda/[id]`, `/akcije/prodavnica/[slug]`
- API: `/api/akcije/*` → Supabase RPC (`ak_discounts_search`, `ak_meta`, …), keš 30 min → ne troši Vercel CPU
- CSS prefiks `.ak` (`app/akcije/akcije.css`); tabele `ak_` (`supabase/akcije.sql`), RLS bez policy → čita samo service_role
- `discount_percent`/`savings` = GENERATED (bez stare cijene NULL → "Angebot" ispada iz filtera po procentu)
- **IZVOR PODATAKA (velika promjena): direktno sa stranica lanaca, NE KaufDA.**
  - KaufDA NAPUŠTEN: ponude po PLZ-u drži na `/shelf` koju robots.txt IZRIČITO zabranjuje (+ stari `/Umgebung/` sada 404). Ne skrejpamo (pravno). `scraper/src/sources/kaufda.ts` ostaje u kodu, NE koristi se.
  - Novi izvor `scraper/src/sources/retailers.ts` (`SCRAPER_SOURCE=retailers`) — čita akcije sa VLASTITIH stranica lanaca (tekst, robots dozvoljava). Selektori nađeni gledanjem stranica u pravom Chrome-u.
  - TRI lanca: **Aldi Süd** `aldi-sued.de/de/angebote.html` (JUG: 85737,80331,80807,70173,60311) · **Aldi Nord** `aldi-nord.de/angebote.html` (SAMO Berlin 10115; cijene "1.49**" skidaju zvjezdice; naziv=marka+h2; tekuća sedmica, sljedeća se učita tek na klik) · **Kaufland** `filiale.kaufland.de/angebote.html` (SVI PLZ; cijena "1.99" tačka→zarez)
  - GEOGRAFIJA: Aldi Süd i Nord ne postoje na istom mjestu → svaki samo u svoje gradove (`plz` u RetailerDef); Kaufland svuda. Nacionalno = povuci jednom po lancu (keš) pa upiši u sve PLZ-ove lanca.
- robots.ts BUG popravljen: `isAllowed` je `/*/*/ajax/` skraćivao na `/` i blokirao BAŠ SVE → pravi regex + `robots.test.ts`.
- SLIKE: fotografija sa stranice lanca → ako fali Open Food Facts (`images:enrich`) → ako i to fali ILUSTRACIJA (`ProductArt`). Kauflandov sivi "fallback" placeholder se prepoznaje kao "nema slike" (`ProductImage.isPlaceholder`). Pokrivenost: Aldi Nord 265/266, Kaufland 17/49, Aldi Süd 4/23 (TODO: bolje hvatanje Aldi Süd/Kaufland slika, lijeno učitavanje).
- Snapshot (PLZ, datum): delete `source='scraper'` pa insert.
- ZAKLJUČANI lanci (Lidl, Netto, Penny, REWE, Edeka, dm, OBI) = "fotoalbum"/JS/izbor marketa → samo crawler+vision (screenshot → AI čita), ~5-15 €/mj + krhko + pravno sivo. ODLOŽENO dok nema posjetilaca.
- TRAJNI SLOJ (`akcije-trajni-sloj.sql`): `ak_product_images`/`ak_moderation`/`ak_scrape_runs`/`ak_apply_product_layer()`/`applyLayer.ts` alarm — postoji, puni ga ADMIN koji NIJE napravljen; alarm (danas vs juče) radi.
- Gradovi: `scraper/data/plz.txt`. Detalji + šta namjerno ne radi: `scraper/README.md`.

### ⏳ ČEKA KORISNIKA (ručno)
1. **info@kodnas.de NE RADI još** → Namecheap → Manage kodnas.de → REDIRECT EMAIL → alias `info` → nodze93@gmail.com
2. Pokrenuti **SQL za app_instalacije** tabelu (gore) → da brojač instalacija radi
3. Provjeriti **Vercel → Usage** datum reseta ciklusa (CPU je bio ~81%)
4. (opciono) cookie-baner za GA pristanak
5. **AKCIJE — SQL** (`akcije.sql` + `akcije-trajni-sloj.sql`) POKRENUT; `DATABASE_URL` secret POSTAVLJEN; scraper radi, podaci u bazi (Aldi Süd/Nord/Kaufland). GOTOVO.
6. **AKCIJE — PROVJERITI dnevni scraper**: GitHub Actions → ima li pokretanje svako jutro ~06:00? Ako ne → cron se ne pali → ponude "ne osvježavaju se". (Glavni sumnjivac za "uvijek jučerašnje".)
7. **AKCIJE TODO**: (a) "važi od/do" + prikaz po danu (korisnikova ideja, NIJE rađeno); (b) bolje hvatanje Aldi Süd/Kaufland slika; (c) ostali lanci = crawler+vision kad bude posjetilaca.
8. **AKCIJE — ručni admin ODBAČEN** (korisnik ne želi ručni unos; fajlovi ostali samo u Claude /tmp). Trajni-sloj admin (potvrdi sliku/sakrij) i dalje NIJE napravljen.

## RADNI DOGOVOR
- Claude UVIJEK radi na NAJSVJEŽIJOJ verziji fajla (povuče iz foldera prije izmjene), ne iz starog snimka.
- Korisnik radi Commit + Push čim se izmjena napravi (da se verzije ne razilaze).

## KADA POČNEŠ NOVI CHAT
1. Pročitaj PROJECT_MEMORY.md, PROGRESS.md, CURRENT_TASK.md
2. Reci: "Razumijem projekat. Šta radimo?"
3. NE mijenjaj kod dok ne dogovorimo plan.
