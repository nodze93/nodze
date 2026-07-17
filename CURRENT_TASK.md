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

### Facebook (brend)
- Napravljena profilna (KN krug) + cover (novinarski stil, sužen za mobilni)
- Napisan prvi post ("Introduce yourself")

## ⚠️ RUČNI KORACI KOJI ČEKAJU KORISNIKA
1. **Pokrenuti `supabase/dijeljenja.sql`** u Supabase → da brojanje dijeljenja radi
2. **Postaviti kvote** u admin → Pipeline → "Koliko članaka po pokretanju" → Snimi
3. **Google Analytics**: napraviti GA4 property, uzeti Measurement ID (G-XXXX),
   dodati `NEXT_PUBLIC_GA_ID` u Vercel env, pa Redeploy

## 🎯 SLJEDEĆI KORACI (dogovoreni redoslijed)
1. **Promocija + Facebook setup** (dovršiti FB stranicu, prvi postovi, širenje)
2. **Google** (Analytics + Google Search Console verifikacija + submit sitemap)
3. **Impresum i Datenschutz** (OBAVEZNO prava podaci — bez placeholdera!)

## PROMPT ZA SLJEDEĆI CHAT
"Otvori PROJECT_MEMORY.md, PROGRESS.md, CURRENT_TASK.md. Šta smo radili? Šta je sljedeći korak?"

## STATUS
🟢 Sve pushovano i radi. Ostaju 3 ručna koraka gore + sljedeći koraci (promocija → Google → Impresum/Datenschutz)
