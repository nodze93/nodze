-- ============================================================
-- FACEBOOK AUTO-OBJAVA — kolona za praćenje (dedupe)
-- ============================================================
-- Pokreni JEDNOM u Supabase SQL editoru.
-- fb_post_id = ID FB posta; ako je popunjen, članak se NE objavljuje ponovo
-- automatski (spriječava duple objave pri ponovnom "Objavi").

ALTER TABLE clanci ADD COLUMN IF NOT EXISTS fb_post_id text;
