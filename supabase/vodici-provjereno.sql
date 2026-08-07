-- =====================================================================
--  VODIČI — kolona `provjereno` (datum zadnje provjere ČINJENICA)
--  Supabase → SQL Editor → Run.  Ponovno pokretanje je bezbjedno.
--
--  Zašto posebna kolona, a ne updated_at:
--    updated_at se mijenja na SVAKU izmjenu reda (i tipfeler u naslovu).
--    provjereno se postavlja samo kad su brojevi i pravila u tekstu
--    stvarno provjereni na izvorima — to je datum koji sajt smije
--    pokazati čitaocu kao "Zadnje ažurirano".
--
--  Redoslijed: pokreni POSLIJE vodic-krankenkasse-v2.sql i
--  vodic-anmeldung.sql (update ispod hvata samo vodiče koji imaju tekst,
--  pa ga je bezbjedno pokretati i više puta).
-- =====================================================================

alter table vodici add column if not exists provjereno date;

-- Dva vodiča čije su činjenice provjerene 7. avgusta 2026.
update vodici
   set provjereno = date '2026-08-07'
 where slug in ('krankenkasse', 'prijavljivanje-adrese')
   and tekst is not null;

-- provjera: ko ima datum, ko nema
select slug, naziv, provjereno, length(coalesce(tekst, '')) as duzina_teksta
  from vodici
 order by provjereno desc nulls last, slug;
