# Google indeksiranje — 11 vodiča + Brutto-Netto

Uputstvo za slanje sajta na indeksiranje poslije objave. Traje 15 minuta, radi se jednom.

---

## Prije nego kreneš

Sve mora biti gore i živo:

1. Svi SQL-ovi pokrenuti u Supabase (11 vodiča)
2. Commit + Push urađen, Vercel deploy završen (zeleno)
3. Provjeri da se otvara `kodnas.de/sitemap.xml` i da u njemu **piše `/brutto-netto`** i svih 11 `/vodic/...` linkova
4. Provjeri jedno preusmjerenje: otvori `kodnas.de/vodic/zubar-zahnarzt` — mora te baciti na `/vodic/krankenkasse`

---

## Korak 1 — Search Console (jednom)

1. Idi na **search.google.com/search-console**
2. Add property → **URL prefix** → upiši `https://kodnas.de`
3. Verifikacija: izaberi **HTML file** — fajl `google4c6a50a83f529ec1.html` je **već na sajtu**, samo klikni Verify
4. Ako property već postoji, preskoči ovaj korak

---

## Korak 2 — pošalji sitemap

U Search Console: **Sitemaps** (lijevi meni) → upiši `sitemap.xml` → Submit.

Status treba postati **Success** za par minuta do par sati. Kad postane, Google vidi svih 11 vodiča i kalkulator.

---

## Korak 3 — ubrzaj 12 najvažnijih stranica

Sitemap je „prijava", a ovo je „molba da se odmah pogleda". Za svaki URL ispod:
**URL Inspection** (gore, polje za pretragu) → zalijepi URL → Enter → **Request Indexing**.

Ide otprilike 10 URL-ova dnevno, pa ako te zaustavi — nastavi sutra.

**Redoslijed (najvrednije prvo):**

```
https://kodnas.de/brutto-netto
https://kodnas.de/vodici
https://kodnas.de/vodic/krankenkasse
https://kodnas.de/vodic/porezi-njemacka
https://kodnas.de/vodic/radna-viza-njemacka
https://kodnas.de/vodic/prijavljivanje-adrese
https://kodnas.de/vodic/stan-u-njemackoj
https://kodnas.de/vodic/porodica-u-njemackoj
https://kodnas.de/vodic/priznavanje-diplome-anerkennung
https://kodnas.de/vodic/penzija-i-povratak
https://kodnas.de/vodic/zamjena-vozacke-njemacka
https://kodnas.de/vodic/spajanje-porodice
https://kodnas.de/vodic/njemacko-drzavljanstvo-einburgerung
```

**Stare slugove NE šalji** — oni sad imaju 301 i Google ih sam prebaci na nove.

---

## Korak 4 — Bing (5 minuta, ne preskači)

**bing.com/webmasters** → Add site → ponudiće ti **Import from Google Search Console** → uradi to i gotovo je u dva klika.

Bing pokriva i ChatGPT pretragu, pa je vrijedniji nego što izgleda.

---

## Šta očekivati i kada

| Kada | Šta se dešava |
|---|---|
| 1–3 dana | prve stranice se pojave u indeksu (provjeri: u Google upiši `site:kodnas.de`) |
| 1–2 sedmice | vodiči počnu izlaziti na duge upite („koliko košta krankenkasse 2026") |
| 1–3 mjeseca | pozicije se stabilizuju; tu se vidi da li duži tekstovi rade |
| 3–6 mjeseci | realna borba za glavne upite protiv starih domena |

Ne paniči ako prvih sedmicu dana nema ničega — to je normalno.

---

## Kako pratiti (jednom mjesečno, 5 minuta)

U Search Console → **Performance**:

- **Queries** — po kojim se riječima pojavljuješ. Ovdje se vidi šta ljudi stvarno traže, i to je najbolji spisak za nove vodiče.
- **Pages** — koji vodič radi, koji ne.
- **Position** — prosječna pozicija. Sve ispod 20 znači da si na 2. strani i da fali sadržaja ili linkova.

U **Indexing → Pages** provjeri da nema grešaka tipa „Redirect error" ili „Duplicate".

---

## Kad dodaš novi vodič

1. Pokreni SQL
2. Push
3. Sitemap se sam osvježi (ISR, svakih sat vremena) — **ne treba ga ponovo slati**
4. Samo uradi **URL Inspection → Request Indexing** za taj jedan novi URL

---

## Ako nešto ne valja

**„Discovered – currently not indexed"** — Google zna za stranicu ali je nije uzeo. Obično znači da mu sadržaj nije dovoljno jak ili da je sajt nov. Rješenje: strpljenje + interni linkovi (naši vodiči se već međusobno linkuju).

**„Page with redirect"** kod starih slugova — to je **normalno i tako treba**, ne greška.

**„Duplicate without user-selected canonical"** — javi mi, znači da dva URL-a nude isti sadržaj.
