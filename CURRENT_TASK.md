# TRENUTNI ZADATAK

## Datum: 2026-07-17 (kasna sesija)

## STANJE
- Portal LIVE: kodnas.de — radi
- Bot: radi preko GitHub Actions, piše draftove
- Danas napravljeno 5 popravki (dole). ⚠️ TREBA COMMIT + PUSH da se aktiviraju.

## ✅ ŠTA SMO RADILI (2026-07-17, druga sesija)

### 1. Mobilna naslovna — Svijet i Sport pokazivali samo 1 članak
- Uzrok: `dajLiveSvijet`/`dajLiveSport` (lib/live.ts) su uzimali samo 60 najnovijih iz
  SVIH kategorija pa filtrirali → sport/svijet "ispadali" iz tog prozora.
- Popravka: sada pitaju bazu DIREKTNO po kategoriji (nova `dajObjavljeneOr`), kao /kategorija stranice.
- Fajl: lib/live.ts

### 2. Bot ne piše (0 članaka, "lutrija")
- Uzrok 1: triaža (AI) radila BEZ postavljene temperature → nasumično; isti ulaz
  nekad prođe nekad ne ("2x ništa, 3. put par"). Auto i ručno su INAČE isti kod.
- Uzrok 2: "već poznato" ×0.3 praktično ubija svaki članak koji AI označi, a označava često.
- Popravka (blago, da NE počne pisati duplikate):
  - `temperature: 0` na triažu → dosljedno (glavna popravka).
  - prag 68→61, sport/svijet prag 56→50 (~10% lakše).
  - "već poznato" 0.3→0.35 (sitno).
  - Memorija (3 dana) i tema-dedup NETAKNUTI — štit protiv duplikata ostaje.
- Fajlovi: lib/bot/agenti/claude.ts (dodan temperature param), lib/bot/agenti/triaza.ts

### 3. Vercel Analytics "pokvaren"
- Uzrok: paketi @vercel/analytics i @vercel/speed-insights instalirani, ali komponente
  nikad ubačene u layout → ništa se nije skupljalo.
- Popravka: <Analytics /> i <SpeedInsights /> dodani u app/layout.tsx.
- RUČNO: u Vercel dashboardu upaliti Web Analytics (Enable) ako nije.

### 4. Ime "Dijaspora.ba" → "kodnas.de"
- Tab naslov + open graph (title + siteName) u app/layout.tsx.
- Interni nazivi u kodu (jeDijaspora, naziv workflow-a) NISU dirani (korisnik ih ne vidi).

### 5. Facebook — istekao token + link u komentaru
- Napravljen NOVI TRAJNI Page token (Graph API Explorer → produžen → me/accounts).
- Upisan u Vercel: FB_PAGE_TOKEN (novi), FB_PAGE_ID = 1270099672843899. Redeploy urađen.
- Kod: facebook.ts sada provjerava i vraća je li link-komentar prošao; fb-share ruta
  ispisuje jasnu poruku (uspjeh ili razlog zašto komentar nije prošao).
- Fajlovi: lib/bot/facebook.ts, app/api/admin/fb-share/route.ts

## ⚠️ RUČNI KORACI KOJI ČEKAJU
1. **GitHub Desktop → Commit → Push** (svih 6 izmijenjenih fajlova gore).
   - Sajt (live.ts, layout.tsx, facebook.ts, fb-share) → ide preko Vercela.
   - Bot (claude.ts, triaza.ts) → radi tek nakon push-a (izvršava se na GitHub Actions).
2. Vercel dashboard → Analytics → Enable (ako Web Analytics nije upaljen).
3. Test bota: admin → "Pokreni odmah" par puta → sad bi trebao pisati dosljedno (ne duplikate).
4. Test FB: objavi članak → dugme za dijeljenje → provjeri sliku + link u prvom komentaru.

## 🎯 SLJEDEĆI KORACI (dogovoreni redoslijed, ostaje od prije)
1. Promocija + Facebook setup
2. Google (Analytics + Search Console + submit sitemap)
3. Impresum i Datenschutz (OBAVEZNO pravi podaci — bez placeholdera!)

## RADNI DOGOVOR (bitno)
- Claude UVIJEK radi na NAJSVJEŽIJOJ verziji fajla (povuče iz foldera prije izmjene),
  nikad iz starog snimka — da ne poremeti dizajn.
- Korisnik: Commit + Push čim se izmjena napravi (da se verzije ne razilaze).

## PROMPT ZA SLJEDEĆI CHAT
"Otvori PROJECT_MEMORY.md, PROGRESS.md, CURRENT_TASK.md. Šta smo radili? Šta je sljedeći korak?"

## STATUS
🟡 Sve napravljeno, ČEKA Commit + Push. Nakon push-a: testirati bota i FB objavu.
