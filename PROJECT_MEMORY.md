# KODNAS.DE — PROJECT MEMORY

## KO SAM JA
- Nisam developer, objašnjavaj mi na bosanskom
- Budžet: MAX €15/mj Claude API
- Domena: kodnas.de

## CILJ
News portal za Bosance u Njemačkoj i Austriji. Bot piše vijesti 2x dnevno automatski.
Cilj: pusti da radi sam sa minimalnim mojim učešćem.

## STACK
- Next.js 15 (App Router)
- TypeScript
- Tailwind
- Supabase (baza)
- Claude API (Haiku 4.5 za sve agente da uštedim)
- Vercel Hobby (besplatno)
- GitHub Actions (cron za bot, besplatno)

## MODELI
- MODEL_BRZI: claude-haiku-4-5
- MODEL_PISAC: claude-haiku-4-5 (promijenjeno sa Sonnet radi ušteda)

## VAŽNA PRAVILA
1. NIKAD ne push direktno na main (osim hitnih fix-ova)
2. UVIJEK preview branch prvo
3. Pre push, uvijek `npm run build` lokalno
4. Ako build ne prođe — NE PUSH
5. Mali commiti, ne veliki
6. Objasni mi jednostavno, korak po korak

## AUTO-PUBLISH PRAVILA
- 🟢 ZELENI članci → auto-publish
- 🟡 ŽUTI članci → draft (email meni)
- 🔴 CRVENI članci → obriši

## KLJUČNE DATOTEKE
- /lib/bot/pipeline.ts — srce bota
- /lib/bot/izvori.ts — RSS izvori (16 feedova)
- /lib/bot/agenti/writer.ts — pisanje
- /lib/bot/agenti/factcheck.ts — provjera
- /lib/bot/agenti/jezik.ts — bosanski lektor
- /app/admin/ — admin panel
- .github/workflows/bot-cron.yml — cron 2x dnevno

## ENV VARIJABLE (Vercel + GitHub Secrets)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ANTHROPIC_API_KEY
- CRON_SECRET
- SITE_URL = https://kodnas.de

## SUPABASE
- Project ID (TAČAN, 20 znakova): nfqhnhtktktlyqlwhcsj
- URL: https://nfqhnhtktktlyqlwhcsj.supabase.co
- NOVI format ključeva (ovaj projekt):
  - Publishable (= anon): sb_publishable_...  → NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Secret (= service role): sb_secret_...     → SUPABASE_SERVICE_ROLE_KEY
- Tabele: clanci, obradjeni_linkovi, pipeline_logovi, vodici, newsletter_subscribers, kontakt_poruke
- RLS enabled, anon čita samo published, service_role (admin+bot) zaobilazi RLS

## GITHUB
- Repo: github.com/nodze93/nodze
- Branch: main (production)
- GitHub Actions secrets: SITE_URL, CRON_SECRET postavljeni

## VERCEL
- Projekat: nodze-delta.vercel.app
- Domena: kodnas.de (A record: 216.198.79.1, CNAME www: ec48c866504a9103.vercel-dns-017.com)
- Build: ignoreBuildErrors: true, ignoreDuringBuilds: true

## KADA POČNEŠ NOVI CHAT
1. PRVO pročitaj PROJECT_MEMORY.md
2. PRVO pročitaj PROGRESS.md
3. PRVO pročitaj CURRENT_TASK.md
4. Reci mi: "Razumijem projekat. Šta radimo?"
5. NE mijenjaj kod dok ne dogovorimo plan.
