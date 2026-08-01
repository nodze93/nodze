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
- **IZVOR PODATAKA (velika promjena ove sesije): direktno sa stranica lanaca, NE KaufDA.**
  - KaufDA NAPUSTEN: ponude po PLZ-u drzi na `/shelf` koju njihov robots.txt IZRICITO zabranjuje (+ stari `/Umgebung/` sada 404). Ne skrejpamo (pravno). `scraper/src/sources/kaufda.ts` ostaje u kodu ali se NE koristi.
  - Novi izvor `scraper/src/sources/retailers.ts` (`SCRAPER_SOURCE=retailers`) cita akcije sa VLASTITIH stranica lanaca (tekst, robots dozvoljava). Selektori nadjeni gledanjem stranica u pravom Chrome-u.
  - TRI lanca rade: **Aldi Sud** `aldi-sued.de/de/angebote.html` (JUG: 85737,80331,80807,70173,60311) - **Aldi Nord** `aldi-nord.de/angebote.html` (SAMO Berlin 10115; cijene "1.49**" skidaju zvjezdice; naziv=marka+h2; tekuca sedmica, sljedeca se ucita tek na klik) - **Kaufland** `filiale.kaufland.de/angebote.html` (SVI PLZ, nacionalno; cijena "1.99" tacka->zarez).
  - GEOGRAFIJA: Aldi Sud i Nord ne postoje na istom mjestu -> svaki samo u svoje gradove (`plz` u RetailerDef); Kaufland svuda. Nacionalno = povuci jednom po lancu (kes) pa upisi u sve PLZ-ove tog lanca.
- robots.ts BUG popravljen: `isAllowed` je pravilo `/*/*/ajax/` skracivao na `/` i blokirao BAS SVE (zato je KaufDA prvo "sve zabranjeno"). Sad pravi regex + `robots.test.ts`.
- SLIKE: fotografija sa stranice lanca -> ako fali Open Food Facts (`images:enrich`) -> ako i to fali NASA ILUSTRACIJA (`ProductArt`). Kauflandov sivi "fallback" placeholder se prepoznaje kao "nema slike" (`ProductImage.isPlaceholder`; suzen regex da ne sakrije prave slike). CSS `.thumb img` max-height u px (slika se ne prelijeva preko naziva). Pokrivenost: Aldi Nord 265/266, Kaufland 17/49, Aldi Sud 4/23 (TODO: bolje hvatanje Aldi Sud/Kaufland slika, lijeno ucitavanje).
- Snapshot po (PLZ, datum): delete `source='scraper'` pa insert (rucni unosi bi prezivjeli).
- ZAKLJUCANI lanci (Lidl, Netto, Penny, REWE, Edeka, dm, OBI) = "fotoalbum"/JS/izbor marketa -> samo kroz crawler+vision (screenshot -> AI cita), ~5-15 EUR/mj + krhko + pravno sivo. ODLOZENO dok sajt ne dobije posjetioce.
- TRAJNI SLOJ (`akcije-trajni-sloj.sql`): `ak_product_images`/`ak_moderation`/`ak_scrape_runs`/`ak_apply_product_layer()`/`applyLayer.ts` alarm - postoji u bazi/kodu; puni ga ADMIN koji JOS NIJE napravljen; alarm (danas vs juce) radi.
- Gradovi: `scraper/data/plz.txt`. Detalji + sta namjerno ne radi: `scraper/README.md`.
### ⏳ ČEKA KORISNIKA (ručno)
1. **info@kodnas.de NE RADI još** → Namecheap → Manage kodnas.de → REDIRECT EMAIL → alias `info` → nodze93@gmail.com
   (DNS je na **Namecheapu**: nameserveri registrar-servers.com, nema MX zapisa)
2. Pokrenuti **SQL za app_instalacije** tabelu (gore) → da brojač instalacija radi
3. Provjeriti **Vercel → Usage** datum reseta ciklusa (CPU je bio ~81%)
4. (opciono) cookie-baner za GA pristanak
5. **AKCIJE — SQL** (`akcije.sql` + `akcije-trajni-sloj.sql`) POKRENUT; `DATABASE_URL` secret POSTAVLJEN; scraper radi, podaci u bazi (Aldi Sud/Nord/Kaufland). GOTOVO.
6. **AKCIJE — PROVJERITI dnevni scraper**: GitHub Actions -> ima li pokretanje svako jutro ~06:00? Ako ne -> cron se ne pali -> ponude "ne osvjezavaju se". (Glavni sumnjivac za "uvijek jucerasnje".)
7. **AKCIJE TODO**: (a) "vazi od/do" + prikaz po danu (korisnikova ideja, NIJE radjeno); (b) bolje hvatanje Aldi Sud/Kaufland slika; (c) ostali lanci = crawler+vision kad bude posjetilaca.
8. **AKCIJE — rucni admin ODBACEN** (korisnik ne zeli rucni unos; fajlovi ostali samo u Claude /tmp). Trajni-sloj admin (potvrdi sliku/sakrij) i dalje NIJE napravljen.

## RADNI DOGOVOR
- Claude UVIJEK radi na NAJSVJEŽIJOJ verziji fajla (povuče iz foldera prije izmjene), ne iz starog snimka.
- Korisnik radi Commit + Push čim se izmjena napravi (da se verzije ne razilaze).

## KADA POČNEŠ NOVI CHAT
1. Pročitaj PROJECT_MEMORY.md, PROGRESS.md, CURRENT_TASK.md
2. Reci: "Razumijem projekat. Šta radimo?"
3. NE mijenjaj kod dok ne dogovorimo plan.
