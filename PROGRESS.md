# PROGRESS LOG — KODNAS.DE

## STATUS: LIVE + bogat feature set (na preview-u, čeka finalni push/merge)
Zadnji update: 2026-07-06

## ✅ URAĐENO

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
