# TRENUTNI ZADATAK

## Datum: 2026-07-10

## ŠTA SMO RADILI (ova sesija)
Sve upisano u folder (osim bot-cron.yml koji je zaštićen):

1. GRAMATIKA — novi završni prolaz
   - NOVO lib/bot/agenti/gramatika.ts — zaseban, ZADNJI poziv nakon lektora,
     radi SAMO gramatiku (padeži, rod, slaganje), ne dira stil/HTML.
   - PREKIDAČ preko env-a: MODEL_GRAMATIKA (default Haiku; postavi
     "claude-sonnet-4-5" u Vercelu za bolju gramatiku bez izmjene koda).
     GRAMATIKA_PROLAZ=off ga potpuno isključi.
   - claude.ts (MODEL_GRAMATIKA const), pipeline.ts (poziv poslije lektora).

2. SLIKE — Wikimedia IMPLEMENTIRANO (penzionisan Unsplash kao glavni)
   - NOVO lib/bot/slike-wikimedia.ts — izvuče IMENA iz naslova → Wikipedia
     (de/en) glavna slika (~1200px) → licenca s Commons; rezerva Commons pretraga.
   - pipeline.ts: Wikimedia PRVO, Unsplash samo rezerva. tipovi.ts (SlikaInfo),
     publisher.ts (oznaka: autor + licenca).
   - ADMIN dugme za STARE članke: app/admin/slike/page.tsx + 
     app/api/admin/slike-wikimedia/route.ts (pregled → primijeni, batch) +
     link u app/admin/layout.tsx. (Pexels NIJE rađen — Wikimedia dovoljno.)

3. KATEGORIJE NA TELEFONU (desktop netaknut)
   - NOVO components/KategorijaMobilna.tsx — naslovni članak + kartice sa
     slikama, kao naslovna. app/kategorija/[slug]/page.tsx, app/de/page.tsx,
     app/bih/page.tsx (mobilni blok .kat-mob, Ticker sakriven na telefonu).

4. MARKETING SLIKA + TEKST (dijeljenje linka)
   - /public/og-default.jpg regenerisan (PIL): "Sve njemačke vijesti na našem
     jeziku" + "Aktuelne vijesti iz Njemačke — svaki dan", čipovi BEZ Austrije.
   - app/layout.tsx metadata (title/description/OG/twitter) na novo pozicioniranje.

5. SEO — provjereno, već dobro
   - sitemap.ts (dinamičan, svi članci+vodiči) i robots.ts (kodnas.de) OK.
   - GSC verifikacija ide preko GOOGLE_SITE_VERIFICATION env (još nije postavljeno).

## STANJE
- Portal LIVE: kodnas.de. Bot radi (piše draftove).
- SVE izmjene ove sesije su u folderu, spremne za Commit → Push.
- Desktop NIJE diran (mobilne izmjene izolovane).

## ⚠️ RUČNI KORACI KOJI ČEKAJU KORISNIKA
1. GitHub Desktop → Commit → Push (SVE nepokupljeno zajedno — bot+slike+kategorije+og).
2. Test Wikimedia: admin → 🖼️ Slike → "Pronađi slike" → pregled → primijeni.
3. Facebook (kad želi uživo): supabase/facebook.sql + FB_PAGE_ID/FB_PAGE_TOKEN env.
   Nakon push: FB Sharing Debugger → Scrape Again (da povuče novu og sliku).
4. Google: Search Console → dodaj kodnas.de → HTML tag → daj mi kod ILI postavi
   GOOGLE_SITE_VERIFICATION u Vercel → submit sitemap.xml.

## DOGOVORENO ALI NIJE RAĐENO (sljedeći koraci)
- KAPALJKA: pisati u seriji, objavljivati postepeno kroz dan (preko zakazano_za)
  da uvijek ima svježe. AUTO-OBJAVA kasnije — kad se gramatika potvrdi kao dobra.
- Dizanje obima na ~20 članaka/dan (~€25/mj). Podešava se iz admina (bot_config:
  vremena + kvote), NE treba kod. Realan trošak ~4 EUR centa/članak.
- Impressum + Datenschutz: pravno OBAVEZNO (Njemačka, Abmahnung rizik), ali
  korisnik NIJE spreman upisati prave podatke → odloženo. NE stavljati placeholder.
- Ako Haiku gramatika i dalje slaba → prebaci MODEL_GRAMATIKA na Sonnet (env).

## STATUS
🟡 Sve spremno u folderu — čeka Commit → Push + testove (Wikimedia, og, telefon).
