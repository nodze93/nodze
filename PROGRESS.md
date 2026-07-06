# PROGRESS LOG — KODNAS.DE

## STATUS: LIVE i bot radi end-to-end ✅
Zadnji update: 2026-07-06

## ✅ URAĐENO (do sad)
- [x] Domena kodnas.de kupljena (Namecheap) i povezana na Vercel
      - A record: @ → 216.198.79.1
      - CNAME: www → ec48c866504a9103.vercel-dns-017.com
- [x] GitHub repo (github.com/nodze93/nodze), Vercel projekt, Supabase baza
- [x] Portal deployed i LIVE na kodnas.de
- [x] Build popravke: sadrzaj prop, TagTip cast, ignoreBuildErrors, force-dynamic
- [x] Next.js podignut na ^15.3.0 (Vercel je blokirao staru zbog CVE)
- [x] Oba Claude modela na Haiku (MODEL_BRZI + MODEL_PISAC) radi uštede
- [x] BOT PREBAČEN NA GITHUB ACTIONS (ne Vercel — nema 60s timeouta)
      - bot-cron.yml: checkout → Node 22 → npm install → npx tsx scripts/run-bot.ts
      - Node MORA biti 22 (Supabase treba native WebSocket; Node 20 puca)
      - npm install (NE npm ci — nema package-lock.json)
      - GitHub secrets: ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY, (UNSPLASH_ACCESS_KEY opcionalno)
- [x] KRITIČNA GREŠKA RIJEŠENA: Supabase URL je imao pogrešan ref (19 znakova)
      - Tačan ref ima 20 znakova: nfqhnhtktktlyqlwhcsj
      - Tačan URL: https://nfqhnhtktktlyqlwhcsj.supabase.co
- [x] Vercel ključevi popravljeni (bili su Invalid API key):
      - SUPABASE_SERVICE_ROLE_KEY = sb_secret_... (novi Supabase format)
      - NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_... (novi format)
- [x] lib/supabase.ts: anon ključ ima fallback na service role (da bot import ne puca)
- [x] RSS izvori očišćeni:
      - Klix.ba popravljen: https://www.klix.ba/rss (staro /rss/naslovnica bilo 404)
      - Izbačeni mrtvi: Klix Sport, Al Jazeera Balkans, Make it in Germany (404)
      - Dodan Avaz Sport: https://avaz.ba/rss/sport (bosanski sport)
- [x] POTVRĐENO END-TO-END: bot piše → sprema u bazu → admin objavi → izlazi na kodnas.de
      - Prvi pravi članci objavljeni (Marine Le Pen, Reforma zdravstvenog osiguranja)

## 🚧 U TOKU
- LIVE widget (Vijesti iz Njemačke/BiH) — mijenjamo da pokazuje NAŠE članke
  umjesto vanjskih RSS naslova. Badge zadržava originalni izvor (N1, Spiegel...),
  klik vodi na naš članak (/clanak/slug). Fajlovi: components/LiveVijesti.tsx, lib/live.ts

## 📋 TODO
- [ ] Završiti LIVE widget → naši članci + badge izvora
- [ ] Provjeriti da bot radi automatski 2x dnevno (08:00 i 20:00 Berlin / 06:00 i 18:00 UTC)
- [ ] (Opcionalno) Unsplash ključ za slike — sad su sive prazne kutije
- [ ] Autor bio / O nama stranica
- [ ] Article schema markup (SEO)

## 🐛 POZNATI PROBLEMI
- Slike članaka su prazne (sive) — nema UNSPLASH_ACCESS_KEY (opcionalno)
- lib/live.ts još ima stare feed URL-ove (Klix /rss/naslovnica, Make it in Germany)
  — ali to mijenjamo kad prebacimo widget na naše članke

## 💡 ZA POSLIJE (ne sad)
- 30-40 statičnih vodiča
- Ispovijesti sekcija, Newsletter, Telegram kanal, TikTok video

## ⚙️ VAŽNO ZA UBUDUĆE — kako se mijenja kod
- Cowork (cloud) NE MOŽE push na GitHub (403). Claude šalje fajl → korisnik
  ga kopira u C:\Users\dzena\Documents\GitHub\nodze\ → GitHub Desktop commit + push.
- Bot se ručno testira: GitHub → Actions → "Dijaspora bot" → Run workflow
  (NE "Re-run" — to koristi staru verziju!).
- Env varijable u Vercelu se mijenjaju: Settings → Environment Variables → Edit,
  PA OBAVEZNO Deployments → Redeploy (inače promjena ne djeluje).
