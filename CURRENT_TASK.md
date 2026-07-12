# TRENUTNI ZADATAK

## Datum: 2026-07-12

## ŠTA SMO RADILI (ova sesija) — sve upisano u folder
Zaštićen ostaje samo `.github/workflows/bot-cron.yml` (most ga ne može pisati).

### 1. AUDIT SAJTA + čišćenje (frontend)
- Footer: rebrand (staro "dijaspora.ba" → logo), izbačena Austrija/Švicarska,
  izbačeni MRTVI linkovi (/newsletter, /oglasavanje → sad /vijesti, /vodici).
- Uklonjeni "uvijek mrtvi" linkovi: Hero bočne kartice i NajcitanijeBox sad
  vuku PRAVE članke iz baze (fallback = pravi vodiči), ne izmišljene /clanak/.
- Izbačeni BiH-mock fallbackovi (page.tsx, NajnovijeSection, NajpopularnijeSection)
  — prazna sekcija se sad sakrije umjesto da nudi lažne linkove.
- Rebrand + de-Austrija: o-nama, vijesti, vodici, FaqBox, ai-chat.
- Newsletter forma SPOJENA na /api/newsletter (prije samo "TODO", nije snimala).

### 2. LOGO — novi wordmark "Dnevni filter njemačkih vijesti"
- Varijanta D (verzal, novinski): "DNEVNI FILTER" + sitnije "NJEMAČKIH VIJESTI".
- Nav.tsx (header + drawer) i Footer.tsx. Staro "Kod nas u…" IZBAČENO.

### 3. VODIČI — sve grupe kompletirane (17 → 31 vodiča)
- Stan i najam: 1 → 8 (Mietvertrag, Kaucija, Nebenkosten, prava stanara,
  otkaz, Wohngeld/WBS, struja/internet/Rundfunkbeitrag).
- Zdravstvo: 1 → 8 (kod ljekara, hitno 112/116117, bolovanje, zubar, lijekovi,
  djeca/pedijatar, dopunsko+mentalno zdravlje).
- Porodica: 1 → 8 (Elterngeld/Elternzeit, Kita, vjenčanje/Standesamt, škola,
  razvod/Unterhalt, dijete rođeno u DE, njega starijih/Pflege).
- Provjerene brojke 2026: Kindergeld 259€, Rundfunkbeitrag 18,36€, Mietpreisbremse
  do 2029, Pflegegeld PG2~347/PG3~599/PG4~800/PG5~990€. Popravljena 2 ćirilična slova.
- lib/data/vodici.ts: sada viza 7, stan 8, zdravstvo 8, porodica 8, posao 3, +1 svaka.

### 4. BOT 2.0 — "LIJEVAK" (pipeline2) — NOVA ARHITEKTURA
Cilj: pročitaj mnogo, objavi malo. AI skupo radi samo na ~8 članaka/dan.
Tok: ~1500 RSS → dedupe link → PRAVILA (bez AI) → KLJUČNE RIJEČI+tier (bez AI, top 40)
→ AI TRIAŽA (jedan poziv, naslov+opis) → dedupe tema → za pobjednike WRITER čita
cijeli tekst i piše → fact-check/jezik → draft.
- NOVO: lib/bot/izvori-prosireni.ts (izvori po slojevima/tier), lib/bot/lijevak/pravila.ts,
  lib/bot/lijevak/kljucne.ts, lib/bot/agenti/triaza.ts, lib/bot/pipeline2.ts.
- Izmijenjeno: rss.ts (fetchIzvore), pipeline.ts (prekidač NOVI_PIPELINE=on),
  scripts/run-bot.ts (lijevak je PODRAZUMIJEVAN; stari = NOVI_PIPELINE=off), tipovi.ts.
- Dokumentacija: BOT-LIJEVAK.md.
- Env štimanje: PRAG_TRIAZA (68), BROJ_OBJAVA (8), TOP_ZA_TRIAZU (40), MAX_STAROST_SATI (36).

### 5. BOT — popravke nakon prvog testa
- Triaža je pukla ("max_tokens/ocjene not iterable") → sad radi u grupama po 20,
  izbačeno "razlog" polje, dodana zaštita od krnjeg odgovora.
- Izbačena 3 mrtva feeda (Bundesregierung, Focus, Köln — 404/403).
- PRVI TEST (run #33): lijevak radi, piše draftove. ✅

### 6. MEMORIJA TEMA (bez ažuriranja starih članaka!)
- publisher.ts ucitajNedavneNaslove() — naslovi zadnjih 3 dana → signal triaži.
- Triaža dobije "već objavljeno" listu: ista priča bez novog = "vec_poznato"
  (spusti), NOVI razvoj iste teme (rezolucija štrajka) = nova vijest (prođe).
- ODLUKA korisnika: NE ažurirati/dopunjavati stare članke (rezolucija štrajka je
  nova vijest, ne dodatak starom). Svaki razvoj = svoj članak.

### 7. TVRĐA DEDUPE (protiv ponavljanja istog članka)
- dedupe.ts: normLink() (skini ?/#/trailing slash) + istaTemaStrogo() (≥3 iste
  riječi ILI jaccard ≥0.55 — strogo, da "novi razvoj" prođe).
- pipeline2.ts: normalizovan link-dedupe + izbaciVecObjavljene() preko dana.

### 8. SCROLL FIX (pull-to-refresh)
- components/ScrollNaVrh.tsx — pravi uzrok bio browser "scroll restoration"; sad
  se na reload isključi pa forsira vrh više puta, a "nazad" i dalje pamti poziciju.

### 9. ADMIN ZA TELEFON (ponovo — prošli put nije stvarno radilo)
- app/admin/layout.tsx — sidebar je bio uvijek vidljiv (jeo pola ekrana); sad je
  fioka na ☰ dugme, sadržaj koristi cijelu širinu. Logo "kodnas.de".
- app/admin/clanci/page.tsx — tabela (6 kolona) → KARTICE na telefonu s velikom
  dugmadi (✅ Objavi / ✏️ Uredi / 🗑️). Desktop ostaje tabela.

## STANJE
- Portal LIVE: kodnas.de. Lijevak (pipeline2) potvrđeno piše draftove.
- Sve izmjene u folderu, spremne za Commit → Push.

## ⚠️ VAŽNO — nesklad koji treba znati
- Bot-BACKEND (izvori.ts, filter.ts, publisher.ts, pipeline.ts) JOŠ IMA BiH
  (Klix/N1/Slobodna Evropa, BiH filter, "bih" kategorija, kBih kvota), iako je
  frontend očišćen. NOVI lijevak (pipeline2) je već čist. Kad se koristi lijevak,
  nesklad je nebitan. (Opcija: očistiti i stari pipeline od BiH — nije urađeno.)

## SLJEDEĆE (dogovoreno, nije urađeno)
- ADUT: "Šta ovo znači za dijasporu?" okvir ispod svakog članka (ko je pogođen,
  treba li nešto uraditi, od kada važi, važi li svuda ili samo neke pokrajine,
  link na službeni izvor). PRVI sljedeći zadatak.
- Trend detector (5 izvora ista tema u sat → prioritet) — poslije memorije.
- Geo score — kasnije (treba podatke gdje su čitaoci).
- Ostali admin ekrani (Dashboard, Pipeline, uređivanje članka, moderacijski prozor)
  mogu imati sitnije mobilne probleme — po potrebi (screenshot).
- Faza 1.5: DWD (vrijeme) + Deutsche Bahn (štrajk) preko posebnog fetchera (JSON/API).

## STATUS
🟢 Lijevak radi i piše. Čeka Commit → Push. Sljedeće: "Šta ovo znači za dijasporu?".
