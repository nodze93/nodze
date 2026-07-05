# TRENUTNI ZADATAK

## Datum: 2026-07-05

## ŠTA RADIM SADA
Portal je deployed i DNS je postavljen. Treba Promote to Production na Vercelu da kodnas.de počne raditi.

## KONTEKST
- Portal je live: DA — nodze-delta.vercel.app (Preview)
- kodnas.de: DNS ok, ali nema produkcijskog deploymenta još
- Bot: GitHub Actions postavljeni, secrets dodani, NIJE još testiran
- Zadnji commit: 68d2bf4 UPUTSTVO: admin sekcija
- Trenutni branch: main

## SLJEDEĆI KORACI
1. Vercel → Deployments → pronađi "Fix React Server Components CVE vulnerabilities" (Ready, Preview) → tri tačke (...) → "Promote to Production"
2. Provjeri da kodnas.de radi (može trajati par minuta)
3. Testiraj bota ručno: github.com/nodze93/nodze → Actions → bot workflow → "Run workflow"
4. Provjeri admin panel: kodnas.de/admin → Pipeline tab → da li bot piše članke
5. Ako bot radi → članci se pojavljuju na sajtu automatski

## ŠTO OČEKUJEM
- kodnas.de otvara portal (kao nodze-delta.vercel.app)
- Bot piše 3-5 članaka po pokretanju
- Članci se vide na /vijesti i /admin

## PROMPT KOJI KORISTIM (za sljedeći chat)
"Otvori PROJECT_MEMORY.md, PROGRESS.md, CURRENT_TASK.md. Šta smo radili? Šta je sljedeći korak?"

## STATUS
🟡 U toku — čekamo Promote to Production
