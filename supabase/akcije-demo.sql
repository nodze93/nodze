-- =====================================================================
--  AKCIJE — DEMO PODACI (nije obavezno)
--  Pokreni SAMO ako hoćeš da vidiš kako stranica izgleda prije nego
--  scraper prvi put povuče prave podatke.
--  PAŽNJA: prvi red briše sve iz ak_ tabela.
--  PLZ-ovi: 85737 (Ismaning), 80331 (München), 10115 (Berlin)
-- =====================================================================
truncate ak_discounts, ak_stores_by_plz, ak_stores restart identity cascade;

insert into ak_stores (name, slug) values
    ('Lidl',        'lidl'),
    ('Aldi Sued',   'aldi-sued'),
    ('REWE',        'rewe'),
    ('Edeka',       'edeka'),
    ('Penny',       'penny'),
    ('Netto',       'netto'),
    ('Kaufland',    'kaufland'),
    ('dm',          'dm'),
    ('Rossmann',    'rossmann'),
    ('MediaMarkt',  'mediamarkt');

-- Koje prodavnice postoje u kojem PLZ-u
insert into ak_stores_by_plz (store_id, plz)
select s.id, p.plz
from ak_stores s
cross join (values ('85737'), ('80331'), ('10115')) as p(plz)
where not (p.plz = '85737' and s.slug in ('mediamarkt', 'rossmann'))   -- nema ih u Ismaningu
  and not (p.plz = '10115' and s.slug = 'aldi-sued');                  -- u Berlinu je Aldi Nord

-- ---------------------------------------------------------------------
-- POPUSTI
-- ---------------------------------------------------------------------
insert into ak_discounts (product_name, old_price, new_price, store_id, category, plz, date, valid_to)
values
-- ===== 85737 Ismaning =====
('Rinderhackfleisch 500g',            4.99, 2.99, (select id from ak_stores where slug='lidl'),      'Fleisch',      '85737', current_date, current_date + 5),
('Schweineschnitzel 1kg',            10.99, 6.99, (select id from ak_stores where slug='lidl'),      'Fleisch',      '85737', current_date, current_date + 5),
('Haehnchenbrust 600g',               7.49, 4.99, (select id from ak_stores where slug='lidl'),      'Fleisch',      '85737', current_date, current_date + 5),
('Butter 250g',                       2.49, 1.49, (select id from ak_stores where slug='lidl'),      'Molkerei',     '85737', current_date, current_date + 5),
('Gouda jung 400g',                   3.29, 2.19, (select id from ak_stores where slug='lidl'),      'Molkerei',     '85737', current_date, current_date + 5),
('Coca-Cola 1,25L',                   1.99, 0.99, (select id from ak_stores where slug='lidl'),      'Getraenke',    '85737', current_date, current_date + 3),
('Erdbeeren 500g',                    3.99, 1.99, (select id from ak_stores where slug='lidl'),      'Obst',         '85737', current_date, current_date + 2),
('Waschmittel 40WL',                 12.99, 7.99, (select id from ak_stores where slug='lidl'),      'Haushalt',     '85737', current_date, current_date + 7),

('Bio Vollmilch 1L',                  1.59, 1.09, (select id from ak_stores where slug='aldi-sued'), 'Molkerei',     '85737', current_date, current_date + 6),
('Lachsfilet 250g',                   6.99, 4.49, (select id from ak_stores where slug='aldi-sued'), 'Fisch',        '85737', current_date, current_date + 4),
('Kartoffeln 2,5kg',                  3.49, 2.29, (select id from ak_stores where slug='aldi-sued'), 'Gemuese',      '85737', current_date, current_date + 6),
('Olivenoel 750ml',                   8.99, 5.99, (select id from ak_stores where slug='aldi-sued'), 'Lebensmittel', '85737', current_date, current_date + 6),
('Kaffee gemahlen 500g',              6.49, 3.99, (select id from ak_stores where slug='aldi-sued'), 'Getraenke',    '85737', current_date, current_date + 6),

-- REWE ne daje staru cijenu -> "Angebot", ispada iz filtera po procentu i ustedi
('Bratwurst 400g',                    null, 2.99, (select id from ak_stores where slug='rewe'),      'Fleisch',      '85737', current_date, current_date + 5),
('Joghurt 500g',                      null, 0.89, (select id from ak_stores where slug='rewe'),      'Molkerei',     '85737', current_date, current_date + 5),
('Tomaten 500g',                      null, 1.49, (select id from ak_stores where slug='rewe'),      'Gemuese',      '85737', current_date, current_date + 5),
('Mineralwasser 6x1,5L',              null, 2.79, (select id from ak_stores where slug='rewe'),      'Getraenke',    '85737', current_date, current_date + 5),
('Toastbrot 500g',                    null, 1.19, (select id from ak_stores where slug='rewe'),      'Backwaren',    '85737', current_date, current_date + 5),

('Nutella 750g',                      5.99, 3.49, (select id from ak_stores where slug='edeka'),     'Lebensmittel', '85737', current_date, current_date + 4),
('Pizza Salami 350g',                 3.49, 1.99, (select id from ak_stores where slug='edeka'),     'Tiefkuehl',    '85737', current_date, current_date + 4),
('Bananen 1kg',                       2.29, 1.59, (select id from ak_stores where slug='edeka'),     'Obst',         '85737', current_date, current_date + 4),
('Weizenbier 20x0,5L',               19.99, 13.99, (select id from ak_stores where slug='edeka'),    'Getraenke',    '85737', current_date, current_date + 4),

('Toilettenpapier 10 Rollen',         6.99, 3.99, (select id from ak_stores where slug='penny'),     'Haushalt',     '85737', current_date, current_date + 5),
('Salami 100g',                       2.19, 1.29, (select id from ak_stores where slug='penny'),     'Fleisch',      '85737', current_date, current_date + 5),
('Eis 900ml',                         4.49, 2.49, (select id from ak_stores where slug='penny'),     'Tiefkuehl',    '85737', current_date, current_date + 5),

('Katzenfutter 12x100g',              9.99, 5.99, (select id from ak_stores where slug='netto'),     'Tierbedarf',   '85737', current_date, current_date + 6),
('Zahnpasta 75ml',                    2.99, 1.49, (select id from ak_stores where slug='netto'),     'Drogerie',     '85737', current_date, current_date + 6),
('Haehnchenschenkel 1kg',             5.99, 2.99, (select id from ak_stores where slug='netto'),     'Fleisch',      '85737', current_date, current_date + 6),

('Nackensteaks 1kg',                 11.99, 6.99, (select id from ak_stores where slug='kaufland'),  'Fleisch',      '85737', current_date, current_date + 5),
('Paprika rot 500g',                  2.99, 1.79, (select id from ak_stores where slug='kaufland'),  'Gemuese',      '85737', current_date, current_date + 5),
('Bier Kiste 20x0,5L',               17.99, 11.99, (select id from ak_stores where slug='kaufland'), 'Getraenke',    '85737', current_date, current_date + 5),

('Duschgel 250ml',                    3.45, 1.95, (select id from ak_stores where slug='dm'),        'Drogerie',     '85737', current_date, current_date + 10),
('Windeln Gr.4 40St',                12.95, 8.95, (select id from ak_stores where slug='dm'),        'Baby',         '85737', current_date, current_date + 10),

-- ===== 80331 Muenchen =====
('Rindersteak 300g',                  9.99, 6.49, (select id from ak_stores where slug='lidl'),      'Fleisch',      '80331', current_date, current_date + 5),
('Mozzarella 125g',                   1.19, 0.69, (select id from ak_stores where slug='lidl'),      'Molkerei',     '80331', current_date, current_date + 5),
('Apfelsaft 1L',                      2.19, 1.29, (select id from ak_stores where slug='edeka'),     'Getraenke',    '80331', current_date, current_date + 4),
('Croissant 6St',                     2.49, 1.49, (select id from ak_stores where slug='edeka'),     'Backwaren',    '80331', current_date, current_date + 4),
('Garnelen 200g',                     7.99, 4.99, (select id from ak_stores where slug='kaufland'),  'Fisch',        '80331', current_date, current_date + 5),
('Espresso Bohnen 1kg',              17.99, 11.99, (select id from ak_stores where slug='kaufland'), 'Getraenke',    '80331', current_date, current_date + 5),
('Kopfhoerer Bluetooth',             79.00, 39.00, (select id from ak_stores where slug='mediamarkt'), 'Elektronik', '80331', current_date, current_date + 8),
('Fernseher 55 Zoll',               699.00, 499.00, (select id from ak_stores where slug='mediamarkt'), 'Elektronik','80331', current_date, current_date + 8),
('Shampoo 300ml',                     4.29, 2.29, (select id from ak_stores where slug='rossmann'),  'Drogerie',     '80331', current_date, current_date + 9),
('Kaesekuchen 1kg',                   null, 5.99, (select id from ak_stores where slug='rewe'),      'Backwaren',    '80331', current_date, current_date + 5),
('Rucola 125g',                       null, 1.29, (select id from ak_stores where slug='rewe'),      'Gemuese',      '80331', current_date, current_date + 5),

-- ===== 10115 Berlin =====
('Hackfleisch gemischt 500g',         4.79, 3.29, (select id from ak_stores where slug='penny'),     'Fleisch',      '10115', current_date, current_date + 5),
('Doener Fleisch 1kg',               13.99, 8.99, (select id from ak_stores where slug='netto'),     'Fleisch',      '10115', current_date, current_date + 6),
('Vollkornbrot 750g',                 2.79, 1.79, (select id from ak_stores where slug='edeka'),     'Backwaren',    '10115', current_date, current_date + 4),
('Orangen 2kg',                       4.99, 2.99, (select id from ak_stores where slug='kaufland'),  'Obst',         '10115', current_date, current_date + 5),
('Spuelmaschinentabs 60St',          14.99, 8.99, (select id from ak_stores where slug='dm'),        'Haushalt',     '10115', current_date, current_date + 10),
('Fitness Riegel 6x',                 null, 2.49, (select id from ak_stores where slug='rewe'),      'Lebensmittel', '10115', current_date, current_date + 5);

-- ===== Artikli iz mockupa (85737) =====
insert into ak_discounts (product_name, old_price, new_price, store_id, category, plz, date, valid_to)
values
('Parkside Aku Bohrmaschine 20V',    69.99, 49.99, (select id from ak_stores where slug='lidl'),     'Alat',         '85737', current_date, current_date + 5),
('Nutella 750 g',                     6.49,  4.99, (select id from ak_stores where slug='lidl'),     'Lebensmittel', '85737', current_date, current_date + 5),
('Coca-Cola 6x1,5L',                  8.99,  5.99, (select id from ak_stores where slug='lidl'),     'Getraenke',    '85737', current_date, current_date + 5),
('Milbona Sir Gouda 400 g',           2.79,  2.09, (select id from ak_stores where slug='lidl'),     'Molkerei',     '85737', current_date, current_date + 5),
('Persil Deterdzent 100 pranja',     18.99, 14.79, (select id from ak_stores where slug='lidl'),     'Haushalt',     '85737', current_date, current_date + 5),
('Bananen 1 kg',                      1.49,  1.19, (select id from ak_stores where slug='lidl'),     'Obst',         '85737', current_date, current_date + 5),
('Haehnchenfilet 1 kg',               5.99,  4.49, (select id from ak_stores where slug='kaufland'), 'Fleisch',      '85737', current_date, current_date + 6),
('Pampers Baby-Dry Giant Pack',      28.99, 19.99, (select id from ak_stores where slug='dm'),       'Baby',         '85737', current_date, current_date + 10),
('Bosch Akkuschrauber 12V',          89.00, 64.90, (select id from ak_stores where slug='kaufland'), 'Alat',         '85737', current_date, current_date + 6);

-- ---------------------------------------------------------------------
-- DEMO SLIKE
--   Ovako izgleda kad artikal IMA `image_url`: frontend prikaze pravu
--   bitmap sliku umjesto ilustracije. U produkciji ovo polje puni scraper
--   (KaufDA daje slike) ili `npm run images:enrich` (Open Food Facts).
--   Zadnji red je namjerno pokvaren URL - da se vidi da fallback radi.
-- ---------------------------------------------------------------------
update ak_discounts set image_url = '/demo/parkside-busilica.png' where product_name like 'Parkside%';
update ak_discounts set image_url = '/demo/nutella.png'           where product_name like 'Nutella%';
update ak_discounts set image_url = '/demo/persil.png'            where product_name like 'Persil%';
update ak_discounts set image_url = '/demo/pampers.png'           where product_name like 'Pampers%';
update ak_discounts set image_url = '/demo/milbona-gouda.png'     where product_name like 'Milbona%';
update ak_discounts set image_url = '/demo/coca-cola-6x15.png'    where product_name like 'Coca-Cola 6x%';
update ak_discounts set image_url = '/demo/banane.png'            where product_name like 'Bananen%';
update ak_discounts set image_url = '/demo/hahnchenfilet.png'     where product_name like 'Haehnchenfilet%';
update ak_discounts set image_url = 'https://cdn.example.invalid/nema-slike.jpg'
  where product_name like 'Bosch%';

-- Kratka provjera
select plz,
       count(*)                                            as ukupno,
       count(discount_percent)                             as sa_popustom,
       count(*) - count(discount_percent)                  as samo_angebot
from ak_discounts
group by plz
order by plz;
