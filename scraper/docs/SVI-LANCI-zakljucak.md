# Svih 7 lanaca — zaključak, 2026-08-01

Sve testirano uživo kroz Chrome bridge. Bez ijednog zaobilaženja zaštite.

---

## Tabela

| lanac | ponuda | cijena | stara cijena | procenat | period | EAN | pristup |
|---|---|---|---|---|---|---|---|
| **Lidl** | 69 | ✔ | **56** | **48** | **69/69** | ✖ | otvoreni API |
| **Netto** (online shop) | 1.625 | ✔ | 1.005 | **1.625** | ✖ | ✖ | HTML, dozvoljeno |
| **OBI** | 84 na landingu | ✔ | **46** | **28** | ✖ | ✖ | HTML, `Allow: */api/*` |
| **REWE** | 113 | ✔ | **0** | **0** | ✖ | ✖ | HTML, **izričit `Allow`** |
| **Penny** | 10 po filijali | ✔ | djelimično | djelimično | ✖ | ✖ | HTML, `Allow: /` |
| **dm** | 597+ po upitu | ✔ | **0** | **0** | ✖ | **✔ gtin** | otvoreni API |
| **EDEKA** | — | ✖ | ✖ | ✖ | ✖ | ✖ | **403, blokiran** |

---

## Detalji po lancu

### Lidl — jedini kompletan

```
GET https://stores.lidlplus.com/api/v4/DE                    → 3.269 filijala
GET https://offers.lidlplus.com/app/api/v4/DE/{key}/offers   → akcije
```

Bez logina, ključa i custom headera. Jedini izvor s periodom važenja 69/69.
Provjera procenta: 46 zapisa, 0 odstupanja. Detalji u `LIDL-prospekt-api.md`.

### dm — najotvoreniji API, ali nema akcija

```
GET https://product-search.services.dmtech.com/de/search?query={q}&pageSize=100
```

200, CORS otvoren, **`gtin` = EAN na 100/100**. Cijena u
`tileData.price.price.current.value`, Grundpreis u `tileData.price.tileInfos[0]`.

**Skenirano 200 artikala — `price` uvijek ima samo `current`.** Nula starih cijena,
nula procenata. Oznake su „Nur Online", „Marke von dm", „Neues Produkt" — nijedna
akcijska. To nije neuspjeh scrapea nego dm-ov **Dauerpreis** model: oni ne rade
sedmične akcije kao diskonteri.

Vrijednost za tvoj sistem: dm je najbolji izvor za **EAN mapiranje** između lanaca,
ne za popuste.

### OBI — ima stare cijene, DIY asortiman

robots.txt: `Allow: */api/*` (najpermisivniji), 41 `Disallow` ali nijedan na ponude.
Pogađanje `/api/*` putanja daje 404; presretanje mreže hvata samo trackere
(Exponea, Hotjar, DynamicYield) — stranica je server-rendered.

Klase na `/angebote`:

```
.disc-product-price-container
  .disc-product-price__crossed-out      // stara cijena
  .disc-product-price__savings-badge    // "Du sparst 150,00 €"
```

84 kontejnera na landing stranici: 46 sa starom cijenom, 28 s uštedom.
Ušteda je u eurima, ne u procentima — procenat se računa.

⚠️ **Parser mora znati njemačke hiljade.** `1.249,00 €` naivno daje 1,24 —
greška 1000×. Isti bug se pojavio i kod Netta (`UVP 1.589.–`).

### REWE — najjača dozvola, najslabiji podaci

robots.txt ima **17 `Allow:` pravila** baš za `/angebote/nationale-angebote/*`.
Eksplicitan poziv, ne samo odsustvo zabrane.

113 ponuda iz 16 kategorija, server-rendered. Cijena 113/113, Grundpreis 92/113.
**Stara cijena 0/113, procenat 0/113.** Oznaka samo `Aktion` (99) / `Knaller` (14).

Blokada prethodne sesije (`/shop/api/products` gzip) je **riješena** — browser
dekompresuje sam, vraća čist JSON. Ali odgovor je `NO_HIT` bez parametara, a
parametri koji trebaju (`search=`, `sorting=`, `objectsPerPage=`) su
robots-disallowed. Tehnički otvoreno, robots-zatvoreno.

### Penny — regionalno, ali samo 10 po filijali

robots.txt: `Allow: /`, nula zabrana. Sitemap daje **2.121 filijalu s punim slugovima**.

**Prospekt je regionalan** — Berlin `15A-01-56`, Hamburg `15A-03-21`,
Karlsruhe `15A-07-76`. Za razliku od Lidla gdje je 33 filijale dalo identičnih 69.

Strukturirani tekst samo na `/markt/.../angebote`, i to **10 ponuda**.
Puni prospekt (~500) je na `/angebote` kao slike — 502 `<img>`, nula teksta.
`/.rest/offers/v1/{x}` vraća 400 (ruta postoji), parametar nije utvrđen;
presretanje ne pomaže jer je stranica server-rendered.

### EDEKA — namjerno zatvoren

```
GET /api/marketsearch/markets?searchstring=Berlin  → 200, 216 filijala ✔
GET /api/offers?marketId=10000327                  → 403
    {"message":"haha! better luck next time 😜"}
```

To nije slučajna greška nego **namjerna anti-scraping poruka**. EDEKA zna da se
taj endpoint pokušava zvati i svjesno ga zatvara.

`/angebote` stranica vraća 200 ali je klijentski renderovana — 0 cijena u server
HTML-u, a puni je isti onaj blokirani API.

**Nisam pokušavao zaobići.** Isti razlog kao kod Nettovog Akamai bloka: to je
jedina stvar u ovom poslu koja stvarno pravi pravni problem, i tvoj brief je
sam označava kao najveći multiplikator rizika.

---

## Šta ovo znači za sistem

Od 7 traženih lanaca, **za sniženja s procentom upotrebljiva su tri**:
Lidl (kompletno), Netto (bez perioda), OBI (ušteda u €, DIY asortiman).

REWE i Penny daju cijene ali ne i reference — kod njih bi svaki artikal bio goli
„Angebot". dm nema akcije jer ih poslovno ne radi. EDEKA je zatvoren.

**Za tvoj format** (`validTo` obavezan) situacija je oštrija: **samo Lidl daje
period važenja**. Kod ostalih bi se `validTo` morao izvoditi iz trajanja sedmice,
što je pretpostavka a ne podatak — i ako pogriješiš, na sajtu ti stoji istekla
ponuda, što je tvoj problem po UWG-u.

### Preporuka

1. **Lidl kao okosnica** — jedini s punim setom, 3.269 filijala, sedmični pull.
2. **Netto kao dopuna** — 1.625 procenata, ali treba riješiti `validTo`.
3. **dm samo za EAN** — mapiranje proizvoda između lanaca, ne za cijene.
4. REWE, Penny, OBI — tek kad se riješi pitanje perioda važenja.
5. EDEKA — samo preko partnerskog ugovora.
