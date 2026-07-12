# PROGRESS LOG — KODNAS.DE

## STATUS: LIVE + bogat feature set (izmjene čekaju push/merge na preview)
Zadnji update: 2026-07-12

## 🆕 SESIJA 2026-07-12 (audit, novi logo, kompletni vodiči, BOT 2.0 "lijevak", memorija, admin mobilni)

### Audit sajta + čišćenje (frontend)
- [x] Footer: rebrand, izbačena Austrija/Švicarska, izbačeni mrtvi linkovi
      (/newsletter, /oglasavanje → /vijesti, /vodici).
- [x] "Uvijek mrtvi" linkovi: Hero bočne kartice + NajcitanijeBox sad vuku PRAVE
      članke iz baze (fallback = pravi vodiči). Nema više izmišljenih /clanak/.
- [x] Izbačeni BiH-mock fallbackovi (page.tsx, NajnovijeSection, NajpopularnijeSection)
      — prazna sekcija se sakrije umjesto lažnih linkova.
- [x] Rebrand + de-Austrija: o-nama, vijesti, vodici, FaqBox, ai-chat.
- [x] Newsletter forma SPOJENA na /api/newsletter (prije "TODO", nije snimala).

### Logo — novi wordmark "Dnevni filter njemačkih vijesti"
- [x] Varijanta D (verzal): "DNEVNI FILTER" + sitnije "NJEMAČKIH VIJESTI".
      Nav.tsx (header+drawer) + Footer.tsx. Staro "Kod nas u…" izbačeno.

### Vodiči — sve grupe kompletirane (17 → 31)
- [x] Stan 1→8, Zdravstvo 1→8, Porodica 1→8. (viza 7, posao 3, +1 ostale.)
- [x] Provjerene brojke 2026: Kindergeld 259€, Rundfunkbeitrag 18,36€,
      Mietpreisbremse do 2029, Pflegegeld PG2~347/PG3~599/PG4~800/PG5~990€.
- [x] Popravljena 2 ćirilična slova (jedno staro u Westbalkan vodiču).

### BOT 2.0 — "LIJEVAK" (pipeline2), pali se prekidačem
- [x] Tok: ~1500 RSS → dedupe → PRAVILA (bez AI) → KLJUČNE RIJEČI+tier (bez AI, top 40)
      → AI TRIAŽA (JEDAN poziv, naslov+opis) → dedupe tema → pobjednici: writer
      čita cijeli tekst → fact-check/jezik → draft. AI skupo radi ~8 članaka/dan.
- [x] NOVO: izvori-prosireni.ts (tier), lijevak/pravila.ts, lijevak/kljucne.ts,
      agenti/triaza.ts, pipeline2.ts. + BOT-LIJEVAK.md.
- [x] rss.ts (fetchIzvore), pipeline.ts (NOVI_PIPELINE prekidač), run-bot.ts
      (lijevak PODRAZUMIJEVAN; stari = NOVI_PIPELINE=off), tipovi.ts.
- [x] Env štimanje: PRAG_TRIAZA=68, BROJ_OBJAVA=8, TOP_ZA_TRIAZU=40, MAX_STAROST_SATI=36.
- [x] Popravke: triaža u grupama po 20 + izbačen "razlog" + zaštita (bio max_tokens crash);
      izbačena 3 mrtva feeda (Bundesregierung/Focus/Köln). PRVI TEST (run #33) → piše draftove. ✅

### Memorija tema + tvrđa dedupe (protiv ponavljanja) — BEZ diranja starih članaka
- [x] publisher.ts ucitajNedavneNaslove() → signal triaži ("vec_poznato" spusti duplikat,
      ali "novi razvoj iste teme" prolazi kao nova vijest).
- [x] ODLUKA: NE ažurirati stare članke. Rezolucija štrajka = nova vijest, ne dodatak.
- [x] dedupe.ts: normLink() + istaTemaStrogo() (≥3 iste riječi ILI jaccard ≥0.55);
      pipeline2.ts normalizovan link-dedupe + izbaciVecObjavljene() preko dana.

### Scroll fix + Admin za telefon (ponovo — prošli put nije stvarno radilo)
- [x] ScrollNaVrh.tsx — pravi uzrok = browser scroll restoration; sad na reload
      isključi pa forsira vrh, "nazad" i dalje pamti poziciju.
- [x] app/admin/layout.tsx — sidebar je bio uvijek vidljiv (jeo pola ekrana!);
      sad fioka na ☰ + sadržaj cijela širina. Logo "kodnas.de".
- [x] app/admin/clanci/page.tsx — tabela → KARTICE na telefonu (velika dugmad). Desktop = tabela.

### VAŽNO — nesklad
- Bot-BACKEND (izvori.ts, filter.ts, publisher.ts, pipeline.ts) JOŠ IMA BiH,
  iako je frontend očišćen. NOVI lijevak (pipeline2) je čist. Nebitno kad se koristi lijevak.

## 🆕 SESIJA 2026-07-10 (gramatika, Wikimedia slike, kategorije na telefonu, marketing)

### Gramatika — završni prolaz (odvojen od lektora)
- [x] NOVO lib/bot/agenti/gramatika.ts — zaseban ZADNJI poziv, radi SAMO
      gramatiku (padeži, rod, slaganje, ijekavica), ne dira stil/HTML.
- [x] PREKIDAČ env: MODEL_GRAMATIKA (default Haiku → postavi "claude-sonnet-4-5"
      za bolju gramatiku bez izmjene koda). GRAMATIKA_PROLAZ=off isključi.
- [x] claude.ts (MODEL_GRAMATIKA), pipeline.ts (poziv poslije lektora).
- Razlog: Haiku slabiji za bosansku gramatiku; besplatna pravila već iscrpljena.

### Slike — Wikimedia IMPLEMENTIRANO (Unsplash pao na rezervu)
- [x] NOVO lib/bot/slike-wikimedia.ts — izvuče vlastita IMENA iz naslova
      (Merz, Washington, Džeko, Bundestag...) → Wikipedia (de/en) glavna slika
      (~1200px, oštro+brzo) → licenca s Commons; rezerva Commons full-text.
      Za apstraktne naslove bez imena → null (članak zadrži staru sliku).
- [x] pipeline.ts: Wikimedia PRVO, Unsplash rezerva. tipovi.ts (SlikaInfo),
      publisher.ts (oznaka slike = autor + Wikimedia Commons + licenca).
- [x] ADMIN dugme za STARE članke: app/admin/slike/page.tsx (pregled sa
      staro→novo, odznači šta ne želiš, pa primijeni) + 
      app/api/admin/slike-wikimedia/route.ts (preview/apply, batch po 8) +
      link "🖼️ Slike" u app/admin/layout.tsx.
- Napomena: og:image iz izvora ostaje ODBAČEN (Abmahnung rizik). Pexels nije rađen.

### Kategorije na telefonu — izgled kao naslovna (desktop netaknut)
- [x] NOVO components/KategorijaMobilna.tsx — naslovni članak (velika slika +
      naslov + datum) + ostali kao kartice sa slikama, do ivica ekrana.
- [x] app/kategorija/[slug]/page.tsx, app/de/page.tsx, app/bih/page.tsx —
      mobilni blok (.kat-mob) + desktop lista sakrivena na telefonu (.kat-desktop-lista),
      Ticker sakriven na telefonu. Desktop identičan kao prije.

### Marketing — slika i tekst za dijeljenje linka
- [x] /public/og-default.jpg regenerisan (PIL): naslov "Sve njemačke vijesti
      na našem jeziku" (bijelo), podnaslov "Aktuelne vijesti iz Njemačke —
      svaki dan", čipovi BEZ Austrije, čist zeleni dizajn s logom.
- [x] app/layout.tsx — title/description/OG/twitter na novo pozicioniranje
      (njemačke vijesti na bosanskom), Austrija maknuta iz vidljivog teksta.

### SEO — provjereno (već dobro postavljeno)
- [x] sitemap.ts dinamičan (statične + kategorije + SVI objavljeni članci iz
      baze + svi vodiči), robots.ts (dozvoli sve, blokiraj admin/api, sitemap).
      Oba na kodnas.de. GSC verifikacija ide preko GOOGLE_SITE_VERIFICATION env.

### Odluke/strategija
- Pozicioniranje: NJEMAČKE vijesti na bosanskom (ne takmičiti se s klixom na
  bh. vijestima). Cilj ~20 članaka/dan (~€25/mj). Realan trošak ~4 EUR centa/članak
  (NE 0.5 — ranija procjena bila pogrešna). Kapaljka + auto-objava = dogovoreno, TODO.

## 🆕 SESIJA 2026-07-09 (bot, mobilna verzija, vodiči)

### Bot — jeftinije, tačnije, bolja gramatika
- [x] DEDUPE popravka (glavna ušteda): bot je pamtio samo OBJAVLJENE linkove,
      pa je filter (Claude) svakih 15 min ponovo ocjenjivao istih ~140 vijesti.
      Sad se pamte SVE vijesti koje prođu kroz filter (oznaciObradjeneBatch u
      publisher.ts + poziv u pipeline.ts) → ~85-90% manje Claude poziva.
- [x] Context agent ISKLJUČEN (vraćao samo true/false kućice koje se ne koriste)
      → jedan Claude poziv manje po svakom članku.
- [x] Writer maxTokens 2500 → 3800 (članak se sjekao prije poente).
- [x] Jezik/lektor maxTokens 3000 → 4500 (vraća cijeli članak, ne smije se sjeći).
- [x] Bosanska gramatička pravila (padeži uz brojeve, slaganje roda/broja,
      ijekavica, bosanski oblici) dodana i piscu (writer.ts ZAJEDNICKA_PRAVILA)
      i lektoru (jezik.ts).
- [x] Pravilo "ako naslov/uvod nešto obeća, tekst to MORA razriješiti" (writer).
- [x] Bolje čitanje izvora (fetchIzvor): hvata i <li>/<h2>/<h3> + rezerva na
      ogoljeni tekst (prije samo <p>, pa su detalji promicali).
- [x] Upozorenje u logu kad odgovor udari u max_tokens (claude.ts).
- Klikabilnost i selekcija vijesti NISU dirane (filter.ts netaknut).

### Admin za telefon (mobilna verzija) — desktop netaknut
- [x] NOVO lib/useIsMobile.ts — hook za detekciju telefona.
- [x] app/admin/layout.tsx — hamburger meni + off-canvas sidebar na telefonu.
- [x] components/admin/AdminModeracija.tsx — kartice umjesto stisnutih redova,
      velika dugmad, filter po statusu ("Na čekanju") za brzo odobravanje.
- [x] app/admin/clanci/page.tsx — tabela → kartice na telefonu (veliko "🚀 Objavi").
- [x] app/admin/page.tsx — grid kartica se slaže 2×2, tabela horizontalni scroll.

### Naslovna za telefon — desktop netaknut
- [x] NOVO components/MobilnaNaslovna.tsx — 4 JEDNAKE kutije do ivica ekrana
      (🇩🇪 Njemačka, 🇧🇦 BiH, 🌍 Svijet, ⚽ Sport), sve sa slikama (klix stil).
      Kutije vuku NAŠE objavljene članke (imaju slike; siva kutija ako nema).
- [x] lib/live.ts — slika dodata u LiveStavka; nove funkcije dajLiveSport + MOCK_SPORT.
- [x] app/page.tsx — hide-mob/samo-mob obrazac; Ticker "Uživo" sakriven na telefonu;
      traka kategorija prebačena IZNAD slike na telefonu (Sport ispod Svijeta).
- [x] components/HeroRotator.tsx — na telefonu samo naslov + datum (opis sakriven).
- [x] components/KategorijBar.tsx — momentum swipe (klizi prstom), skriven scrollbar.

### Stranica članka — popravljen horizontalni scroll
- [x] app/clanak/[slug]/page.tsx — više se ne pomjera lijevo/desno na telefonu:
      flexWrap na redu meta i redu za dijeljenje, prelamanje dugih linkova,
      slike max-width:100%, tabele skrolaju unutar sebe, grid minmax(0,1fr).

### Vodiči — 12 → 17, svi provjereni (fact-check 2026)
- [x] 5 NOVIH vodiča: zamjena vozačke, priznavanje diplome (Anerkennung),
      njemačko državljanstvo (Einbürgerung), Kindergeld+poreske klase, Ausbildung+njega.
- [x] Fact-check svih 17 (3 subagenta, aktuelni njemački izvori). Ispravljeno:
      Krankenkasse prag 66.600→77.400€; Familienversicherung 505→565€ (603 mini-job);
      Kindergeld 255→259€ (od 2026); "dijete u BiH dobija Kindergeld" ispravljeno
      (varljivo — samo mali iznos pod uslovima); Elterngeld granica 175.000€;
      Integrationskurs 1.95→2.29€/sat; Goethe B2 ~289€ (+ telc/VHS jeftinije);
      Beibehaltungsgenehmigung (bio pogrešan pojam za boravak); vozačka (rok=vožnja,
      zamjena može i kasnije + ispravljen netačan dio o ispitu); Chancenkarte iskustvo
      5→3 god; Westbalkan kvota napomena.
- [x] Dodati "hackovi" kroz vodiče (kaucija na 3 rate, mini-job čuva osiguranje,
      termini rano ujutro, homeoffice+kilometraža isti dan, itd.).

## ✅ URAĐENO RANIJE (do 2026-07-06)
- Domena, Vercel, Supabase, GitHub; portal LIVE na kodnas.de
- Bot na GitHub Actions (Node 22, npx tsx scripts/run-bot.ts)
- MOST do kompjutera (Claude piše direktno u folder)
- Sigurnosni audit (rate limit, XSS, admin login timing-safe, cron secret)
- Bot optimizacija (Haiku, prompt caching, skip fact-check sport/svijet)
- DE/BiH odvojene kvote + 3x dnevno raspored; "Pokreni odmah" preko GitHub Actions
- Moderacija na stranici (Article Manager: reorder, pin, uredi, zakaži, obriši, dodaj)
- SEO (sitemap, robots, verifikacioni tagovi)
- Layout: kategorijske stranice, /de i /bih stil, naslovni widgeti
- Očišćen tekst koji odaje automatizaciju

## 🚧 ČEKA MENE (ručni koraci)
1. Push svih ovih izmjena na PREVIEW → testirati na telefonu → merge u main
2. (Ranije) bot-cron.yml ručno kopirati; GITHUB_TOKEN u Vercel; moderacija.sql u Supabase

## 📋 TODO / SLJEDEĆE
- [x] SLIKE: Wikimedia implementiran (bot + admin dugme). Unsplash = rezerva.
- [ ] KAPALJKA: postepeno objavljivanje kroz dan (zakazano_za) + AUTO-OBJAVA
      (kad se gramatika potvrdi). Dizanje kvota na ~20/dan (iz admina bot_config).
- [ ] Impressum + Datenschutz stranice (pravno obavezno, čeka prave podatke korisnika).
- [ ] Ako Haiku gramatika slaba → MODEL_GRAMATIKA=claude-sonnet-4-5 (env u Vercelu).
- [ ] Nova serija vodiča: Bürgergeld, Wohngeld, penzija BiH–Njemačka, otvaranje firme, Minijob
- [ ] Uskladiti stari vodič "trudnoća" ako još negdje spominje Kindergeld za dijete u BiH
- [ ] GSC: dodaj property + submit sitemap (GOOGLE_SITE_VERIFICATION env). Bing opciono.

## 💡 ZA POSLIJE
- Ispovijesti sekcija, Telegram kanal, TikTok video
