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
- Claude NE MOŽE sam push (cloud 403). MOŽE `tsc --noEmit` (tipska provjera) u sandboxu, ali NE MOŽE pokrenuti bazu/scraper lokalno (nema mrežu do Supabase/lanaca) — pravu provjeru radi UŽIVO kroz Chrome na deployanom sajtu (npr. `/api/akcije/discounts`).
- Build prolazi i uz tipske greške u TUĐIM fajlovima jer `next.config` ima `ignoreBuildErrors: true` + `eslint.ignoreDuringBuilds: true`. Claude gleda da su BAŠ NJEGOVI fajlovi čisti.
- ⚠️ GIT LOCK: Claude NE SMIJE pokretati `git` komande preko mosta (device_bash) — one kao "bridge" korisnik naprave `.git/index.lock` koji onda blokira korisnikov GitHub Desktop ("A lock file already exists"). Ako se desi: ukloni `.git/index.lock` (premjesti ga, jer most ne može `rm`) i NE pokreći git poslije toga. Za isporuku koristi samo device_commit_files (piše fajlove, ne dira git).
- Line-endings: 30+ fajlova zna pokazivati kao "modified" u GitHub Desktopu — to su SAMO CRLF/LF razlike (sadržaj isti kao GitHub), bezopasno, slobodno commit.

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
2026-08-01: duplikati · datumi važenja · JSON uvoz popravljen · Lidl · provjera slika

### SQL MIGRACIJE (redoslijed pokretanja u Supabaseu)
1. `akcije.sql` ✅  2. `akcije-trajni-sloj.sql` ✅
3. `akcije-datumi.sql` ✅ (filter po datumu)
4. **`akcije-uvoz.sql`** ✅ — NADOGRAĐUJE #3, uvijek pokreni OVAJ ako ideš iznova.
   Dodaje kolonu `source` i pravilo: scraper redovi po snapshotu, ručni po datumu važenja.

### DATUMI VAŽENJA — kako radi (2026-08-01)
- `scraper/src/datumi.ts` — parser njemačkih perioda iz naslova sekcija, sa testovima.
  „Gültig vom 30.07. bis 05.08." · „Angebote ab Donnerstag 30.7." · „Nur Sa. 1.8." …
- `retailers.ts` ide kroz dokument REDOM i lijepi zadnji viđeni naslov s datumom na artikle
  ispod. „Dauerhaft günstige Produkte" resetuje period (nisu sedmična akcija → bez roka).
- `krajSedmice` po lancu kad je dat samo početak: Aldi = subota (6), Kaufland = srijeda (3).
- Filter „važi danas" postoji NA DVA MJESTA: u bazi (akcije-uvoz.sql) i u API-ju
  (`app/api/akcije/discounts/route.ts`, po BERLINU jer Vercel radi u UTC-u).
- U logu GitHub Actions traži `[datumi]` i `[dupli]` — tako se vidi je li lanac promijenio izgled.

### JSON UVOZ (`/admin/akcije`) — pravila
- Prima goli niz, `{"offers":[...]}` ili jedan objekat (i dvostruko umotano, zbog starog buga).
- **Obavezno:** `productName`, `store`, `newPrice`, **`valid_to`** (bez roka se NE prikazuje).
- **`plz` MORA biti pravi PLZ.** Ako fali, upiše se `00000` („svi gradovi"), ali pretraga
  traži tačan PLZ → takva ponuda se NIKAD ne vidi. (Popraviti kad pređemo na regije.)
- Scraper više ne briše ručne redove (`delete ... and source='scraper'`).
- Slike agregatora (marktguru/kaufda/bonial) se namjerno odbacuju.

### SLIKE — svjesna odluka: HOTLINK, ne kopiranje
- Sve 4 prodavnice se povlače s TUĐIH CDN-ova; kod nas se ništa ne čuva.
- Pravno je hotlink SIGURNIJI od skidanja (nema umnožavanja po §16 UrhG); sudska praksa
  (Svensson/BestWater/Paperboy) drži da linkovanje na slobodno objavljen sadržaj ne traži dozvolu.
- Zato `images:download` NAMJERNO nije uključen u workflow. Ne uključivati bez odluke korisnika.
- `scraper/src/checkImages.ts` (`images:check`) čisti MRTVE linkove → red postaje „bez slike"
  → `images:enrich` (Open Food Facts) ga popuni. Ide PRIJE enrich koraka u workflow-u.
- ⚠️ Admin kolona „sa slikom %" broji samo da URL POSTOJI, ne da se otvara.

### LANCI U SCRAPERU (6) — svi kroz `SCRAPER_SOURCE=retailers`
| Lanac | Kako | Scope | Stara cijena |
|---|---|---|---|
| Aldi Süd / Aldi Nord | HTML (Playwright) | regionalno, 6 gradova | da |
| Kaufland | HTML (Playwright) | **DE** | da |
| **Lidl** | otvoreni Lidl Plus API | **DE** | da |
| **REWE** | HTML **BEZ JS-a** | **DE** | **ne** → sve „Angebot" |
| **OBI** | HTML **SA JS-om** + Nuxt payload | **DE** | da (često UVP) |

⚠️ REWE i OBI su suprotni slučajevi — lako se zamijene:
- **REWE bez JS-a**: sadržaj je već u HTML-u; kad se skripta izvrši, pregazi
  listu (traži izbor marketa) → prvi put je prošla samo 1 od 16 kategorija.
- **OBI sa JS-om**: server pošalje 316 KB sa NULA proizvoda (Baqend Speed Kit
  preko Service Workera), pa listing MORA kroz browser. Ali stranice proizvoda
  JESU server-rendered → rok važenja se vadi običnim `fetch`-om iz Nuxt payloada.

- `scraper/src/sources/svi.ts` = spaja sve; `index.ts` zove samo njega.
  `--source=samo-retailers` isključi Lidl i REWE (dijagnostika).
- Lidl: `stores.lidlplus.com/api/v4/DE` (3.269 filijala) → uzorak 2 po pokrajini,
  max 40 → `offers.lidlplus.com/app/api/v4/DE/{key}/offers`. Ponude nacionalne,
  spajaju se po `id` ponude.
  ⚠️ **`priceBox.smallPartNumeric` je STARA CIJENA, NE centi**, i vrijedi samo
  kad je `strikethrough=true`. Testovi: `scraper/src/sources/lidl.test.ts`.
- REWE: 16 kategorija pod `/angebote/nationale-angebote/`. Rok NIJE na pločici
  nego u tabu `button[data-week="current"]` („Diese Woche 27.7. bis 2.8.").
  Ne dirati zabranjene parametre: `search=`, `sorting=`, `objectsPerPage=`,
  `merchant=`, `merchantType=`.
- OBI: dvije liste (`/promo/produkte/sale` ~552 pločice, `/angebote` ~84),
  dedup po URL-u proizvoda. Bez stare cijene se red preskače.
  ⚠️ Cente OBI stavlja u `<sup>`, ISTO kao markere fusnota → brišu se samo
  `<sup>` koji NISU dvocifreni, inače 1.249 € postane 1,24 €.
  ⚠️ Nova cijena je `.disc-product-price__base` (prvi iznos je precrtana stara).
  ⚠️ Stara cijena je često **UVP** (preporuka proizvođača), ne ranija OBI cijena
  — popust nije isto što i „jeftinije nego prošle sedmice".
  Testovi: `scraper/src/sources/obi.test.ts`.
- Istraživanje zašto Netto/EDEKA/Penny/dm NE rade: `scraper/docs/*.md`
  (EDEKA `/api/offers` vraća 403 „haha! better luck next time").
- Osnova preuzeta iz korisnikovog `prospekt-bot` (Python) i prevedena u TS da
  radi kao ostali lanci — jedan workflow, jedan snapshot, isti logovi.

### USER-AGENT — svjesna odluka, ne mijenjati bez razloga
- Podrazumijevano: `kodnas-bot/1.0 (+kontakt: info@kodnas.de)` — Aldi ×2,
  Kaufland, Lidl i REWE rade s tim.
- SAMO OBI dobija browser UA (`config.browserUserAgent`), jer njihov Baqend
  Speed Kit ne renderuje sadržaj za nepoznate UA-ove → 0 artikala i alarm.
  I taj UA na kraju nosi `(+kodnas.de)`.
- **Zašto se uopšte predstavljamo:** skrivanje ne smanjuje rizik. Sajt ima
  Impressum s imenom i adresom, GitHub-ovi IP opsezi su javni, a slike se
  povlače s njihovih CDN-ova — ko pogleda, zna ko smo za deset sekundi.
  Pošten UA + poštovanje robots.txt + pauze = dobra vjera, što je i pravno
  na našoj strani i praktično jeftinije (mejl umjesto Abmahnunga).
- Ne uvoditi rotaciju IP-a ni potpuno anonimni UA.

### LIDL — šta se može a šta ne (provjereno 2026-08-01)
- **Namirnice: NE.** Prospekt je flipbook od 70 SLIKA — izvučen tekst daje samo navigaciju.
- **Online/non-food: DA.** ESMARA/SILVERCREST/PARKSIDE imaju naziv, staru cijenu, procent
  i „auch in der Filiale 27.07. - 01.08." kao TEKST. robots.txt dozvoljava
  (ali zabranjuje `*?offset=*`, `*sort=*`, `*id=*` → ne smije se listati kroz stranice).
- Za sada ide preko JSON uvoza. Lidl je NACIONALAN — iste cijene svugdje, pa se jedan
  set artikala preslika na sve naše PLZ-ove.

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
- `/api/akcije/*` keš **2 min** (`s-maxage=120`, `revalidate=120` u `lib/akcije-server.ts` + `app/api/akcije/*`). Bilo 30 min + 24h stale-while-revalidate → izmjene su visjele satima i razlikovao se telefon/kompjuter. Kratak keš = izmjene se vide skoro odmah, promet mali pa CPU ostaje nizak.

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
- SLIKE (POPRAVLJENO): fotografija sa stranice lanca → ako fali Open Food Facts (`images:enrich`) → ako i to fali ILUSTRACIJA (`ProductArt`). Kauflandov sivi "fallback" placeholder se prepoznaje kao "nema slike" (`ProductImage.isPlaceholder`).
  - **BUG bio: scraper je ABORTIRAO učitavanje slika (`route.abort` za `image`).** Kaufland/Aldi Süd na grešku učitavanja zamijene `<img src>` sivim placeholderom → hvatali smo prazno (0 slika). Aldi Nord to ne radi (zato je jedini radio). FIX u `retailers.ts`: NE abortiramo slike (samo font/media), + `waitForLoadState('networkidle')` + dijagnostički log `[slike]`. Poslije fixa: Aldi Süd 23/23, Kaufland 49/49, Aldi Nord 265/266 — praktično 100%.
- Snapshot (PLZ, datum): delete `source='scraper'` pa insert.
- ZAKLJUČANI lanci (Lidl, Netto, Penny, REWE, Edeka, dm, OBI) = "fotoalbum"/JS/izbor marketa → samo crawler+vision (screenshot → AI čita), ~5-15 €/mj + krhko + pravno sivo. ODLOŽENO dok nema posjetilaca.
- TRAJNI SLOJ (`akcije-trajni-sloj.sql`): `ak_product_images`/`ak_moderation`/`ak_scrape_runs`/`ak_apply_product_layer()`/`applyLayer.ts` alarm. Alarm (danas vs juče) radi. **ADMIN KONZOL NAPRAVLJEN** (vidi dolje).
- Gradovi (privremeno): `scraper/data/plz.txt`. **Plan: preći s PLZ-uzoraka na REGIJE — vidi `PLAN-REGIJE.md`.** Detalji: `scraper/README.md`.

### AKCIJE — ADMIN KONZOL (`/admin/akcije/*`) — NAPRAVLJENO
- Svijetli samostalni konzol (`app/admin/akcije/layout.tsx`) sa sidebar-om; opšti (tamni) admin okvir se zaobiđe za `/admin/akcije/*` (`app/admin/layout.tsx` early-return). Zaštićen postojećim middleware-om.
- **Pregled** (`/admin/akcije/pregled` + `api/admin/akcije/dashboard`): stat-kartice + Zdravlje scrapera (danas vs juče iz `ak_scrape_runs`) + Ručne radnje ("Primijeni sloj slika" = poziva `ak_apply_product_layer` RPC; scrape/enrich vode na GitHub Actions). PLZ izbornik.
- **Slike** (`/admin/akcije/slike` + `api/admin/akcije/slike`): tabovi (Nesigurno/Bez slike/Odbačeno/Potvrđene), Potvrdi/Odbaci (mijenja `ak_product_images.status`), "Okači svoju" = zalijepi URL slike (manual, bez file-storagea zasad), Pokrivenost slikama (po izvoru + licenca).
- **Scraper** (`/admin/akcije/scraper`): historija prolaza. **Prodavnice / PLZ pokrivenost / Kategorije** (`api/admin/akcije/liste?what=`): liste nad snapshotom. **Popusti** = postojeća `/admin/akcije` (unos + JSON uvoz).
- **Dozvole** = "uskoro" (traži hash lozinki). Pravi file-upload slika = "uskoro" (treba storage). Icecat/Pexels izvori = nisu povezani.
- **JSON IMPORTER** (`app/admin/akcije/page.tsx` + `api/admin/akcije/route.ts`): lijepljenje ili **upload `.json`**. Prima `productName/store/newPrice/oldPrice/category/imageUrl/validFrom/validTo/plz/offerId/offerUrl`. Za marktguru: **slike agregatora (marktguru/kaufda/bonial) se NAMJERNO preskaču** (`cleanImageUrl`) — za slike se oslanjamo SAMO na OFF (pravni razlog). `offerId→external_id`, `offerUrl→source_url`.
- marktguru: API traži POJAM PRETRAGE (nije bulk feed) + pravni rizik (§87b) → NIJE dobar besplatan izvor; koristi se samo ručni JSON uvoz ako korisnik želi.

### INSTALL PROMPT — sada na SVAKOJ stranici
- `components/InstallPrompt.tsx`: prije se palio SAMO na kalkulatoru (postMessage). Sada je u `app/layout.tsx` (root) i pali se na svakoj stranici ~2s nakon učitavanja (`maybeShow` + timer). Pamti "Kasnije" u `sessionStorage`. Uklonjen duplikat sa `app/brutto-netto/page.tsx`.

### ⏳ ČEKA KORISNIKA (ručno)
1. **info@kodnas.de NE RADI još** → Namecheap → Manage kodnas.de → REDIRECT EMAIL → alias `info` → nodze93@gmail.com
2. Pokrenuti **SQL za app_instalacije** tabelu (gore) → da brojač instalacija radi
3. Provjeriti **Vercel → Usage** datum reseta ciklusa (CPU je bio ~81%)
4. (opciono) cookie-baner za GA pristanak
5. **AKCIJE — SQL** (`akcije.sql` + `akcije-trajni-sloj.sql`) POKRENUT; `DATABASE_URL` secret POSTAVLJEN; scraper radi, podaci u bazi (Aldi Süd/Nord/Kaufland). GOTOVO.
6. **AKCIJE — dnevni scraper RADI** (potvrđeno): GitHub Actions "Akcije — dnevni scraper" se pali po cronu i prolazi uspješno. "Uvijek jučerašnje" je bio KEŠ (30 min + 24h stale), sada 2 min → riješeno.
7. **AKCIJE TODO**: (a) "važi od/do" + prikaz po danu — importer sada čita `validFrom/validTo`, ali PRIKAZ po danu u dizajnu NIJE rađen; (b) slike Aldi Süd/Kaufland POPRAVLJENE; (c) ostali lanci = crawler+vision ili marktguru JSON, kad bude posjetilaca; (d) pravi file-upload slika (treba storage); (e) Dozvole (hash lozinki); (f) Icecat/Pexels izvori slika.
8. **AKCIJE — admin konzol NAPRAVLJEN** (Pregled/Scraper/Slike/Prodavnice/PLZ/Kategorije/Popusti+JSON uvoz). Korisnik SADA želi JSON uvoz (predomislio se oko ručnog) — upload `.json` radi.
9. **AKCIJE — REGIJE**: dogovoren prelazak s 8.200 PLZ na model regija (nacionalno + Aldi jug/sjever + kasnije REWE/Edeka). Detaljan plan: **`PLAN-REGIJE.md`**. Sljedeći veći zadatak.

## RADNI DOGOVOR
- Claude UVIJEK radi na NAJSVJEŽIJOJ verziji fajla (povuče iz foldera prije izmjene), ne iz starog snimka.
- Korisnik radi Commit + Push čim se izmjena napravi (da se verzije ne razilaze).

## KADA POČNEŠ NOVI CHAT
1. Pročitaj PROJECT_MEMORY.md, PROGRESS.md, CURRENT_TASK.md
2. Reci: "Razumijem projekat. Šta radimo?"
3. NE mijenjaj kod dok ne dogovorimo plan.
