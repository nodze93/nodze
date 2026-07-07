-- ============================================================
-- BOT RASPORED — kontrola bota iz admina
-- ============================================================
-- Jedan red (id=1) drži cijeli raspored. Admin ga uređuje,
-- a /api/cron/tick ga čita i pokreće bota u zadata vremena.

create table if not exists bot_config (
  id smallint primary key default 1,
  aktivan boolean not null default true,
  -- vremena pokretanja po Berlinu, npr. {'06:00','12:30','20:00'}
  vremena text[] not null default array['06:00','12:30','20:00'],
  -- koliko članaka po pokretanju
  kvota_de smallint not null default 1,
  kvota_bih smallint not null default 1,
  kvota_svijet smallint not null default 1,
  kvota_sport smallint not null default 1,
  -- zadnji odrađeni slot ("2026-07-07 06:00") — spriječi dvostruko pokretanje
  zadnji_slot text,
  updated_at timestamptz not null default now(),
  constraint bot_config_samo_jedan_red check (id = 1)
);

-- Ubaci početni red ako ga nema
insert into bot_config (id) values (1) on conflict (id) do nothing;
