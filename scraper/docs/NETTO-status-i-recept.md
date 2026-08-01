# Netto — status i recepti, 2026-08-01 (KW31)

Sesija bez `device_bash`. Sve izvršeno kroz Chrome bridge na tvom računaru.
Sandbox je i dalje blokiran (`403 CONNECT` na netto, marktguru, rewe — reprovjereno).

---

## 1. marktguru API — RADI kroz browser

Ovo je najvažniji nalaz sesije. Prošla sesija ga nije mogla dohvatiti; kroz browser radi.

### Ključevi

```js
// s https://www.marktguru.de/ (bilo koja stranica)
var h  = document.documentElement.outerHTML;
var ak = h.match(/"?apiKey"?\s*[:=]\s*"([^"]{16,})"/i)[1];
var ck = h.match(/"?clientKey"?\s*[:=]\s*"([^"]{16,})"/i)[1];
```

### Pozivi

```
BASE = https://api.marktguru.de/api/v1
Headers: x-apikey, x-clientkey, Accept: application/json

GET /offers/search?as=web&q={upit}&limit=&offset=&zipCode=10115   → 200, radi
GET /advertisers?as=web&limit=300                                 → 200, 300 lanaca
GET /leafletflights?as=web&retailerId={id}&limit=100&zipCode=     → 200, prospekti
```

**Struktura je `{id, type, data:{...}}`** — naziv je u `data.name`, ne u `name`.
Prošla sesija je vjerovatno na ovome pukla.

### Retailer ID-evi (potvrđeni)

| Lanac | retailerId |
|---|---|
| Netto Marken-Discount | **126735** |
| Netto (bez psa, Edeka) | 126734 |
| REWE | 126802 |

Ostalih 297 je u istom pozivu — `/advertisers?as=web&limit=300`.

### Shema ponude (`/offers/search`)

```
brand, advertisers[], categories[], id, description, volume, quantity,
isMultiProduct, price, oldPrice, referencePrice (=Grundpreis),
leafletFlightId, validityDates[], externalId, externalUrl,
externalTrackings[], type, industries[], product, unit, images
```

`validityDates` je ono što direktni scrape Netta **nema** — period važenja akcije.

### ⚠️ ISPRAVKA — `retailerId` NE FILTRIRA

`/leafletflights?retailerId=126735` vraća **200 i 67 rezultata, ali parametar je
ignorisan**. Provjereno: `/leaflets/5737573` iz te liste vraća
`"Lidl (KW31 HHZ Dataset 2)"`, `advertiser: retailers/126679`. Dakle lista je
mješavina svih lanaca, a "glavni sedmični prospekt 69 str / 606 ponuda" je Lidlov.

Isto vrijedi za `/offers/search?retailerId=` → `totalResults 0`.
**`/offers/search` bez `q` uvijek vraća 0.** Filter po lancu se ne postiže
nijednim od isprobanih imena (`retailerId`, `retailerIds`, `advertiserId`,
`advertiserIds`, `filterRetailerIds`, `industryIds`).

Pravi pozivi koje marktguruov vlastiti UI radi (uhvaćeni presretanjem `fetch`/XHR):

```
/industries?as=web&limit=64&zipCode=40213
/retailerfeeds?as=web&limit=64&zipCode=40213
/…?as=web&limit=64&leafletFlightLimit=64&zipCode=40213
/…?as=web&index=…&limit=8&zipCode=40213
```

`/retailerfeeds` vraća feedove s poljima `advertiser`, `offerCount`,
**`leafletImageId`** (ključ za sklapanje URL-a slike stranice).
Taj put je nedovršen — treba ga dovršiti čitanjem UI poziva na stranici
konkretnog lanca, ne pogađanjem.

### Lista prospekata (MJEŠAVINA LANACA, ne samo Netto)

```
286793  2026-07-26  2026-08-01  69  606   ← glavni sedmični, KW31
287013  2026-08-02  2026-08-08  69  552   ← KW32, VEĆ DOSTUPAN
285806  2026-07-29  2026-08-05  66  448
286598  2026-07-26  2026-08-01  71  369
286863  2026-07-26  2026-08-01  48  315
286043  2026-07-31  2026-08-07  16  281
285650  2026-07-26  2026-08-01  34  267
285794  2026-07-24  2026-08-07  26  212
286663  2026-07-31  2026-08-14  41  169
285788  2026-07-24  2026-08-07  20  147
286838  2026-08-02  2026-08-08  12  150
286733  2026-07-31  2026-08-07  32  116
282866  2026-07-26  2026-08-02  16  114
286743  2026-07-29  2026-08-05  27  113
```

### JEDINO ŠTO FALI

Kako dobiti ponude **za konkretan prospekt**. Ovo NE radi:

```
/offers/search?leafletFlightId=285650   → 200 ali totalResults 0
/leafletflights/285650/offers           → 404
/offers/search?retailerId=126735        → 200 ali totalResults 0   (traži q)
```

`/offers/search` bez `q` uvijek vraća 0. Parametar za filter po lancu/prospektu
nisam našao pogađanjem. **Rješenje:** otvoriti prospekt na marktguru.de u browseru
s uključenim praćenjem mreže i pročitati pravi poziv — to je jedan korak, ne
istraživanje. Mogu to odmah u sljedećoj poruci.

---

## 2. Netto prospekt PDF — tekstualni sloj, OCR NE TREBA

Netto vrti prospekte preko Publitasa (account `100990`, custom domena
`sonderprospekt.netto-online.de`). PDF je javno dostupan iz samog viewera
(„PDF herunterladen") i **ima pravi tekstualni sloj**.

```
https://sonderprospekt.netto-online.de/{slug}
  → u HTML-u: /{acct}/{pub}/pdfs/{uuid}.pdf
```

Postojeće publikacije (druge vraćaju 404):

| slug | pub id | stranica | veličina |
|---|---|---|---|
| `preissenkung_2026-07-30` | 3274704 | 2 | 0,91 MB |
| `bestellmagazin_2026-08` | 3245449 | 20 | 210 MB |
| `sondermagazin_2026-08` | 3245056 | 8 | 33,8 MB |

Ekstrakcija: pdf.js iz CDN-a u stranici, `getTextContent()` po stranici.
30 stranica → 2.177 tekstualnih elemenata. Nula OCR-a.

**Rezultat: 67 ponuda izvučeno.** Kvalitet:

- cijena, `statt`, `%`, Grundpreis — pouzdano
- **5 od 40 provjerivih ima krivu referentnu cijenu** (12,5 %) — spatialno
  grupisanje po radijusu pokupi cijenu susjedne pločice
- nazivi proizvoda slabi (41/67) — tekstualni sloj nema grupisanje po proizvodu,
  pa se hvataju dimenzije („Maße: ca. L 56 x B 59")

Da bi ovo bilo produkcijski, treba prava segmentacija pločica (klasterisanje po
prazninama u layoutu), ne fiksni radijus. Izvodljivo, ali je posao za sebe —
i zato je marktguru bolji put: tamo su ponude već strukturirane.

### Bug koji se ponavlja na oba izvora

Njemački separator hiljada. `statt 1.399` je **1399**, ne 1,39. Isto `UVP 1.589.–`.
Pogađa svaki artikal preko 1.000 €, greška 100×. Ispravan parser:

```js
var m = s.match(/(\d{1,3})\.(\d{3})(?!\d)/);   if(m) return +(m[1]+m[2]);   // hiljade
m = s.match(/(\d+)[.,](\d{2})(?!\d)/);          if(m) return +(m[1]+'.'+m[2]); // decimale
```

---

## 3. Netto direktno (online shop) — radi, ali nije prospekt

Metoda potvrđena: `fetch()` iz origin konteksta, 39 zahtjeva, 0 grešaka,
**2.224 unique SKU** (`/sale/c-S00` 1.214 + `/lebensmittel/c-N01` 1.010).
Podaci su izgubljeni pri navigaciji (živjeli su u memoriji taba), ali se
reproduciraju za ~90 sekundi.

Verifikacija je bila čista: deklarisani % vs `(1 − nova/ref) × 100` na 1.565
zapisa, **0 odstupanja**.

**Ispravka briefa:** tvrdnja „oldPrice 46/46" ne stoji. Na 1.625 akcija:
1.005 (61,8 %) ima pravu prethodnu cijenu, 620 (38,2 %) ima samo UVP.
Prošla sesija je čitala `product__uvp` kao `product__old-price` — to su dva
različita elementa i dvije pravno različite stvari.

**Ali:** ovo je asortiman online shopa (24-packi, roštilji, solarni paneli),
ne ono što stoji u prospektu za filijalu. Nije isti skup artikala.

---

## 4. Zidovi na koje sam naletio

| Šta | Status |
|---|---|
| `/media/handzettel/` | robots.txt **Disallow** — to je sedmični Handzettel |
| `/frontend/catalogs/*/pdf/` | robots.txt **Disallow** |
| `/INTERSHOP/` | **Disallow** (osim 4 whitelistovana JSON-a) |
| `/ueber-netto/Online-Prospekt.chtm` | **Akamai Access Denied** |
| Filialangebote | traže izbor filijale preko `/INTERSHOP/` |

Riješeno usput, ono što brief vodi kao otvoreno: setter filijale je
**`ViewMMPStoreFinder-AddStoreID`** (uz `GetStoreByPostcode`, `GetStoreItems`,
`GetPreferredStore`, `RemoveStoreID`). Radi — ali je pod `/INTERSHOP/`.

---

## 4b. Ima li marktguru popuste? NE — izmjereno

| | ponuda | price | oldPrice | referencePrice |
|---|---|---|---|---|
| svi lanci (8 upita) | 548 | 548 | **10** | 548 |
| Netto Marken-Discount | 56 | 56 | **0** | 56 |

Pretraga sheme po `disc|percent|saving|rabatt` → **prazno**. Polja za popust nema.
Brief je mjerio 0/17 za Netto; sad je 0/56, a i preko svih lanaca `oldPrice` je 1,8 %.

**Zamka:** `referencePrice` je popunjen 548/548 i lako se zamijeni za staru cijenu.
Nije — to je Grundpreis. `Milram Buttermilch-Drink p=1.29 ref=2.58` znači 2,58 €/l.

Gdje popust POSTOJI:

- **Netto direktno (online shop):** `discountPercent` 1.625/2.224, 0 odstupanja — ali nije prospekt
- **Prospekt PDF:** `–25%`, `–41%` su odštampani u prospektu, uhvaćeni na 61/67

---

## 5. Preporuka

Za ono što ti treba — **ponude iz prospekta, po sedmici, za sajt** — marktguru je
jedini izvor koji daje sve tri stvari odjednom: strukturirane ponude, period
važenja, i svih 10 lanaca kroz isti konektor. Prospekt-PDF put radi ali traži
ozbiljan rad na segmentaciji, a direktni scrape Netta uopšte nema prospekt.

Ostaje jedan korak: naći poziv koji vraća ponude po `leafletFlightId`.

**Pravna napomena, kratko:** tvoj vlastiti brief marktguru svrstava u
najizloženiju kategoriju (agregator, §§87a-87b UrhG, CJEU *Innoweb*). Za
interni ingest i analizu §44b UrhG (TDM) daje pokriće. **Objavljivanje na
vlastitom sajtu je druga stvar** i to je odluka koju trebaš svjesno donijeti —
posebno za slike proizvoda (§72 UrhG štiti i trivijalne fotografije;
hotlink je sigurniji od kopiranja, *Svensson* vs *Renckhoff*).
