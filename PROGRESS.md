# PROGRESS LOG — KODNAS.DE

## STATUS: LIVE + bogat feature set (izmjene čekaju push/merge na preview)
Zadnji update: 2026-07-09

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
- [ ] SLIKE: implementirati Wikimedia (glavno) + Pexels (rezerva), penzionisati Unsplash
- [ ] Nova serija vodiča: Bürgergeld, Wohngeld, penzija BiH–Njemačka, otvaranje firme, Minijob
- [ ] Uskladiti stari vodič "trudnoća" ako još negdje spominje Kindergeld za dijete u BiH
- [ ] GSC/Bing verifikacija + Indexing API
- [ ] Veliki hero na naslovnoj → dinamički (URAĐENO ranije, provjeriti)

## 💡 ZA POSLIJE
- Ispovijesti sekcija, Telegram kanal, TikTok video
