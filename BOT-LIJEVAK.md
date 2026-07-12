# Bot 2.0 — „Dnevni filter njemačkih vijesti" (lijevak)

Cilj: bot koji **pročita mnogo, a objavi malo**. AI se ne troši na masu —
skupi dio (čitanje cijelog članka + pisanje) radi samo na ~5–10 vijesti dnevno.
Ostalo siječu jeftini slojevi bez AI-a. Rezultat izgleda kao da iza portala
stoji uredništvo, iako većinu posla radi kod.

Novi pipeline se **pali prekidačem** i ne dira stari:

```
NOVI_PIPELINE=on
```

Ako ga isključiš (ili ne postaviš), radi stari `pipeline.ts` kao i do sada.

---

## Lijevak — od ~1500 do ~8

| Korak | Šta radi | AI? | Ostane |
|------|----------|-----|--------|
| 1. Prikupljanje | RSS iz slojevitih izvora (`izvori-prosireni.ts`) | ne | ~1500 |
| 2. Dedupe (link) | izbaci već obrađene linkove (baza) | ne | ~800 |
| 3. Pravila | baci šum/reklame/staro/prazno | ne | ~150 |
| 4. Ključne riječi | težina izvora + pogodci ključnih riječi → top N | ne | ~40 |
| 5. **AI triaža** | **jedan poziv**, ocjena samo naslov+opis | **1 poziv** | ~8 |
| 6. Dedupe (tema) | ista priča iz dva izvora → jednom | ne | ~6–8 |
| 7. Pisanje | tek SAD writer čita cijeli tekst i piše | AI | 5–8 draftova |
| 8. Kontrola | Fact-check + Context + Jezik → Supabase draft | AI | isto |

Ključna ideja (dva prolaza AI-a): u koraku 5 AI ocjenjuje **samo naslov + kratak
opis** (jeftino, jedan poziv za svih 40). Cijeli članak se skida i piše
**tek za pobjednike** u koraku 7. To je jedina stvar koja obara trošak za red
veličine.

---

## Fajlovi (šta je gdje)

**Novi:**
- `lib/bot/izvori-prosireni.ts` — katalog izvora po **slojevima** (`tier`):
  službeni, mediji, lokalno, finansije, svijet, sport. Svaki sloj nosi bazno
  povjerenje (`TIER_TEZINA`). BiH je namjerno izostavljen (portal je DE/svijet/sport).
- `lib/bot/lijevak/pravila.ts` — korak 3, **bez AI**. Baca samo ono u šta smo
  sigurni (reklame, horoskop, prestaro, prazno). Granično se PUŠTA dalje.
- `lib/bot/lijevak/kljucne.ts` — korak 4, **bez AI**. Svakoj vijesti daje
  jeftin `predScore` = težina sloja + pogodci ključnih riječi (Kindergeld,
  Aufenthalt, Streik, Unwetter…) + bonus za hitnost + svježina. Vrati top N.
- `lib/bot/agenti/triaza.ts` — korak 5, **jedan AI poziv**. Ocjenjuje 4
  dimenzije (relevantnost za Njemačku, za dijasporu, hitnost, klik) + „već
  poznato". Ukupna ocjena se računa **u kodu** (težine su ovdje, lako se štimaju).
- `lib/bot/pipeline2.ts` — orkestrator koji spaja sve korake i za pobjednike
  poziva **postojeći** writer/fact-check/jezik/slike/publisher (ništa se ne duplira).

**Izmijenjeni (dodatno, ne ruši staro):**
- `lib/bot/tipovi.ts` — dodani opcionalni tipovi (`TierIzvora`, `FeedIzvorPro`,
  `TriazaOcjena`) i polja na `Vijest` (`tier`, `predScore`, `triaza`).
- `lib/bot/rss.ts` — dodан `fetchIzvore(izvori)` (čita proizvoljan spisak);
  `fetchSveVijesti()` sada samo poziva njega s postojećom listom.
- `lib/bot/pipeline.ts` — na vrhu prekidač: ako je `NOVI_PIPELINE=on`,
  preusmjeri na `pipeline2`. Ostatak starog koda netaknut.

---

## Podešavanje (env varijable)

| Varijabla | Default | Šta radi |
|-----------|---------|----------|
| `NOVI_PIPELINE` | (off) | `on` = koristi lijevak (pipeline2) |
| `TOP_ZA_TRIAZU` | 40 | koliko vijesti ulazi u AI triažu |
| `PRAG_TRIAZA` | 68 | minimalna ukupna ocjena (0–100) za objavu |
| `BROJ_OBJAVA` | 8 | koliko draftova max po pokretanju |
| `MAX_STAROST_SATI` | 36 | starije vijesti se bacaju |

Uređivačka politika (težine ukupne ocjene) je u `agenti/triaza.ts`, konstanta `T`:
`relevantnost_de 0.30 · relevantnost_dijaspora 0.30 · hitnost 0.20 · klik 0.20`.
Ako želiš „ozbiljniji" portal — digni težinu relevantnosti i prag; ako želiš
više saobraćaja klikova — digni `klik`.

---

## Trošak

AI radi na: **1 triaža** (par hiljada tokena) + **~8 pisanja** dnevno. To je
centi dnevno za tokene — realno **ispod 1 € dnevno**. Pravi trošak postaje
hosting (GitHub Actions minute) i tvoje vrijeme, ne AI.

---

## Bitno: nesklad koji sam našao

Bot-backend **još uvijek ima BiH** (izvori `Klix/N1/Slobodna Evropa`, `filter.ts`
BiH prompt, `publisher.ts` kategorija „bih", `pipeline.ts` BiH kvota), iako je
frontend očišćen od BiH rubrike. To znači da **stari** pipeline i dalje piše
BiH članke koji se na sajtu nemaju gdje prikazati. Novi lijevak (`pipeline2`)
je već čist — nema BiH. Kad pređeš na `NOVI_PIPELINE=on`, taj nesklad nestaje
sam. (Ako želiš, mogu i stari pipeline očistiti od BiH da bude dosljedno.)

---

## Sljedeći koraci (nisu u ovoj verziji)

- **Faza 1.5 — strukturirani službeni izvori.** DWD (upozorenja na nevrijeme)
  i Deutsche Bahn (poremećaji) nisu klasičan RSS nego JSON/API. Za njih treba
  mali poseban fetcher koji vrati `Vijest[]` s `tier: "vrijeme"/"saobracaj"`;
  lijevak ih dalje tretira isto. Ovo daje najjaču „redakcijsku" prednost.
- **Embeddings (opcionalno).** Za još pametnije grupisanje duplikata i mjerenje
  relevantnosti van ključnih riječi. Traži zaseban jeftin provajder (npr. Voyage
  ili OpenAI embeddings) — nije nužno za v1 jer AI triaža pokriva najveći dio.
- **Učenje iz klikova.** Loguj ocjene triaže + stvarne klikove (analitika je već
  tu) i s vremenom štimaj težine — „vjerovatnoća klika" se ne pogađa, uči se.
- **Društvene mreže.** Prati službene naloge preko Mastodon/Bluesky RSS-a
  (svaki nalog ima otvoreni feed), ne preko X-a (skup/zatvoren).

---

## Kako testirati bez rizika

1. Provjeri feedove: pokreni jednom i pogledaj `admin/pipeline` log — vidiš
   koliko je vijesti stiglo. Feedove označene `// provjeri` u `izvori-prosireni.ts`
   ispravi ako vrate 0 (RSS čitač ne ruši ništa, samo preskoči mrtve).
2. Upali `NOVI_PIPELINE=on` u Vercel/GitHub env. Draftovi idu u `admin/clanci`
   kao i prije — ti odobravaš ručno. Stari pipeline je samo prekidač daleko.
