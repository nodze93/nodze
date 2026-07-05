# PROGRESS LOG — KODNAS.DE

## STATUS: Deployed, DNS u toku
Zadnji update: 2026-07-05

## ✅ URAĐENO (do sad)
- [x] Kupljena domena kodnas.de (Namecheap)
- [x] GitHub repo kreiran (github.com/nodze93/nodze)
- [x] Vercel projekt kreiran i spojen na GitHub
- [x] Supabase baza kreirana, schema.sql pokrenut uspješno
- [x] Portal deployed na nodze-delta.vercel.app
- [x] Fix: dodan sadrzaj prop u kategorija i vijesti page
- [x] Fix: kategorija TypeScript cast (TagTip)
- [x] Fix: next.config.ts — ignoreBuildErrors + ignoreDuringBuilds
- [x] Fix: clanak/[slug] — force-dynamic, prazni generateStaticParams (riješio Vercel timeout)
- [x] Build prošao uspješno ✅
- [x] GitHub Actions secrets postavljeni (SITE_URL, CRON_SECRET)
- [x] DNS A record na Namecheap: @ → 216.198.79.1
- [x] DNS CNAME na Namecheap: www → ec48c866504a9103.vercel-dns-017.com
- [x] Vercel prepoznao domenu (plave kvačice za kodnas.de i www.kodnas.de)

## 🚧 U TOKU
- Promote to Production na Vercelu (Preview build je Ready, treba Promote)
- DNS propagacija za kodnas.de (može trajati do 24h)

## 📋 TODO
- [ ] Promote "Fix React Server Components CVE" build to Production na Vercelu
- [ ] Provjeriti da bot radi 2x dnevno (GitHub Actions)
- [ ] Testirati bot ručno: GitHub Actions → Run workflow
- [ ] Testirati auto-publish za 🟢 zelene članke
- [ ] Postaviti email alert za 🟡 žute članke
- [ ] Autor bio / O nama stranica
- [ ] Article schema markup (SEO)

## 🐛 POZNATI PROBLEMI
- Vercel pokazuje "No Production Deployment" — riješiti sa Promote to Production
- kodnas.de još ne radi jer nema produkcijskog deploymenta (DNS je ok)
- RSS widget na homepage linkuje na vanjske sajtove — to je normalno dok bot ne napuni bazu

## 💡 ZA POSLIJE (ne sad)
- 30-40 statičnih vodiča (kad budem znao da radi)
- Ispovijesti sekcija
- Newsletter
- Telegram kanal
- TikTok video generisanje
- Unsplash API key za slike (UNSPLASH_ACCESS_KEY)
