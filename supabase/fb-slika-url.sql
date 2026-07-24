-- ============================================================
-- FACEBOOK — ručni URL slike za thumbnail/objavu
-- ============================================================
-- Pokreni JEDNOM u Supabase SQL editoru.
-- fb_slika_url = opcioni URL slike koji ima PREDNOST nad slikom članka.
-- Koristi se kad članak nema sliku, ili kad želiš zamijeniti postojeću.
-- Prazno (NULL) = koristi se slika članka kao i do sada.

ALTER TABLE clanci ADD COLUMN IF NOT EXISTS fb_slika_url text;
