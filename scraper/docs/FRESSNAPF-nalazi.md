# Fressnapf scraper

Povlaci akcije s Fressnapfa (Tierbedarf) i izbacuje JSON spreman za uvoz.
Samostalan — ne treba mu nista drugo.

Ne treba browser. Sve je u server HTML-u, obican `requests`.

---

## Zasto je Fressnapf dobar izvor

Jedini lanac poslije OBI-ja koji ima **rok vazenja po artiklu**, u schema.org
Offer bloku:

```json
"priceValidUntil": "2026-08-05T21:59:59+0000"   ← prava akcija
"priceValidUntil": "9999-12-31T22:59:59+0000"   ← NIJE na akciji
```

Vrijednost `9999-12-31` je rezervirana. Scraper je koristi kao **filter i
provjeru odjednom** — artikal s njom se preskace.

Vecina lanaca rok uopste ne objavljuje. Izmjereno 2026-08-01: od 8 provjerenih
lanaca samo 3 imaju rok, a od njih samo OBI i Fressnapf ga imaju po artiklu.

---

## Pokretanje

### GitHub Actions

1. Ubaci fajlove u repo.
2. Settings → Actions → General → Workflow permissions → **Read and write**.
3. Actions → *Fressnapf scrape* → **Run workflow**.

Dalje se vrti sam ponedjeljkom u 05:50 UTC. Izlaz u `output/fressnapf-latest.json`.

### Lokalno

```bash
pip install -r requirements.txt
python src/main.py
```

---

## Izvori

Sale kategorije, sve server-rendered:

```
/aktionen-angebote/summer-sale/    912 artikala
/c/hund/sale/                      717
/c/katze/sale/                     688
/c/kleintier/sale/  /c/vogel/sale/  /c/fisch/sale/
```

Iz listinga se skupe linkovi na artikle, pa se svaki otvori zbog
`priceValidUntil`. To je 1 poziv po artiklu — zato `max_products`.

`robots.txt` ima `Allow: /api/proxy/v1/*`, a zabranjeni su samo cart, checkout,
account, `*sort=*` i `*viewtype=*`. Scraper ne koristi nijedan zabranjen
parametar.

---

## Podesavanje

`config.json`:

- **`plz_list`** — svaka ponuda se ponavlja za svaki PLZ. Fressnapf akcije su
  nacionalne, pa je lista samo za pretragu na tvom sajtu.
- **`max_products`** — koliko artikala provjeriti (default 400).
  Sale kategorije imaju preko 2.300 ukupno; svaki je jedan poziv.
  Sa 400 i pauzom 0.35 s to je oko 3 minute.
- **`delay_seconds`** — ne spustaj ispod 0.3.

---

## Stara cijena je IZVEDENA, ne izvorna

Fressnapf staru cijenu renderuje klijentski, pa je nema u server HTML-u.
Scraper je racuna iz cijene i procenta:

```
stara = cijena / (1 - procenat/100)
```

Zato je u `meta.note` izlaznog fajla oznaceno da je izvedena. Provjereno da
povratni racun daje isti procenat. Ako procenta nema, `oldPrice` se izostavi —
artikal se prikaze kao „Angebot".

---

## Validacija

`src/main.py` odbija upisati fajl ako ijedan red padne:

- prazno obavezno polje (`productName`, `store`, `newPrice`, `validTo`, `plz`)
- `plz` nije petocifren ili je `00000` (takav red pretraga nikad ne nadje)
- `newPrice` <= 0
- `validTo` nije `YYYY-MM-DD`
- dupli `offerId`

Upozorenja koja ne blokiraju: `oldPrice <= newPrice`, popust > 95%.

---

## Izlaz

```json
{
  "meta": { "generatedAt": "2026-08-03", "store": "Fressnapf", "rowCount": 4620 },
  "offers": [
    {
      "productName": "4pets Rampe EasySteps",
      "store": "Fressnapf",
      "plz": "26603",
      "newPrice": 153.29,
      "oldPrice": 218.99,
      "validTo": "2026-08-05",
      "offerId": "fn-20260805-000-26603",
      "category": "Tierbedarf",
      "offerUrl": "https://www.fressnapf.de/p/4pets-rampe-easysteps-1110837/"
    }
  ]
}
```
