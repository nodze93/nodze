# Penny — status istraživanja, 2026-08-01

## Dobro

**robots.txt je potpuno otvoren.** Doslovno cijeli sadržaj:

```
User-agent: *
Allow: /

Sitemap: https://www.penny.de/sitemap.xml
```

Nula `Disallow`. Najpermisivniji od svih lanaca koje smo dirali.

**2.121 filijala s punim slugovima** iz sitemapa:

```
GET /.rest/sitemap/sitemap-markets.xml   → 2.121 URL-a
   /markt/berlin/4030913/penny-cottbusser-platz-cottbuser-platz-2
   /markt/berlin/4030382/penny-alt-mahlsdorf-alt-mahlsdorf-48-49
```

Puni slug je obavezan — `penny.de/markt/4030913` daje 404. Sitemap ga daje besplatno.

**Prospekt je REGIONALAN** — bitna razlika u odnosu na Lidl:

| regija | prospekt ID |
|---|---|
| Berlin | `15A-01-56` |
| Hamburg | `15A-03-21` |
| Karlsruhe | `15A-07-76` |

Kod Lidla je 33 filijale dalo 69 identičnih ponuda (nacionalno). Kod Pennyja svaka
regija ima svoj prospekt, pa je `plz` ovdje stvarno nosi informaciju, ne samo ključ.

**Ekstraktor radi** na stranici filijale `/markt/{grad}/{id}/{slug}/angebote`:

```js
'.offer-tile'                 // pločica
  '.h4'                       // naziv
  '.bubble'                   // "UVP 1.39 € Angebotspreis 0.99 € 0.99"
  '.badge'                    // "-28%" ili "Aktion"
  '.offer-tile__unit-price'   // "je 0,5 l (1 l = 1.98)"
```

Testirano na Berlin/4030913 — 10/10 naziva i cijena, 3 sa starom cijenom i
procentom, 5 s Grundpreisom. Primjeri:

```
CARLSBERG Elephant          0.99 statt 1.39   -28%   1.98/l
RADEBERGER Pilsener         3.99 statt 4.45   -10%   1.33/l
BEN'S ORIGINAL Kochbeutelreis 1.79    -       Aktion 3.58/kg
GRILLPARTY Frische Spareribs  4.99    -       Aktion 7.23/kg
MÜHLENHOF Rinder-Rouladen     6.99    -       Aktion 13.98/kg
```

---

## Zid

**Strukturirani tekst postoji samo za 10 ponuda po filijali.**

Puni prospekt ima ~500 ponuda, ali:

| stranica | pločica | sadržaj |
|---|---|---|
| `/markt/.../angebote` | 10 | **tekst** — naziv, cijena, UVP, %, Grundpreis |
| `/angebote` | 502 | samo `<img alt="offer">`, nula teksta |
| `/angebote/{flight}/{kategorija}` | 10-31 | samo `<img>`, bez linkova u server HTML-u |

Kategorijske stranice u server-rendered HTML-u nemaju ni tekst ni `href` na detalj.
Provjereno i na živoj hidriranoj stranici — `/angebote` i dalje daje slike bez teksta.

**`/.rest/offers/v1/{x}` postoji ali nije otključan.** Potvrda da ruta živi:

```
/.rest/offers/v1              → 404
/.rest/offers/v1/{bilo sta}   → 400   ← handler postoji, parametar kriv
/.rest/marketsearch/v1        → 401
```

Probani parametri koji ne rade: flight id, market id, `offers`, `current`.
Presretanje `fetch`/XHR na `/angebote` uhvatilo je **0 poziva** — stranica je
server-rendered, pa se pravi poziv ne može pročitati iz prometa.

---

## Tri moguća puta

1. **10 ponuda × N filijala.** Radi odmah, čist tekst, pravi PLZ, prava regionalna
   razlika. 2.121 filijala → do 21.210 redova, ali samo top-10 highlights po filijali.
2. **OCR/čitanje slika prospekta.** Isti problem kao Netto. ~500 ponuda po regiji.
3. **Otključati `/.rest/offers/v1`.** Najčistije ako uspije. Traži da se vidi poziv
   iz Penny mobilne aplikacije ili pogodi shema parametra — nije riješeno pogađanjem.

---

## Poređenje s Lidlom

| | Lidl Plus API | Penny |
|---|---|---|
| autentikacija | nema | nema |
| strukturirano | **da, sve** | samo 10 po filijali |
| stara cijena | 56/69 | 3/10 na testu |
| procenat | 48/69 | 3/10 na testu |
| period važenja | 69/69 | **nije nađen na pločici** |
| filijala | 3.269 | 2.121 |
| regionalno | ne (nacionalno) | **da** |

Napomena: Penny pločica nema `validFrom`/`validTo`. Za tvoj format je `validTo`
obavezan, pa bi ga trebalo izvesti iz trajanja prospekta (Penny sedmica ide
ponedjeljak–subota), a to je pretpostavka, ne podatak s izvora.
