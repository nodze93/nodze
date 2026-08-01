# PLAN: model REGIJA umjesto 8.200 PLZ (akcije)

## Zašto
Njemačka ima ~8.200 PLZ, ali se **ponude ne razlikuju po PLZ-u nego po regiji**, a većina je **nacionalna**. Trenutno dupliramo iste ponude preko par uzoraka-gradova (85737, 80331, 80807, 70173, 60311, 10115) — nepotrebno i ne skalira.

Cilj: čuvati ponudu po **(lanac + regija)**, a **bilo koji** PLZ preslikati u njegovu regiju.

## Regije ("kante") — koliko ih stvarno ima
- **`DE`** = nacionalno: Kaufland, Lidl, Netto, Penny, dm, OBI (isto svugdje)
- **`aldi-sued`**, **`aldi-nord`** = Aldi dvije polovine Njemačke
- (kasnije) **`rewe-<regija>`**, **`edeka-<regija>`** = franšize, po Bundeslandu/Marktgebietu (nekoliko desetina, NE 8.200)

Dakle ukupno ~2–30 kanti, ne 8.200.

---

## Korak 1 — BAZA (migracija)
1. Nova kolona `scope text` na `ak_discounts` (npr. `'DE' | 'aldi-sued' | 'aldi-nord' | 'rewe-…' | 'edeka-…'`).
   - Zadržati staru `plz` kolonu privremeno (dok se sve ne prebaci), pa je ukloniti na kraju.
2. Snapshot i dalje delete-then-insert, ali po **`(scope, date, source)`** umjesto `(plz, date, source)`.
3. `ak_scrape_runs`: isto `plz` → `scope`.
4. **Mapa PLZ→regija** — nova tabela:
   ```
   ak_plz_region (
     plz          char(5) primary key,
     aldi         text,          -- 'sued' | 'nord'
     bundesland   text,          -- za REWE/Edeka kasnije
     rewe_region  text,          -- kasnije
     edeka_region text           -- kasnije
   )
   ```
   Puni se JEDNOM iz javnog dataseta (PLZ→Bundesland je besplatno; Aldi granica ima gotove liste). ~8.200 redova, ali sitni i statični.
   - Alternativa bez tabele: funkcija po prefiksu PLZ-a. **Ne preporučujem** za Aldi granicu (nije čist prefiks) — tabela je tačnija.

## Korak 2 — SCRAPER (`scraper/src/sources/retailers.ts`)
1. Ukloniti petlju po PLZ-u i `JUG`/`SJEVER` liste.
2. Svaki lanac ima **fiksni `scope`**:
   - Kaufland → `DE`
   - Aldi Süd → `aldi-sued`, Aldi Nord → `aldi-nord`
3. Povuci svaki lanac **jednom**, upiši sa njegovim `scope` (nema više dupliranja).
4. `index.ts`/`db.ts`: `replaceSnapshot(scope, date, rows)`.

## Korak 3 — API (`app/api/akcije/*`, `lib/akcije-server.ts`)
1. `/api/akcije/discounts?plz=XXXXX`:
   - preslikaj korisnikov PLZ → regije: `['DE', aldiRegija(plz)]` (+ kasnije rewe/edeka)
   - vrati ponude gdje `scope IN (te regije)`
2. `stores` i `categories` isto po regijama.
3. RPC `ak_discounts_search` prima `scope[]` umjesto `plz` (ili API filtrira nakon RPC-a).

## Korak 4 — FRONTEND
1. Zamijeni listu gradova s **poljem "Unesi svoj PLZ"** (5 cifara, validacija).
2. Zapamti PLZ u cookie/localStorage (već postoji `PlzProvider`).
3. Prikaz spaja nacionalne + regionalne ponude (korisnik ne vidi "scope", samo svoje ponude).

## Korak 5 — PLZ→REGIJA PODACI
- **Aldi granica**: postoje gotove javne liste PLZ→(Nord/Süd). Uvesti ih jednom u `ak_plz_region.aldi`.
- **Bundesland**: PLZ→Bundesland javni dataset → puni `bundesland` (za REWE/Edeka kasnije).
- REWE/Edeka regije: mapiranje Bundesland→regija dodajemo **tek kad počnemo skidati te lance**.

---

## Redoslijed migracije (bez pada sajta)
1. Dodaj `scope` (nullable) + `ak_plz_region` tabelu, popuni mapu.
2. Popuni `scope` na postojećim redovima (Kaufland→`DE`, München-PLZ Aldi→`aldi-sued`, Berlin Aldi→`aldi-nord`).
3. Deploy **scrapera** koji piše `scope` (paralelno sa starim `plz` još radi).
4. Deploy **API-ja** koji čita po `scope` (preko PLZ→regija).
5. Deploy **frontenda** sa poljem za PLZ.
6. Kad sve radi: ukloni staru `plz` logiku i uzorke-gradove.

## Odluke / rizici
- **REWE/Edeka granularnost**: Bundesland-nivo je sasvim dovoljno za početak (ne treba po marketu).
- **Aldi granica**: koristiti provjeren PLZ→region dataset (ne pogađati prefiksom).
- Admin "PLZ pokrivenost" postaje **"Regije"** (DE / jug / sjever + broj ponuda) — mnogo čitljivije.

## Procjena
- Baza + mapa: pola dana (najviše priprema dataseta PLZ→regija).
- Scraper + API + frontend: dan-dva.
- Rizik nizak jer se radi u koracima (stara i nova logika koegzistiraju dok se ne prebaci).

---

# SLJEDEĆI KORAK — RASPORED /akcije, DATUMI I QA (dogovoreno)

## Raspored stranice /akcije
- **„Top ponude danas"** (traka gore): sortirano po popustu, prikaži **≥30%** (fallback: **top 10 po %** ako ih je malo taj dan), **BEZ filtera**, ~10–12 kartica. Kartica: „Vrijedi do DD.MM".
  - Preimenovati postojeće „Top ponude **ove sedmice**" → „Top ponude **danas**".
- **„Sve akcije"** (ispod): sve što danas vrijedi + **PUNI filteri** (uključujući novčani/ušteda). Tu je mjesto svim filterima.
- Artikli bez stare cijene („Angebot", nemaju %) ne idu u „Top" → prirodno padnu u „Sve akcije".

## Datumi (valid_from / valid_to)
- **Scraper vadi tačne datume:** Aldi Süd grupiše po sekcijama („Wochenangebote Mo 27.7–Sa 1.8.", „Angebote ab Donnerstag 30.7." …) → `valid_from` = datum sekcije, `valid_to` = subota te sedmice. Aldi Nord i Kaufland — pogledati istu stvar (svaki svoja struktura). Paziti: stranica pokazuje i SLJEDEĆU sedmicu → uzeti samo pravu.
- **Filter u prikazu:** pokaži ponudu samo ako je `valid_from ≤ danas ≤ valid_to` (null tretiraj kao „uvijek važi"). To je ideja „skini sedmicu jednom → prikazuj dan po dan".
- **Kartica:** „Vrijedi do DD.MM" (VEĆ postoji, treba samo podatak). „Od" se NE piše — ponuda se sama „upali" kad počne (npr. ab Donnerstag → pojavi se tek u četvrtak).
- Import (marktguru) već daje `validFrom`/`validTo`; scraper je taj koji fali.
- Diagnostički log u scraperu (datum po artiklu) → provjera na prvom pravom runu (jer se ne može testirati iz sandboxa).

## Frontend — QA + DIZAJN / DOTJERIVANJE (POSEBNO MOBILNA)
Ne samo popravka bugova — **pun vizuelni pas: da /akcije izgleda čisto i profesionalno**, kao ozbiljna „deal" aplikacija, ne skica.

**Bugovi (obavezno popraviti):**
- preklapanje slova / teksta na karticama i sekcijama,
- da ništa ne „bježi" sa stranice (horizontalni overflow),
- da stranica ne skače / ne pomjera se (layout shift pri učitavanju),
- klik na **filter** → otvara se PRAVI filter (ne nešto random / prazno).

**Dotjerivanje (izgled):**
- dosljedan razmak / padding / poravnanje kartica i sekcija,
- tipografska hijerarhija (naziv, cijena, −%, „Vrijedi do"),
- dizajn kartice: slika · naziv · cijena · badge popusta · datum — uravnoteženo i čisto,
- dosljedne boje / akcenti (brend),
- **mobilna:** 2 kolone, čitljive veličine, dovoljno veliki dodirni ciljevi, uredan filter-sheet, rail koji lijepo klizi, uredna prazna/loading stanja.

**Metod:** Claude uživo kroz Chrome (desktop + mobilni viewport) + screenshotovi, pa iterativno dotjeruje dok ne izgleda kako treba.

## Install prompt — ne dosađivati instaliranim korisnicima
- Već pokriveno: standalone (gleda kroz app) i Android kad app postoji.
- **Doraditi:** iOS slučaj (instalirana app, ali otvoreno u Safariju) + „Kasnije" da pamti duže (npr. par dana preko localStorage, ne samo sesija), da ne iskače stalno.
