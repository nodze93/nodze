-- =====================================================================
--  AKCIJE — "NAJBLIŽI GRAD": svaki poštanski broj u Njemačkoj dobije
--  ponude iz najbližeg grada koji smo skinuli
-- =====================================================================
--  PROBLEM koji ovo rješava
--  ------------------------
--  Ponude iz marktguru izvoza nose PRAVI poštanski broj grada za koji su
--  skinute (npr. 40213 Düsseldorf). Bez ovoga bi ih vidio SAMO čovjek koji
--  ukuca tačno 40213 — a čovjek iz Dortmunda (44137) ne bi vidio ništa.
--
--  RJEŠENJE (u tri koraka)
--  -----------------------
--   1. `ak_izvor_grad`  — spisak gradova koje smo skinuli, sa koordinatama.
--   2. `ak_plz_tacka`   — gdje se otprilike nalazi svaka poštanska regija
--                         (prve dvije cifre, npr. 44 = Dortmund/Bochum).
--   3. `ak_najblizi_plz(plz)` — vrati grad koji je GEOGRAFSKI najbliži toj
--                         regiji, ali SAMO ako taj grad zaista ima žive
--                         ponude u bazi. Ako ga nema, uzima sljedeći najbliži.
--
--  Zato se sistem sam podešava: skineš novi grad -> svi poštanski brojevi
--  oko njega automatski pređu na njega. Ne dira se nijedna funkcija.
--
--  ŠTA SE JOŠ MIJENJA
--  ------------------
--  `ak_store_sporedni` — lanci koji NISU za namirnice (namještaj, baumarkt,
--  ljubimci, veleprodaja). Ponašaju se kao OBI: ne guraju se u opšte liste,
--  vide se tek kad se klikne na njihovu pločicu. Bez toga bi 2.338 artikala
--  XXXLutza (kauči, ormari) zatrpalo paradajz i kafu.
--
--  Ovo NASLJEĐUJE sve iz `akcije-regije-2.sql` i `akcije-fressnapf.sql`
--  (Aldi regije, OBI na klik) — Postgres ne zna "zakrpiti" tijelo funkcije,
--  pa se cijele pišu iznova. Pokrenuti JEDNOM u Supabase -> SQL Editor.
--  Bezopasno je pokrenuti više puta.
--
--  NE POKRETATI `akcije-rucni-unos.sql` POSLIJE OVOGA — vratio bi stare
--  funkcije bez regija.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Gradovi koje smo skinuli (izvori podataka), sa koordinatama
-- ---------------------------------------------------------------------
--  Spisak je namjerno ŠIRI od onoga što je skinuto: grad bez ponuda se
--  jednostavno preskače. Kad ga skineš, proradi sam od sebe.
create table if not exists ak_izvor_grad (
    plz    char(5) primary key,
    naziv  text    not null,
    lat    numeric not null,
    lon    numeric not null
);

insert into ak_izvor_grad (plz, naziv, lat, lon) values
    ('01067', 'Dresden',        51.05, 13.74),
    ('04109', 'Leipzig',        51.34, 12.37),
    ('06108', 'Halle',          51.48, 11.97),
    ('07743', 'Jena',           50.93, 11.59),
    ('09111', 'Chemnitz',       50.83, 12.92),
    ('10115', 'Berlin',         52.53, 13.38),
    ('14467', 'Potsdam',        52.40, 13.06),
    ('17033', 'Neubrandenburg', 53.56, 13.26),
    ('18055', 'Rostock',        54.09, 12.14),
    ('19053', 'Schwerin',       53.63, 11.41),
    ('20095', 'Hamburg',        53.55, 10.00),
    ('23552', 'Lübeck',         53.87, 10.69),
    ('24103', 'Kiel',           54.32, 10.13),
    ('26121', 'Oldenburg',      53.14,  8.21),
    ('28195', 'Bremen',         53.08,  8.81),
    ('30159', 'Hannover',       52.37,  9.74),
    ('33602', 'Bielefeld',      52.02,  8.53),
    ('34117', 'Kassel',         51.31,  9.49),
    ('38100', 'Braunschweig',   52.26, 10.52),
    ('39104', 'Magdeburg',      52.13, 11.62),
    ('40213', 'Düsseldorf',     51.22,  6.77),
    ('44137', 'Dortmund',       51.51,  7.47),
    ('45127', 'Essen',          51.46,  7.01),
    ('47051', 'Duisburg',       51.43,  6.76),
    ('48143', 'Münster',        51.96,  7.63),
    ('49074', 'Osnabrück',      52.27,  8.05),
    ('50667', 'Köln',           50.94,  6.96),
    ('52062', 'Aachen',         50.78,  6.08),
    ('54290', 'Trier',          49.75,  6.64),
    ('55116', 'Mainz',          50.00,  8.27),
    ('56068', 'Koblenz',        50.36,  7.59),
    ('60311', 'Frankfurt',      50.11,  8.68),
    ('66111', 'Saarbrücken',    49.23,  7.00),
    ('68159', 'Mannheim',       49.49,  8.47),
    ('70173', 'Stuttgart',      48.78,  9.18),
    ('74072', 'Heilbronn',      49.14,  9.22),
    ('76133', 'Karlsruhe',      49.01,  8.40),
    ('78462', 'Konstanz',       47.66,  9.18),
    ('79098', 'Freiburg',       47.99,  7.85),
    ('80331', 'München',        48.14, 11.57),
    ('86150', 'Augsburg',       48.37, 10.90),
    ('87435', 'Kempten',        47.73, 10.31),
    ('89073', 'Ulm',            48.40,  9.99),
    ('90402', 'Nürnberg',       49.45, 11.08),
    ('93047', 'Regensburg',     49.02, 12.10),
    ('94032', 'Passau',         48.57, 13.46),
    ('95444', 'Bayreuth',       49.95, 11.58),
    ('97070', 'Würzburg',       49.79,  9.94),
    ('99084', 'Erfurt',         50.98, 11.03)
on conflict (plz) do update
   set naziv = excluded.naziv, lat = excluded.lat, lon = excluded.lon;


-- ---------------------------------------------------------------------
-- 2) Gdje se nalazi koja poštanska regija (prve DVIJE cifre)
-- ---------------------------------------------------------------------
--  Približan centar svake regije. Tačnost od par kilometara nije bitna —
--  služi samo da se izabere najbliži grad, a gradovi su 50+ km razmaknuti.
--  '00' NAMJERNO NE POSTOJI: to je naša kanta za nacionalne ponude.
create table if not exists ak_plz_tacka (
    prefix char(2) primary key,
    lat    numeric not null,
    lon    numeric not null,
    opis   text
);

insert into ak_plz_tacka (prefix, lat, lon, opis) values
    ('01', 51.05, 13.74, 'Dresden'),
    ('02', 51.15, 14.60, 'Bautzen, Görlitz'),
    ('03', 51.76, 14.33, 'Cottbus'),
    ('04', 51.34, 12.37, 'Leipzig'),
    ('05', 51.40, 12.20, 'Leipzig okolina'),
    ('06', 51.48, 11.97, 'Halle, Dessau'),
    ('07', 50.88, 11.59, 'Jena, Gera'),
    ('08', 50.72, 12.49, 'Zwickau, Plauen'),
    ('09', 50.83, 12.92, 'Chemnitz'),
    ('10', 52.52, 13.40, 'Berlin Mitte'),
    ('11', 52.52, 13.40, 'Berlin (pošt. pretinci)'),
    ('12', 52.46, 13.42, 'Berlin jug'),
    ('13', 52.57, 13.35, 'Berlin sjever'),
    ('14', 52.40, 13.06, 'Potsdam'),
    ('15', 52.34, 14.30, 'Frankfurt (Oder)'),
    ('16', 52.80, 13.50, 'Oranienburg, Eberswalde'),
    ('17', 53.70, 13.30, 'Neubrandenburg, Greifswald'),
    ('18', 54.09, 12.14, 'Rostock, Stralsund'),
    ('19', 53.55, 11.45, 'Schwerin, Ludwigslust'),
    ('20', 53.55,  9.99, 'Hamburg Mitte'),
    ('21', 53.35, 10.15, 'Harburg, Lüneburg'),
    ('22', 53.63,  9.98, 'Hamburg sjever, Altona'),
    ('23', 53.87, 10.69, 'Lübeck'),
    ('24', 54.32, 10.13, 'Kiel, Rendsburg'),
    ('25', 54.05,  9.35, 'Itzehoe, Husum'),
    ('26', 53.30,  7.85, 'Oldenburg, Ostfriesland'),
    ('27', 53.30,  8.85, 'Bremerhaven, Verden'),
    ('28', 53.08,  8.81, 'Bremen'),
    ('29', 52.85, 10.30, 'Celle, Uelzen'),
    ('30', 52.37,  9.74, 'Hannover'),
    ('31', 52.15,  9.90, 'Hildesheim, Nienburg'),
    ('32', 52.20,  8.75, 'Minden, Herford'),
    ('33', 51.90,  8.65, 'Bielefeld, Paderborn'),
    ('34', 51.31,  9.49, 'Kassel'),
    ('35', 50.75,  8.70, 'Marburg, Gießen'),
    ('36', 50.62,  9.75, 'Fulda, Bad Hersfeld'),
    ('37', 51.53,  9.94, 'Göttingen'),
    ('38', 52.30, 10.55, 'Braunschweig, Wolfsburg'),
    ('39', 52.13, 11.62, 'Magdeburg, Stendal'),
    ('40', 51.23,  6.78, 'Düsseldorf'),
    ('41', 51.19,  6.44, 'Mönchengladbach, Neuss'),
    ('42', 51.25,  7.15, 'Wuppertal, Solingen'),
    ('43', 51.25,  7.15, 'Wuppertal okolina'),
    ('44', 51.51,  7.47, 'Dortmund, Bochum'),
    ('45', 51.46,  7.01, 'Essen, Gelsenkirchen'),
    ('46', 51.65,  6.72, 'Oberhausen, Bocholt, Wesel'),
    ('47', 51.42,  6.68, 'Duisburg, Krefeld, Moers'),
    ('48', 52.00,  7.62, 'Münster, Steinfurt'),
    ('49', 52.35,  7.95, 'Osnabrück, Cloppenburg'),
    ('50', 50.94,  6.90, 'Köln, Rhein-Erft'),
    ('51', 51.00,  7.20, 'Leverkusen, Bergisch Gladbach'),
    ('52', 50.78,  6.28, 'Aachen, Düren'),
    ('53', 50.70,  7.10, 'Bonn, Euskirchen'),
    ('54', 49.76,  6.64, 'Trier, Bitburg'),
    ('55', 49.95,  8.00, 'Mainz, Bad Kreuznach'),
    ('56', 50.36,  7.60, 'Koblenz, Montabaur'),
    ('57', 50.90,  8.00, 'Siegen, Olpe'),
    ('58', 51.30,  7.55, 'Hagen, Lüdenscheid'),
    ('59', 51.60,  7.95, 'Hamm, Soest, Arnsberg'),
    ('60', 50.11,  8.68, 'Frankfurt am Main'),
    ('61', 50.28,  8.65, 'Bad Homburg, Friedberg'),
    ('62', 50.11,  8.68, 'Frankfurt okolina'),
    ('63', 50.08,  8.95, 'Offenbach, Hanau, Aschaffenburg'),
    ('64', 49.87,  8.65, 'Darmstadt, Bergstraße'),
    ('65', 50.15,  8.20, 'Wiesbaden, Limburg'),
    ('66', 49.28,  7.00, 'Saarbrücken, Saarland'),
    ('67', 49.45,  8.05, 'Ludwigshafen, Kaiserslautern'),
    ('68', 49.49,  8.47, 'Mannheim, Weinheim'),
    ('69', 49.41,  8.71, 'Heidelberg'),
    ('70', 48.78,  9.18, 'Stuttgart'),
    ('71', 48.87,  9.10, 'Ludwigsburg, Sindelfingen'),
    ('72', 48.50,  9.05, 'Tübingen, Reutlingen'),
    ('73', 48.72,  9.65, 'Esslingen, Göppingen'),
    ('74', 49.15,  9.30, 'Heilbronn, Schwäbisch Hall'),
    ('75', 48.85,  8.70, 'Pforzheim, Calw'),
    ('76', 49.00,  8.35, 'Karlsruhe, Rastatt, Landau'),
    ('77', 48.47,  8.00, 'Offenburg, Baden-Baden'),
    ('78', 47.95,  8.55, 'Villingen, Konstanz, Rottweil'),
    ('79', 47.95,  7.80, 'Freiburg, Lörrach'),
    ('80', 48.14, 11.55, 'München zapad'),
    ('81', 48.11, 11.62, 'München jug, istok'),
    ('82', 47.98, 11.25, 'Starnberg, Garmisch'),
    ('83', 47.85, 12.20, 'Rosenheim, Traunstein'),
    ('84', 48.55, 12.35, 'Landshut, Altötting'),
    ('85', 48.50, 11.55, 'Ingolstadt, Freising, Dachau'),
    ('86', 48.37, 10.90, 'Augsburg, Donauwörth'),
    ('87', 47.75, 10.35, 'Kempten, Memmingen'),
    ('88', 47.85,  9.65, 'Ravensburg, Friedrichshafen'),
    ('89', 48.40, 10.00, 'Ulm, Heidenheim'),
    ('90', 49.45, 11.05, 'Nürnberg, Fürth'),
    ('91', 49.45, 10.75, 'Erlangen, Ansbach'),
    ('92', 49.50, 11.95, 'Amberg, Weiden'),
    ('93', 49.02, 12.10, 'Regensburg, Cham'),
    ('94', 48.65, 13.20, 'Passau, Deggendorf'),
    ('95', 50.05, 11.70, 'Bayreuth, Hof'),
    ('96', 50.00, 10.95, 'Bamberg, Coburg'),
    ('97', 49.80,  9.95, 'Würzburg, Schweinfurt'),
    ('98', 50.60, 10.60, 'Suhl, Meiningen'),
    ('99', 51.00, 10.90, 'Erfurt, Weimar, Nordhausen')
on conflict (prefix) do update
   set lat = excluded.lat, lon = excluded.lon, opis = excluded.opis;


-- ---------------------------------------------------------------------
-- 3) Lanci koji NISU za namirnice — samo kad se klikne na njihovu pločicu
-- ---------------------------------------------------------------------
--  Zamjenjuje ranije zakucano `slug not in ('obi','fressnapf')`. Dodavanje
--  novog lanca je sad jedan `insert`, a ne prepisivanje funkcija.
--
--  Spisak je usklađen sa izvozom od 04.08.2026 (42 lanca). Uz svaki lanac
--  stoji koliko je ponuda donio u tom izvozu — zato XXXLutz mora van: sam
--  je nosio 2338 od 13526 ponuda i gušio je namirnice na naslovnoj.
--
--  Uvoz od sada SAM dopisuje nove lance u ovu tabelu na osnovu marktguru
--  polja `industry` (Möbelhaus, Baumarkt, Zoo & Garten, Kaufhaus, Großmarkt,
--  KFZ & Zubehör) — vidi app/api/admin/akcije/route.ts. Ovaj spisak je
--  početno stanje i ručna kontrola; nova stolarnica se skriva sama.
create table if not exists ak_store_sporedni (
    slug   text primary key,
    razlog text
);

insert into ak_store_sporedni (slug, razlog) values
    -- namještaj (Möbelhaus) — 3881 ponuda, najveći zagađivač naslovne
    ('xxxlutz',              'namještaj'),      -- 2338
    ('segmueller',           'namještaj'),      --  328
    ('opti-wohnwelt',        'namještaj'),      --  304
    ('porta',                'namještaj'),      --  180
    ('schaffrath',           'namještaj'),      --  159
    ('moemax',               'namještaj'),      --  142
    ('moebel-inhofer',       'namještaj'),      --  122
    ('trends-by-ostermann',  'namještaj'),      --  106
    ('ostermann',            'namještaj'),      --  100
    ('sb-moebel-boss',       'namještaj'),      --   71
    ('kabs-polsterwelt',     'namještaj'),      --   31
    -- alat i gradnja (Baumarkt) — 280 ponuda
    ('toom',                 'alat, baumarkt'), --  180
    ('b1-discount-baumarkt', 'alat, baumarkt'), --   67
    ('obi',                  'alat, baumarkt'), --   25
    ('hagebaumarkt',         'alat, baumarkt'), --    8
    -- ljubimci i vrt (Zoo & Garten) — 120 ponuda
    ('fressnapf',            'ljubimci'),       --   97
    ('das-futterhaus',       'ljubimci'),       --   23
    -- robna kuća (Kaufhaus) — 294 ponuda, uglavnom neprehrana
    ('thomas-philipps',      'razno, neprehrana'), -- 150
    ('woolworth',            'razno, neprehrana'), -- 144
    -- veleprodaja (Großmarkt) — cijene su bez PDV-a, varaju kupca
    ('handelshof',           'veleprodaja (cijene bez PDV-a)'), -- 396
    ('edeka-foodservice',    'veleprodaja (cijene bez PDV-a)'), -- 398
    -- drogerija (Drogerie & Gesundheit) — 396 ponuda
    --  Nije namirnica. Rossmann je u izvozu od 04.08. kao najjaču kategoriju
    --  imao "Damen Düfte" (28 parfema), pa šampone, kreme i šminku. Deterdžent
    --  i pelene tu jesu, ali zbog njih ne vrijedi držati parfimeriju na
    --  naslovnoj — ko traži drogeriju, klikne pločicu.
    ('rossmann',             'drogerija'),      --  291
    ('budni',                'drogerija'),      --  105
    -- ostalo
    ('bosch-car-service',    'auto servis'),    --   13
    ('ran-tankstelle',       'benzinska')       --    9
on conflict (slug) do nothing;

--  Lanci koji OSTAJU na naslovnoj (samo namirnice i piće) — za kontrolu:
--  edeka 1201, netto-marken-discount 1016, lidl 885, kaufland 734, rewe 731,
--  rewe-center 629, aldi-sued 414, penny 399, famila-nordwest 298,
--  scheck-in-center 265, e-center 241, combi 236, edeka-frischemarkt 216,
--  nahkauf 193, trinkgut 176, e-xpress 63, edeka-bandelt 42.
--
--  Ako budni ipak hoćeš nazad na naslovnu (Rossmann si izričito tražio van):
--      delete from ak_store_sporedni where slug = 'budni';


-- ---------------------------------------------------------------------
-- 3b) Kategorije koje NISU namirnice — ni kod Lidla ni kod Rossmanna
-- ---------------------------------------------------------------------
--  Izbacivanje lanaca nije dovoljno. I lanci koji OSTAJU (Lidl, ALDI, Netto,
--  Kaufland, Rossmann) svake sedmice guraju "non-food" ćošak: bušilice, sofe,
--  ženske cipele, TV, kosilice, parfeme. U izvozu od 04.08. to je 1403 od
--  8135 ponuda tih lanaca — svaka šesta kartica na naslovnoj nije hrana.
--
--  Zato se filtrira i po KATEGORIJI, a ne samo po prodavnici. Kategorija
--  ostaje vidljiva čim se izričito izabere (klik na lanac ili na kategoriju),
--  isto pravilo kao za sporedne lance — ništa se ne briše, samo se skloni
--  s naslovne.
--
--  Radi u dva koraka jer ima 382 kategorije i stalno stižu nove:
--    ak_kategorija_uzorak    – ~140 LIKE uzoraka koje ja održavam
--    ak_kategorija_sporedna  – konkretna imena, popunjava se iz uzoraka
--  Pretraga gleda samo drugu tabelu (obično poređenje po ključu, brzo).

create table if not exists ak_kategorija_uzorak (
    uzorak text primary key,   -- LIKE uzorak, mala slova (npr. 'damen %')
    razlog text
);

create table if not exists ak_kategorija_sporedna (
    naziv  text primary key,   -- tačno ime kategorije kako stoji u ponudi
    razlog text
);

insert into ak_kategorija_uzorak (uzorak, razlog) values
    -- odjeća i obuća
    ('damen %',              'odjeća'),   -- NE hvata 'Damenhygiene' (nema razmaka)
    ('herren %',             'odjeća'),
    ('kinder- und babybekleidung', 'odjeća'),
    ('kinderschuhe',         'odjeća'),
    ('dessous',              'odjeća'),
    ('unterwäsche',          'odjeća'),
    ('leggins',              'odjeća'),
    ('blazer',               'odjeća'),
    ('kopfbedeckung',        'odjeća'),
    ('accessoires',          'odjeća'),
    ('sportbekleidung',      'odjeća'),
    ('arbeitsbekleidung%',   'odjeća'),
    ('%bademode',            'odjeća'),
    -- parfemi i šminka (drogerija ostaje, ali parfem nije namirnica)
    ('%düfte',               'parfemi'),
    ('duftsets',             'parfemi'),
    ('%makeup%',             'šminka'),
    ('maniküre pediküre',    'šminka'),
    ('brillen',              'optika'),
    ('sehhilfen',            'optika'),
    ('kontaktlinsen',        'optika'),
    -- namještaj
    ('%möbel%',              'namještaj'),
    ('betten',               'namještaj'),
    ('matratzen',            'namještaj'),
    ('sofas',                'namještaj'),
    ('sessel',               'namještaj'),
    ('tische',               'namještaj'),
    ('regale',               'namještaj'),
    ('kommoden',             'namještaj'),
    ('spiegel',              'namještaj'),
    ('garderoben',           'namještaj'),
    ('küchen',               'namještaj'),
    ('auflagen',             'namještaj'),
    -- bašta i vanjsko
    ('garten%',              'bašta'),
    ('rasenmäher',           'bašta'),
    ('rasentrimmer',         'bašta'),
    ('heckenscheren',        'bašta'),
    ('laubsauger',           'bašta'),
    ('schnittblumen',        'bašta'),
    ('dünger%',              'bašta'),
    ('pflanzen',             'bašta'),
    ('pflanzenzubehör',      'bašta'),
    ('insektizide',          'bašta'),
    ('insektenschutz',       'bašta'),
    ('fliegengitter',        'bašta'),
    ('schubkarren',          'bašta'),
    ('terrassenheizung%',    'bašta'),
    ('terassen%',            'bašta'),
    ('markisen',             'bašta'),
    ('sichtschutz',          'bašta'),
    ('sonnenschutzsystem',   'bašta'),   -- tenda; obični 'Sonnenschutz' (krema) OSTAJE
    ('gerätehäuser',         'bašta'),
    ('sauna',                'bašta'),
    ('poolzubehör%',         'bašta'),
    ('mülltonnenbox',        'bašta'),
    ('grills',               'bašta'),
    ('grillzubehör',         'bašta'),
    -- alat
    ('%werkzeug%',           'alat'),
    ('bohrmaschinen',        'alat'),
    ('sägen',                'alat'),
    ('kettensäge',           'alat'),
    ('akkuschrauber',        'alat'),
    ('schleifer',            'alat'),
    ('schweißgeräte',        'alat'),
    ('kompressoren',         'alat'),
    ('leitern',              'alat'),
    ('schraubzwingen',       'alat'),
    ('dübel',                'alat'),
    ('kleber',               'alat'),
    ('arbeitsleuchten',      'alat'),
    ('arbeitssicherheit',    'alat'),
    ('hebeanlagen',          'alat'),
    -- gradnja i instalacije
    ('sanitär',              'gradnja'),
    ('heizkörper',           'gradnja'),
    ('farben',               'gradnja'),
    ('türbeschläge',         'gradnja'),
    ('schalter',             'gradnja'),
    ('haustechnik',          'gradnja'),
    ('brennstoffe',          'gradnja'),
    ('klimageräte',          'gradnja'),
    ('jalousien',            'gradnja'),
    -- tehnika
    ('tv',                   'tehnika'),
    ('handys',               'tehnika'),
    ('laptops',              'tehnika'),
    ('monitore',             'tehnika'),
    ('kopfhörer',            'tehnika'),
    ('drucker-scanner',      'tehnika'),
    ('computerzubehör',      'tehnika'),
    ('speichermedien',       'tehnika'),
    ('multimedia',           'tehnika'),
    ('foto-video',           'tehnika'),
    ('smartwatches',         'tehnika'),
    ('kabel',                'tehnika'),
    ('netzwerk',             'tehnika'),
    ('steckdosenleisten',    'tehnika'),
    ('mobileabspielgeräte',  'tehnika'),
    ('uhren',                'tehnika'),
    ('armbanduhr',           'tehnika'),
    ('sportuhren',           'tehnika'),
    ('wanduhren',            'tehnika'),
    ('gesundheitselektronik','tehnika'),
    -- bijela tehnika i aparati
    ('kühlgeräte',           'aparati'),
    ('waschmaschinen',       'aparati'),
    ('geschirrspüler',       'aparati'),
    ('küchengroßgeräte',     'aparati'),
    ('küchengeräte',         'aparati'),
    ('kaffeemaschinen',      'aparati'),
    ('haartrockner',         'aparati'),
    ('nähmaschinen',         'aparati'),
    ('reinigungsgeräte',     'aparati'),
    ('wäschenständer',       'aparati'),
    ('filtersysteme',        'aparati'),
    -- dekoracija, posuđe, tekstil
    ('%deko%',               'dekoracija'),
    ('bilder',               'dekoracija'),
    ('wanddekoration',       'dekoracija'),
    ('kerzen',               'dekoracija'),
    ('leuchten',             'dekoracija'),
    ('lampen',               'dekoracija'),
    ('teppiche',             'tekstil'),
    ('heimtextilien',        'tekstil'),
    ('küchentextilien',      'tekstil'),
    ('glasartikel',          'posuđe'),
    ('essgeschirr',          'posuđe'),
    ('besteck',              'posuđe'),
    ('kochgeschirr',         'posuđe'),
    ('töpfe',                'posuđe'),
    ('küchenzubehör',        'posuđe'),
    ('aufbewahrungsbehälter','posuđe'),
    -- igračke i sport
    ('spiele',               'igračke'),
    ('spielfiguren',         'igračke'),
    ('puppen',               'igračke'),
    ('plüschtiere',          'igračke'),
    ('bausteine',            'igračke'),
    ('%spielzeug',           'igračke'),
    ('experimentierkasten',  'igračke'),
    ('kinderfahrzeuge',      'igračke'),
    ('kindermalbedarf',      'igračke'),
    ('radsport',             'sport'),
    ('tennis',               'sport'),
    ('kampfsport',           'sport'),
    ('fitness',              'sport'),
    ('fitnessartikel',       'sport'),
    ('outdoorausrüstung',    'sport'),
    ('fanartikel',           'sport'),
    ('koffer',               'sport'),
    -- ured, mediji, vozila
    ('schreibwaren',         'ured'),
    ('bürozubehör',          'ured'),
    ('bücher',               'mediji'),
    ('zeitschriften',        'mediji'),
    ('auto',                 'vozila'),
    ('motorräder',           'vozila'),
    ('roller',               'vozila'),
    ('medizinische geräte%', 'medicinska oprema'),
    ('mobilitäts-%',         'medicinska oprema')
on conflict (uzorak) do nothing;

--  Iz uzoraka napravi spisak konkretnih imena. Zove se sam poslije svakog
--  uvoza (vidi app/api/admin/akcije/route.ts), a može i ručno:
--      select ak_osvjezi_kategorije();
--  Vraća koliko kategorija je sklonjeno s naslovne.
create or replace function ak_osvjezi_kategorije()
returns int
language plpgsql
security definer
set search_path = public
as $fn$
declare
    n int;
begin
    insert into ak_kategorija_sporedna (naziv, razlog)
    select distinct on (d.category) d.category, u.razlog
      from ak_discounts d
      join ak_kategorija_uzorak u on lower(trim(d.category)) like u.uzorak
     where d.category is not null
    on conflict (naziv) do nothing;

    select count(*) into n from ak_kategorija_sporedna;
    return n;
end;
$fn$;


-- ---------------------------------------------------------------------
-- 4) PLZ -> najbliži grad koji ZAISTA ima ponude
-- ---------------------------------------------------------------------
--  Udaljenost: obična ravan račun, s tim da se stepen dužine množi sa 0.62
--  (koliko je uži od stepena širine na visini Njemačke). Dovoljno tačno.
create or replace function ak_najblizi_plz(p_plz text)
returns text
language sql
stable
security definer
set search_path = public
as $$
    select g.plz
      from ak_izvor_grad g
      join ak_plz_tacka t on t.prefix = left(p_plz, 2)
     where exists (
             select 1
               from ak_discounts d
              where d.plz = g.plz
                and d.source = 'manual'
                and not d.hidden
                and d.valid_to >= ak_danas()
           )
     order by (g.lat - t.lat) * (g.lat - t.lat)
            + (g.lon - t.lon) * (g.lon - t.lon) * 0.3844
     limit 1
$$;

-- Bez ovih indeksa bi provjera "ima li grad ponude" i osvježavanje uvoza
-- prolazili cijelu tabelu.
create index if not exists ak_discounts_plz_idx        on ak_discounts (plz);
create index if not exists ak_discounts_manual_ext_idx on ak_discounts (external_id) where source = 'manual';


-- ---------------------------------------------------------------------
-- 5) Pretraga ponuda — regija + najbliži grad + sporedni lanci na klik
-- ---------------------------------------------------------------------
drop function if exists ak_discounts_search(text, text, text, numeric, numeric, text, text, int, int);
create function ak_discounts_search(
    p_plz      text,
    p_store    text    default null,
    p_category text    default null,
    p_percent  numeric default null,
    p_savings  numeric default null,
    p_q        text    default null,
    p_sort     text    default 'percent',
    p_limit    int     default 100,
    p_offset   int     default 0
)
returns table (
    id               text,
    product_name     text,
    old_price        numeric,
    new_price        numeric,
    discount_percent numeric,
    savings          numeric,
    store            text,
    store_slug       text,
    category         text,
    plz              text,
    date             text,
    image_url        text,
    image_exact      boolean,
    valid_from       text,
    valid_to         text,
    is_angebot       boolean,
    rabatt_quelle    text,
    total_count      bigint
)
language plpgsql
stable
security definer
set search_path = public
as $fn$
declare
    v_order  text;
    v_regija text := ak_aldi_scope(p_plz);    -- Aldi Nord / Süd za ovaj PLZ
    v_blizu  text := ak_najblizi_plz(p_plz);  -- NOVO: najbliži skinuti grad
begin
    v_order := case p_sort
        when 'savings' then 'd.savings desc nulls last, d.discount_percent desc nulls last, d.product_name asc'
        when 'price'   then 'd.new_price asc, d.product_name asc'
        when 'name'    then 'd.product_name asc'
        else                'd.discount_percent desc nulls last, d.savings desc nulls last, d.product_name asc'
    end;

    return query execute format($q$
        with snap as (
            select max(date) as date
              from ak_discounts
             where source <> 'manual'
               and (scope = 'DE' or plz = $1 or scope = $9)
        )
        select
            d.id::text, d.product_name, d.old_price, d.new_price,
            d.discount_percent, d.savings, s.name, s.slug, d.category,
            d.plz, d.date::text, d.image_url, d.image_exact,
            d.valid_from::text, d.valid_to::text,
            (d.old_price is null), d.rabatt_quelle,
            count(*) over ()
        from ak_discounts d
        join ak_stores s on s.id = d.store_id
        cross join snap
        where not d.hidden
          -- nacionalno + tačan PLZ + Aldi regija + NOVO: najbliži skinuti grad
          and (d.scope = 'DE' or d.plz = $1 or d.scope = $9 or d.plz = $10)
          -- namještaj, baumarkt, ljubimci… samo kad su izričito izabrani
          and ($2 is not null
               or not exists (select 1 from ak_store_sporedni z where z.slug = s.slug))
          -- non-food kategorije (bušilice, sofe, parfemi, TV) i kod Lidla/Aldija:
          -- vide se tek kad se klikne taj lanac ili ta kategorija
          and ($2 is not null or $3 is not null
               or not exists (select 1 from ak_kategorija_sporedna k where k.naziv = d.category))
          and ( (d.source <> 'manual' and d.date = snap.date)
             or (d.source  = 'manual' and d.valid_to is not null) )
          and (d.valid_from is null or d.valid_from <= ak_danas())
          and (d.valid_to   is null or d.valid_to   >= ak_danas())
          and ($2 is null or s.slug = lower($2) or lower(s.name) = lower($2))
          and ($3 is null or lower(d.category) = lower($3))
          and ($4 is null or d.discount_percent >= $4)
          and ($5 is null or d.savings >= $5)
          and ($6 is null or d.product_name ilike '%%' || $6 || '%%')
        order by %s
        limit $7 offset $8
    $q$, v_order)
    using p_plz, p_store, p_category, p_percent, p_savings, p_q, p_limit, p_offset, v_regija, v_blizu;
end;
$fn$;


-- ---------------------------------------------------------------------
-- 6) Prodavnice — regija + najbliži grad
--    (sporedni lanci NAMJERNO OSTAJU: pločica s brojem u traci je jedini
--     način da se do njih dođe)
-- ---------------------------------------------------------------------
drop function if exists ak_stores_list(text);
create function ak_stores_list(p_plz text)
returns table (
    id       int,
    name     text,
    slug     text,
    logo_url text,
    offers   int,
    offers_with_percent int
)
language sql
stable
security definer
set search_path = public
as $fn$
    with izvor as (
        select ak_aldi_scope(p_plz) as regija, ak_najblizi_plz(p_plz) as blizu
    ),
    snap as (
        select max(d.date) as date
          from ak_discounts d, izvor i
         where d.source <> 'manual'
           and (d.scope = 'DE' or d.plz = p_plz or d.scope = i.regija)
    )
    select s.id, s.name, s.slug, s.logo_url,
           count(d.id)::int, count(d.discount_percent)::int
    from ak_discounts d
    join ak_stores s on s.id = d.store_id
    cross join snap
    cross join izvor i
    where not d.hidden
      and (d.scope = 'DE' or d.plz = p_plz or d.scope = i.regija or d.plz = i.blizu)
      and ( (d.source <> 'manual' and d.date = snap.date)
         or (d.source  = 'manual' and d.valid_to is not null) )
      and (d.valid_from is null or d.valid_from <= ak_danas())
      and (d.valid_to   is null or d.valid_to   >= ak_danas())
    group by s.id, s.name, s.slug, s.logo_url
    order by count(d.id) desc, s.name asc
$fn$;


-- ---------------------------------------------------------------------
-- 7) Kategorije — regija + najbliži grad + sporedni lanci na klik
-- ---------------------------------------------------------------------
drop function if exists ak_categories_list(text, text);
create function ak_categories_list(p_plz text, p_store text default null)
returns table (
    category text,
    offers   int
)
language sql
stable
security definer
set search_path = public
as $fn$
    with izvor as (
        select ak_aldi_scope(p_plz) as regija, ak_najblizi_plz(p_plz) as blizu
    ),
    snap as (
        select max(d.date) as date
          from ak_discounts d, izvor i
         where d.source <> 'manual'
           and (d.scope = 'DE' or d.plz = p_plz or d.scope = i.regija)
    )
    select d.category, count(*)::int
    from ak_discounts d
    join ak_stores s on s.id = d.store_id
    cross join snap
    cross join izvor i
    where not d.hidden
      and (d.scope = 'DE' or d.plz = p_plz or d.scope = i.regija or d.plz = i.blizu)
      and (p_store is not null
           or not exists (select 1 from ak_store_sporedni z where z.slug = s.slug))
      -- non-food kategorije se ne nude ni kao dugme; kod izabranog lanca da
      and (p_store is not null
           or not exists (select 1 from ak_kategorija_sporedna k where k.naziv = d.category))
      and ( (d.source <> 'manual' and d.date = snap.date)
         or (d.source  = 'manual' and d.valid_to is not null) )
      and (d.valid_from is null or d.valid_from <= ak_danas())
      and (d.valid_to   is null or d.valid_to   >= ak_danas())
      and d.category is not null
      and (p_store is null or s.slug = lower(p_store) or lower(s.name) = lower(p_store))
    group by d.category
    order by count(*) desc, d.category asc
$fn$;


-- ---------------------------------------------------------------------
-- 8) Kratki pregled — regija + najbliži grad
--    (namjerno BEZ izbacivanja sporednih: admin treba prave ukupne brojeve)
-- ---------------------------------------------------------------------
drop function if exists ak_meta(text);
create function ak_meta(p_plz text)
returns table (
    plz          text,
    date         text,
    total        int,
    with_percent int,
    angebot_only int,
    stores       int,
    max_percent  numeric,
    max_savings  numeric
)
language sql
stable
security definer
set search_path = public
as $fn$
    with izvor as (
        select ak_aldi_scope(p_plz) as regija, ak_najblizi_plz(p_plz) as blizu
    ),
    snap as (
        select max(d.date) as date
          from ak_discounts d, izvor i
         where d.source <> 'manual'
           and (d.scope = 'DE' or d.plz = p_plz or d.scope = i.regija)
    )
    select p_plz,
           snap.date::text,
           count(d.id)::int,
           count(d.discount_percent)::int,
           (count(d.id) - count(d.discount_percent))::int,
           count(distinct d.store_id)::int,
           max(d.discount_percent),
           max(d.savings)
    from snap
    cross join izvor i
    left join ak_discounts d
           on not d.hidden
          and (d.scope = 'DE' or d.plz = p_plz or d.scope = i.regija or d.plz = i.blizu)
          and ( (d.source <> 'manual' and d.date = snap.date)
             or (d.source  = 'manual' and d.valid_to is not null) )
          and (d.valid_from is null or d.valid_from <= ak_danas())
          and (d.valid_to   is null or d.valid_to   >= ak_danas())
    group by snap.date
$fn$;


-- ---------------------------------------------------------------------
-- 9) Prava: samo server (service_role)
-- ---------------------------------------------------------------------
revoke execute on function ak_discounts_search(text, text, text, numeric, numeric, text, text, int, int) from anon, authenticated;
revoke execute on function ak_stores_list(text)            from anon, authenticated;
revoke execute on function ak_categories_list(text, text)  from anon, authenticated;
revoke execute on function ak_meta(text)                   from anon, authenticated;
revoke execute on function ak_najblizi_plz(text)           from anon, authenticated;
revoke execute on function ak_osvjezi_kategorije()         from anon, authenticated;
revoke all on table ak_izvor_grad          from anon, authenticated;
revoke all on table ak_plz_tacka           from anon, authenticated;
revoke all on table ak_store_sporedni      from anon, authenticated;
revoke all on table ak_kategorija_uzorak   from anon, authenticated;
revoke all on table ak_kategorija_sporedna from anon, authenticated;

-- Prvo popunjavanje spiska kategorija iz onoga što je VEĆ u bazi.
-- Poslije svakog uvoza uvoz ovo pozove sam.
select ak_osvjezi_kategorije() as sklonjeno_kategorija;


-- ---------------------------------------------------------------------
--  PROVJERA (pokreni poslije, da vidiš da radi)
-- ---------------------------------------------------------------------
--  select ak_najblizi_plz('44137');  -- Dortmund -> najbliži skinuti grad
--  select ak_najblizi_plz('72764');  -- Reutlingen -> Stuttgart
--  select ak_najblizi_plz('18055');  -- Rostock -> Rostock (ako je skinut)
--  select * from ak_meta('44137');
--
--  Šta je sklonjeno s naslovne, po razlogu:
--  select razlog, count(*) from ak_kategorija_sporedna group by 1 order by 2 desc;
--
--  AKO NEŠTO NE ŽELIŠ SKLONITI (npr. hoćeš da se roštilji vide ljeti):
--  delete from ak_kategorija_sporedna where naziv in ('Grills','Grillzubehör');
--  delete from ak_kategorija_uzorak    where uzorak in ('grills','grillzubehör');
--
--  AKO NEKI LANAC HOĆEŠ VRATITI NA NASLOVNU:
--  delete from ak_store_sporedni where slug = 'budni';
