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
2. U Supabase: **Settings → Database → Connection string → Session pooler**.
   Kopirati taj string (u njemu je i lozinka baze).
3. U GitHubu: **Settings → Secrets and variables → Actions → New repository
   secret**, ime `DATABASE_URL`, vrijednost je string iz koraka 2.

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
npm test                # 29 testova, ne treba baza
npm run scrape:mock     # izmišljeni podaci, treba DATABASE_URL
npm run dry-run         # pravi KaufDA, ne dira bazu, piše u out/
```

Za lokalni rad `DATABASE_URL` ide u `scraper/.env` (fajl je u `.gitignore`).

## Kako se podaci obnavljaju

Za svaki `(PLZ, datum)` scraper prvo obriše pa upiše iznova, sve u jednoj
transakciji. Zato je ponovno pokretanje bezbjedno — nikad nema duplikata ni
pola upisanih podataka. Snapshoti stariji od 14 dana se brišu sami.

Sajt uvijek čita najnoviji datum po PLZ-u, pa ako jedno jutro scraper padne,
posjetioci vide jučerašnje akcije umjesto prazne stranice.

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
