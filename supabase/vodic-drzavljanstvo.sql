-- =====================================================================
--  VODIC: Njemačko državljanstvo — 5 godina i bosansko ostaje
--  Provjereno 8.8.2026. Bezbjedno pokrenuti i ponovo (upsert po slug-u).
-- =====================================================================

alter table vodici add column if not exists provjereno date;

insert into vodici (slug, naziv, opis, ikona, kategorija, min_citanja, tagovi, tekst, aktivan)
values (
  'njemacko-drzavljanstvo-einburgerung', 'Njemačko državljanstvo — 5 godina i bosansko ostaje', 'Poslije reforme 2024.: dvojno državljanstvo dozvoljeno svima, 5 godina (ili 3), B1, test od 33 pitanja i 255 € takse',
  '🇩🇪', 'viza', 7, array['državljanstvo', 'Einbürgerung', 'dvojno', 'pasoš', 'B1'],
  $vodic$
<p>Od reforme 2024. njemačko državljanstvo je postalo osjetno dostupnije, i jedna promjena mijenja sve za nas: <strong>više ne moraš odreći se bosanskog.</strong> Dvojno državljanstvo je sada dozvoljeno svima — ostaješ i Bosanac i postaješ Nijemac.</p>

<p>Uz to je rok skraćen sa 8 na <strong>5&nbsp;godina</strong>, a za one koji se posebno istaknu na <strong>3 godine</strong>.</p>

<h2>Šta stvarno dobijaš</h2>

<ul>
<li><strong>Njemački pasoš</strong> — putovanje bez viza u preko 190 zemalja, uključujući Ameriku, Kanadu, Australiju.</li>
<li><strong>Boravak koji se ne može izgubiti.</strong> Nema više produžavanja dozvola, nema uslova, nema straha od gubitka posla.</li>
<li><strong>Pravo glasa</strong> i pun pristup državnim poslovima.</li>
<li><strong>Rad i život bilo gdje u EU</strong> bez ijedne dozvole.</li>
<li><strong>Djeca automatski</strong> dobijaju njemačko državljanstvo rođenjem.</li>
</ul>

<h2>Uslovi — izričito</h2>

<div class="vd-tabela-wrap"><table class="vd-tabela">
<thead><tr><th>Uslov</th><th>Redovni put</th><th>Brzi put</th></tr></thead>
<tbody>
<tr><td>Godine legalnog boravka</td><td><strong>5&nbsp;godina</strong></td><td><strong>3 godine</strong></td></tr>
<tr><td>Njemački jezik</td><td><strong>B1</strong></td><td><strong>C1</strong></td></tr>
<tr><td>Dodatno</td><td>—</td><td>posebna dostignuća: odličan uspjeh u poslu ili školi, volonterski rad</td></tr>
</tbody>
</table></div>

<p>Uz to, za oba puta:</p>

<ul>
<li><strong>Stalni boravak</strong> ili druga odgovarajuća dozvola u trenutku predaje.</li>
<li><strong>Sam se izdržavaš</strong> — bez Bürgergelda i socijale za sebe i porodicu. Izuzeci postoje za one koji nisu krivi (bolest, njega člana porodice).</li>
<li><strong>Položen test</strong> „Leben in Deutschland" — <strong>33 pitanja</strong> (30 opštih + 3 o tvojoj pokrajini), prolaz je <strong>17 tačnih</strong>. Prolaznost je preko 95&nbsp;%.</li>
<li><strong>Bez krivične osude</strong> (sitne kazne ne smetaju).</li>
<li><strong>Priznavanje ustavnog poretka</strong> — potpisuje se izjava.</li>
</ul>

<blockquote class="vd-savjet"><strong>💡 Test je lakši nego što misliš.</strong> Svih 310 mogućih pitanja je javno objavljeno i vježba se online besplatno; ispit košta <strong>25&nbsp;€</strong>. Ko je završio njemačku školu, test se uopšte ne traži.</blockquote>

<h2>Koliko košta</h2>

<ul>
<li><strong>255&nbsp;€ po odrasloj osobi</strong></li>
<li><strong>51&nbsp;€ po djetetu</strong> koje se prijavljuje uz roditelje</li>
<li>+ 25&nbsp;€ test, + jezički certifikat ako ga nemaš (oko 200&nbsp;€)</li>
</ul>

<p>Za četveročlanu porodicu (dvoje odraslih, dvoje djece) to je oko <strong>612&nbsp;€ taksi</strong> — jednokratno, za nešto što se ne može oduzeti.</p>

<h2>Kako se predaje</h2>

<ol>
<li><strong>Skupi papire:</strong> pasoš, dozvola boravka, rodni i vjenčani list (međunarodni obrazac iz BiH — bez prevoda), platne liste i ugovor o radu, dokaz o stanu, jezički certifikat, potvrda o testu, uplate penzionog.</li>
<li><strong>Predaj zahtjev</strong> u Einbürgerungsbehörde (obično pri gradskoj upravi ili okrugu). U mnogim gradovima ide i online.</li>
<li><strong>Čekaj.</strong> Realno <strong>12–24 mjeseca</strong>, u velikim gradovima i duže — zaostatak je ogroman otkako je reforma otvorila vrata.</li>
<li><strong>Svečana dodjela</strong> i predaja isprave (Einbürgerungsurkunde). Tek s njom vadiš njemački pasoš i ličnu.</li>
</ol>

<blockquote class="vd-savjet"><strong>💡 Predaj čim ispuniš uslov</strong>, ne kad ti „bude vremena". Red se ne skraćuje, a godine boravka ti već teku — svaki mjesec odlaganja je mjesec duže do pasoša.</blockquote>

<h2>Bosansko državljanstvo — šta s njim</h2>

<p>Ostaje ti. Od reforme se <strong>ne traži odricanje</strong> ni od koje ranije državljanstva. U praksi to znači:</p>

<ul>
<li>zadržavaš bh pasoš i ličnu, i imovinu i prava u BiH bez ograničenja,</li>
<li>za ulazak u BiH koristiš bh pasoš, za ostatak svijeta njemački,</li>
<li>djeca rođena ovdje mogu imati oba od rođenja.</li>
</ul>

<blockquote class="vd-upozorenje"><strong>⚠️ Jedna stvar koja se često promaši:</strong> BiH traži da se sticanje stranog državljanstva <strong>prijavi</strong> nadležnom organu (preko konzulata). Nije formalnost bez posljedica — uredna prijava ti čuva bh papire u redu. Raspitaj se u konzulatu kad dobiješ njemačku ispravu.</blockquote>

<h2>Česta pitanja</h2>

<h3>Radim 6&nbsp;godina ali sam bio 8 mjeseci nezaposlen. Računa li se?</h3>
<p>Godine boravka se broje po dozvoli boravka, ne po radnom stažu — prekid u poslu ne briše godine. Bitno je da <strong>u trenutku predaje</strong> sam sebe izdržavaš i ne primaš Bürgergeld.</p>

<h3>Žena ne radi, kod djece je. Smeta li to?</h3>
<p>Ne smeta ako je porodica izdržavana iz tvoje plate, bez socijale. Ona predaje svoj zahtjev pod istim uslovima — jezik i test važe i za nju.</p>

<h3>Moram li imati stalni boravak prije?</h3>
<p>Po pravilu da — ili odgovarajuću dozvolu koja vodi ka stalnom. Stalni boravak (Niederlassungserlaubnis) se obično dobija poslije 5&nbsp;godina, a kod kvalifikovanih radnika i ranije, pa to ide paralelno.</p>

<h3>Vrijedi li mi vrijeme na Ausbildungu i studiju?</h3>
<p>Da, i te godine se broje kao legalan boravak. Zato mladi koji dođu preko <a href="/vodic/priznavanje-diplome-anerkennung">Ausbildunga</a> stižu do državljanstva ranije nego što misle.</p>

<p><em>Informativno, nije pravni savjet. Praksa i rokovi se razlikuju po gradovima, a pojedinačni slučajevi znaju imati izuzetke — obavezujuću informaciju daje Einbürgerungsbehörde tvog grada.</em></p>

  $vodic$,
  true
)
on conflict (slug) do update set
  naziv = excluded.naziv, opis = excluded.opis, ikona = excluded.ikona,
  kategorija = excluded.kategorija, min_citanja = excluded.min_citanja,
  tagovi = excluded.tagovi, tekst = excluded.tekst,
  aktivan = true, updated_at = now();

update vodici set provjereno = date '2026-08-08' where slug = 'njemacko-drzavljanstvo-einburgerung';

select slug, naziv, provjereno, length(tekst) as duzina from vodici where slug = 'njemacko-drzavljanstvo-einburgerung';
