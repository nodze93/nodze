-- ============================================================
-- kodnas.de — JEDINSTVENA SUPABASE ŠEMA (v2, konačna)
-- ============================================================
-- Pokreni CIJELI ovaj fajl u Supabase → SQL Editor → Run.
-- Ova šema pokriva i sajt i bota — nema više dvije verzije.
--
-- Ako već imaš staru "clanci" tabelu iz ranijih pokušaja, prvo je obriši:
--   DROP TABLE IF EXISTS clanci CASCADE;
-- (samo ako u njoj nemaš ništa što ti treba!)
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- ČLANCI ----------
CREATE TABLE IF NOT EXISTS clanci (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  naslov text NOT NULL,
  excerpt text,
  sadrzaj text NOT NULL,

  -- SVE kategorije koje bot i sajt koriste (uklj. svijet/sport/bih/vijesti/finansije)
  kategorija text NOT NULL DEFAULT 'vijesti' CHECK (
    kategorija IN (
      'viza','posao','stan','zdravstvo','porodica','porez','penzija','povratak',
      'finansije','vijesti','bih','sport','svijet','dokumenti','gastarbajter','drama','biznis'
    )
  ),

  -- Statusi usklađeni s admin panelom
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived','rejected')),

  auto_generisan boolean DEFAULT false,
  izvor text,                          -- npr. "Klix.ba" (originalni portal)
  min_citanja integer DEFAULT 5,
  broj_pregleda integer DEFAULT 0,

  -- ── Bot metadata: fact-check / context / jezik ──
  faktcheck_status text DEFAULT 'zuto' CHECK (faktcheck_status IN ('zeleno','zuto','crveno')),
  faktcheck_report jsonb,
  context_report   jsonb,
  jezik_ocjena     text,               -- 'cisto' | 'sitne_greske' | 'puno_gresaka'
  jezik_report     jsonb,

  -- ── Slika (Unsplash — samo URL, fajl se NE čuva u bazi) ──
  slika        text,
  slika_autor  text,

  -- ── Porijeklo ──
  originalni_link  text,               -- link originalne vijesti
  zvanicni_izvor   text,               -- zvanična stranica korištena za grounding
  tip              text DEFAULT 'dijaspora' CHECK (tip IN ('dijaspora','svjetske','sport')),

  -- ── Vremena ──
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  datum_objave timestamptz             -- postavlja se kad admin klikne Objavi
);

CREATE INDEX IF NOT EXISTS clanci_status_idx     ON clanci(status, datum_objave DESC);
CREATE INDEX IF NOT EXISTS clanci_kategorija_idx ON clanci(kategorija);
CREATE INDEX IF NOT EXISTS clanci_created_idx    ON clanci(created_at DESC);
CREATE INDEX IF NOT EXISTS clanci_tip_idx        ON clanci(tip);
CREATE INDEX IF NOT EXISTS clanci_slug_idx       ON clanci(slug);

-- Automatski updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS clanci_updated_at ON clanci;
CREATE TRIGGER clanci_updated_at
  BEFORE UPDATE ON clanci
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------- OBRAĐENI LINKOVI (bot dedupe — da isti članak ne piše dvaput) ----------
CREATE TABLE IF NOT EXISTS obradjeni_linkovi (
  link text PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

-- ---------- PIPELINE LOGOVI (admin "Pipeline" stranica čita ovo) ----------
CREATE TABLE IF NOT EXISTS pipeline_logovi (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  datum timestamptz DEFAULT now(),
  status text CHECK (status IN ('uspjeh','djelimicno','greška')),
  clanci_napisano integer DEFAULT 0,
  rss_vijesti integer DEFAULT 0,
  trending_tema text,
  greska text,
  trajanje_sekundi integer DEFAULT 0,
  detalji jsonb
);

CREATE INDEX IF NOT EXISTS pipeline_logovi_datum_idx ON pipeline_logovi(datum DESC);

-- ---------- VODIČI ----------
CREATE TABLE IF NOT EXISTS vodici (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  naziv text NOT NULL,
  opis text,
  sadrzaj jsonb NOT NULL DEFAULT '[]',
  kategorija text,
  ikona text DEFAULT '📋',
  min_citanja integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

-- ---------- NEWSLETTER ----------
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  aktivan boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ---------- KONTAKT ----------
CREATE TABLE IF NOT EXISTS kontakt_poruke (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ime text NOT NULL,
  email text NOT NULL,
  poruka text NOT NULL,
  procitano boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- RLS — javnost čita samo objavljeno; bot i admin idu preko
-- SERVICE ROLE ključa (koji zaobilazi RLS) u server rutama.
-- ============================================================
ALTER TABLE clanci                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE obradjeni_linkovi      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_logovi        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vodici                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE kontakt_poruke         ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "javno_cita_objavljene" ON clanci;
CREATE POLICY "javno_cita_objavljene" ON clanci
  FOR SELECT TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "javno_cita_vodice" ON vodici;
CREATE POLICY "javno_cita_vodice" ON vodici
  FOR SELECT TO anon, authenticated USING (true);

-- Newsletter: javnost smije SAMO dodati svoj email (ne čitati tuđe)
DROP POLICY IF EXISTS "javno_upisuje_newsletter" ON newsletter_subscribers;
CREATE POLICY "javno_upisuje_newsletter" ON newsletter_subscribers
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Kontakt: javnost smije samo poslati poruku
DROP POLICY IF EXISTS "javno_salje_kontakt" ON kontakt_poruke;
CREATE POLICY "javno_salje_kontakt" ON kontakt_poruke
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- obradjeni_linkovi i pipeline_logovi: bez javnih politika
-- (pristupa im samo service role, koji zaobilazi RLS)

-- ============================================================
-- SEED PODACI — Početni vodiči
-- ============================================================
INSERT INTO vodici (slug, naziv, opis, ikona, kategorija, min_citanja, sadrzaj) VALUES
(
  'radna-viza-njemacka',
  'Radna viza za Njemačku',
  'Od aplikacije do dolaska — sve što trebaš znati',
  '📋',
  'viza',
  15,
  '[{"broj":1,"naslov":"Pronađi posao","opis":"Aplicirati na njemacke portale: Indeed.de, Stepstone.de, LinkedIn."},{"broj":2,"naslov":"Anerkennung diplome","opis":"Provjeri na anabin.kmk.org da li tvoja diploma treba nostrifikaciju."},{"broj":3,"naslov":"Zakažite termin u Ambasadi","opis":"Online rezervacija na antrag.diplo.de za Sarajevo."}]'::jsonb
),
(
  'krankenkasse',
  'Krankenkasse — kako se prijaviti',
  'Javno ili privatno zdravstveno osiguranje, ko može biti suosiguran',
  '🏥',
  'zdravstvo',
  8,
  '[{"broj":1,"naslov":"Odaberi blagajnu","opis":"Usporedi Zusatzbeitrag. TK, Barmer i AOK su najpopularnije."},{"broj":2,"naslov":"Prijavi se online","opis":"Na web stranici odabrane blagajne s Anmeldung i platnim listovima."}]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
