-- ============================================================
-- SOCIAL MEDIA MIGRACIJA v1
-- Dodaje Facebook kolone u tabelu clanci.
-- Pokrenuti JEDNOM u Supabase SQL Editoru.
-- ============================================================

-- Facebook post tekstovi (generirani od Writer agenta u ISTOM AI pozivu)
ALTER TABLE clanci ADD COLUMN IF NOT EXISTS fb_tekst_news   text;  -- vijesti post (klikovi)
ALTER TABLE clanci ADD COLUMN IF NOT EXISTS fb_tekst_engage text;  -- engagement post (komentari)

-- Thumbnail overlay tekst (kratki, udarni redovi za branded thumbnail sliku)
ALTER TABLE clanci ADD COLUMN IF NOT EXISTS fb_thumbnail_r1 text;  -- udarna rečenica (r1, max ~8 rijeci)
ALTER TABLE clanci ADD COLUMN IF NOT EXISTS fb_thumbnail_r2 text;  -- podnaslov/kategorija (r2, max ~5 rijeci)

-- Da li AI smatra da ovaj clanak treba ici na Facebook (default: true)
ALTER TABLE clanci ADD COLUMN IF NOT EXISTS fb_ide_na_facebook boolean DEFAULT true;

-- Status posta u redu cekanja
--   ceka      = novi draft, ceka admin pregled
--   odobreno  = admin odobrio, ceka objavu
--   objavljeno = uspjesno objavljeno na FB
--   preskoceno = admin ili AI odlucio da preskoci
ALTER TABLE clanci ADD COLUMN IF NOT EXISTS fb_social_status text DEFAULT 'ceka'
  CHECK (fb_social_status IN ('ceka', 'odobreno', 'preskoceno', 'objavljeno'));

-- Tip objave koji admin odabere (ili AI sugerira):
--   news     = vijesti post (klikovi na clanak)
--   engage   = engagement post (komentari/dijeljenje)
--   original = bez thumbnailа, koristi originalnu sliku clanka
ALTER TABLE clanci ADD COLUMN IF NOT EXISTS fb_tip text
  CHECK (fb_tip IN ('news', 'engage', 'original'));

-- Zakazano za — kad je admin zakazao objavu (NULL = odmah/rucno)
ALTER TABLE clanci ADD COLUMN IF NOT EXISTS fb_zakazano_za timestamptz;

-- Index za admin panel (brzo dohvacanje po statusu)
CREATE INDEX IF NOT EXISTS idx_clanci_fb_social_status
  ON clanci (fb_social_status, created_at DESC)
  WHERE fb_social_status IS NOT NULL;

-- Postoji vec: fb_post_id text (iz facebook.sql) -- NE treba ponovo dodavati
