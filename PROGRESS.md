# PROGRESS LOG — KODNAS.DE

## STATUS: LIVE + bot 2.0 (lijevak) radi; sve pushovano
Zadnji update: 2026-07-17

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
