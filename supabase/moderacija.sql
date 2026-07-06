-- ============================================================
-- MODERACIJA — dodatne kolone za uređivanje na stranici
-- ============================================================
-- Pokreni CIJELI ovaj fajl u Supabase → SQL Editor → Run.
-- Aditivno je (ne briše ništa) i sigurno se može pokrenuti više puta.

-- Ručni redoslijed (manji broj = više gore). Default 0 = kao i do sad.
ALTER TABLE clanci ADD COLUMN IF NOT EXISTS redoslijed integer DEFAULT 0;

-- Naslovna (hero) vijest — samo jedan članak je true.
ALTER TABLE clanci ADD COLUMN IF NOT EXISTS je_naslovna boolean DEFAULT false;

-- Zakazivanje: ako je postavljeno u budućnost, članak je sakriven
-- od javnosti dok ne dođe to vrijeme (tad se sam pojavi).
ALTER TABLE clanci ADD COLUMN IF NOT EXISTS zakazano_za timestamptz;

CREATE INDEX IF NOT EXISTS clanci_redoslijed_idx ON clanci(redoslijed);
CREATE INDEX IF NOT EXISTS clanci_naslovna_idx ON clanci(je_naslovna) WHERE je_naslovna = true;
