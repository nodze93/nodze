-- =====================================================================
--  VODIC: Spajanje porodice — kako dovesti ženu i djecu
--  Provjereno 8.8.2026. Bezbjedno pokrenuti i ponovo (upsert po slug-u).
-- =====================================================================

alter table vodici add column if not exists provjereno date;

insert into vodici (slug, naziv, opis, ikona, kategorija, min_citanja, tagovi, tekst, aktivan)
values (
  'spajanje-porodice', 'Spajanje porodice — kako dovesti ženu i djecu', 'Četiri uslova na tvojoj strani, A1 jezik i kad se ne traži, granica od 16 godina za djecu, i koliko traje',
  '👨‍👩‍👧', 'viza', 8, array['spajanje porodice', 'viza', 'A1', 'djeca', 'Kindergeld'],
  $vodic$
<p>Ovo je najvažniji papir koji ćeš vaditi u Njemačkoj — i finansijski, ne samo porodično. Dok ti dijete živi u BiH, Kindergeld je <strong>5,11&nbsp;€ mjesečno</strong>. Čim dijete živi ovdje, isto to dijete nosi <strong>259&nbsp;€</strong>. Za dvoje djece to je preko <strong>6.000&nbsp;€ godišnje</strong> razlike — pored toga što ti je porodica uz tebe.</p>

<p>Postupak je zaseban od tvoje radne vize, traje duže, i ima tačno četiri uslova koja moraš ispuniti <em>ti ovdje</em>, prije nego oni predaju zahtjev dole.</p>

<h2>Četiri uslova — na tvojoj strani</h2>

<ol>
<li><strong>Tvoj boravak.</strong> Moraš imati važeću boravišnu dozvolu (Aufenthaltstitel), ne samo vizu.</li>
<li><strong>Prihod bez socijale.</strong> Tvoja plata mora pokrivati cijelu porodicu — bez ijednog eura Bürgergelda. Računa se neto plata minus kirija i režije; ured gleda da ostane dovoljno po članu domaćinstva.</li>
<li><strong>Dovoljan stan.</strong> Pravilo koje uredi primjenjuju: oko <strong>12&nbsp;m² po osobi starijoj od 6&nbsp;godina</strong> i <strong>10&nbsp;m² po djetetu do 6&nbsp;godina</strong>. Garsonjera za četvoro ne prolazi — traži se ugovor o najmu kao dokaz.</li>
<li><strong>Zdravstveno osiguranje</strong> za sve koji dolaze — ide besplatno uz tebe čim stignu, vidi <a href="/vodic/krankenkasse">Krankenkasse</a>.</li>
</ol>

<blockquote class="vd-savjet"><strong>💡 Redoslijed koji štedi mjesece:</strong> prvo nađi <strong>veći stan</strong>, pa tek onda predaj zahtjev. Najčešći razlog odbijanja kod nas nije plata nego kvadratura — a selidba u veći stan usred postupka znači kretanje ispočetka.</blockquote>

<h2>Jezik — ovdje je najveća razlika</h2>

<p>Standardno pravilo: supružnik mora prije dolaska položiti <strong>A1 njemački</strong> (Start Deutsch 1, kod Goethe instituta ili ÖSD).</p>

<blockquote class="vd-savjet"><strong>💡 Izuzetak koji većina ne zna:</strong> ako ti imaš status <strong>kvalifikovanog radnika</strong> (Fachkräfte) ili <strong>Plavu kartu EU</strong>, supružnik <strong>ne mora znati njemački</strong> — jezik se briše kao uslov. To je još jedan razlog zašto se priznavanje diplome isplati i kad nije obavezno: vidi <a href="/vodic/priznavanje-diplome-anerkennung">Posao i diploma</a>.</blockquote>

<p>Kod dolaska preko Westbalkanregelunga taj izuzetak ne važi automatski — supružnik po pravilu polaže A1. Kurs u BiH traje 2–3 mjeseca, ispit se polaže u Sarajevu ili Banjoj Luci.</p>

<h2>Djeca — granica je 16&nbsp;godina</h2>

<div class="vd-tabela-wrap"><table class="vd-tabela">
<thead><tr><th>Uzrast djeteta</th><th>Uslov</th></tr></thead>
<tbody>
<tr><td><strong>do 16&nbsp;godina</strong></td><td>bez dodatnih uslova — dolazi uz roditelje</td></tr>
<tr><td><strong>16–18&nbsp;godina</strong></td><td>traži se <strong>C1 njemački</strong> ili dokaz da će se lako uklopiti (npr. njemačka škola dole)</td></tr>
<tr><td><strong>dijete kvalifikovanog radnika</strong></td><td>bez ograničenja, bez obzira na uzrast</td></tr>
</tbody>
</table></div>

<blockquote class="vd-upozorenje"><strong>⚠️ Ne čekaj da dijete napuni 16.</strong> Ovo je najbolniji rok u cijelom njemačkom sistemu za nas — dijete od 15&nbsp;godina dolazi bez ijednog uslova, a isto to dijete sa 16 mora imati C1, što je nivo koji rijetko ko ima. Ako planiraš dovesti porodicu, računaj unazad od djetetovog 16. rođendana.</blockquote>

<p>Ako dolazi <strong>samo jedan roditelj</strong> s djetetom, treba i saglasnost drugog roditelja ovjerena kod notara.</p>

<h2>Kako ide postupak</h2>

<ol>
<li><strong>Ti ovdje</strong> skupljaš dokaze: ugovor o najmu i kvadratura, platne liste (obično zadnje 3–6), ugovor o radu, tvoj Aufenthaltstitel.</li>
<li><strong>Oni dole</strong> zakazuju termin u Ambasadi (ili preko VisaMetrica — provjeri gdje se predaje ta kategorija, mijenja se) i predaju: pasoše, <strong>međunarodni vjenčani list</strong> i izvode za djecu, A1 certifikat, tvoje dokaze.</li>
<li><strong>Ambasada traži saglasnost</strong> tvoje Ausländerbehörde. Tu se najviše čeka.</li>
<li><strong>Viza stiže</strong>, oni dolaze, i u roku od 14 dana idu na <a href="/vodic/prijavljivanje-adrese">Anmeldung</a>, pa u Ausländerbehörde po svoju dozvolu.</li>
</ol>

<p><strong>Koliko traje:</strong> realno <strong>3 do 9 mjeseci</strong> od predaje — osjetno duže od radne vize. Zato se kreće rano.</p>

<blockquote class="vd-savjet"><strong>💡 Bosanski papiri:</strong> vjenčani list i izvode za djecu vadi kao <strong>međunarodne (višejezične) obrasce</strong> — njemački organi ih primaju <strong>bez prevoda</strong>. Obični izvod traži sudski prevod i apostille, međunarodni ne. To je nekoliko stotina eura i par sedmica razlike.</blockquote>

<h2>Šta porodica dobija čim stigne</h2>

<ul>
<li><strong>Kindergeld 259&nbsp;€ po djetetu</strong> — traži se odmah kod Familienkasse, plaća unazad najviše 6 mjeseci.</li>
<li><strong>Besplatno zdravstveno</strong> za suprugu i djecu uz tvoje osiguranje.</li>
<li><strong>Vrtić i škola</strong> — dijete ima zakonsko pravo na mjesto; upisi i pripremna odjeljenja za jezik: <a href="/vodic/porodica-u-njemackoj">Porodica u Njemačkoj</a>.</li>
<li><strong>Supruga smije raditi</strong> — dozvola za rad ide uz boravak za spajanje porodice, ne traži se posebno.</li>
<li>Ako je plata mala za porodicu: <strong>Kinderzuschlag do 297&nbsp;€</strong> i <strong>Wohngeld</strong> — vidi <a href="/vodic/porezi-njemacka">Porezi</a> i <a href="/vodic/stan-u-njemackoj">Stan</a>.</li>
</ul>

<h2>Česta pitanja</h2>

<h3>Koliko moram zarađivati?</h3>
<p>Nema jednog broja — gleda se da neto plata pokrije kiriju, režije i minimum po članu porodice, bez socijale. Orijentaciono, za četveročlanu porodicu traži se osjetno više od minimalca. Tačan iznos ti izračuna tvoja Ausländerbehörde na osnovu tvoje kirije — pitaj ih prije nego išta predaš.</p>

<h3>Možemo li se vjenčati u BiH pa je odmah dovesti?</h3>
<p>Vjenčanje u BiH je najbrži dio (par dana) i brak se ovdje samo prijavi. Ali <strong>spajanje porodice je zaseban postupak</strong> koji ide poslije, po uslovima gore — brak sam po sebi ne daje pravo ulaska.</p>

<h3>Supruga ne zna nimalo njemački. Je li gotovo?</h3>
<p>Nije. Ili polaže A1 (2–3 mjeseca kursa), ili — ako ti imaš Fachkräfte status ili Plavu kartu — jezik se uopšte ne traži. Provjeri prvo koji ti je status.</p>

<h3>Dijete ima 16 i ne zna njemački. Ima li šanse?</h3>
<p>Ima, ali teže: traži se C1 ili dokaz o lakom uklapanju, osim ako si kvalifikovani radnik — tada nema ograničenja. Ovo je slučaj gdje se stvarno isplati advokat za strance.</p>

<p><em>Informativno, nije pravni savjet. Uslovi se razlikuju po statusu boravka i po gradu, a prihodovni prag računa tvoja Ausländerbehörde — za svoj slučaj provjeri kod njih ili kod advokata za strance.</em></p>

  $vodic$,
  true
)
on conflict (slug) do update set
  naziv = excluded.naziv, opis = excluded.opis, ikona = excluded.ikona,
  kategorija = excluded.kategorija, min_citanja = excluded.min_citanja,
  tagovi = excluded.tagovi, tekst = excluded.tekst,
  aktivan = true, updated_at = now();

update vodici set provjereno = date '2026-08-08' where slug = 'spajanje-porodice';

select slug, naziv, provjereno, length(tekst) as duzina from vodici where slug = 'spajanje-porodice';
