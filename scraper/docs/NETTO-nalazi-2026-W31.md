# Netto direktni pull — nalazi, KW31 / 2026-08-01

Izvor: `netto-online.de`, server-rendered HTML, `fetch()` iz origin konteksta
preko Chrome bridgea (sandbox egress je i dalje `403 CONNECT` — potvrđeno ponovo).

Sesija: `StoreID 9999`, `Region 1`, `KW 31` (iz `ViewMMPLoginStatus-StatusJSON`).

---

## Šta je povučeno

| Kategorija | Deklarisano | Povučeno | Stranica |
|---|---|---|---|
| `/sale/c-S00` | 1.214 | 1.214 | 21 |
| `/lebensmittel/c-N01` | 1.021 | 1.010 | 18 |
| **Ukupno unique SKU** | | **2.224** | 39 zahtjeva, 0 grešaka |

Razlika 1.021 → 1.010 kod Lebensmittela: 11 artikala se pojavljuje na više
stranica (dedupe po `data-sku`), deklarisani broj ih broji duplo.

---

## KLJUČNA ISPRAVKA BRIEFA: "oldPrice 46/46" ne stoji

Brief tvrdi da Netto direktno daje `oldPrice` u **46/46** slučajeva i na osnovu
toga zaključuje "za Netto ide DIREKTNO, ne preko marktgurua".

Na punom uzorku od 1.625 akcijskih artikala stvarno stanje je:

| Referentna cijena | Broj | Udio akcija |
|---|---|---|
| `product__old-price` — prava prethodna Netto cijena | **1.005** | 61,8 % |
| `product__uvp` — UVP proizvođača (nije prethodna cijena) | **620** | 38,2 % |
| bez reference | 0 | — |

Zaključak: prethodna sesija je tretirala **UVP kao oldPrice**. To su dva različita
DOM elementa i dvije pravno različite stvari:

- `product__old-price` = ranija Netto cijena → to je ono što PAngV § 11 traži kao
  najnižu cijenu iz zadnjih 30 dana kod oglašavanja sniženja
- `product__uvp` = preporučena cijena proizvođača → referenca na tuđu cijenu,
  nikad nije bila Netto cijena

Za praćenje cijena to nije kozmetika: ako se UVP upiše u `oldPrice`, izračunata
"ušteda" mjeri razliku prema RRP-u, ne prema stvarnom kretanju cijene kod Netta.

Zato shema u `netto_akcije.json` ima **tri odvojena polja**:
`oldPrice`, `uvp`, i `referencePrice` + `referencePriceType`
(`PREVIOUS_PRICE` | `UVP`) da se izvor reference nikad ne izgubi.

Napomena: nalaz i dalje potvrđuje glavnu preporuku briefa — direktno je bolje od
marktgurua (0/17). Samo je omjer 62 %, ne 100 %.

---

## Bug u parsiranju cijena (uhvaćen i ispravljen)

Njemački separator hiljada u UVP tekstu: `UVP 1.589.– UVP : 1589,–€`.
Naivno parsiranje prvog tokena daje **1,58 €** umjesto **1589 €** — greška od
100×, a pogađa svaki artikal preko 1.000 €.

Ispravka: čitati locale-normalizovanu formu `1589,–€` (regex traži `€` sufiks),
uz fallback na `\d{1,3}(\.\d{3})+` pa tek onda na goli token.

Rezultat verifikacije nakon ispravke:

- deklarisani `-XX %` uspoređen s `(1 − nova / referentna) × 100` na **1.565** zapisa
- **0 odstupanja** (tolerancija ±1 pp zbog zaokruživanja kod Netta)
- 72 artikla s `ab` prefiksom (varijantne cijene) isključena iz provjere i
  označena s `priceIsFrom: true`
- najviša cijena u setu 4.010 € — sanity check da parser hiljada radi

---

## Popunjenost polja

| Polje | Popunjeno | Od |
|---|---|---|
| `newPrice` | 2.224 | 2.224 |
| `basePrice` + `basePriceUnit` (Grundpreis) | 1.576 | 2.224 |
| `discountPercent` | 1.625 | 2.224 |
| `articleNumber` (`data-sku`) | 2.224 | 2.224 |
| `ean` | 0 | — nije na listing stranici |
| `brand`, `quantity`, `unit`, `packaging` | 0 | — nije izdvojeno |
| `validFrom` / `validTo` | 0 | — nije na listing stranici |

`basePrice` fali kod 648 artikala — to su uglavnom non-food (roštilji, namještaj,
tekstil) gdje Grundpreis po PAngV nije obavezan. Kod hrane je pokrivenost praktično
potpuna.

---

## Šta ostaje otvoreno

1. **EAN, brand, Grundpreis za non-food** — samo na detaljnoj stranici
   `/{slug}/p-{artikelNr}`. Imam 2.224 tačna URL-a; to je 2.224 zahtjeva.
   Brief već ima potvrdu da detalj daje EAN (`/fanta-cassis-6x0-33l/p-2914282000`
   → EAN 5000112680577, Grundpreis 3,16 €/l, Pfand 6,00 €).
2. **`validFrom` / `validTo`** — nema ih na listingu. KW 31 iz `StatusJSON` je
   jedina vremenska oznaka; nije isto što i period važenja akcije.
3. **Filialangebote** — nedirnuto. Brief tačno kaže da je `StoreID` vezan za
   cookie i da je setter pod `/INTERSHOP/` = robots-disallowed. Nisam dirao,
   to je tvoja pravna odluka.
4. **Prospekti / Publitas** — nedirnuto u ovoj sesiji.

---

## Metodološka napomena

Sve je povučeno s javnih, robots-dozvoljenih putanja (`/sale/`, `/lebensmittel/`),
običnim GET-ovima iz stvarnog browsera, s ~400 ms razmaka, bez logina, bez
zaobilaženja ičega, bez diranja `/INTERSHOP/` osim jednog `StatusJSON` koji
robots.txt izričito whitelistuje. To je najniža kategorija rizika iz hijerarhije
u briefu (trgovac direktno).
