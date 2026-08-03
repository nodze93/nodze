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
2026-08-02: veliki pregled bugova (lista: kodnas-bugovi.md kod korisnika) + popravke:
- **datumi.ts**: čita i datum BEZ završne tačke („27.7 bis 2.8" — REWE tab) i više NE
  guta dvocifren broj iza datuma kao godinu („30.7. 20% Rabatt" ≠ godina 2020).
  Dvocifrena godina namjerno izbačena (nigdje se ne piše).
- **REWE = 0 nedjeljom je NORMALNO**: REWE u nedjelju isprazni „current" tab, novi
  redovi (next week) imaju validFrom sutra → sajt nedjeljom nema REWE, u ponedjeljak
  ujutro se sam vrati. NE dirati — nije kvar.
- **obi.ts**: kategorija je fiksno 'Baumarkt' (ranije pogađanje iz naziva slalo
  Gasgrill pod „Fleisch", pa je OBI imao „Fleisch 13", „Obst 2"…).
- **db.ts `bezDuplihRedova()`**: dedup na upisu (store+naziv+cijena+rok) — rješava
  „traka kaže 131, stranica 118". REWE-ove 2 sedmice istog artikla ostaju (rok u ključu).
- **checkImages.ts**: 429/403/5xx/mreža = „preskoči" (provjeri sutra), briše se SAMO
  404/410 i HTML-na-200; octet-stream je živa slika; pauza 300ms između grupa.
- **images.ts (OFF)**: prolazna greška se NE kešira kao {url:null} — ranije je jedan
  429 artikal ZAUVIJEK ostavljao bez slike (keš preživi kroz Actions cache).
- **JSON uvoz**: `valid_to` OBAVEZAN (bez njega se red nikad ne prikaže — sad se
  preskoči uz objašnjenje); dedup unutar uvoza; isti `externalId` = osvježi (delete
  pa insert), ne dupliraj.
- **/api/admin/upload**: NAMJERNO ISKLJUČEN (501) — odluka korisnika: slike se NE
  čuvaju kod nas, samo hotlink. Editor ima dugme „URL slike". NE „popravljati" u
  pravi upload bez izričite odluke korisnika.
- **/api/ai-chat**: UGAŠEN (410) — javno trošio Anthropic tokene, niko ga ne koristi.
- **/api/hero**: s-maxage=120 (bio no-store — najveći nepotrebni CPU trošak).
- **/api/og/thumbnail**: s-maxage=1god (isti parametri = ista slika) + `slika` param
  ograničen na unsplash/supabase/kodnas.de hostove.
- **Kategorije OSTAJU NJEMAČKE** (izričita odluka korisnika — NE prevoditi). Samo
  kozmetika prikaza: `lib/akcije/kategorije.ts` → „Getraenke"→„Getränke" itd.
  (baza/URL ostaju ASCII).
- Novi testovi: rewe.test.ts, db.test.ts, checkImages.test.ts + dopune datumi.test.ts
  (87/87 prolazi). ⚠️ `npm test` glob hvata samo dio — puni prolaz:
  `npx tsx --test src/*.test.ts src/sources/*.test.ts`.
- NIJE dirano (svjesno): smrzavanje /akcije (korisniku radi; test na telefonu kad
  stigne), SQL brojači (dedup na upisu ih čini tačnim od sutra).

2026-08-02 (drugi krug) — REGIJE FAZA 2 + OBI politika + otpornost + UX:
- **⚠️ SQL: `akcije-regije-2.sql` MORA SE POKRENUTI u Supabaseu** (poslije
  akcije-regije.sql; bezopasno više puta). Donosi: `ak_plz_region` (Aldi-ekvator
  po PLZ RASPONIMA, ~26 redova) + `ak_aldi_scope(plz)` + sve 4 funkcije uče
  regiju → **SVAKI PLZ u Njemačkoj dobija svoj Aldi**. Granica izvedena iz
  filialen.aldi-sued.de po gradovima (NRW/Hessen šavovi ručno; uz samu granicu
  moguća sitna greška — ispravka = UPDATE u ak_plz_region).
- **OBI SAMO NA KLIK** (odluka korisnika): u istoj migraciji — OBI ispada iz
  opštih lista/kategorija (`p_store is not null or s.slug <> 'obi'`), ostaje u
  ak_stores_list (pločica s brojem) i kad je izričito izabran. Razlog: UVP
  „−77%" gušio Top ponude.
- **OBI VLASTITE GRUPE** (`kategorijaObi` u obi.ts): Garten, Grill, Camping,
  Werkzeug & Maschinen, Haushaltsgeräte, Elektro & Licht, Möbel & Wohnen,
  Bad & Sanitär, Farben & Bauen, ostalo Baumarkt. (Frižider → Haushaltsgeräte,
  NE „Gemuese".) Redoslijed pravila bitan (LED-Sonnensegel → Garten).
- **Scraper regije**: retailers.ts — Aldi Süd/Nord se povlače JEDNOM pod
  '00000' sa scope 'aldi-sued'/'aldi-nord' (kao Kaufland); JUG/SJEVER liste
  uklonjene; **plz.txt = samo 00000**. ⚠️ REDOSLIJED KOD KORISNIKA: prvo SQL,
  pa push — bota ne pokretati između (inače Aldi nestane dok SQL ne prođe).
- **Otpornost**: retailers waitForSelector BEZ .catch (timeout → retry, ne
  keširana prazna lista); open() zatvara page na grešku (curenje memorije);
  OBI baca grešku ako listing padne; REWE baca ako padne ≥4/16 kategorija.
- **UX**: filteri žive u URL-u (nazad ih čuva; replace, ne push); „Prikaži još"
  umjesto reza na 300; polje za pretragu (q) na listama; sheet dugmad sticky;
  admin traka na telefonu IZNAD donje trake; body padding 58→62px; padeži
  (mnozina() u format.ts: artikal/artikla/artikala, akcija/akcije); „uštedi"
  pravopis; PLZ bez bljeska 85737 (ready-gate, nema uzaludnog prvog zahtjeva);
  brzi odabir PLZ: München/Berlin/Hamburg/Köln/Stuttgart; top=1 naslov se vraća
  na „Sve akcije" čim korisnik skine ≥30% filter.
- REWE NEDJELJOM: potvrđeno korisniku i drugi put — prazan REWE nedjeljom je
  ritam izvora, vraća se ponedjeljkom ~6:30. Ne „popravljati".
- Mobilni VIZUELNI pas (iframe 390px kroz Chrome) URAĐEN poslije deploya.
  Potvrđeno uživo: regije rade (Köln = Aldi Süd 60), OBI van opštih lista,
  umlauti („Gemüse/Getränke/Tiefkühl"), sticky dugmad sheeta, padeži
  („82 artikla"), pretraga, 2 kolone bez overflow-a. Nađeno i popravljeno:
  wordmark „Kauflan" (grid → block + manji font za duga imena), meta red
  kartice sjekao datum (ime prodavnice van mreže — pločica dovoljna),
  Lidl chip „Store" (smeće iz njihovog API-ja → baca se, pogađa naziv).
  ALDI NORD NEDJELJOM = 0 (kao REWE): sljedeća sedmica im se učita tek na
  klik, pa nedjeljom nema pločica → alarm „na nuli" nedjeljom uveče za
  Aldi Nord/REWE je OČEKIVAN, ne kvar. Detalj-linkovi umiru na re-scrape
  (novi id-jevi) — empty-state to lijepo objasni; poznato, ne dirati.

2026-08-02 (treći krug — želje korisnika):
- **„NOVO" oznaka**: OfferCard pokazuje zelenu NOVO pločicu kad je
  valid_from = DANAS (lokalni datum, danasIso() u format.ts — namjerno ne
  UTC); na naslovnoj „Top ponude danas" nove-danas idu NA POČETAK trake
  (novoPrvo() u app/akcije/page.tsx). Pali se samo na dane kad sedmica
  počinje (pon: Lidl/REWE/Aldi, čet: Kaufland) — to je ispravno.
- **Brutto-Netto na jedan ekran**: components/BnFrame.tsx mjeri stvarnu
  veličinu kalkulatora (isti origin) i SKALIRA iframe da sve stane — bez
  odsijecanja desne strane i bez skrolanja. Korisnikov dizajn u
  public/kalkulator-app/ NIJE diran (i dalje se ne dira).
- **Pločice u bojama lanaca** (odluka korisnika): StoreLogo sada uvijek
  boji pločicu bojama iz lib/akcije/stores.ts (Lidl žuto-plavo, Kaufland
  crveno…), ali ime ostaje NAŠIM fontom — ne crta se njihov logotip.
  BrandLogo SVG-ovi i dalje isključeni iza env prekidača. Korisniku
  rečeno uz „nisam pravnik" ogradu.

### SQL MIGRACIJE (redoslijed pokretanja u Supabaseu)
1. `akcije.sql` ✅  2. `akcije-trajni-sloj.sql` ✅
3. `akcije-datumi.sql` ✅ (filter po datumu)
4. **`akcije-uvoz.sql`** ✅ — NADOGRAĐUJE #3, uvijek pokreni OVAJ ako ideš iznova.
   Dodaje kolonu `source` i pravilo: scraper redovi po snapshotu, ručni po datumu važenja.
5. `akcije-regije.sql` ✅ + **`akcije-regije-2.sql`** ✅ — scope/regije + **OBI samo na klik**.
6. **`akcije-fressnapf.sql`** ⬜ — Fressnapf se ponaša ISTO KAO OBI (samo na klik).
   Mijenja `ak_discounts_search` i `ak_categories_list`: `s.slug <> 'obi'`
   → `s.slug not in ('obi','fressnapf')`. Ostatak je 1:1 iz `akcije-regije-2.sql`
   (Postgres ne zna zakrpiti tijelo funkcije — mora cijela iznova).

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

### LANCI U SCRAPERU (8) — svi kroz `SCRAPER_SOURCE=retailers`
| Lanac | Kako | Scope | Stara cijena |
|---|---|---|---|
| Aldi Süd / Aldi Nord | HTML (Playwright) | regionalno, 6 gradova | da |
| Kaufland | HTML (Playwright) | **DE** | da |
| **Lidl** | otvoreni Lidl Plus API | **DE** | da |
| **REWE** | HTML **BEZ JS-a** | **DE** | **ne** → sve „Angebot" |
| **OBI** | HTML **SA JS-om** + Nuxt payload | **DE** | da (često UVP) |
| **Fressnapf** | server HTML, BEZ browsera | **DE** | da (**IZVEDENA**) |
| **Trinkgut** | server HTML, BEZ browsera | **DE** | **ne** → sve „Angebot" |

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
- Fressnapf: sale kategorije → linkovi na artikle → 1 zahtjev po artiklu.
  ⚠️ `priceValidUntil` je SENTINEL: `9999-12-31` znači „nije na akciji" → preskoči.
  ⚠️ Stara cijena je **IZVEDENA** iz procenta (`cijena / (1 - pct/100)`), jer je
  Fressnapf renderuje tek u browseru. Bez procenta → bez stare cijene.
  Slika se bira po ID-u artikla iz putanje (stranica ima 150+ slika).
  Testovi: `scraper/src/sources/fressnapf.test.ts`.
- Istraživanje zašto Netto/EDEKA/Penny/dm NE rade: `scraper/docs/*.md`
  (EDEKA `/api/offers` vraća 403 „haha! better luck next time").
- Osnova preuzeta iz korisnikovog `prospekt-bot` (Python) i prevedena u TS da
  radi kao ostali lanci — jedan workflow, jedan snapshot, isti logovi.

### ZAMKA: `__name is not defined` u `page.evaluate`
- U funkciji koja ide u `page.evaluate` **NE definisati imenovane funkcije**
  (`const f = () => {}` ni `function f() {}`). `tsx`/esbuild ih umota u
  pomoćnik `__name`, kojeg u stranici nema → `ReferenceError`.
- Dozvoljeno: anonimne funkcije unutar `.map()/.filter()` i ravan kod.
- Provjera: `f.toString()` pod `tsx` — ako sadrži `__name`, puca.

### ZAŠTITA OD PARSERA HILJADA (`sanitizeOffer`)
- Popust > 95% → stara cijena se BACA + `[sumnjivo]` u logu.
- Razlog: "1.249,00" pogrešno pročitano kao 1.24 je tiha greška 1000× —
  cijena izgleda uredno, samo je besmislena. Vrijedi za SVIH 6 lanaca.
- Ideja preuzeta iz korisnikovog `obi-bot` validatora.

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

### INSTALL PROMPT — nudi se tek nakon 25 s (03.08.2026)
Ranije je baner iskakao **2,2 s** nakon učitavanja, dakle svakome ko je samo
proletio kroz stranicu. Sada se nudi tek onome ko provede **25 sekundi** na
sajtu (`PRAG_MS` u `components/InstallPrompt.tsx`).

⚠️ Broji se SAMO vrijeme dok je kartica VIDLJIVA (`document.visibilityState`,
interval od 1 s). Običan `setTimeout(…, 25000)` bi otkucao i kad neko otvori
sajt u pozadinskoj kartici pa ode na sat — a to nije 25 s pažnje.

Gate stoji u `maybeShow()` (`spremanRef`), pa ga poštuju SVI okidači, uključujući
`beforeinstallprompt` (koji se i dalje hvata i pamti — samo se ne prikazuje odmah).
**Izuzetak:** dovršen račun u kalkulatoru odmah otključa baner — jači je signal
od vremena. Ukloniti `spremanRef.current = true` u `onMsg` ako se to ne želi.

⚠️ OČEKIVANJE: ovo će SMANJITI broj ljudi koji vide baner (a povećati udio
zainteresovanih). Nije popravka ničega — brojač nije bio pokvaren.

### INSTALL PROMPT — tekst (03.08.2026)
JEDAN tekst za cijeli sajt, konstante `NASLOV` i `TEKST` u `InstallPrompt.tsx`:

> **Instaliraj kodnas.de** — Akcije, kalkulator i vodiči kao aplikacija — brzo, bez browsera.

Probane su bile varijante po stranici („Dodaj akcije na svoj ekran" na /akcije
itd.), ali je odluka korisnika: jednostavno i svugdje isto. NE vraćati bez
dogovora.

⚠️ NAMJERNO se NIGDJE ne obećava rad BEZ INTERNETA — service worker ne kešira
stranice, pa bi to bila neistina. Ne dodavati bez provjere.

### INSTALL PROMPT — na SVAKOJ stranici
- `components/InstallPrompt.tsx`: prije se palio SAMO na kalkulatoru (postMessage). Sada je u `app/layout.tsx` (root) i pali se na svakoj stranici ~2s nakon učitavanja (`maybeShow` + timer). Pamti "Kasnije" u `sessionStorage`. Uklonjen duplikat sa `app/brutto-netto/page.tsx`.

### ⏳ ČEKA KORISNIKA (ručno)
1. **info@kodnas.de NE RADI još** → Namecheap → Manage kodnas.de → REDIRECT EMAIL → alias `info` → nodze93@gmail.com
2. ~~Pokrenuti SQL za app_instalacije~~ **GOTOVO** — provjereno 03.08.2026 u
   adminu: brojač radi i stoji na **17 instalacija**. Tabela postoji u Supabaseu
   (nije u repou kao .sql fajl — napravljena ručno).
   ⚠️ DVA OGRANIČENJA tog broja, da se ne čita pogrešno:
   • `InstallPrompt.tsx` šalje POST BEZ tijela, pa je `platforma` uvijek
     „unknown" — ne zna se Android/desktop.
   • iPhone se UOPŠTE ne broji: Safari ne podržava `appinstalled` događaj.
     Pravi broj instalacija je dakle VEĆI od prikazanog.
   • `track-install` ruta gubi grešku: supabase-js `.insert()` ne baca izuzetak
     nego vraća `{error}`, a kod ga ne gleda — ruta uvijek vrati `ok:true`.
     Da tabela sutra nestane, brojač bi tiho stao bez ijedne greške.
3. Provjeriti **Vercel → Usage** datum reseta ciklusa (CPU je bio ~81%)
4. (opciono) cookie-baner za GA pristanak
5. **AKCIJE — SQL** (`akcije.sql` + `akcije-trajni-sloj.sql`) POKRENUT; `DATABASE_URL` secret POSTAVLJEN; scraper radi, podaci u bazi (Aldi Süd/Nord/Kaufland). GOTOVO.
6. **AKCIJE — dnevni scraper RADI** (potvrđeno): GitHub Actions "Akcije — dnevni scraper" se pali po cronu i prolazi uspješno. "Uvijek jučerašnje" je bio KEŠ (30 min + 24h stale), sada 2 min → riješeno.
7. **AKCIJE TODO**: (a) "važi od/do" + prikaz po danu — importer sada čita `validFrom/validTo`, ali PRIKAZ po danu u dizajnu NIJE rađen; (b) slike Aldi Süd/Kaufland POPRAVLJENE; (c) ostali lanci = crawler+vision ili marktguru JSON, kad bude posjetilaca; (d) pravi file-upload slika (treba storage); (e) Dozvole (hash lozinki); (f) Icecat/Pexels izvori slika.
8. **AKCIJE — admin konzol NAPRAVLJEN** (Pregled/Scraper/Slike/Prodavnice/PLZ/Kategorije/Popusti+JSON uvoz). Korisnik SADA želi JSON uvoz (predomislio se oko ručnog) — upload `.json` radi.
9. **AKCIJE — REGIJE**: dogovoren prelazak s 8.200 PLZ na model regija (nacionalno + Aldi jug/sjever + kasnije REWE/Edeka). Detaljan plan: **`PLAN-REGIJE.md`**. Sljedeći veći zadatak.

### SPECIJALIZOVANI LANCI — „samo na klik" (OBI, Fressnapf)
`/akcije` je stranica za **namirnice**. OBI (baumarkt) i Fressnapf (ljubimci)
imaju stotine artikala sa −50%, pa na „Sve akcije" i u „Preporuci ove sedmice"
pregaze listu — paradajz i kafa ispadnu ispod hrane za mačke.

Rješenje je **u SQL-u, ne u kodu** (bitno — ne tražiti filter u TypeScriptu):
`ak_discounts_search` i `ak_categories_list` imaju uslov
`p_store is not null or s.slug not in ('obi','fressnapf')`.
Prevod: dok korisnik NE klikne baš na taj lanac, njegovi artikli se ne
prikazuju; kad klikne pločicu u traci — otvore se svi.

**Namjerno OSTAJU vidljivi** (ne dirati): `ak_stores_list` (pločica s brojem
u traci) i `ak_meta` (brojači). Bez toga se ne bi imalo na šta kliknuti.

„Preporuka ove sedmice" (`components/akcije/Recommendation.tsx`) prima `items`
kao prop iz iste pretrage → popravlja se sama, nema zasebne izmjene.

### ZAŠTITA: jedan loš dohvat NE briše lanac sa sajta (2026-08-03)
**Šta se desilo:** Aldi Nord je u jednom runu 4× zaredom istekao na
`waitForSelector` (stranica se otvorila, kartice se nisu pojavile u 30 s).
`withRetry` je vratio null → lanac preskočen → `replaceSnapshot` svejedno
upisao NOVI snapshot bez njega → **243 ponude nestale sa sajta**, iako su
jučerašnje mirno stajale u bazi. Sat kasnije: isti kod, isti bot, prošao
normalno. Dakle prolazno (throttling / spor render), NE kvar koda.

**Trajanje 2m43s je potpis kvara:** `maxRetries=3` → 4 pokušaja × 30 s
timeout + backoff (5+10+15 s) ≈ 163 s. Kad vidiš lanac koji „pojede" ~2,5
minute i ne ostavi svoju liniju — to je ovo.

**Riješeno** u `scraper/src/db.ts` (`prenesiZaostale` + `idPrisutnihLanaca`):
lancu koji danas nije dao NIJEDAN red prepišu se jučerašnji redovi u
današnji snapshot, u istoj transakciji.
- ne laže: svaki red nosi `valid_from/valid_to`, sajt filtrira po danu →
  istekle ponude ispadnu same;
- prepisuje najviše **3 dana** unazad (`MAX_PRENOS_DANA`) — ako lanac ne radi
  4+ dana, treba da nestane, to je onda pravi kvar;
- **alarm i dalje radi**: „Zdravlje scrapera" čita `ak_scrape_runs` (tamo i
  dalje piše 0 / status `error`), a ne `ak_discounts`;
- isključivanje: `SCRAPER_CARRY_FORWARD=0`.

### ZAŠTO ALDI SÜD IMA SAMO ~15 PONUDA (a Aldi Nord 250)
**Nije bug — stranice su različite.** `aldi-nord.de/angebote.html` prikaže
CIJELU ponudu (~250 kartica). `aldi-sued.de/de/angebote.html` je samo
**pregledna stranica**: po sekciji pokaže 10-12 kartica i dugme „Alle
Angebote ab Montag" koje vodi na pravu listu.

Prave liste Aldi Süda su na zasebnim URL-ovima, po danu početka:
`/angebote/GGGG-MM-DD` (npr. `/angebote/2026-08-03`, `/angebote/2026-08-06`,
`/angebote/2026-08-07`) + `/produkte/wochenangebote/k/1588161426582123`.
Ti linkovi stoje u meniju pregledne stranice, pa se mogu pročitati iz nje.

**RIJEŠENO 2026-08-03** u `retailers.ts`:
- `RetailerDef.podstranice?: RegExp` + `maxPodstranica` — SAMO Aldi Süd ih ima;
  Nord i Kaufland su prazni (sve im je na jednoj stranici) → ne diraju se.
- čitanje jedne stranice izdvojeno u `citajStranicu(page, def)` da se ne kopira kod;
- `podstraniceIzLinkova(hrefs, obrazac, najvise)` — bira linkove sa pregledne
  stranice (čisti `#` i završnu `/`, izbacuje ponovljene, reže na 8);
- `periodIzUrla(url)` — `/angebote/2026-08-03` → `"Angebote ab 03.08.2026"`, što
  `procitajPeriod` već zna pročitati; koristi se SAMO ako podstranica nema
  naslov s datumom;
- ⚠️ svaka podstranica ima SVOJ try/catch — jedna loša NE SMIJE oboriti lanac
  (to je tačno onaj kvar zbog kojeg je Aldi Nord nestao sa sajta);
- pregledna stranica NAMJERNO nema catch → greška izlazi i `withRetry` ponavlja.

**DRUGI KRUG (isti dan) — podstranice nisu ni pokušane.** Prvi popravak nije
pomogao: i dalje 15. Uzrok nađen mjerenjem u PRAVOM browseru (Claude in Chrome):

| | `div.product-tile` | linkova na podstranice |
|---|---|---|
| pravi Chrome | **52** | **9** |
| naš `kodnas-bot` UA | 15 | **0** |

Aldi Süd pod poštenim bot-UA renderuje stranicu SAMO DJELIMIČNO — pa je izostao
i meni s linkovima, zato podstranice nisu ni pokušane. **Isti slučaj kao OBI.**
Riješeno poljem `browserUa: true` u defu (koristi `config.browserUserAgent`,
koji i dalje sadrži „(+kodnas.de)" — ne krijemo se).

**+ PAGINACIJA**: podstranica ima 30 artikala po strani, a dan zna imati 38
(„Ab Montag, 3. August (38)") → `najvecaStrana()` čita `?page=N` i obiđe ih do 6.
Njihov robots.txt to izričito dozvoljava (`Allow: /*?page=*`).

**TREĆI KRUG — PRAVI uzrok: CIJENA, ne stranica i ne UA.** Podstranice su
proradile i log je pokazao 478 kartica:
```
[podstranice] Aldi Süd: 8 za obići
[podstranica] /angebote/2026-07-31: 126 kartica (3 strane)
[podstranica] /angebote/2026-08-07: 146 kartica (4 strane)  … itd
[slike] Aldi Süd: 15 artikala   ← od 478!
```
Kartice su se ČITALE, ali im je `np` bio prazan pa ih je `toOffer` bacao.
Selektor `ins.base-price__discounted` postoji SAMO kod sniženih artikala.

Izmjereno na živoj stranici (Claude in Chrome), simulacijom iste logike:

| | stari selektor | novi |
|---|---|---|
| pregledna (52 kartice) | 15 | **52** |
| /angebote/2026-08-07 (30) | **0** | **30** |

Rješenje: `newPrice: 'ins.base-price__discounted, span.base-price__regular'`.

⚠️ NAZIV VARA: `base-price__regular` NIJE stara cijena — to je TRENUTNA cijena
u oba slučaja (kod sniženog daje „0,99 €²", isto što i `ins`), a stara je u
`del`. Zato je svejedno koji selektor querySelector pogodi prvi. Provjereno
VRIJEDNOSTIMA; provjera samo po postojanju elemenata daje lažnu uzbunu
(`span.base-price__regular` je prvi u DOM-u kod svih 15 sniženih).

Fusnote `¹`/`²` uz cijenu ne smetaju — `parsePrice("1,00 €¹")` = 1 (testirano).

⚠️ POSLJEDICA: Aldi Süd skače sa 15 na ~400 artikala, ali VEĆINA je bez stare
cijene (Aktionsartikel — alat, odjeća, baštenski program), pa idu kao „Angebot"
bez procenta, kao REWE.

⚠️ POUKA ZA UBUDUĆE: kad lanac vraća SUMNJIVO MALO artikala (a ne 0), prvo
uporedi broj kartica u pravom browseru sa onim što dobija bot. Ako se razlikuje
— to je User-Agent, ne selektor.

Robots.txt Aldi Süda dozvoljava (`Disallow` je samo `/tools` i `/*?q=`).
U logu se vidi `[podstranica] /angebote/2026-08-03: N kartica`.

### REFERENTNA CIJENA — 30-dnevni minimum (§11 PAngV)
Za namirnice NE postoji javna baza UVP-a, i ne treba nam: od 28.05.2022. njemački
§11 PAngV traži da uz popust stoji **najniža cijena KOJU JE TAJ ISTI TRGOVAC imao
u zadnjih 30 dana**, a EuGH je dodao da se i procenat mora računati iz nje.

⚠️ **Cijene se NE MIJEŠAJU između lanaca.** Aldijeva referentna cijena dolazi iz
Aldija, REWE-ova iz REWE-a. Ključ za bilo kakav budući obračun mora biti
`store_id + product_key`, NIKAD samo naziv artikla.

`old_price` koji već upisujemo je precrtana cijena koju lanac sam objavljuje —
dakle po zakonu bi to već trebala biti ta 30-dnevna najniža. Mi smo prenosilac.
(Izuzetak koji treba imati na umu: OBI često prikazuje UVP, ne 30-dnevni minimum.)

**Zadržavanje snimaka podignuto 14 → 31 dan** (2026-08-03), na dva mjesta koja
moraju ostati usklađena:
- `scraper/src/config.ts` → `keepDays` default 31
- `.github/workflows/akcije-scraper.yml` → `SCRAPER_KEEP_DAYS: "31"`
Time imamo pun mjesec vlastite historije i možemo sami računati „najniža cijena
koju smo vidjeli za ovaj artikal kod ovog lanca" — bez ijednog tuđeg servisa.
Trošak je zanemariv (~800 redova dnevno ≈ 25k ukupno).

**NIJE JOŠ NAPRAVLJENO**: sam obračun/prikaz tog minimuma. Dogovoriti prije diranja.

### TRINKGUT (pića, EDEKA grupa) — dodan 03.08.2026
Najjednostavniji izvor: jedan HTTP zahtjev na `/angebote`, bez browsera i bez
API-ja. Shopware sa STABILNIM klasama (`.product-box`, `.product-name`,
`.product-price`), pa se čita regexom.

**TRI ZAMKE (sve provjerene u pravom browseru):**
1. **Cijena je razbijena tagom:** `<p class="product-price"> 11.<sup>99</sup> </p>`
   — regex nad tekstom vidi samo „11." i stane. Zato `bezTagova()` PRIJE parsiranja.
2. **Tačka je decimalni zarez** („11.99"), suprotno od ostatka Njemačke →
   `normPriceText(txt, true)`, isto kao Kaufland.
3. **Nema stare cijene ni procenta** (0 precrtanih, 0 „statt"/„UVP") → sve je
   „Angebot" kao REWE, dakle NE ulazi u „Top ponude danas" ni u preporuku.

Rok stoji JEDNOM za cijelu stranicu („Gültig vom 03.08.2026 bis 08.08.2026").
Bez njega se NE upisuje ništa — radije prazno nego izmišljen datum.
Regex prima i „Gueltig" (ue umjesto ü), inače bi tiho vraćao 0.

Slika: iz `srcset` se uzima NAJVEĆA (`products_xl`), ne prva (`products_xs`).
Provjereno na živoj stranici: **57 blokova → 57 ponuda, 57/57 sa slikom i linkom.**

robots.txt dozvoljava `/angebote`, ali zabranjuje sve putanje s upitnikom —
zato bez paginacije (a i nema je, `?p=2` vraća isto).

⚠️ Kategorija svih artikala: `Getraenke`. Pločica: crno na žutom (#fce503),
njihova primarna boja.

### HTML ENTITETI U NAZIVIMA — riješeno 03.08.2026
Na sajtu se vidjelo `DOG&#39;S LOVE`, `N&amp;D Farmina`, `Adult Maxi &gt;25kg`.
Uzrok: izvori koji se čitaju REGEXOM iz sirovog HTML-a (Fressnapf, Trinkgut)
dobiju naziv onakav kakav je u kodu stranice; izvori kroz browser
(`textContent`) to nemaju jer entitete dekodira sam browser.

Riješeno u `normalize.ts` → `dekodirajEntitete()`, pozvano iz `cleanProductName`
— JEDNO mjesto kroz koje prolazi svaki naziv iz svakog izvora i iz JSON uvoza.
Dekodira se u JEDNOM prolazu (replacer funkcija), NE lančano — inače bi
„&amp;lt;" postalo „<" umjesto „&lt;". Nepoznat entitet ostaje netaknut.
Stari redovi u bazi se poprave sami sljedećim runom (snapshot se prepisuje).

### DISKAUFEN — samostalna njemačka app (osvježeno 03.08.2026)
Rebrend akcija kao poseban proizvod. **Ime: diskaufen, domena diskaufen.com**
(ranije radno ime Angebote24 — zamijenjeno). Isporuka: `diskaufen.zip` (176
fajlova). kodnas.de NIJE diran.

Šta je ušlo pri osvježavanju (stari zip je bio PRIJE svega ovoga):
- scraper: svih 8 lanaca (uklj. Fressnapf i Trinkgut), Aldi Süd podstranice +
  paginacija + browserUa + novi selektor cijene, zaštita `prenesiZaostale`,
  HTML entiteti, keepDays 31, plz.txt samo '00000'
- frontend: dan-po-dan (`poSvjezini`/`najnovijaTura`/`turaOd`), „Prikaži još",
  URL filteri, PLZ guard, `kategorijaNaziv`, novi CSS (srch, badge-novo)
- admin JSON uvoz: dedup + `validTo` obavezan + rok max 60 dana
- SQL: dodani `akcije-uvoz` u README redoslijed + `akcije-regije-2` + `akcije-fressnapf`
- workflow: KEEP_DAYS 31, ime „diskaufen — täglicher Scraper"

**Ispravljena curenja starog zipa** (bila su promakla): admin logo „kodnas.de",
OG `siteName: 'kodnas.de'` + SITE fallback na detalju ponude, ime scraper
paketa, UA `kodnas-bot`. Sada je identitet `diskaufen-bot/1.0
(+kontakt: info@diskaufen.com)`, a SVE brend-stvari vuku iz `lib/brand.ts`
(ime 'diskaufen', kratko 'DK', url diskaufen.com).

**Ispravljeni zaostali bosanski tekstovi u njemačkom UI**: „X akcija" u traci
prodavnica, „Preporuka ove sedmice", pola-pola rečenica u preporuci,
„prodavnica" na glavnoj, „Pogledaj akcije" na Merkzettelu, „umjesto" u OG
opisu (sad „statt"), „Alle aktuelne akcije".

Admin NAMJERNO ostaje na bosanskom (za vlasnika). Komentari u kodu bosanski.
Verifikovano: scraper 121/121 testova, tsc čist, `next build` 22 stranice.

## RADNI DOGOVOR
- Claude UVIJEK radi na NAJSVJEŽIJOJ verziji fajla (povuče iz foldera prije izmjene), ne iz starog snimka.
- Korisnik radi Commit + Push čim se izmjena napravi (da se verzije ne razilaze).

## KADA POČNEŠ NOVI CHAT
1. Pročitaj PROJECT_MEMORY.md, PROGRESS.md, CURRENT_TASK.md
2. Reci: "Razumijem projekat. Šta radimo?"
3. NE mijenjaj kod dok ne dogovorimo plan.
