# TRENUTNI ZADATAK

## Datum: 2026-07-17

## STANJE
- Portal LIVE: kodnas.de — radi super
- Bot: radi preko GitHub Actions, piše draftove; njemački/svijet/sport OK
- Sve od danas je PUSHOVANO i deployano

## ✅ ŠTA SMO RADILI DANAS (2026-07-17)

### Bot — lektor (gramatika) na Sonnet
- Lektor (lib/bot/agenti/jezik.ts) prebačen na **claude-sonnet-5** (novi MODEL_LEKTOR)
  — najjači za bosansku gramatiku. Ostatak bota (pisanje, triaža, fact-check) ostaje Haiku.
- maxTokens 3000 → **8000** (ranije se odgovor odsijecao na dužim člancima)
- ZAŠTITA: ako lektor vrati krnj odgovor, članak se sačuva s ORIGINALNIM tekstom
  (ne ruši se). Ovo je bio pravi uzrok "greška u obradi" za njemačke članke — RIJEŠENO.
- Izbačena detaljna lista ispravki iz odgovora → Sonnet jeftiniji + rjeđe se siječe.
- Jezička pravila dodana: istorija→historija (H-oblici), IJEKAVICA (prijevoz NE prevoz),
  futur ODVOJENO (donosit će, bit će), glagoli na -iti u 3. licu množine -e (ruše, ne rušu).

### Bot — kvote iz admina STVARNO rade
- pipeline2 sad čita bot_config (dajBotConfig) i poštuje kvote po kategoriji (DE/svijet/sport).
- Maksimum, ne garancija (ako nema dobrih priča — piše manje).
- Podrazumijevano bumpano: DE 5, svijet 3, sport 3.

### Bot — protiv duplikata
- Triaža stroža: vec_poznato množi ocjenu 0.3, oštriji prompt da hvata istu temu drugačije sročenu.

### Admin
- Uklonjeno DUPLO "Pokreni odmah" dugme s Dashboarda (ostaje ono na Pipeline stranici).
- Status runa: "Djelimično" (žuto) umjesto crvene "Greška" kad je nešto napisano + poneka greška.
- Kolona 📤 (broj dijeljenja) u listi članaka; API otporan ako kolona još ne postoji.

### Podjela članaka (share)
- Dugme "Podijeli" ispod slike (Web Share API, klix stil) — components/DijeliDugme.tsx
- API /api/clanak/[slug]/dijeli + supabase/dijeljenja.sql (kolona broj_dijeljenja + RPC)
- Datum i "Podijeli" u istom redu ispod slike (bez "min čitanja")

### Frontend
- /de: dugme "Učitaj još" (components/DeLista.tsx) + popravljen limit (vidi se i stariji članci)
- Izbačena "AI asistent" sekcija sa /o-nama
- Sport podnaslov promijenjen: "Bundesliga, svjetski fudbal i veliki mečevi" (naslovna + /kategorija/sport)
- Uklonjen Vercel cron iz vercel.json (bio uzrok "c is not iterable")
- Google Analytics spreman: app/layout.tsx čita NEXT_PUBLIC_GA_ID

### Facebook (brend + objava iz admina) — GOTOVO ✅
- Napravljena profilna (KN krug) + cover (novinarski stil, sužen za mobilni)
- Napisan prvi post ("Introduce yourself")
- **FB objava iz admina radi**: 🔵 FB dugme → objavljuje nativni foto-post
  (slika + naslov + link u tekstu) na stranicu Kodnas.de.
- FB_PAGE_ID = 1270099672843899; FB_PAGE_TOKEN (dugotrajni) postavljen u Vercel.
- Pokrenut supabase/facebook.sql (kolona fb_post_id — protiv duplih objava).
- NAPOMENA: link ide u TEKST posta (ne u komentar). Komentar-stil traži dozvolu
  pages_manage_engagement — Facebook OAuth to blokira zbog pages_read_user_content
  (ne može se dodati bez revizije). Za malu stranicu razlika u dosegu je zanemarljiva.
  Ako ikad zatreba komentar-stil: izbaci pages_read_user_content iz use case-a,
  dodaj pages_manage_engagement, generiši novi token, i vrati komentar u lib/bot/facebook.ts.

### Impressum + Datenschutz — GOTOVO ✅
- app/impressum/page.tsx i app/datenschutz/page.tsx (prava podaci: Dzen Karg,
  Korbinianstraße 1, 80807 München; email info@kodnas.de).
- Linkovi dodani u Footer.tsx (i u "Portal" koloni i u donjem redu).

## ⚠️ RUČNI KORACI KOJI ČEKAJU KORISNIKA
1. **Google Analytics**: napraviti GA4 property, uzeti Measurement ID (G-XXXX),
   dodati `NEXT_PUBLIC_GA_ID` u Vercel env, pa Redeploy
   (dijeljenja.sql, facebook.sql, kvote — SVE VEĆ URAĐENO ✅)

## 🎯 SLJEDEĆI KORACI (dogovoreni redoslijed)
1. **Promocija + Facebook** (prvi postovi, širenje) — FB integracija gotova ✅
2. **Google** (Analytics + Google Search Console verifikacija + submit sitemap)
3. ~~Impresum i Datenschutz~~ — GOTOVO ✅

## PROMPT ZA SLJEDEĆI CHAT
"Otvori PROJECT_MEMORY.md, PROGRESS.md, CURRENT_TASK.md. Šta smo radili? Šta je sljedeći korak?"

## STATUS
🟢 Sve pushovano i radi. FB objava + Impressum/Datenschutz gotovi.
Ostaje 1 ručni korak (Google Analytics ID) + sljedeći korak: promocija → Google.
