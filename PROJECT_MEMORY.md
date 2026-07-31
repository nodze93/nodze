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

## AKTUELNO (2026-07-27, treća sesija) — sve URAĐENO i push-ovano na main
Commitovi ove sesije: pwa · vodici · calc · datenshutzetc · appinstall · isoinstall

### Google
- Google Analytics: NEXT_PUBLIC_GA_ID postavljen u Vercelu (radi).
- Search Console: verifikovan preko fajla `public/google4c6a50a83f529ec1.html` (NE BRISATI!).
  Sitemap poslat (sitemap.xml). "Couldn't fetch" na početku je normalno.

### PWA (aplikacija)
- `public/manifest.json`, `public/sw.js` (bez keširanja), ikonice `public/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`
- `components/BottomNav.tsx` = donja traka (mobilni): Vijesti (/) · Vodiči (/vodici) · Brutto-Netto (/brutto-netto)
- `layout.tsx`: manifest + theme-color #1a8a4a + appleWebApp + <BottomNav/> + registracija SW
- Instalacija: Android/desktop Chrome/Edge = 1 klik; iPhone = ručno (Safari: Podijeli → Dodaj na početni ekran)

### Brutto-Netto kalkulator
- Korisnikovi statični fajlovi: `public/kalkulator-app/{index.html, admin.html, params.json, favicon.svg}`
- Ruta `app/brutto-netto/page.tsx` = iframe (allow="web-share") + <InstallPrompt/>
- Admin kalkulatora: link u admin meniju ISPOD "Facebook" (`app/admin/layout.tsx`) → /kalkulator-app/admin.html (lozinka netto2026)
- Izmjene u index.html: boja PLAVA→ZELENA (#1a8a4a), bosanski default (setLanguage("bs")),
  PDF dugme → "Podijeli" (navigator.share, link /brutto-netto), stepper "Podaci/Rezultat" + "Unesite podatke"
- `vercel.json`: X-Frame-Options DENY → **SAMEORIGIN** (bez toga iframe kalkulatora je prazan!)
- ⚠️ Dizajn kalkulatora NE dirati bez izričite potrebe (korisnikov je).

### Vodiči — app dizajn
- `lib/data/vodic-kategorije.ts` (prikazne kategorije + boje), `components/VodiciKlijent.tsx` (lista+čipovi),
  `components/VodicShare.tsx`, `public/vodic-ilustracije/*.svg` (6 flat ilustracija po kategoriji)
- `/vodici` i `/vodic/[slug]` presloženi u app-stil (hero, poglavlja iz koraka, share)
- Lista SPAJA bazu + hard-kodirane (svih 38); detalj ima fallback na kod → svaki vodič se otvara

### Impressum + Datenschutz (obavezno u Njemačkoj)
- `app/impressum/page.tsx`, `app/datenschutz/page.tsx` (njemački, DSGVO), linkovi u Footer
- Podaci: **Dzena Karg, Korbinianstraße 1, 80807 München, info@kodnas.de**
- ⚠️ Cookie-baner prije GA (pristanak) — NIJE još urađeno (preporučeno).

### Install baner + brojač (`components/InstallPrompt.tsx`)
- Pojavi se kad korisnik vidi REZULTAT kalkulatora (iframe šalje postMessage "kodnas-calc-result" u showPage(2))
- Android/desktop: dugme "Instaliraj aplikaciju"; iPhone: uputstvo (Podijeli → Dodaj na ekran); već instalirano: ništa
- Brojač u adminu: `/api/track-install` (POST na `appinstalled`) + kartica "📲 App instalacije" u dashboardu
- ⚠️ TREBA Supabase tabela (pokrenuti SQL):
  `create table if not exists app_instalacije (id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), platforma text);`

### Vercel CPU (Hobby: Fluid Active CPU 4h/mj = JEDINI limit koji PAUZIRA sajt na 100%)
- Bot piše članke na **GitHub Actions** → NE troši Vercel CPU. Vercel CPU troši POSLUŽIVANJE stranica.
- `app/clanak/[slug]` je imao zaostali `force-dynamic` koji je poništavao `revalidate=300` → UKLONJEN → ISR (keš). Najveća ušteda.
- `app/vodic/[slug]` i `app/vodici` → `revalidate=600`; + `osvjeziSajt()` dodan u vodici admin rute (instant na izmjenu).
- `broj_pregleda` se NIGDJE ne uvećava u kodu (vidi ga samo admin) → keširanje ga ne kvari.
- `osvjeziSajt()` (lib/revalidate.ts) se zove na svaku objavu članka → svježina očuvana.
- Ostali limiti (Speed Insights, Web Analytics, ISR, transfer): kad se napune samo STANU da broje, NE ruše sajt.

### AKCIJE (/akcije) — popusti iz njemačkih letaka
- Četvrta kartica u donjoj nav traci: Vijesti · **Akcije** · Vodiči · Brutto-Netto
- Stranice: `/akcije`, `/akcije/ponude`, `/akcije/favoriti`, `/akcije/ponuda/[id]`, `/akcije/prodavnica/[slug]`
- API: `/api/akcije/*` → Supabase RPC funkcije (`ak_discounts_search`, `ak_meta`, …), keš 30 min na CDN-u → **ne troši Vercel CPU**
- CSS je cijeli prefiksiran sa `.ak` (`app/akcije/akcije.css`) da se `.card`/`.grid`/`.btn` ne sudare sa kodnas stilovima
- Tabele u Supabase počinju sa `ak_` (`supabase/akcije.sql`). RLS je uključen BEZ policy-ja → čita samo service_role
- `discount_percent` i `savings` su GENERATED kolone: bez stare cijene su NULL, pa "Angebot" artikli sami ispadaju iz filtera po procentu
- Podaci: `scraper/` (svoj package.json, NE ide na Vercel) → GitHub Actions `akcije-scraper.yml`, svaki dan 04:00 UTC
- Snapshot po (PLZ, datum): obriši pa upiši, u transakciji → ponovno pokretanje ne pravi duplikate; sajt čita najnoviji datum, pa ako scraper padne vide se jučerašnje akcije
- Gradovi: `scraper/data/plz.txt` (85737 mora ostati — podrazumijevani PLZ na sajtu)
- Detalji i šta NAMJERNO ne radi (`prices:apply`, `images:download`): `scraper/README.md`
- **TRAJNI SLOJ** (`supabase/akcije-trajni-sloj.sql`): odluke se vežu za `product_key` (računa ga scraper u TS-u i UPISUJE), ne za dnevnu ponudu, pa ne nestaju sutradan
  - `ak_product_images` (potvrđene/ručne slike) + `ak_moderation` (skriveni artikli; `hidden` je povratan) → puni ih ADMIN (još NIJE napravljen)
  - `ak_apply_product_layer()` prelije te odluke na najnoviji snapshot; RPC-i osvježeni sa `and not d.hidden` da skriveni ne izlaze javno
  - `ak_scrape_runs` (jedan red po PLZ+prodavnica+dan) → `scraper/src/applyLayer.ts` (`npm run layer:apply`) računa „danas vs juče" i na pad/prazno ISPIŠE alarm + izlazni kod 3 → GitHub Actions korak pukne → mejl vlasniku
  - Cron redoslijed: scrape → **layer:apply** (alarm) → images. Korak „Trajni sloj + alarm" dodan u `akcije-scraper.yml`
  - Provjereno na pravoj Postgres 16 bazi: 43/43 testa, product_key 475/475, prelijevanje po EAN/ključu radi, skrivanje se poštuje u RPC-ima, alarm okida kod 3

### ⏳ ČEKA KORISNIKA (ručno)
1. **info@kodnas.de NE RADI još** → Namecheap → Manage kodnas.de → REDIRECT EMAIL → alias `info` → nodze93@gmail.com
   (DNS je na **Namecheapu**: nameserveri registrar-servers.com, nema MX zapisa)
2. Pokrenuti **SQL za app_instalacije** tabelu (gore) → da brojač instalacija radi
3. Provjeriti **Vercel → Usage** datum reseta ciklusa (CPU je bio ~81%)
4. (opciono) cookie-baner za GA pristanak
5. **AKCIJE — pokrenuti `supabase/akcije.sql`** u Supabase SQL Editoru (pravi `ak_` tabele i funkcije)
5b. **AKCIJE — pokrenuti `supabase/akcije-trajni-sloj.sql`** ODMAH POSLIJE `akcije.sql` (trajni sloj + tabela zdravlja + alarm)
6. **AKCIJE — GitHub secret `DATABASE_URL`**: Supabase → Settings → Database → Connection string → *Session pooler*
   → GitHub → Settings → Secrets and variables → Actions → New repository secret
7. **AKCIJE — prvo pokretanje**: Actions → "Akcije — dnevni scraper" → Run workflow → `dry_run = true`
   (baza se ne dira; u artifactu `akcije-dry-run` se vidi je li KaufDA promijenio stranicu). Ako je uredu — pusti isto bez `dry_run`.
8. **AKCIJE — admin panel još NIJE napravljen** (prijava, „potvrdi sliku"/„sakrij", pregled zdravlja). Temelj (tabele + funkcije) je spreman; sam admin je zaseban posao kad se odluči.

## RADNI DOGOVOR
- Claude UVIJEK radi na NAJSVJEŽIJOJ verziji fajla (povuče iz foldera prije izmjene), ne iz starog snimka.
- Korisnik radi Commit + Push čim se izmjena napravi (da se verzije ne razilaze).

## KADA POČNEŠ NOVI CHAT
1. Pročitaj PROJECT_MEMORY.md, PROGRESS.md, CURRENT_TASK.md
2. Reci: "Razumijem projekat. Šta radimo?"
3. NE mijenjaj kod dok ne dogovorimo plan.
