# PROGRESS LOG — KODNAS.DE

## STATUS: LIVE · bot 2.0 radi · /akcije radi sa 4 lanca
Zadnji update: 2026-08-01

---

## ✅ SESIJA 2026-08-01 (akcije: duplikati, datumi, JSON uvoz, Lidl) — SVE PUSHOVANO

### Install prompt — iOS
- [x] „Već imam aplikaciju" link u iPhone baneru → trajno `kodnas-install-done`.
      iPhone NIKAD ne šalje `appinstalled`, a Safari i app imaju odvojen localStorage,
      pa se instalirana app ne može detektovati — korisnik to sam kaže.
- Fajl: components/InstallPrompt.tsx

### QA uživo — nađeno gledanjem sajta u Chrome-u
- Klik na „Top ponude danas → Pogledaj sve" vodio na stranicu koja piše „Sve akcije"
- 12 od 72 ponude bili DUPLIKATI (Kaufland isti artikal na više mjesta na stranici)
- Klik na srce kod duplikata bojio OBA (favorit ide po nazivu, ne po redu)
- Nijedna kartica nije imala „Vrijedi do" — scraper nije vadio datume
- (NE diramo, korisnikova odluka: kategorije na njemačkom, „Akcije" van gornjeg menija)

### Duplikati — riješeno na dva mjesta
- [x] `scraper/src/sources/retailers.ts` → `dedup()` po (naziv + nova cijena); ne ulaze u bazu
- [x] `app/api/akcije/discounts/route.ts` → izbacuje ih i iz odgovora (današnji snapshot je
      već bio u bazi s duplikatima) + ispravlja ukupan broj
- Provjereno na pravim podacima: 72 → 60, izbačeno tačno 12, ništa jedinstveno nije palo
- Prvi pravi run: `[dupli] Kaufland: izbačeno 12`, `[dupli] Aldi Nord: izbačeno 8`

### Naslov „Top ponude danas"
- [x] Link nosi `top=1`; `/akcije/ponude` tada piše „Top ponude danas" umjesto „Sve akcije"

### DATUMI VAŽENJA (valid_from / valid_to) — velika stvar
- [x] `scraper/src/datumi.ts` + `datumi.test.ts` (10/10 testova) — parser njemačkih perioda:
      „Gültig vom 30.07. bis 05.08." · „Wochenangebote Mo., 27.7. – Sa., 1.8." ·
      „Angebote ab Donnerstag 30.7." · „Aktion Mo. 27.7." · „Nur Sa. 1.8."
      Pogađa godinu (radi i preko Nove godine); kad je dat samo početak, kraj je zadnji
      dan prodajne sedmice lanca (`krajSedmice`: Aldi subota=6, Kaufland srijeda=3).
- [x] `retailers.ts` prolazi kroz dokument REDOM, pamti zadnji naslov s datumom i lijepi ga
      na artikle ispod. „Dauerhaft günstige Produkte" resetuje period (nisu sedmična akcija).
- [x] `supabase/akcije-datumi.sql` → poslije nadograđen u `akcije-uvoz.sql` (vidi dolje)
- [x] API filtrira po danu **po Berlinu** (Vercel radi u UTC-u)
- Kartica i detalj su „Vrijedi do" VEĆ imali — falio je samo podatak
- Prvi pravi run: `[datumi] Kaufland 37/37`, `[datumi] Aldi Süd 11/23`
  (12 od 23 su „Dauerhaft" — namjerno bez roka)

### JSON UVOZ — bio potpuno pokvaren, sada radi
- [x] **Kolona `source` NIJE POSTOJALA** u `ak_discounts`, a importer je upisuje →
      svaki red odbijen; `/api/admin/akcije` vraćao 500. → `supabase/akcije-uvoz.sql`
- [x] Scraper je brisao SVE za (plz, datum) → pojeo bi ručni uvoz.
      Sada briše samo `source='scraper'` (`scraper/src/db.ts`)
- [x] Sajt pokazuje samo najnoviji snapshot → ručni uvoz bi nestao sutradan.
      Sada ručni redovi idu po DATUMU VAŽENJA. ⚠️ Zato ručni red MORA imati `valid_to`.
- [x] **Dupli omot**: admin je fajl `{"offers":[...]}` umotavao još jednom → server vidio
      JEDAN artikal bez naziva → „upisano 0, preskočeno 1". Popravljeno na obje strane
      (klijent + server razmotaju bilo koji oblik). 6/6 testova.
- [x] Poruka o preskakanju sada kaže ŠTA fali, ne samo brojku

### LIDL — uvezen, 58 ponuda
- Provjereno: Lidlove NAMIRNICE se ne mogu skrejpati — Prospekt je flipbook od 70 SLIKA
  (izvučen tekst = samo navigacija). Njihov ONLINE dio (ESMARA/SILVERCREST/PARKSIDE) JESTE
  tekst, sa starom cijenom, procentom i „auch in der Filiale 27.07. - 01.08." → mogući izvor.
- Korisnikov JSON je imao 1807 redova / 33 TUĐA PLZ-a (nijedan naš) = 58 artikala × 33 grada.
  Sređeno na 58 × naših 6 gradova = 348 redova. **Lidl je nacionalan — cijene iste svugdje.**
- Lidl se pojavio u traci sam, sa svojim znakom (već pripremljen u `lib/akcije/stores.ts`)

### SLIKE — admin je lagao „100%"
- [x] `scraper/src/checkImages.ts` (`npm run images:check`) + korak u workflow-u PRIJE
      Open Food Facts dopune. Pokuca na svaki URL; mrtvima obriše `image_url` → postaju
      „bez slike" → OFF ih popuni. 6/6 testova (404, HTML sa statusom 200, HEAD zabranjen…)
- Nađeno mjerenjem: 52 od 58 Lidlovih slika se učita, 6 mrtvo. Admin je brojao samo
  „ima URL u bazi", ne „slika se otvara".
- **HOTLINK — svjesna odluka.** Sve 4 prodavnice se povlače s tuđih CDN-ova
  (lidlplus / kaufland.media.schwarz / aldi.cx / scene7), ništa se ne kopira kod nas.
  Pravno je to SIGURNIJE od skidanja (nema umnožavanja); `images:download` NAMJERNO ostaje
  isključen. Kad sajt poraste — provjeriti kod njemačkog advokata.

### Admin — dugme „Povuci slike sada"
- [x] `lib/github-dispatch.ts` → `dispatchWorkflow()` (pokreće bilo koji workflow)
- [x] `app/api/admin/akcije/pokreni/route.ts` + dugme u Pregledu
- Posao traje ~2 min (ne 15–40 kako je prvo pisalo)

### Stanje na kraju sesije
- 118 ponuda za PLZ 85737: Lidl 58 · Kaufland 37 · Aldi Süd 23 (+ Aldi Nord 258 u 10115)
- ⚠️ Lidl pada na ~15 već sutra — 43 od 58 ističe 1.8.

---

## Starije sesije

## ✅ SESIJA 2026-07-17 (druga — 5 popravki; ⚠️ ČEKA COMMIT + PUSH)

### Mobilna naslovna — Svijet/Sport
- [x] dajLiveSvijet/dajLiveSport (lib/live.ts) sada čitaju DIREKTNO iz baze po kategoriji
      (nova dajObjavljeneOr) umjesto iz prozora "60 najnovijih iz svih kategorija"
      → prije pokazivali 1, sad do 5. (dajLiveDE/BIH ostavljeni.)

### Bot — triaža (nije pisao, "lutrija")
- [x] Uzrok: AI triaža bez temperature = nasumično + "već poznato" ×0.3 ubija skoro sve.
      Auto i ručno su INAČE identičan kod (oba dispatchBot → isti workflow → pipeline2).
- [x] temperature: 0 na triažu (claude.ts dobio opcioni param) → dosljedno
- [x] prag 68→61, sport/svijet 56→50, "već poznato" 0.3→0.35 (blago, ~10%)
- [x] Memorija (3 dana) + tema-dedup NETAKNUTI (štit protiv duplikata)
- Fajlovi: lib/bot/agenti/claude.ts, lib/bot/agenti/triaza.ts

### Vercel Analytics
- [x] Paketi bili instalirani ali komponente nikad montirane → dodani <Analytics /> +
      <SpeedInsights /> u app/layout.tsx. (Ručno: Enable Web Analytics u Vercel dashboardu.)

### Brend ime
- [x] "Dijaspora.ba" → "kodnas.de" u tab naslovu i open graph-u (app/layout.tsx)

### Facebook — token + komentar
- [x] Napravljen NOVI TRAJNI Page token, upisan u Vercel (FB_PAGE_TOKEN), Redeploy urađen
- [x] FB_PAGE_ID potvrđen = 1270099672843899
- [x] facebook.ts: provjerava i vraća je li link-komentar prošao (prije tiho padalo)
- [x] fb-share ruta: jasna poruka (uspjeh / razlog zašto komentar nije prošao)

### ⚠️ Ručno što čeka: COMMIT + PUSH (6 fajlova); Vercel Enable Analytics; test bota; test FB objave

---

## ✅ SESIJA 2026-07-17 (veliki set popravki — SVE PUSHOVANO)

### Bot — lektor (gramatika)
- [x] Lektor prebačen na **claude-sonnet-5** (MODEL_LEKTOR u lib/bot/agenti/claude.ts); ostatak Haiku
- [x] maxTokens lektora 3000→8000 + zaštita (krnj odgovor → sačuvaj original, ne ruši)
      → RIJEŠEN pravi uzrok "greška u obradi" za njemačke članke (bio krah lektora, NE dedup)
- [x] Izbačena lista ispravki iz lektorovog odgovora → jeftiniji Sonnet + rjeđe se siječe
- [x] Jezik: istorija→historija, ijekavica (prijevoz ne prevoz), futur odvojeno (donosit će),
      glagoli -iti 3.l.mn. -e (ruše ne rušu)

### Bot — kvote + duplikati
- [x] Kvote iz admina STVARNO rade (pipeline2 čita dajBotConfig → kapDijaspora/svijet/sport + brojObjava)
- [x] Podrazumijevano: DE 5, svijet 3, sport 3 (lib/bot-config.ts)
- [x] Triaža stroža protiv duplikata (vec_poznato *0.3 + oštriji prompt za istu temu drugačije sročenu)

### Admin
- [x] Uklonjeno duplo "Pokreni odmah" dugme (Dashboard) — ostaje na Pipeline stranici
- [x] Status runa "Djelimično" (žuto) umjesto crvene "Greška" kad je nešto napisano
- [x] Kolona 📤 broj dijeljenja; API ruta otporna ako kolona ne postoji

### Dijeljenje (share) članaka
- [x] components/DijeliDugme.tsx (Web Share API, klix stil), app/api/clanak/[slug]/dijeli/route.ts
- [x] supabase/dijeljenja.sql (kolona broj_dijeljenja + RPC increment_dijeljenja) — ČEKA da se pokrene
- [x] Datum + "Podijeli" u redu ispod slike (bez "min čitanja")

### Frontend
- [x] /de "Učitaj još" (components/DeLista.tsx) + popravljen limit (lib/live.ts — vide se stariji članci)
- [x] Izbačena "AI asistent" sekcija (/o-nama)
- [x] Sport podnaslov: "Bundesliga, svjetski fudbal i veliki mečevi" (naslovna + /kategorija/sport)
- [x] Uklonjen Vercel cron (vercel.json) → nema više "c is not iterable"
- [x] Google Analytics spreman: app/layout.tsx čita NEXT_PUBLIC_GA_ID (čeka ID u Vercelu)

### Facebook (brend)
- [x] Profilna "KN" + cover (novinarski stil, sužen da stane na mobilnom)
- [x] Prvi post napisan ("Introduce yourself")

### ⚠️ Ručni koraci koji čekaju: pokrenuti supabase/dijeljenja.sql; postaviti kvote u adminu;
###    napraviti GA4 + upisati NEXT_PUBLIC_GA_ID u Vercel

### 🎯 Sljedeći koraci: 1) Promocija + FB setup  2) Google (Analytics + Search Console)  3) Impresum i Datenschutz (prava podaci!)

---

## ✅ URAĐENO (ranije)

### Osnova (ranije)
- [x] Domena kodnas.de (Namecheap A/CNAME), Vercel, Supabase, GitHub
- [x] Portal LIVE na kodnas.de
- [x] Supabase URL/ključevi popravljeni (sb_publishable_ / sb_secret_)
- [x] Bot prebačen na GitHub Actions (Node 22, npm install, npx tsx scripts/run-bot.ts)

### MOST DO KOMPJUTERA (najvažnija promjena u workflow-u!)
- [x] Claude piše fajlove DIREKTNO u C:\Users\dzena\Documents\GitHub\nodze preko mosta
- [x] Korisnik samo commit + push u GitHub Desktop (nema više copy-paste)
- [x] IZUZETAK: .github/workflows/*.yml su ZAŠTIĆENI — most ih ne može pisati.
      Taj jedan fajl (bot-cron.yml) korisnik MORA ručno kopirati.

### Sigurnosni audit
- [x] Cron endpoint zatvoren (zahtijeva CRON_SECRET, timing-safe)
- [x] /api/ai-chat rate limit + validacija (zaštita budžeta)
- [x] Rate limiting na newsletter/kontakt
- [x] Admin login: timing-safe + hash token u cookie (ne sirova lozinka)
- [x] XSS sanitizacija članaka (lib/sanitize.ts)
- [x] Validacija javnih formi
- Novi fajlovi: lib/security.ts, lib/rate-limit.ts, lib/sanitize.ts

### Bot optimizacija (cilj < €12-15/mj)
- [x] Oba modela Haiku 4.5 (MODEL_PISAC bio Sonnet)
- [x] Prompt caching (cache_control ephemeral) u lib/bot/agenti/claude.ts
- [x] Max tokens sniženi: writer 2500, factcheck 1500, jezik 3000
- [x] Skip fact-check za sport i svijet (samo dijaspora ide kroz fact-check)
- [x] Cijene (Haiku 4.5): input $1/M, output $5/M, cache read $0.10/M

### Bot kvote + raspored
- [x] DE i BiH ODVOJENE kvote (BiH više ne ostaje prazan) — filter dijeli po jeziku izvora
- [x] 3x dnevno: 06:00 / 12:30 / 20:00 (Berlin) → cron UTC: "0 4", "30 10", "0 18"
- [x] Sport samo ujutro (06:00) i navečer (20:00), ne u podne
- [x] Kvote (env): CLANCI_DE=1, CLANCI_BIH=1, CLANCI_SVIJET=1, CLANCI_SPORT (uslovno)
- [x] Procjena troška: ~€13/mj

### Admin "Pokreni odmah"
- [x] Sada pali GitHub Actions (ne piše na Vercelu — 60s limit ubijao bota)
- [x] Treba env GITHUB_TOKEN u Vercelu (repo scope dovoljan)

### Moderacija na stranici (in-place)
- [x] DB migracija: supabase/moderacija.sql (redoslijed, je_naslovna, zakazano_za)
- [x] Admin traka na svim stranicama (samo za ulogovanog admina)
- [x] "Uredi članke" (Article Manager): reorder (▲▼/drag), pin naslovna, uredi, zakaži, obriši, dodaj
- [x] Filter po kategoriji (u Vizi vidiš samo Viza, itd.)
- [x] Javne liste poštuju redoslijed + skrivaju zakazane (lib/data.ts, otporno prije migracije)
- Fajlovi: components/admin/AdminModeracija.tsx, app/api/admin/{me,redoslijed,naslovna}/route.ts

### SEO
- [x] app/sitemap.ts (dinamički: članci + vodiči + kategorije + statične)
- [x] app/robots.ts
- [x] Verifikacioni meta tagovi (GOOGLE_SITE_VERIFICATION, BING_SITE_VERIFICATION env)
- [ ] GSC + Bing verifikacija + submit sitemap (ručno, čeka korisnika)
- [ ] Google Indexing API + IndexNow (poslije GSC verifikacije)

### Vodiči (hard-kodirani, lib/data/vodici.ts)
- [x] Postojeći: radna viza, Krankenkasse, trudnoća, stan, povrat poreza, povratak BiH, Anmeldung, njemački jezik
- [x] NOVI (vize, 2026 podaci): Chancenkarte, EU Plava karta (Blue Card), Westbalkan regulacija, Spajanje porodice

### Layout / dizajn
- [x] Kategorijske stranice (Viza/Stan...) = card-lista (thumbnail + tag + naslov + meta)
- [x] /de i /bih = ISTI stil kao kategorije (thumbnail + BADGE IZVORA + naslov + meta); bez LIVE badge/info kutije
- [x] Naslovni widget "Vijesti iz Njemačke" = SAMO njemački portali (svjetski izbačeni)
- [x] Naslovna: "Iz svijeta" na vrhu (pokazuje izvor umjesto SVIJET), "Najnovije" ispod
- [x] Thumbnail kutija se UVIJEK prikazuje (siva dok nema slike)

### Čišćenje teksta (da ne odaje automatizaciju / ne zvuči neozbiljno)
- [x] Izbačeno "klikabilno", "Naš AI bot", "automatski sistem", "prati izvore"
- [x] Interni kod-komentari i sistemski promptovi ostavljeni (čitalac ih ne vidi)

## 🚧 U TOKU / ČEKA KORISNIKA (ručni koraci)
1. Ručno kopirati `.github/workflows/bot-cron.yml` (zaštićen fajl) → za 3x/dnevno raspored
2. Dodati `GITHUB_TOKEN` u Vercel env → za "Pokreni odmah" dugme
3. Pokrenuti `supabase/moderacija.sql` u Supabase (ako nije) → za moderaciju
4. Commit + push sve na preview, testirati, pa merge u main

## 📋 TODO (opciono, sljedeće)
- [ ] Unsplash ključ → prave slike uz članke (sad su sive kutije)
- [ ] Veliki hero na naslovnoj → dinamički (da pin-naslovna radi na njemu)
- [ ] GSC/Bing verifikacija + Indexing API
- [ ] Više vodiča (Anerkennung, stalni boravak, državljanstvo)

## 💡 ZA POSLIJE
- Ispovijesti sekcija, Telegram kanal, TikTok video

---

## 📅 SESIJA 2026-07-27 (PWA + kalkulator + vodiči + legal + CPU)

### Google
- [x] Google Analytics (NEXT_PUBLIC_GA_ID) — radi
- [x] Search Console verifikovan (public/google4c6a50a83f529ec1.html — NE brisati), sitemap poslat

### PWA aplikacija
- [x] manifest.json, sw.js (bez keša), KN ikonice (192/512 + apple-touch)
- [x] components/BottomNav.tsx — donja traka (Vijesti/Vodiči/Brutto-Netto)
- [x] layout.tsx — manifest + theme-color + appleWebApp + SW registracija
- [x] Install baner (InstallPrompt.tsx): Android/desktop dugme, iPhone uputstvo; brojač u adminu (/api/track-install)
- [ ] Supabase tabela app_instalacije (SQL) — ČEKA korisnika

### Brutto-Netto kalkulator (public/kalkulator-app/ u iframe-u na /brutto-netto)
- [x] Ubačen + admin link ispod "Facebook"
- [x] Boja plava→zelena, bosanski default, PDF→"Podijeli" (native share), stepper + "Unesite podatke"
- [x] vercel.json: X-Frame-Options DENY→SAMEORIGIN (da iframe radi)
- [x] iframe allow="web-share"

### Vodiči app-dizajn
- [x] Kategorije + čipovi + kartice s ilustracijama (6 SVG u public/vodic-ilustracije/)
- [x] Detalj: hero + poglavlja + share; lista spaja bazu + kod (svih 38); detalj fallback na kod

### Impressum + Datenschutz
- [x] /impressum + /datenschutz (njemački, DSGVO) + linkovi u Footer
- [x] Podaci: Dzena Karg, Korbinianstraße 1, 80807 München, info@kodnas.de
- [ ] info@kodnas.de forwarding (Namecheap Redirect Email) — ČEKA korisnika
- [ ] cookie-baner za GA pristanak (opciono)

### Vercel CPU optimizacija (Hobby, Active CPU ~81%)
- [x] app/clanak/[slug]: uklonjen zaostali force-dynamic (poništavao revalidate=300) → ISR
- [x] app/vodic/[slug] + app/vodici → revalidate=600 + osvjeziSajt() u vodici admin
- [x] Potvrđeno: bot piše na GitHub Actions (ne troši Vercel CPU); broj_pregleda se ne kvari keširanjem
