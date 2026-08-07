-- =====================================================================
--  VODIC: Anmeldung — prijava adrese
--  Supabase -> SQL Editor -> Run.  Samostalan fajl, bezbjedno i ponovo.
-- =====================================================================

alter table vodici add column if not exists provjereno date;

insert into vodici (slug, naziv, opis, ikona, kategorija, min_citanja, tagovi, tekst, aktivan)
values (
  'prijavljivanje-adrese',
  'Anmeldung — prijava adrese',
  'Rok od 14 dana, papir koji ti mora dati stanodavac, kako doći do termina, i šta stiže na vrata kad se prijaviš',
  '🏠', 'viza', 8,
  array['Anmeldung', 'prijava', 'Wohnungsgeberbestätigung', 'Rundfunkbeitrag', 'Steuer-ID'],
  $vodic$
<p>Anmeldung je prijava adrese stanovanja i to je <strong>prva stvar koju uradiš</strong> kad dođeš. Ne zato što neko insistira, nego zato što bez nje ne ide skoro ništa drugo — ni bankovni račun, ni poreski broj, ni termin u Ausländerbehörde. Ljudi to potcijene, izgube dvije-tri sedmice, pa se onda čude zašto stoje.</p>

<p>Sama prijava traje petnaest minuta i <strong>besplatna je</strong>. Sve teško je oko nje: jedan papir koji ti mora dati stanodavac, i termin koji se u velikim gradovima čeka.</p>

<h2>Rok je 14 dana — i kazna je stvarna</h2>

<p>Po zakonu se moraš prijaviti <strong>u roku od dvije sedmice od useljenja</strong>. Rok teče od dana kad si se stvarno uselio, ne od dana kad si potpisao ugovor.</p>

<p>Kazna za probijanje roka ide <strong>do 1.000&nbsp;€</strong>. U praksi se za sedam dana zakašnjenja obično ne desi ništa, ali za mjesec-dva zna stići rješenje — a i kad ne stigne, sve ostalo ti stoji dok se ne prijaviš. Nema razloga rizikovati.</p>

<div class="vd-box vd-box-tip"><span>💡</span><span>Ako u tih 14 dana ne možeš dobiti termin — a u velikim gradovima često ne možeš — <strong>sačuvaj dokaz da si pokušao</strong>: snimak ekrana sa portala gdje piše da nema termina, ili potvrdu mejla. To se prihvata kao opravdanje.</span></div>

<h2>Wohnungsgeberbestätigung — papir bez kojeg nema prijave</h2>

<p>Ovo je ključna stvar i najčešća tačka na kojoj ljudi zapnu.</p>

<p>Od 2015. stanodavac ti <strong>mora</strong> potpisati potvrdu o useljenju (<em>Wohnungsgeberbestätigung</em>, po §19 Zakona o prijavi prebivališta). Bez tog papira te u uredu neće prijaviti, koliko god ugovora imao sa sobom.</p>

<p>Šta mora pisati na njemu:</p>

<ul>
<li>ime i adresa stanodavca,</li>
<li>puna adresa stana — ulica, broj, poštanski broj, grad,</li>
<li><strong>tačan datum useljenja</strong>,</li>
<li>imena <strong>svih</strong> koji se useljavaju, uključujući djecu,</li>
<li>potpis stanodavca.</li>
</ul>

<p>Tri stvari koje trebaš znati:</p>

<ul>
<li><strong>Besplatno je.</strong> Stanodavac ti ne smije naplatiti taj papir.</li>
<li><strong>Rok mu je dvije sedmice</strong> od tvog useljenja.</li>
<li><strong>Ako odbije da potpiše, njemu prijeti kazna do 1.000&nbsp;€.</strong> To je dobro znati, ali reci mu lijepo prije nego zaprijetiš — u devedeset posto slučajeva čovjek jednostavno ne zna da je to njegova zakonska obaveza, a ne usluga.</li>
</ul>

<h3>Ako stanuješ kod rodbine</h3>

<p>Ovo je kod nas najčešća situacija: prvih par mjeseci si kod brata, tetke ili kolege dok ne nađeš svoje.</p>

<p>Potvrdu ti potpisuje <strong>onaj ko drži stan</strong> — dakle tvoj rođak ako je on nosilac ugovora, a ne vlasnik zgrade. To je potpuno legalno i uobičajeno.</p>

<div class="vd-box vd-box-tip"><span>💡</span><span>Mnogi ugovori o najmu traže da se <strong>vlasniku javi</strong> kad se u stan useljava još neko. Zato se rođaci ustručavaju potpisati. Rješenje: neka javi vlasniku unaprijed — prijava dodatne osobe je normalna stvar i rijetko se odbija.</span></div>

<h2>Nemoj se prijaviti tamo gdje ne živiš</h2>

<p>Ovo se kod nas radi olako — „prijavi me kod sebe dok ne nađem stan" — i ljudi ne shvataju koliko je opasno.</p>

<div class="vd-box vd-box-warn"><span>⚠️</span><span>Prijava na adresu na kojoj stvarno ne stanuješ zove se <strong>Scheinanmeldung</strong> i kazna ide <strong>do 50.000&nbsp;€</strong> — i za tebe i za onoga ko je potpisao potvrdu. Provjere se rade, pogotovo kad se na jednu adresu prijavi više ljudi.</span></div>

<p>Ako stvarno stanuješ kod nekoga, makar privremeno, prijava je ispravna i nema nikakvog problema. Prijava „na papiru" nije.</p>

<h2>Šta ponijeti na termin</h2>

<ol>
<li><strong>Pasoš</strong> (i lične karte svih članova porodice koji se prijavljuju).</li>
<li><strong>Wohnungsgeberbestätigung</strong>, potpisana.</li>
<li><strong>Popunjen prijavni formular</strong> (<em>Anmeldeformular</em>) — skini ga sa sajta grada i popuni kod kuće, tako ne gubiš vrijeme na šalteru.</li>
<li><strong>Vjenčani list i rodne listove djece</strong> ako prijavljuješ porodicu. Neki uredi ih traže, neki ne — ponesi za svaki slučaj, prevedene ako imaš.</li>
<li>Ugovor o najmu — nije obavezan, ali zna pomoći ako nešto zapne.</li>
</ol>

<p>Cijela porodica se može prijaviti odjednom, jednim formularom. Ne treba svaki član posebno dolaziti ako je jedan roditelj tu sa dokumentima.</p>

<h2>Termin — pravi problem</h2>

<p>U manjim gradovima uđeš bez najave ili dobiješ termin za par dana. U Berlinu, Münchenu, Hamburgu i Frankfurtu se zna čekati sedmicama.</p>

<p>Šta stvarno pomaže:</p>

<ul>
<li><strong>Gledaj portal rano ujutro</strong>, oko 7–8 sati. Otkazani termini se tada vraćaju u sistem.</li>
<li><strong>Ne traži samo najbliži ured.</strong> U velikim gradovima se možeš prijaviti u <em>bilo kojem</em> uredu u tom gradu, ne samo u onom u svom kvartu. Ured na periferiji često ima termin za sutra.</li>
<li><strong>Provjeri da li grad ima dolazak bez najave</strong> (<em>ohne Termin</em>) određenim danima — mnogi imaju, samo to nije istaknuto.</li>
<li><strong>Snimi ekran</strong> svaki put kad nema slobodnih termina. To ti je dokaz da nisi ti kriv za kašnjenje.</li>
</ul>

<h2>Šta Anmeldung otključava</h2>

<p>Zato je ovo prva stvar, a ne administrativna formalnost:</p>

<ul>
<li><strong>Poreski broj (Steuer-ID).</strong> Stiže ti poštom automatski nakon prve prijave — jedanaest cifara, dobiješ ga jednom i vrijedi doživotno, bez obzira na selidbe i promjenu prezimena. Bez njega ti poslodavac obračunava najgoru poresku klasu.</li>
<li><strong>Bankovni račun.</strong> Većina banaka traži <em>Anmeldebestätigung</em>.</li>
<li><strong>Zdravstveno osiguranje</strong> i prijava kod poslodavca.</li>
<li><strong>Termin u Ausländerbehörde</strong> za boravišnu dozvolu — bez prijavljene adrese ga uglavnom ne dobiješ.</li>
<li><strong>Zamjena vozačke dozvole</strong>, upis djece u vrtić i školu, Kindergeld — sve traži prijavljenu adresu.</li>
</ul>

<div class="vd-box vd-box-tip"><span>💡</span><span>Potvrdu o prijavi (<em>Anmeldebestätigung</em>) dobiješ odmah na šalteru. <strong>Napravi tri-četiri kopije istog dana</strong> — trebaće ti na više mjesta, a duplikat znači još jedan odlazak u ured.</span></div>

<h2>Pismo koje stiže samo — Rundfunkbeitrag</h2>

<p>Otprilike mjesec dana nakon prijave stiže ti pismo za <strong>Rundfunkbeitrag</strong> (radio-TV taksa, ljudi je zovu GEZ). Niko ti to ne spominje na šalteru, a nije reklama i ne može se ignorisati.</p>

<p>Iznos je <strong>18,36&nbsp;€ mjesečno</strong> i plaća se <strong>po stanu, ne po osobi</strong>. Koliko vas živi u stanu ne igra nikakvu ulogu — cimeri i podstanari su uključeni u tu jednu uplatu.</p>

<div class="vd-box vd-box-tip"><span>💡</span><span>Ako ste ti i još dvojica u stanu, <strong>plaća jedan</strong>, a ostali se odjave pozivom na njegov broj računa. Ovdje ljudi bacaju novac — svako plati svoje jer se ne raspitaju.</span></div>

<p>Oslobođeni su, između ostalog, primaoci BAföG-a i socijalne pomoći, dok osobe sa oznakom „RF" u invalidskoj legitimaciji plaćaju sniženih 6,12&nbsp;€ mjesečno. Oslobođenje se traži, ne dolazi samo.</p>

<h2>Rubrika „religija" — da razjasnimo</h2>

<p>Na formularu postoji polje za vjersku pripadnost i tu ljudi zastanu, jer su čuli za crkveni porez.</p>

<p>Kirchensteuer plaćaju samo članovi vjerskih zajednica koje su priznate kao javnopravna tijela i koje porez naplaćuju preko poreske uprave — prije svega katolička i evangelička crkva, te jevrejske opštine. Stopa je <strong>9&nbsp;% poreza na dohodak</strong>, odnosno <strong>8&nbsp;% u Bavarskoj i Baden-Württembergu</strong>.</p>

<p><strong>Islamske zajednice u Njemačkoj taj status nemaju, pa muslimani ne plaćaju crkveni porez.</strong> Ako upišeš „islamisch", to ti ne povlači nikakav dodatni namet. Polje možeš i ostaviti prazno — nije obavezno.</p>

<h2>Kad se vraćaš u BiH — Abmeldung</h2>

<p>Odjava adrese (<em>Abmeldung</em>) je isto obaveza, i mnogi je preskoče jer misle da je nebitna kad već odlaze. Nije.</p>

<p>Bez uredne odjave:</p>

<ul>
<li><strong>Rundfunkbeitrag ti i dalje teče</strong> i zna se nakupiti na stotine eura, sa opomenama koje te stižu i u Bosni,</li>
<li>zna se zakomplikovati <strong>povrat poreza</strong> za zadnju godinu,</li>
<li>ostaješ formalno prijavljen u Njemačkoj, što ume smetati kod prijave prebivališta u BiH i kod poreskog statusa.</li>
</ul>

<p>Odjava se u većini gradova radi <strong>poštom ili online, bez termina</strong> — i može se predati najranije sedam dana prije odlaska. Potvrdu o odjavi (<em>Abmeldebestätigung</em>) <strong>sačuvaj trajno</strong>; to je papir koji dokazuje od kada više nisi imao prebivalište u Njemačkoj, i zna zatrebati godinama kasnije.</p>

<div class="vd-box vd-box-info"><span>ℹ️</span><span>Ako zadržavaš stan u Njemačkoj a odlaziš na duže — to nije odjava nego druga situacija; prvo se raspitaj kako ti stoji poreski status prije nego išta prijaviš.</span></div>

<h2>Najčešće greške</h2>

<ul>
<li><strong>Čeka se „dok se sredi".</strong> Rok od 14 dana teče od useljenja, a sve ostalo — banka, poreski broj, Ausländerbehörde — stoji dok se ne prijaviš.</li>
<li><strong>Ide se na termin bez Wohnungsgeberbestätigunga.</strong> Vraćaju te. Traži papir prije nego rezervišeš termin, ne poslije.</li>
<li><strong>Prijava kod rodbine gdje se ne stanuje.</strong> Do 50.000&nbsp;€ kazne, i za tebe i za njega.</li>
<li><strong>Ne prave se kopije potvrde o prijavi.</strong> Trebaće ti bar tri.</li>
<li><strong>Svako u stanu plaća Rundfunkbeitrag.</strong> Plaća se po stanu — jedan plaća, ostali se odjave.</li>
<li><strong>Ne radi se odjava pri povratku.</strong> Taksa teče dalje i računi te sustignu u Bosni.</li>
</ul>

<h2>Česta pitanja</h2>

<h3>Mogu li se prijaviti bez ugovora o najmu?</h3>
<p>Možeš. Traži se potvrda stanodavca, ne ugovor. Ako stanuješ kod rodbine ili u podstanarstvu, potpisuje ti onaj ko drži stan.</p>

<h3>Šta ako se selim unutar istog grada?</h3>
<p>Isti postupak i isti rok od 14 dana — samo se zove <em>Ummeldung</em>. Treba ti nova potvrda od novog stanodavca.</p>

<h3>Koliko košta?</h3>
<p>Prijava, odjava i promjena adrese su besplatne. Naplaćuju se samo dodatne potvrde ako ih naknadno vadiš.</p>

<h3>Nije mi stigao poreski broj, šta sad?</h3>
<p>Stiže poštom u roku od nekoliko sedmica nakon prijave, i to isključivo na prijavljenu adresu. Ako ne stigne, zatraži ga ponovo preko portala Savezne poreske uprave (BZSt) ili nazovi +49 228 406-1240, radnim danima od 9 do 14 sati. Nađeš ga i na obračunu plate od poslodavca.</p>

<h3>Mogu li se prijaviti u hotelu ili kod poslodavca?</h3>
<p>Kratkotrajni smještaj do tri mjeseca se u pravilu ne prijavljuje ako već imaš prijavljen stan u Njemačkoj. Ako ti je to jedina adresa, moraš se prijaviti — ali onda tu i stvarno moraš stanovati.</p>

<h2>Izvori</h2>

<p>Provjereno <strong>7. avgusta 2026.</strong>:</p>

<ul>
<li><a href="https://amtsdeutschland.de/buergeramt/wohnungsgeberbestaetigung/" rel="nofollow noopener" target="_blank">Wohnungsgeberbestätigung po §19 BMG</a> — sadržaj potvrde, rok od dvije sedmice, kazne do 1.000&nbsp;€ i do 50.000&nbsp;€ za lažnu prijavu</li>
<li><a href="https://www.rundfunkbeitrag.de/buergerinnen-und-buerger/informationen" rel="nofollow noopener" target="_blank">Rundfunkbeitrag — zvanične informacije</a> (18,36&nbsp;€ mjesečno po stanu, sniženih 6,12&nbsp;€, oslobođenja)</li>
<li><a href="https://www.vlh.de/wissen-service/steuer-abc/kirchensteuer-was-muss-ich-wissen-was-kann-ich-absetzen.html" rel="nofollow noopener" target="_blank">Kirchensteuer — ko je plaća i koliko</a> (9&nbsp;%, odnosno 8&nbsp;% u Bavarskoj i Baden-Württembergu; islamske zajednice ne naplaćuju)</li>
<li><a href="https://www.bzst.de/DE/Privatpersonen/SteuerlicheIdentifikationsnummer/steuerlicheidentifikationsnummer_node.html" rel="nofollow noopener" target="_blank">BZSt — poreski identifikacioni broj</a> (dostava poštom, ponovno traženje, kontakt)</li>
</ul>

<p><em>Ovaj tekst je informativan i nije pravni savjet — nisam pravnik. Rokovi i praksa se razlikuju od grada do grada, a iznosi se mijenjaju. Obavezujuću informaciju ti daje ured u tvom gradu. Ako primijetiš da je nešto zastarjelo, javi nam i ispravićemo.</em></p>

  $vodic$,
  true
)
on conflict (slug) do update set
  naziv = excluded.naziv, opis = excluded.opis, ikona = excluded.ikona,
  kategorija = excluded.kategorija, min_citanja = excluded.min_citanja,
  tagovi = excluded.tagovi, tekst = excluded.tekst,
  aktivan = true, updated_at = now();

update vodici set provjereno = date '2026-08-07' where slug = 'prijavljivanje-adrese';

select slug, naziv, min_citanja, provjereno, length(tekst) as duzina
from vodici where slug = 'prijavljivanje-adrese';
