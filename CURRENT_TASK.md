# TRENUTNI ZADATAK

## Datum: 2026-08-01

## STANJE
- Portal LIVE: kodnas.de — radi
- Bot: radi preko GitHub Actions, piše draftove
- **/akcije radi sa 4 lanca**: Aldi Süd, Aldi Nord, Kaufland (scraper) + Lidl (JSON uvoz)
- Sve od danas je commitovano i pushovano. SQL migracije pokrenute u Supabaseu.

## ✅ ŠTA JE URAĐENO DANAS
Detaljno u `PROGRESS.md` (sesija 2026-08-01). Ukratko:

1. **Duplikati** — 12 od 72 ponude su bili isti artikal. Čisti se u scraperu I u API-ju.
2. **Naslov** — „Top ponude danas → Pogledaj sve" više ne vodi na stranicu koja piše „Sve akcije".
3. **Datumi važenja** — scraper sada čita period iz naslova sekcija na stranicama lanaca;
   sajt pokazuje samo ono što DANAS važi; kartica piše „Vrijedi do DD.MM".
4. **JSON uvoz** — bio potpuno pokvaren (falila kolona `source`, dupli omot, scraper ga brisao).
   Sada radi; ručni uvoz živi po datumu važenja, ne po snapshotu.
5. **Lidl** — 58 ponuda uvezeno. Namirnice se NE mogu skrejpati (flipbook slika).
6. **Slike** — `images:check` čisti mrtve linkove pa ih Open Food Facts popuni.

## 🎯 SLJEDEĆI ZADATAK: SVI PLZ-ovi (model REGIJA)

Sada pokrivamo samo **6 gradova** (85737, 80331, 80807, 70173, 60311, 10115). Ko unese
bilo koji drugi PLZ — ne vidi ništa. Cilj: **svih ~8.200 njemačkih PLZ-ova**.

Plan je već napisan i dogovoren: **`PLAN-REGIJE.md`**.

Suština: ponude se ne razlikuju po PLZ-u nego po REGIJI, i većina je nacionalna.
Umjesto 8.200 kopija istih podataka → nekoliko „kanti":
- `DE` = nacionalno (Kaufland, Lidl, Netto, Penny, dm, OBI)
- `aldi-sued` / `aldi-nord` = dvije polovine Njemačke
- (kasnije) `rewe-<regija>`, `edeka-<regija>` po Bundeslandu

Korisnikov PLZ se preslika u regije: `['DE', aldiRegija(plz)]`.

### Otvoreno pitanje prije koda
**Odakle tačna mapa PLZ → Aldi Nord/Süd?** Granica („Aldi-Äquator") nije čist prefiks —
sječe NRW i Hessen. Treba provjeren javni dataset + njegova licenca.
PLZ → Bundesland je lakše (prefiks je dobra aproksimacija), ali treba tek za REWE/Edeka.

## ⏳ ČEKA KORISNIKA (ručno)
1. `info@kodnas.de` još ne radi → Namecheap → Redirect Email → alias `info` → nodze93@gmail.com
2. SQL za tabelu `app_instalacije` (brojač PWA instalacija)
3. (opciono) cookie-baner za GA pristanak
4. Ponedjeljkom: novi Lidl JSON za sljedeću sedmicu (KW32) — mora se presložiti na naše PLZ-ove
   dok ne pređemo na regije

## RADNI DOGOVOR (bitno)
- Claude UVIJEK radi na NAJSVJEŽIJOJ verziji fajla; prije izmjena provjeri da se lokalni
  HEAD poklapa sa `origin/main` i javi ako se razilaze.
- Korisnik: Commit + Push čim se izmjena napravi.
- NE mijenjati kod dok se plan ne dogovori.

## PROMPT ZA SLJEDEĆI CHAT
"Otvori PROJECT_MEMORY.md, PROGRESS.md, CURRENT_TASK.md, PLAN-REGIJE.md. Radimo regije."

## STATUS
🟢 Sve pushovano i radi. Sljedeće: prelazak sa 6 uzoraka-gradova na REGIJE (svi PLZ).
