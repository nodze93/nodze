-- =====================================================================
--  VODIC: Radna viza za Njemačku — dva puta i koji je tvoj
--  Supabase -> SQL Editor -> Run.  Samostalan fajl, bezbjedno i ponovo.
-- =====================================================================

alter table vodici add column if not exists provjereno date;

insert into vodici (slug, naziv, opis, ikona, kategorija, min_citanja, tagovi, tekst, aktivan)
values (
  'radna-viza-njemacka',
  'Radna viza za Njemačku — dva puta i koji je tvoj',
  'Westbalkanregelung ili Fachkräfte, kvota od 50.000, Vorabzustimmung, i koraci od ugovora do prvog dana',
  '📋', 'viza', 7,
  array['viza', 'Westbalkan', 'Fachkräfte', 'VisaMetric', 'Vorabzustimmung'],
  $vodic$
<p>Većina vodiča o radnoj vizi napisana je za ljude s fakultetskom diplomom koja se priznaje u Njemačkoj. Ako si s Balkana — iz BiH, Srbije, Crne Gore, Albanije, Kosova ili Sjeverne Makedonije — postoji i drugi put koji ne zahtijeva da ti kvalifikacija bude formalno priznata. Mnogi za njega ne znaju i odustanu prije nego što uopšte pokušaju.</p>

<p>Zato prvo moraš znati koji od dva puta je tvoj, jer se dokumenti, rokovi i cijela procedura razlikuju.</p>

<h2>Dva puta u Njemačku</h2>

<h3>Put 1 — Westbalkanregelung (§ 26 st. 2 BeschV)</h3>

<p>Poseban režim za državljane šest zemalja: BiH, Srbije, Sjeverne Makedonije, Crne Gore, Albanije i Kosova. Suština: <strong>važi za svaku vrstu zaposlenja, bez obzira na to da li ti je kvalifikacija priznata u Njemačkoj.</strong> Nije ti potrebna diploma niti Anerkennung.</p>

<p>Uslov je da zanimanje nije reglementirano i da imaš konkretnu ponudu posla ili potpisan ugovor.</p>

<p>Ovim putem ide najveći dio nas s Balkana koji radimo u gradnji, transportu, gastronomiji, skladištima, proizvodnji i njezi — bez obzira na to da li je sprema formalno priznata.</p>

<h3>Put 2 — Fachkräfte (kvalifikovani radnik)</h3>

<p>Ako imaš spremu koja se u Njemačkoj priznaje, ovaj put ti daje bolju poziciju: stabilniji boravak, lakše produženje, bolju perspektivu za stalni boravak. Ali traži da diploma prođe provjeru, a kod reglementiranih zanimanja i puni postupak priznavanja.</p>

<h3>Koji je tvoj put</h3>

<table class="vd-tabela">
<thead><tr><th>Tvoja situacija</th><th>Put</th></tr></thead>
<tbody>
<tr><td>Ljekar, veterinar, farmaceut, medicinska sestra, nastavnik</td><td>Reglementirano — treba i Approbation, ne samo viza</td></tr>
<tr><td>Inženjer, pravnik</td><td>Fachkräfte; provjeri da li je tvoja grana reglementirana</td></tr>
<tr><td>IT, programiranje</td><td>Oba su moguća; Fachkräfte daje bolji dugoročni status, a njemački obično nije uslov</td></tr>
<tr><td>Gradnja, transport, ugostiteljstvo, skladište, proizvodnja</td><td>Westbalkanregelung</td></tr>
<tr><td>Imaš diplomu ali radiš nešto drugo</td><td>Westbalkanregelung je brži</td></tr>
<tr><td>Nemaš formalnu kvalifikaciju</td><td>Westbalkanregelung</td></tr>
</tbody>
</table>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Provjeri svoju diplomu na <a href="https://anabin.kmk.org" rel="nofollow noopener" target="_blank">anabin.kmk.org</a> prije nego bilo šta odlučiš.</blockquote>

<h2>Reglementirana zanimanja — viza i licenca nisu isto</h2>

<p>Ovo je najveći nesporazum kod ljekara, veterinara, farmaceuta, medicinskih sestara i stomatologa.</p>

<p><strong>Vizu možeš dobiti i bez njemačkog. Dozvolu da radiš struku ne možeš.</strong></p>

<p>To su dva odvojena postupka kod dva različita organa. Viza ti daje pravo ulaska i boravka. Za rad u samoj profesiji treba ti <strong>Approbation</strong> ili privremena <strong>Berufserlaubnis</strong>, a to izdaje nadležni organ pokrajine u kojoj živiš — i tu je jezik zakonski uslov, ne stvar dogovora s poslodavcem.</p>

<p>Za veterinare se po pravilu traži B2. U nekim pokrajinama traži se i stručni jezički ispit orijentisan na nivo C1 — u Baden-Württembergu se, primjera radi, traže i B2 certifikat i položen stručni ispit kod pokrajinske veterinarske komore. Uslovi se provjeravaju u pokrajini gdje planiraš živjeti, a ne uopšteno.</p>

<blockquote class="vd-upozorenje"><strong>⚠️ Važno:</strong> Rad kao ljekar, veterinar ili farmaceut prije izdate Approbation može imati krivične posljedice. Ne pristaj na to da „radiš dok se papiri ne srede".</blockquote>

<p>Mnogi dođu prije nego što imaju jezik i licencu, pa u međuvremenu rade kao asistent na srodnom poslu — legalno, ali ne s punom licencom. Jezik puno brže ide kad ga koristiš svaki dan, a postupak priznavanja vodiš iz Njemačke umjesto iz rodne zemlje.</p>

<p>Ako razmišljaš o takvom aranžmanu, prije nego potpišeš, raščisti s poslodavcem: šta tačno piše u ugovoru kao tvoje radno mjesto, da li plaćaju ili organizuju kurs jezika, i šta se dešava s platom i pozicijom kad dobiješ Approbation — dogovori to unaprijed.</p>

<h2>Kvota — najvažnija stvar kod Westbalkana</h2>

<p>Bundesagentur für Arbeit može godišnje izdati <strong>do 50.000 saglasnosti</strong>. Od 1. juna 2024. taj broj je udvostručen (ranije 25.000), a ukinut je rok trajanja propisa — ranije je važio samo do kraja 2023.</p>

<p><strong>Kvota se dijeli po mjesecima i po državama.</strong> Kad se mjesečna kvota za tvoju zemlju potroši, zahtjevi se dalje ne obrađuju do sljedećeg mjeseca. Ima smisla krenuti početkom mjeseca.</p>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Postoje inicijative da se kvota ponovo smanji. Nema razloga odugovlačiti.</blockquote>

<h2>Ako imaš više od 45 godina</h2>

<p>Ako prvi put tražiš saglasnost BA i imaš više od 45 godina, moraš dokazati jedno od dvoje: bruto godišnju platu od 55 posto godišnje granice za obračun doprinosa u penzijskom (za 2026. je to oko 55.770 eura godišnje), ili odgovarajuće penzijsko osiguranje. Ne važi ako si već ranije imao saglasnost BA.</p>

<h2>Vorabzustimmung — dio koji štedi sedmice</h2>

<p>Od 1. juna 2024. <strong>tvoj poslodavac traži predsaglasnost Savezne agencije za rad unaprijed</strong>, prije nego uopšte rezervišeš termin za vizu. Pitaj poslodavca da li je to zatražio. Mnogi manji poslodavci za to nisu ni čuli, a to je jedna od rijetkih stvari koje stvarno skraćuju čekanje.</p>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Vorabzustimmung ne važi ako produžavaš boravak dok si već u Njemačkoj — tada je nadležna Ausländerbehörde.</blockquote>

<h2>Koliko se čeka</h2>

<p>Otkako je lutrija ukinuta i uveden sistem s predsaglasnošću, čekanje je osjetno kraće. Iz iskustava, viza preko Westbalkanregelunga može doći za sedmicu dana, ali ima i onih koji su čekali mjesec i duže. Spajanje porodice po pravilu traje osjetno duže od radne vize.</p>

<blockquote class="vd-upozorenje"><strong>⚠️ Važno:</strong> Nemoj dati otkaz, otkazati stan ni prodavati auto dok ti viza fizički nije u pasošu.</blockquote>

<h2>Koraci — od ugovora do prvog dana</h2>

<h3>1. Nađi posao</h3>

<p>Indeed.de, StepStone.de, LinkedIn. Za Westbalkan put postoje i agencije za posredovanje, ali ih provjeri — ovo je područje s dosta prevara. Legitiman poslodavac ili agencija <strong>ne traži od tebe novac za posao</strong>. Poslodavac potpisuje Arbeitsvertrag. Bez njega nema ničega dalje.</p>

<h3>2. Provjeri kvalifikaciju</h3>

<p>Otvori anabin.kmk.org. Ako je zanimanje reglementirano, Anerkennung je obavezan i traje mjesecima — kreni odmah. Ako ideš preko Westbalkanregelunga, ovaj korak preskačeš.</p>

<h3>3. Poslodavac traži Vorabzustimmung</h3>

<p>Ide prije zakazivanja termina. Ovo je ključni korak koji mnogi preskoče — ne preskoči ga.</p>

<h3>4. Zakaži termin — provjeri gdje se predaje tvoja kategorija</h3>

<p>Westbalkanregelung ide kroz VisaMetric. Ambasada je prijem tih zahtjeva prenijela na vanjsku agenciju i za tu kategoriju zahtjev u samoj Ambasadi ne možeš ni predati. Reglementirana zanimanja i dio Fachkräfte kategorija i dalje idu direktno kroz Ambasadu.</p>

<p>Ambasada kategorije postepeno prebacuje na VisaMetric, pa provjeri gdje se predaje baš tvoja kategorija — podatak star godinu dana ovdje ne vrijedi ništa. Ambasada ne naplaćuje rezervaciju termina i nije moguće platiti raniji termin — ako ti to neko nudi, to je prevara.</p>

<h3>5. Pripremi dokumente</h3>

<ul>
<li>Pasoš koji važi još najmanje <strong>18 mjeseci</strong> (ne 6, kako se često pogrešno navodi)</li>
<li>Biometrijske fotografije</li>
<li>Potpisan Arbeitsvertrag</li>
<li>Diploma i ovjereni sudski prijevod (ako ideš Fachkräfte putem)</li>
<li>Potvrda o priznavanju kvalifikacije, ako je zanimanje reglementirano</li>
<li>Dokaz o smještaju u Njemačkoj</li>
<li>Dokaz o zdravstvenom osiguranju za period do prve plate</li>
<li>Dokaz o penzijskom ili plati, ako imaš više od 45 godina</li>
</ul>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Prijevode radi kod sudskog tumača, ne kod poznanika koji zna njemački.</blockquote>

<h3>6. Predaja zahtjeva</h3>

<p>Dođi ranije i ponesi originale i kopije svega. Taksa se plaća pri predaji. Ako predaješ kod VisaMetrica, nude i dodatne opcione usluge — one nisu obavezne za obradu zahtjeva.</p>

<h3>7. Dolazak i Anmeldung</h3>

<p>Prijaviš se u Einwohnermeldeamt, u većini gradova u roku od 14 dana. Treba ti <strong>Wohnungsgeberbestätigung</strong> — potvrda koju potpisuje vlasnik stana. Bez tog papira te neće prijaviti, i tu se ljudi najčešće zaglave. Traži ga odmah pri useljenju.</p>

<h3>8. Ausländerbehörde</h3>

<p>Viza služi za ulazak. Za dugoročni boravak treba ti Aufenthaltstitel. Zakaži termin odmah po dolasku — termini se čekaju, a viza ti u međuvremenu ističe.</p>

<h3>9. Krankenkasse</h3>

<p>Prijaviš se u javnu blagajnu (TK, AOK, Barmer, DAK). Poslodavac uplaćuje svoj dio, tvoj se odbija od plate. Osnovni doprinos je zakonski određen, ali se dodatni doprinos razlikuje od blagajne do blagajne — vrijedi uporediti. Detaljno u vodiču: <a href="/vodic/krankenkasse">Krankenkasse — prijava, cijene i koju kasu izabrati</a>.</p>

<h3>10. Bankovni račun</h3>

<p>Klasične banke traže Anmeldebestätigung. Digitalne banke poput N26 obično omogućavaju otvaranje i prije prijave prebivališta — to pomaže ako ti poslodavac traži broj računa, a još nemaš Anmeldung.</p>

<h2>Česta pitanja</h2>

<h3>Mogu li preko Westbalkanregelunga dovesti porodicu?</h3>

<p>Spajanje porodice je odvojen postupak s vlastitim uslovima i po pravilu traje duže od radne vize.</p>

<h3>Treba li mi njemački jezik?</h3>

<p>Zavisi od zanimanja. Za Westbalkanregelung jezik nije zakonski uslov, ali ga poslodavac često traži. Za nereglementirana akademska zanimanja (IT, dio inženjerskih poslova) njemački obično nije uslov. Za reglementirana zanimanja — ljekar, veterinar, farmaceut, medicinska sestra — vizu možeš dobiti bez jezika, ali dozvolu za rad u profesiji ne.</p>

<h3>Šta ako je kvota potrošena?</h3>

<p>Zahtjev se ne obrađuje dok se ne otvori nova kvota za sljedeći period.</p>

<p><em>Informativno, ne predstavlja pravni savjet. Propisi i iznosi se mijenjaju — provjeri aktuelne uslove kod Ambasade Njemačke, VisaMetrica i Bundesagentur für Arbeit.</em></p>

  $vodic$,
  true
)
on conflict (slug) do update set
  naziv = excluded.naziv, opis = excluded.opis, ikona = excluded.ikona,
  kategorija = excluded.kategorija, min_citanja = excluded.min_citanja,
  tagovi = excluded.tagovi, tekst = excluded.tekst,
  aktivan = true, updated_at = now();

update vodici set provjereno = date '2026-08-07' where slug = 'radna-viza-njemacka';

select slug, naziv, min_citanja, provjereno, length(tekst) as duzina
from vodici where slug = 'radna-viza-njemacka';
