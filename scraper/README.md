# Scraper za Akcije

Jednom dnevno pokupi akcije iz njemačkih letaka (KaufDA) i upiše ih u
Supabase, u tabele koje počinju sa `ak_`. Sajt ih onda čita preko
`/api/akcije/*`.

Ovo **nije** dio Next.js aplikacije. Ima svoj `package.json` i svoje
`node_modules`, ne deployuje se na Vercel (vidi `.vercelignore`), i pokreće
ga isključivo GitHub Actions — `.github/workflows/akcije-scraper.yml`.

## Šta treba podesiti (jednom)

1. U Supabase SQL Editoru pokrenuti `supabase/akcije.sql` — pravi tabele i
   funkcije.
2. U istom SQL Editoru pokrenuti `supabase/akcije-trajni-sloj.sql` — dodaje
   trajni sloj (slike/skrivanja koja preživljavaju dnevni snapshot),
   tabelu zdravlja scrapera i alarm. Pokreće se POSLIJE `akcije.sql`.
3. U Supabase: **Settings → Database → Connection string → Session pooler**.
   Kopirati taj string (u njemu je i lozinka baze).
4. U GitHubu: **Settings → Secrets and variables → Actions → New repository
   secret**, ime `DATABASE_URL`, vrijednost je string iz koraka 3.

Scraper piše direktno u Postgres preko `pg`, a ne preko supabase-js, jer
`prices.ts` koristi SQL upit sa `with`/`join` koji kroz REST API ne prolazi
čisto. Zato mu treba connection string, a ne `SUPABASE_SERVICE_ROLE_KEY`.

## Prvo pokretanje

Prije nego se pusti u pravi rad, pokrenuti workflow ručno sa
**`dry_run = true`**. Tada baza nije dirana, a rezultat se skine kao
artifact (`akcije-dry-run`) — tako se odmah vidi ako je KaufDA promijenio
izgled stranice. Nakon toga isti workflow bez `dry_run` upiše podatke.

Dalje ide sam, svaki dan u 04:00 UTC (06:00 ljeti, 05:00 zimi).

## Za koje gradove

`data/plz.txt`, jedan PLZ po liniji. Komentar smije stajati i iza broja.
Dodavanje grada = jedan novi red; sutradan ujutro podaci su tu.

`85737` mora ostati — to je podrazumijevani PLZ na sajtu.

## Lokalno

```bash
cd scraper
npm install
npm test                # 43 testa, ne treba baza
npm run scrape:mock     # izmišljeni podaci, treba DATABASE_URL
npm run layer:apply     # prelije trajni sloj + provjeri zdravlje/alarm
npm run dry-run         # pravi KaufDA, ne dira bazu, piše u out/
```

Za lokalni rad `DATABASE_URL` ide u `scraper/.env` (fajl je u `.gitignore`).

## Kako se podaci obnavljaju

Za svaki `(PLZ, datum)` scraper prvo obriše pa upiše iznova, sve u jednoj
transakciji. Zato je ponovno pokretanje bezbjedno — nikad nema duplikata ni
pola upisanih podataka. Snapshoti stariji od 14 dana se brišu sami.

Sajt uvijek čita najnoviji datum po PLZ-u, pa ako jedno jutro scraper padne,
posjetioci vide jučerašnje akcije umjesto prazne stranice.

## Trajni sloj (odluke koje preživljavaju snapshot)

`ak_discounts` je dnevni snapshot, pa bi svaka ručna odluka o slici ili
skrivanju nestala sutradan. Zato se odluke vežu za PROIZVOD (`product_key`,
koji računa scraper), ne za ponudu:

- `ak_product_images` — potvrđene/ručne slike po proizvodu.
- `ak_moderation` — trajno skriveni artikli (`hidden` je povratan, red ostaje).

Poslije scrapea, u istom cronu, ide `npm run layer:apply`. On:

1. prelije te odluke na današnji snapshot (`ak_apply_product_layer()`),
2. provjeri zdravlje: uporedi „danas vs juče" po prodavnici (`ak_scrape_runs`)
   i, ako je neka osvanula prazna ili joj je broj naglo pao, ISPIŠE alarm i
   vrati izlazni kod 3 → GitHub Actions korak pukne i pošalje mejl vlasniku.

**Napomena:** `ak_product_images` i `ak_moderation` puni ADMIN panel (klik
„potvrdi sliku" / „sakrij"). Admin još nije napravljen, pa je trajni sloj za
sada temelj koji stoji spreman — a alarm radi od prvog dana.

## Šta NE radi (i zašto)

**`prices:apply`** — računa staru cijenu za artikle kojima je letak nije dao
(npr. REWE), na osnovu tabele `ak_price_observations`. Tu tabelu za sada
niko ne puni, pa skript trenutno ne radi ništa i namjerno nije u dnevnom
poslu. Da bi radio, treba izvor **redovnih** cijena (webshop prodavnice ili
affiliate feed). Akcijske cijene iz letka se za to ne smiju koristiti:
referenca po § 11 PAngV je najniža redovna cijena u zadnjih 30 dana, pa bi
popust ispao naduvan.

**`images:download`** i **`images:gc`** — snimaju slike u `public/products`.
Na Vercelu je fajl sistem samo za čitanje, pa to nema smisla dok se ne uvede
pravi storage.

**`images:icecat`** — traži Icecat pristupne podatke.

U dnevnom poslu je od slika samo `images:enrich` (Open Food Facts), i to
ograničeno na 150 artikala po danu, sa kešom koji se prenosi između
pokretanja da se isti artikal ne traži dvaput.
