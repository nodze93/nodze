-- =====================================================================
--  VODIC: Porezi u Njemačkoj — klase, Kindergeld i povrat (grupa NOVAC)
--  Svi iznosi za 2026. provjereni 7.8.2026. (BMF, Destatis, Familienkasse,
--  BMF Ländergruppeneinteilung). Bezbjedno pokrenuti i ponovo.
-- =====================================================================

alter table vodici add column if not exists provjereno date;

insert into vodici (slug, naziv, opis, ikona, kategorija, min_citanja, tagovi, tekst, aktivan)
values (
  'porezi-njemacka',
  'Porezi u Njemačkoj — klase, Kindergeld i povrat koji ti pripada',
  'Šta ti država vraća i daje 2026.: klase poslije ženidbe, Kindergeld 259 €, prosjek povrata 1.240 €, i slanje para roditeljima u BiH koje se odbija od poreza',
  '💶', 'porez', 8,
  array['porez','Kindergeld','povrat','poreske klase','Unterhalt','BiH'],
  $vodic$
<p>Njemačka ti svakog mjeseca uzme komad plate — to vidiš na obračunu. Ono što ne vidiš: <strong>dio toga ti država vraća, ali samo ako tražiš.</strong> Prosječan povrat poreza je <strong>1.240&nbsp;eura</strong>, a dobije ga skoro <strong>9 od 10 ljudi</strong> koji predaju prijavu. Ko ne preda ništa — pokloni te pare državi.</p>

<p>Ovaj vodič ide redom: šta su poreske klase i šta se dešava kad se oženiš, koliko je Kindergeld i šta ako ti dijete živi u Bosni, šta sve možeš odbiti od poreza — uključujući pare koje šalješ roditeljima dole — i kako da povrat uzmeš najlakše.</p>

<h2>Poreske klase — šta su stvarno</h2>

<p>Prvo ono što skoro niko ne zna, a mijenja sve: <strong>poreska klasa ne određuje koliko poreza platiš.</strong> Ona određuje samo koliko ti se <em>tokom godine</em> odbija od plate — akontaciju. Konačan porez je za sve iste prihode isti, a razlika se poravna kroz poresku prijavu: ko je preplatio, dobije nazad; ko je potplatio, doplati.</p>

<p>Zato pogrešna klasa nije „veći porez" — ali jeste manja plata svakog mjeseca, i tvoje pare kod države do sljedeće prijave.</p>

<div class="vd-tabela-wrap"><table class="vd-tabela">
<thead><tr><th>Klasa</th><th>Ko je u njoj</th></tr></thead>
<tbody>
<tr><td><strong>I</strong></td><td>neoženjen/neudata, razveden, udovac — standard</td></tr>
<tr><td><strong>II</strong></td><td>samohrani roditelj (ima dodatnu olakšicu — traži se posebno!)</td></tr>
<tr><td><strong>III</strong></td><td>oženjen, ti zarađuješ (znatno) više — najmanji odbici</td></tr>
<tr><td><strong>IV</strong></td><td>oženjeni, slične plate (standard poslije vjenčanja)</td></tr>
<tr><td><strong>V</strong></td><td>oženjen, tvoj partner je u III — najveći odbici</td></tr>
<tr><td><strong>VI</strong></td><td>drugi posao (uz prvi) — najgori odbici, bez olakšica</td></tr>
</tbody>
</table></div>

<h2>Oženio si se — šta sad</h2>

<p>Poslije vjenčanja oboje automatski dobijete <strong>klasu IV/IV</strong>. Ako jedno zarađuje znatno više, kombinacija <strong>III/V</strong> (jači u III, slabiji u V) donosi <strong>veće zajedničko neto odmah svaki mjesec</strong>. Ako su plate slične, ostavite IV/IV.</p>

<p>Promjena klase se traži od Finanzamta — obrazac „Antrag auf Steuerklassenwechsel", ide i online preko ELSTER-a, besplatno, i može <strong>više puta godišnje</strong>.</p>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Prije nego promijeniš klasu, izračunaj obje varijante na našem <a href="/brutto-netto">Brutto-Netto kalkulatoru</a> — uneseš platu jednom kao III, jednom kao IV, i vidiš razliku u eurima.</blockquote>

<blockquote class="vd-upozorenje"><strong>⚠️ Važno:</strong> Sa kombinacijom III/V poreska prijava postaje <strong>obavezna</strong> (čim oboje imate platu). I računaj na moguću doplatu — III/V tokom godine često odbije premalo. Nije to „kazna", nego poravnanje onoga što si već dobio kroz veće neto.</blockquote>

<p>A najlakši put do samog vjenčanja? Kod nas provjereno: <strong>preko Bosne.</strong> Njemački Standesamt traži gomilu papira s apostilama i prevodima i termine koji se čekaju. U BiH se vjenčaš za par dana, a onda u Njemačkoj brak samo prijaviš — <strong>međunarodni vjenčani list</strong> (višejezični obrazac) njemački organi primaju <strong>bez prevoda</strong>. Klasa se mijenja od prijave braka.</p>

<p>Priča se godinama o ukidanju kombinacije III/V — <strong>to još nije zakon</strong>. Dok se ne promijeni, sve gore važi.</p>

<h2>Kindergeld — 259&nbsp;€ po djetetu</h2>

<p>Od 1. januara 2026. Kindergeld je <strong>259&nbsp;eura mjesečno po djetetu</strong>, za svako dijete isto. Nije vezan za platu, ne oporezuje se, a pravo imaš i kao stranac sa radnom dozvolom i boravkom.</p>

<p>Dijete ima pravo do 18. godine bez uslova, do 25. ako se školuje ili studira. Traži se <strong>jednom</strong>, kod Familienkasse (pri Agenturi za rad), online ili obrazac KG1 — treba ti poreski broj tvoj i djeteta, izvod iz matične knjige rođenih.</p>

<blockquote class="vd-upozorenje"><strong>⚠️ Važno — dijete živi u Bosni:</strong> ako ti radiš ovdje a dijete živi u BiH, <strong>ne dobijaš 259&nbsp;€</strong>, nego sporazumske iznose koji su ostali iz starog jugoslovensko-njemačkog sporazuma: <strong>5,11&nbsp;€</strong> za prvo dijete, <strong>12,78&nbsp;€</strong> za drugo, <strong>30,68&nbsp;€</strong> za treće i četvrto, 35,79&nbsp;€ od petog. Da, dobro si pročitao. Puni Kindergeld ide tek kad dijete stvarno živi u Njemačkoj — to je i finansijski najveći razlog za spajanje porodice: <a href="/vodic/radna-viza-njemacka">kako dovesti porodicu</a>.</blockquote>

<p>Uz Kindergeld postoji i <strong>Kinderzuschlag</strong> — dodatak <strong>do 297&nbsp;€ mjesečno po djetetu</strong> za zaposlene s manjim platama (radiš, ali plata jedva pokriva porodicu). Njega ljudi masovno ne traže jer ne znaju da postoji. Provjera i zahtjev idu online kod Familienkasse; ako primaš Kinderzuschlag, dijete ima i besplatan vrtićki ručak, školski pribor i prevoz (BuT paket).</p>

<h2>Povrat poreza — odakle dolazi tih 1.240&nbsp;€</h2>

<p>Poslodavac ti tokom godine odbija porez „na neviđeno". U prijavi se onda priznaju tvoji stvarni troškovi — i razlika se vraća. Država automatski prizna <strong>1.230&nbsp;€ paušala</strong> za radne troškove; sve preko toga vraća dodatno.</p>

<p>Šta se najčešće isplati kod nas:</p>

<div class="vd-tabela-wrap"><table class="vd-tabela">
<thead><tr><th>Trošak</th><th>Koliko se priznaje</th></tr></thead>
<tbody>
<tr><td>Put na posao</td><td><strong>0,38&nbsp;€ po kilometru</strong> udaljenosti (jedan smjer!), od 2026. <strong>od prvog kilometra</strong> — novina, ranije je do 20. km bilo manje</td></tr>
<tr><td>Rad od kuće</td><td>6&nbsp;€ po danu, do 1.260&nbsp;€ godišnje</td></tr>
<tr><td>Alat, radna odjeća, obuća</td><td>stvarni troškovi s računima</td></tr>
<tr><td>Kurs njemačkog za posao, stručni kursevi</td><td>stvarni troškovi</td></tr>
<tr><td>Selidba zbog posla</td><td>paušal + stvarni troškovi prevoza</td></tr>
<tr><td>Telefon/internet (dio za posao)</td><td>pausalno do 20&nbsp;€/mj</td></tr>
</tbody>
</table></div>

<h2>Dva aduta koja njemački sajtovi ne pišu</h2>

<p><strong>1. Pare koje šalješ roditeljima u BiH odbijaju se od poreza.</strong> Izdržavanje roditelja (Unterhalt) je priznat trošak. Za BiH se priznaje <strong>do 6.174&nbsp;€ godišnje po osobi</strong> (polovina njemačkog maksimuma od 12.348&nbsp;€, jer je BiH u „grupi zemalja 3"). Uslovi, izričito:</p>

<ul>
<li><strong>samo bankovni transfer na račun roditelja</strong> — od 2025. keš predat u ruke, Western Union na šalteru i slično <strong>ne priznaje se više uopšte</strong>;</li>
<li>roditelji moraju biti stvarno izdržavani — njihova penzija/prihod preko <strong>624&nbsp;€ godišnje</strong> umanjuje iznos;</li>
<li>čuvaš potvrde o uplatama i dokaz srodstva (izvod).</li>
</ul>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Ako šalješ majci 200&nbsp;€ mjesečno na račun, to je 2.400&nbsp;€ godišnje odbitka — na tvoju poresku stopu realno <strong>600–800&nbsp;€ povrata svake godine</strong>. Samo zato što si prešao s keša na uplatu na račun.</blockquote>

<p><strong>2. Porodica ti je u BiH, a ti radiš ovdje?</strong> To se zove dvostruko domaćinstvo (doppelte Haushaltsführung): priznaje se <strong>kirija njemačkog stana do 1.000&nbsp;€ mjesečno</strong>, oprema stana, i <strong>jedna vožnja kući sedmično</strong> po 0,38&nbsp;€/km udaljenosti. Uslov je da porodično domaćinstvo dole stvarno postoji i da ga sufinansiraš. Ovo su hiljade eura godišnje — i baš zato je ovdje pametno uzeti savjetnika da papiri budu čisti.</p>

<h2>Kako predati — od najjeftinijeg do najlakšeg</h2>

<ul>
<li><strong>ELSTER</strong> — zvanični portal, besplatan, ali sve na njemačkom i suhoparan.</li>
<li><strong>Aplikacije</strong> (Taxfix, WISO i slične) — vode te pitanjima, koštaju oko 35–45&nbsp;€. Za običnu platu bez komplikacija sasvim dovoljno.</li>
<li><strong>Lohnsteuerhilfeverein</strong> — udruženje koje ti radi prijavu za godišnju članarinu po visini prihoda (obično 50–300&nbsp;€). Dobar izbor kad imaš Unterhalt za Bosnu ili dvostruko domaćinstvo.</li>
<li><strong>Steuerberater</strong> — najskuplji, treba ti tek za samostalnu djelatnost i komplikovane slučajeve.</li>
</ul>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Ako nisi obavezan predavati, prijavu možeš predati <strong>4 godine unazad</strong>. Za 2022. imaš vremena do <strong>31. decembra 2026.</strong> — četiri propuštene godine puta prosječnih 1.240&nbsp;€ je razlog da to bude ovaj mjesec, ne „jednom".</blockquote>

<h2>Česta pitanja</h2>

<h3>Moram li uopšte predavati poresku prijavu?</h3>

<p>Kao običan zaposlenik u klasi I — <strong>ne moraš</strong>. Obavezan si, između ostalog: u kombinaciji III/V (oboje rade), u klasi VI, ako si primao Elterngeld/Kurzarbeitergeld/bolovanje od kase preko 410&nbsp;€ godišnje, ili imaš sporedne prihode preko 410&nbsp;€. A i kad ne moraš — u prosjeku ostavljaš 1.240&nbsp;€ ako ne predaš.</p>

<h3>Dijete mi je u BiH kod majke. Dobijam li Kindergeld?</h3>

<p>Sporazumski, umanjeni — 5,11&nbsp;€ za prvo dijete (vidi gore). Puni iznos od 259&nbsp;€ tek kad dijete živi u Njemačkoj.</p>

<h3>Nosim roditeljima pare kad idem dole — priznaje li se to?</h3>

<p><strong>Ne.</strong> Od 2025. priznaje se isključivo uplata na njihov bankovni račun. Otvori im račun i šalji transferom — isti novac, samo sad vidljiv Finanzamtu.</p>

<h3>Strah me da ću morati doplatiti ako predam.</h3>

<p>Od onih koji predaju, povrat dobije oko <strong>87&nbsp;%</strong>, prosjek 1.240&nbsp;€. Doplata pogađa uglavnom III/V kombinacije i one sa sporednim prihodima — a oni su ionako obavezni predati. Za dobrovoljnu prijavu običnog zaposlenika rizik je mali, a prosjek kaže da na stolu ostavljaš više nego što rizikuješ.</p>

<p><em>Informativno, ne predstavlja poresko savjetovanje. Iznosi važe za 2026. i mijenjaju se svakog januara — pravila provjeri kod Finanzamta ili savjetnika prije nego se osloniš na pojedinačni iznos.</em></p>

  $vodic$,
  true
)
on conflict (slug) do update set
  naziv = excluded.naziv, opis = excluded.opis, ikona = excluded.ikona,
  kategorija = excluded.kategorija, min_citanja = excluded.min_citanja,
  tagovi = excluded.tagovi, tekst = excluded.tekst,
  aktivan = true, updated_at = now();

update vodici set provjereno = date '2026-08-07' where slug = 'porezi-njemacka';

select slug, naziv, min_citanja, provjereno, length(tekst) as duzina
from vodici where slug = 'porezi-njemacka';
