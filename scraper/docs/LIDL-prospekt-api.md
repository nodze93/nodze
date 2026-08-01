# Lidl Plus — sedmične akcije po filijali. RADI, bez ičega.

Datum provjere: 2026-08-01. Testirano uživo kroz browser.

Ovo je ono što Netto blokira, a Lidl daje otvoreno: **prave prospektne akcije
po konkretnoj filijali, s procentom sniženja, starom cijenom i periodom važenja.**

Bez logina. Bez API ključa. Bez custom headera. Bez ijednog zaobilaženja.
(Brief je pominjao `User-Agent: LidlPlus/17.0.5` — **nije potreban**, radi i bez.)

---

## Dva poziva, to je sve

### 1. Filijale

```
GET https://stores.lidlplus.com/api/v4/DE
```

→ 200, JSON niz, **3.269 filijala**, 1,4 MB.

Polja: `storeKey` ("DE7437"), `name`, `address`, `postalCode`, `locality`,
`state`, `province`, `location`, `isLidlPlus`, `amenities`, `schedule`.

### 2. Ponude po filijali

```
GET https://offers.lidlplus.com/app/api/v4/DE/{storeKey}/offers
```

→ 200, `{offers:[...], totalOffers:N}`. Za DE7437: **66 ponuda**.

Polja po ponudi:

```
id, offerType, redemptionChannel, category, imageUrl, title, brand,
productIds, packaging, pricePerUnit, featured,
startValidityDate, endValidityDate, endValidityDateUTC,
priceBox { discountMessage, largePartNumeric, smallPartNumeric,
           strikethrough, priceSymbol, hasAsterisk, ...boje }
```

---

## KAKO SE ČITA CIJENA — nije očito

`priceBox` polja se NE zovu `price` / `oldPrice`. Mapiranje:

| polje | značenje |
|---|---|
| `largePartNumeric` | **nova cijena** (3.79) |
| `smallPartNumeric` | **stara cijena** (4.98), važi kad je `strikethrough: true` |
| `discountMessage` | `"-23%¹⁾"` — oglašeni procenat |
| `strikethrough` | boolean, NIJE iznos |
| `pricePerUnit` | Grundpreis, npr. `"1 kg = 5.41/5.92/6.32"` |
| `packaging` | sadrži i `Normalpreis: 3.99` |

**Zamka:** `smallPartNumeric` liči na cente i lako se parsira kao `3.79 + 0.498`.
Nije — to je puna stara cijena. Provjera matematikom to odmah otkrije.

```js
var np = typeof p.largePartNumeric==='number' ? p.largePartNumeric : null;
var op = (p.strikethrough && typeof p.smallPartNumeric==='number') ? p.smallPartNumeric : null;
var pct = (String(p.discountMessage||'').match(/-\s*(\d+)\s*%/)||[])[1];
```

---

## Popunjenost (1 filijala, 66 ponuda)

| polje | popunjeno |
|---|---|
| period važenja (`start`/`endValidityDate`) | **66 / 66** |
| slika (`imageUrl`) | **66 / 66** |
| nova cijena | 55 / 66 |
| stara cijena | 53 / 66 |
| procenat sniženja | 46 / 66 |
| `Normalpreis` iz packaging | 36 / 66 |
| Grundpreis (`pricePerUnit`) | 37 / 66 |
| brand | 51 / 66 |

Ostatak do 66 su ponude bez cijene: „Spare 20% auf alle Baby, Kids & Toys",
kuponi i kategorijske akcije. Nisu greška parsera.

### Verifikacija

Oglašeni procenat vs `(1 − nova / stara) × 100` na **44 zapisa → 0 odstupanja.**

Primjeri:

```
WAGNER Flammkuchen Elsässer   3.79 statt 4.98   -23%   2026-07-30 → 2026-08-01
LAY'S Chips                   0.99 statt 1.99   -50%   2026-07-30 → 2026-08-01
DELUXE Manuka Honig          14.99 statt 16.99  -11%   2026-07-30 → 2026-08-01
RITTER SPORT Bunte Vielfalt   1.11 statt 1.99   -44%   2026-07-26 → 2026-08-01
XXL-Basilikum im Topf         1.59 statt 1.99   -20%   2026-07-30 → 2026-08-01
```

---

## Zašto je ovo bolje od svega ostalog

| izvor | prospekt? | procenat? | stara cijena? | period? | po filijali? |
|---|---|---|---|---|---|
| **Lidl Plus API** | **da** | **da** | **da** | **da** | **da (3.269)** |
| Netto online shop | ne | da | da (62 %) | ne | ne |
| Netto prospekt PDF | da | da | da | ne | ne |
| marktguru (Netto) | da | **ne** | **0 / 207** | da | djelimično |
| Netto Handzettel | da | da | da | da | da | ← robots + Akamai blok |

---

## Ostalo neprovjereno, ali obećava

Iz briefa, po permisivnosti robots.txt:

- **PENNY** — robots.txt je doslovno `User-agent: *` / `Allow: /`. Ništa zabranjeno.
  Cijene po filijali na `penny.de/markt/{grad}/{storeId}/{slug}/angebote`.
- **OBI** — `Allow: */api/*`, najpermisivniji od svih sedam.
- **dm** — robots ne blokira API; `services.dmtech.com` familija.

Ta tri nisam stigao testirati u ovoj sesiji.

---

## Sljedeći korak

Konektor: povuci 3.269 filijala → uzmi reprezentativni uzorak (ili sve) →
za svaku `offers` → normalizuj u tvoju shemu. Dedupe po `id` daje nacionalni
skup akcija; razlike među filijalama daju regionalne cijene.

Napomena o obimu: 3.269 poziva je puno. Za nacionalne akcije dovoljno je
20-30 filijala iz različitih `state` vrijednosti — preklapanje je veliko.
