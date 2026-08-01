# REWE — status, 2026-08-01

## Prethodna blokada je nestala

Brief vodi kao PRIORITET: „Prethodna sesija NIJE uspjela dekompresovati tijelo"
za `/shop/api/products`. **U browseru to nije problem** — `fetch` dekompresuje
gzip/brotli sam.

```
GET /shop/api/products?market=540566
→ 200, Content-Encoding: gzip, čist JSON
  {"type":"NO_HIT","marketInfo":{...},"search":{},"pagination":{},
   "facets":[],"_embedded":{},"toggles":{}}
```

`NO_HIT` znači da traži parametre pretrage. **Ali tu je zamka:** robots.txt
zabranjuje baš one parametre koji bi trebali — `search=`, `sorting=`,
`objectsPerPage=`, `merchant=`, `merchantType=`. Taj put je tehnički otvoren,
robots-zatvoren.

## Bolji put — REWE izričito POZIVA

robots.txt ne samo da ne zabranjuje, nego ima **17 `Allow:` pravila** za stranice
s nacionalnim ponudama:

```
Allow: /angebote/nationale-angebote/topangebote/
Allow: /angebote/nationale-angebote/getraenke/
Allow: /angebote/nationale-angebote/obst-und-gemuese/
Allow: /angebote/nationale-angebote/frische-und-convenience/
Allow: /angebote/nationale-angebote/kuehlung/
Allow: /angebote/nationale-angebote/tiefkuehl/
Allow: /angebote/nationale-angebote/fruehstueck/
Allow: /angebote/nationale-angebote/kochen-und-backen/
Allow: /angebote/nationale-angebote/suesses-und-salziges/
Allow: /angebote/nationale-angebote/alkoholfreie-getraenke/
Allow: /angebote/nationale-angebote/bier/
Allow: /angebote/nationale-angebote/wein-und-spirituosen/
Allow: /angebote/nationale-angebote/haushalt/
Allow: /angebote/nationale-angebote/drogerie/
Allow: /angebote/nationale-angebote/tier/
Allow: /angebote/nationale-angebote/freizeit-und-mode/
Allow: /angebote/nationale-angebote/payback/     ← 404, ne postoji
```

Uz to `Allow: /angebote/*/*/` za facebookexternalhit i Twitterbot.

Eksplicitan `Allow` je najjači signal koji smo dobili od bilo kojeg lanca —
jači od Pennyjevog `Allow: /`, jer je ciljan baš na stranice s ponudama.

## Ekstraktor

Server-rendered, bez JS-a:

```js
'.cor-offer-renderer-tile'
  '.cor-offer-information__title'      // naziv
  '.cor-offer-price__tag-price'        // cijena
  '.cor-offer-price__tag-label'        // "Aktion" | "Knaller"
// Grundpreis i Pfand parsirati iz punog teksta pločice, NE iz
// .cor-offer-information__additional — ono vraca samo prvi fragment
```

## Rezultat: 113 ponuda

| polje | popunjeno |
|---|---|
| naziv | 113 / 113 |
| cijena | 113 / 113 |
| Grundpreis | 92 / 113 |
| Pfand | 12 / 113 |
| **stara cijena** | **0 / 113** |
| **procenat** | **0 / 113** |
| period važenja | 0 / 113 |

Po kategorijama: kuehlung 23, drogerie 18, tiefkuehl 12, kochen-und-backen 8,
fruehstueck 7, wein-und-spirituosen 7, obst-und-gemuese 6, suesses 6,
topangebote 5, freizeit-und-mode 5, frische 4, getraenke 3, alkoholfreie 3,
haushalt 3, bier 2, tier 2.

Primjeri:

```
Dr. Oetker Pizza Tradizionale Salame Romano   1.79 €   4.65/kg   Aktion
Grünländer Scheiben mild & nussig             1.69 €  12.07/kg   Aktion
Haribo Goldbären oder Color-Rado              0.79 €   4.51/kg   Aktion
Krombacher Pils                               0.79 €   1.58/l    Aktion
Gorbatschow Wodka Original                    5.99 €   8.56/l    Aktion
```

## Ograničenje

**Nema stare cijene ni procenta — nijedan zapis.** Oznaka je samo `Aktion` (99)
ili `Knaller` (14). Nema ni `validFrom`/`validTo`.

Za tvoj format to znači: `validTo` je obavezan a REWE ga ne daje na ovim
stranicama, pa bi se morao izvesti iz trajanja sedmice (pretpostavka, ne podatak).
I sve bi bilo „Angebot" bez procenta.

## Poredak lanaca po upotrebljivosti za tvoj sajt

| lanac | ponuda | cijena | stara cijena | procenat | period | pristup |
|---|---|---|---|---|---|---|
| **Lidl** | 69 | da | **56** | **48** | **69** | otvoreni API |
| Netto (online shop) | 1.625 | da | 1.005 | 1.625 | ne | HTML, dozvoljeno |
| REWE | 113 | da | **0** | **0** | ne | HTML, izričito dozvoljeno |
| Penny | 10 po filijali | da | djelimično | djelimično | ne | HTML, dozvoljeno |

Lidl je i dalje jedini koji daje kompletan set.

## Neistraženo

- **EDEKA** — `/api/offers?marketId=` traži `JSESSIONID` + `EDEKA_LB` cookie
- **dm** — `services.dmtech.com` familija, nijedan endpoint još nije potvrđen
- **OBI** — `Allow: */api/*`, konkretan endpoint nije nađen
