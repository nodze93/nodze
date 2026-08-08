-- =====================================================================
--  VODIC: Stan u Njemačkoj — od traženja do prava koja imaš
--  Svi iznosi provjereni 8.8.2026. Bezbjedno pokrenuti i ponovo.
-- =====================================================================

alter table vodici add column if not exists provjereno date;

insert into vodici (slug, naziv, opis, ikona, kategorija, min_citanja, tagovi, tekst, aktivan)
values (
  'stan-u-njemackoj', 'Stan u Njemačkoj — od traženja do prava koja imaš', 'Kako doći do stana, kaucija i tvoja prava, Kaltmiete i „druga kirija", otkazni rokovi i Wohngeld do 400 € koji radnici ne traže',
  '🔑', 'stan', 8, array['stan', 'kirija', 'kaucija', 'Nebenkosten', 'Wohngeld', 'Mieterverein'],
  $vodic$
<p>Naći stan je najteži dio dolaska u Njemačku — teži od vize i od posla. Ali kad jednom uđeš u stan, malo koja zemlja ti daje jača prava kao stanaru. Ovaj vodič ide redom: kako uopšte doći do stana, šta smiju a šta ne smiju tražiti od tebe, koliko te stvarno košta mjesečno, i koje ti pare država daje za stanovanje a da to ne znaš.</p>

<h2>Kako se traži stan</h2>

<p>Portali: <strong>ImmoScout24</strong>, <strong>Immowelt</strong>, <strong>Kleinanzeigen</strong>. U velikim gradovima na jedan oglas dođe i po sto prijava, pa se ne pobjeđuje čekanjem nego brzinom i urednom mapom dokumenata.</p>

<p>Pripremi <strong>jednu PDF mapu</strong> i šalji je odmah uz prijavu:</p>

<ul>
<li>kopija lične ili pasoša,</li>
<li><strong>zadnje 3 platne liste</strong> (ili ugovor o radu ako si tek počeo),</li>
<li><strong>Schufa izvještaj</strong> (bonitet — vadi se online),</li>
<li>potvrda od starog stanodavca da nemaš dugova (<em>Mietschuldenfreiheitsbescheinigung</em>) — ako je imaš,</li>
<li>kratko predstavljanje: ko si, gdje radiš, ko se useljava.</li>
</ul>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Tek si došao i nemaš ni Schufu ni platne liste? Prilaži ugovor o radu i prvu platu čim legne, a pomaže i pismena garancija rođaka koji već radi ovdje (<em>Bürgschaft</em>). Reci otvoreno da si tek počeo — bolje prolazi nego rupa u papirima.</blockquote>

<blockquote class="vd-upozorenje"><strong>⚠️ Važno — prevare:</strong> Nikad ne šalji novac prije nego si vidio stan i potpisao ugovor. „Vlasnik u inostranstvu, pošalji kauciju pa ti šaljem ključ" je prevara, uvijek. Kaucija se plaća tek uz potpisan ugovor, na račun, s potvrdom.</blockquote>

<p>Ako stan nudi agent (Makler): <strong>plaća ga onaj ko ga je angažovao</strong> — kod iznajmljivanja to je po zakonu stanodavac. Tebi agent smije naplatiti proviziju samo ako si ga ti lično angažovao da traži za tebe.</p>

<h2>Kaucija — tvoja prava, izričito</h2>

<ul>
<li>Najviše <strong>3 hladne kirije</strong> (Kaltmiete) — više od toga je nezakonito.</li>
<li>Imaš <strong>zakonsko pravo platiti je u 3 mjesečne rate</strong>, prva uz početak najma. Stanodavac to ne može zabraniti.</li>
<li>Stanodavac je mora držati <strong>odvojeno od svog novca</strong>, s kamatom.</li>
<li>Poslije iseljenja se vraća — u praksi za 3 do 6 mjeseci; dio smije zadržati do zadnjeg obračuna režija.</li>
</ul>

<h2>Kaltmiete i Warmmiete — da se odmah razumijemo</h2>

<p>U oglasu piše <strong>Kaltmiete</strong> — „hladna" kirija, sam prostor. Na to idu <strong>Nebenkosten</strong> (režije zgrade: grijanje, voda, smeće, čišćenje, porez na nekretninu...) i tek to zajedno, <strong>Warmmiete</strong>, je ono što stvarno plaćaš mjesečno. Struja i internet obično idu posebno, na tvoje ugovore.</p>

<p>Prosjek režija u Njemačkoj je <strong>2,28&nbsp;€ po kvadratu mjesečno</strong>, a kad se saberu sve moguće stavke i do <strong>2,87&nbsp;€</strong> — za stan od 70 kvadrata to je 160–200&nbsp;€ mjesečno povrh hladne kirije. Zato je zovu „druga kirija".</p>

<p>Režije tokom godine plaćaš kao <strong>akontaciju</strong>, a jednom godišnje stiže obračun (<em>Nebenkostenabrechnung</em>): ili doplaćuješ ili ti vraćaju.</p>

<blockquote class="vd-upozorenje"><strong>⚠️ Važno:</strong> Obračun režija stanodavac mora poslati <strong>najkasnije 12 mjeseci</strong> nakon kraja obračunskog perioda. Zakasni li, <strong>doplatu više nema pravo tražiti</strong> — a tvoj eventualni povrat i dalje duguje. Pogledaj datum prije nego platiš.</blockquote>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Svaki drugi obračun režija u Njemačkoj sadrži greške — provjeru rade Mieterverein (udruženje stanara, članarina 60–100&nbsp;€ godišnje) i oni te dalje zastupaju i kod svakog spora sa stanodavcem. Za nekoga ko tek uči sistem, to je najbolje potrošenih 80&nbsp;€.</blockquote>

<h2>Useljenje — dva papira bez kojih ne izlaziš iz prvog dana</h2>

<ul>
<li><strong>Übergabeprotokoll</strong> — zapisnik o primopredaji: stanje stana, brojila, svaka postojeća šteta, uz fotografije s datumom. Bez njega ti se pri iseljenju može pripisati tuđa šteta — i tu se gube kaucije.</li>
<li><strong>Wohnungsgeberbestätigung</strong> — potvrda za prijavu adrese, stanodavac ti je mora dati. Bez nje nema Anmeldunga — a bez Anmeldunga ni banke ni poreskog broja. Detaljno: <a href="/vodic/prijavljivanje-adrese">Anmeldung — prijava adrese</a>.</li>
</ul>

<h2>Dok stanuješ — šta stanodavac smije, a šta ne</h2>

<ul>
<li><strong>Povećanje kirije nije slobodno:</strong> do nivoa uporedivih kirija u gradu, i najviše <strong>20&nbsp;% za tri godine</strong> (u mnogim velikim gradovima 15&nbsp;%). Svako povećanje mora biti pismeno i obrazloženo — i imaš pravo provjeriti ga prije nego pristaneš.</li>
<li><strong>U stan ne smije ulaziti bez najave</strong> — samo uz razlog (kvar, prodaja, novi stanar) i dogovoren termin. „Imam ključ pa svratim" ne postoji.</li>
<li><strong>Kvarove prijavljuj pismeno</strong> (mejl je dovoljan). Za ozbiljne kvarove koje ne otklanja — grijanje ne radi, buđ, voda — zakon poznaje umanjenje kirije, ali visinu umanjenja NE određuj sam: jedan pogrešan potez i imaš otkaz zbog duga. Tu opet Mieterverein.</li>
</ul>

<h2>Otkaz — rokovi koje treba znati napamet</h2>

<ul>
<li><strong>Ti otkazuješ:</strong> uvijek <strong>3 mjeseca</strong>, pismeno s potpisom na papiru (mejl ne važi), do 3. radnog dana u mjesecu da taj mjesec počne teći.</li>
<li><strong>Stanodavac tebi:</strong> samo s razlogom (npr. lična potreba — <em>Eigenbedarf</em>), uz rok <strong>3 mjeseca</strong>, koji poslije 5 godina stanovanja raste na <strong>6</strong>, a poslije 8 godina na <strong>9 mjeseci</strong>.</li>
<li>Dobio si otkaz ili papir „sporazumni raskid"? <strong>Ne potpisuj ništa na brzinu.</strong> Trećina otkaza zbog lične potrebe ne prođe provjeru — prvo Mieterverein.</li>
</ul>

<h2>Wohngeld — para koju radnici ne traže jer misle da je socijala</h2>

<p>Wohngeld <strong>nije socijalna pomoć</strong> — to je dodatak za kiriju baš za ljude koji <strong>rade</strong>, ali im plata ne prati kiriju, i za penzionere. Poslije reforme prima ga oko <strong>2 miliona domaćinstava</strong>, prosjek je <strong>oko 385–400&nbsp;€ mjesečno</strong>. Ne može se kombinovati s Bürgergeldom.</p>

<p>Radiš, porodica, kirija te guši? <strong>Provjeri za 5 minuta</strong> na online kalkulatoru (wohngeldrechner), zahtjev ide u Wohngeldstelle tvog grada — u većini pokrajina i online. Uz Wohngeld ili Kinderzuschlag djeca dobijaju i BuT paket (školski pribor, izleti, užina). Za dodatak uz djecu vidi i <a href="/vodic/porezi-njemacka">Porezi — Kindergeld i povrat</a>.</p>

<h2>Česta pitanja</h2>

<h3>Stanodavac traži 4 kirije kaucije, šta da radim?</h3>
<p>Zakonski maksimum su 3 hladne kirije — sve preko toga ne mora se platiti, i može se tražiti nazad i naknadno, do tri godine.</p>

<h3>Mogu li dobiti stan bez Schufe?</h3>
<p>Možeš, pogotovo kod privatnih stanodavaca: ugovor o radu, prve platne liste i garancija rođaka pokrivaju rupu. Schufu ionako izvadi čim otvoriš račun — poslije prve godine urednog plaćanja ona radi za tebe.</p>

<h3>Otkazao sam, a stanodavac traži da krečim cijeli stan?</h3>
<p>Zavisi šta piše u ugovoru — mnoge klauzule o „ljepoticama popravkama" su ništavne. Prije nego platiš ijednog majstora, ponesi ugovor u Mieterverein; često ispadne da ne duguješ ništa.</p>

<p><em>Informativno, ne predstavlja pravni savjet. Rokovi i pravila imaju izuzetke, a pojedinačni ugovori se razlikuju — za svoj slučaj provjeri kod Mietervereina ili advokata.</em></p>

  $vodic$,
  true
)
on conflict (slug) do update set
  naziv = excluded.naziv, opis = excluded.opis, ikona = excluded.ikona,
  kategorija = excluded.kategorija, min_citanja = excluded.min_citanja,
  tagovi = excluded.tagovi, tekst = excluded.tekst,
  aktivan = true, updated_at = now();

update vodici set provjereno = date '2026-08-08' where slug = 'stan-u-njemackoj';

select slug, naziv, provjereno, length(tekst) as duzina from vodici where slug = 'stan-u-njemackoj';
