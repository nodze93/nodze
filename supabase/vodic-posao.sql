-- =====================================================================
--  VODIC: Posao i diploma — Anerkennung, Ausbildung i jezik
--  Zadrzava slug 'priznavanje-diplome-anerkennung' (SEO). Min. plate
--  Ausbildunga 2026 sa zvanicnog BIBB-a. Bezbjedno pokrenuti i ponovo.
-- =====================================================================

alter table vodici add column if not exists provjereno date;

insert into vodici (slug, naziv, opis, ikona, kategorija, min_citanja, tagovi, tekst, aktivan)
values (
  'priznavanje-diplome-anerkennung',
  'Posao i diploma — Anerkennung, Ausbildung i jezik',
  'Kome priznavanje uopšte treba, koliko košta i traje, plaćena škola zanata od 724&nbsp;€ mjesečno, i dokle stvarno moraš s jezikom',
  '🎓', 'posao', 8,
  array['posao','Anerkennung','diploma','Ausbildung','jezik','anabin'],
  $vodic$
<p>Tri pitanja koja svako od nas postavi prije ili poslije dolaska: vrijedi li moja diploma ovdje, mogu li do zanata ako nemam kvalifikaciju — i dokle moram s jezikom? Sve tri stvari idu zajedno, pa su i ovdje u jednom vodiču.</p>

<h2>Prvo pitanje: da li ti priznavanje uopšte treba</h2>

<p>Njemačka dijeli zanimanja na dvije grupe, i od toga zavisi sve:</p>

<div class="vd-tabela-wrap"><table class="vd-tabela">
<thead><tr><th>Grupa</th><th>Primjeri</th><th>Anerkennung?</th></tr></thead>
<tbody>
<tr><td><strong>Reglementirana</strong></td><td>ljekar, stomatolog, medicinska sestra, farmaceut, veterinar, nastavnik, advokat</td><td><strong>Obavezan</strong> — bez priznavanja ne smiješ raditi struku</td></tr>
<tr><td><strong>Nereglementirana</strong></td><td>IT, ekonomija, mašinstvo van komore, trgovina, gradnja, ugostiteljstvo, proizvodnja</td><td><strong>Nije obavezan</strong> — raditi smiješ i bez njega</td></tr>
</tbody>
</table></div>

<p>Za nereglementirana zanimanja preko <a href="/vodic/radna-viza-njemacka">Westbalkanregelunga</a> diploma ti ne treba uopšte. Ali i tu se priznavanje <strong>isplati</strong>: sa priznatom kvalifikacijom prelaziš u Fachkräfte status — stabilniji boravak, brži put do stalnog, i jači argument za veću platu.</p>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Prvi korak je uvijek isti i besplatan: otvori <a href="https://anabin.kmk.org" rel="nofollow noopener" target="_blank">anabin.kmk.org</a> i provjeri kako su ocijenjeni tvoj fakultet i tvoja škola. To je zvanična baza — i tačno ono što će gledati i službenik.</blockquote>

<h2>Anerkennung — kako ide, korak po korak</h2>

<ol>
<li><strong>Nađi nadležno tijelo.</strong> Za privredna i zanatska zanimanja to je IHK FOSA, za zdravstvena pokrajinski organ (za njegu i medicinu — pokrajina u kojoj planiraš raditi). Portal <em>anerkennung-in-deutschland.de</em> ti kaže tačno koje tijelo za tvoje zanimanje.</li>
<li><strong>Skupi papire:</strong> diploma i dodatak diplomi, svjedočanstva, dokaz radnog iskustva, CV, pasoš — sve uz <strong>prevod sudskog tumača</strong>.</li>
<li><strong>Plati taksu:</strong> do <strong>600&nbsp;€</strong> zavisno od postupka (kod IHK FOSA prosjek oko 550&nbsp;€). Na to dođu prevodi i ovjere — realno sve zajedno 700–1.000&nbsp;€.</li>
<li><strong>Čekaj odluku:</strong> po zakonu <strong>3 mjeseca od kompletnih papira</strong> (uz mogućnost jednog produženja). Zato papire predaj kompletne — svaki dopis „nedostaje vam..." vraća sat na nulu.</li>
</ol>

<p>Ishoda su tri: <strong>puno priznavanje</strong> (radiš struku odmah), <strong>djelimično</strong> (dobiješ spisak razlika i dokvalifikaciju — kurs ili ispit, pa puno priznavanje), ili odbijanje (rijetko kad su papiri uredni).</p>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Za troškove postoji državna subvencija (<em>Anerkennungszuschuss</em>, do 600&nbsp;€) za one s manjim primanjima — raspitaj se kod savjetovališta IQ mreže da li program trenutno prima zahtjeve. I: cijeli postupak možeš pokrenuti <strong>još iz BiH</strong>, ne mora se čekati dolazak.</blockquote>

<blockquote class="vd-upozorenje"><strong>⚠️ Važno za medicinare:</strong> viza i dozvola za rad u struci su dva odvojena postupka — vizu možeš dobiti bez njemačkog, ali Approbation ne. Detaljno u vodiču <a href="/vodic/radna-viza-njemacka">Radna viza — reglementirana zanimanja</a>.</blockquote>

<h2>Ausbildung — plaćena škola zanata</h2>

<p>Nemaš kvalifikaciju, ili hoćeš potpuno novo zanimanje? <strong>Ausbildung</strong> je njemački put: 2–3,5 godine kombinacije škole i rada u firmi — i <strong>plaćen je od prvog dana</strong>.</p>

<p>Zakonski minimum za 2026. (mnoge branše plaćaju osjetno više, njega posebno):</p>

<div class="vd-tabela-wrap"><table class="vd-tabela">
<thead><tr><th>Godina Ausbildunga</th><th>Najmanje mjesečno</th></tr></thead>
<tbody>
<tr><td>1. godina</td><td><strong>724&nbsp;€</strong></td></tr>
<tr><td>2. godina</td><td><strong>854&nbsp;€</strong></td></tr>
<tr><td>3. godina</td><td><strong>977&nbsp;€</strong></td></tr>
<tr><td>4. godina</td><td><strong>1.014&nbsp;€</strong></td></tr>
</tbody>
</table></div>

<p>Za Ausbildung ti po pravilu treba završena škola iz BiH i jezik — obično <strong>B1</strong>, za njegu i zdravstvo <strong>B2</strong>. Poslije završetka imaš njemačku kvalifikaciju (nikakav Anerkennung ti više ne treba), tražen si, i na čistom si putu ka stalnom boravku.</p>

<blockquote class="vd-upozorenje"><strong>⚠️ Važno:</strong> Za Ausbildung postoje posrednici i agencije, a među njima i oni koji naplaćuju „posao" ili drže ljude u lošim ugovorima. Legitimna firma ili agencija <strong>ne traži novac od tebe</strong>. Ugovor o Ausbildungu potpisuješ direktno s firmom i registruje se kod komore — sve mimo toga je crvena zastava.</blockquote>

<h2>Jezik — dokle stvarno moraš</h2>

<p>Izričito, jer se oko ovoga širi magla:</p>

<ul>
<li><strong>Bez jezika</strong> se može doći i raditi (Westbalkan put, mnogi poslovi u gradnji, skladištu, proizvodnji) — ali ostaješ zavisan od drugih za svaki papir.</li>
<li><strong>B1</strong> je prag za Ausbildung, za većinu poslova s ljudima, i za stalni boravak / državljanstvo.</li>
<li><strong>B2</strong> traže zdravstvena zanimanja (zakonski uslov za Approbation) i ozbiljnija kancelarijska mjesta.</li>
</ul>

<p>Najjeftiniji ozbiljan put je <strong>Integrationskurs</strong> preko BAMF-a: oko <strong>2,30&nbsp;€ po času</strong>, s oslobađanjem od plaćanja za slabija primanja — a ko kurs položi u roku, ima pravo na <strong>povrat polovine</strong> uplaćenog. Kursevi jezika vezani za posao se uz to <strong>odbijaju od poreza</strong> — vidi <a href="/vodic/porezi-njemacka">Porezi</a>.</p>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Jezik najbrže ide kad ga koristiš svaki dan na poslu — zato je često pametnije doći, raditi i učiti uveče, nego godinama „prvo da naučim pa da dođem". Tako radi većina naših koja je uspjela.</blockquote>

<h2>Česta pitanja</h2>

<h3>Radim na gradilištu — treba li mi Anerkennung?</h3>
<p>Ne. Gradnja je nereglementirana i preko Westbalkanregelunga radiš bez priznavanja. Isplati se tek ako hoćeš Fachkräfte status ili majstorski nivo.</p>

<h3>Koliko me sve zajedno košta priznavanje?</h3>
<p>Taksa do 600&nbsp;€ + sudski prevodi i ovjere — realno <strong>700–1.000&nbsp;€</strong>. Uz subvenciju i poreski odbitak (troškovi vezani za posao) dio se vrati.</p>

<h3>Medicinska sam sestra iz BiH — mogu li raditi dok traje priznavanje?</h3>
<p>Možeš kao pomoćno osoblje, uz ograničenu dozvolu, dok ne položiš jezik i stručne razlike — mnogi tako i rade prvu godinu, jer jezik uz posao ide duplo brže. Uslovi se razlikuju po pokrajini — pitaj nadležni organ pokrajine u kojoj ćeš raditi.</p>

<p><em>Informativno, nije pravni savjet. Takse, rokovi i uslovi zavise od zanimanja i pokrajine — obavezujuće ti kaže nadležno tijelo za priznavanje i savjetovališta IQ mreže (besplatna su).</em></p>

  $vodic$,
  true
)
on conflict (slug) do update set
  naziv = excluded.naziv, opis = excluded.opis, ikona = excluded.ikona,
  kategorija = excluded.kategorija, min_citanja = excluded.min_citanja,
  tagovi = excluded.tagovi, tekst = excluded.tekst,
  aktivan = true, updated_at = now();

update vodici set provjereno = date '2026-08-08' where slug = 'priznavanje-diplome-anerkennung';

select slug, naziv, provjereno, length(tekst) as duzina from vodici where slug = 'priznavanje-diplome-anerkennung';
