-- =====================================================================
--  VODIC: Zdravstvo u Njemačkoj — kasa, ljekar, bolovanje i zubi
--  Provjereno 8.8.2026. Bezbjedno pokrenuti i ponovo (upsert po slug-u).
-- =====================================================================

alter table vodici add column if not exists provjereno date;

insert into vodici (slug, naziv, opis, ikona, kategorija, min_citanja, tagovi, tekst, aktivan)
values (
  'krankenkasse', 'Zdravstvo u Njemačkoj — kasa, ljekar, bolovanje i zubi', 'Koliko košta 2026., ko ide besplatno uz tebe, zubi i participacije, kod ljekara i hitna, bolovanje — i šta ti treba kad ideš u Bosnu',
  '🏥', 'zdravstvo', 12, array['zdravstvo', 'Krankenkasse', 'ljekar', 'bolovanje', 'zubi', 'BiH'],
  $vodic$
<p>Zdravstveno osiguranje u Njemačkoj nije opcija nego zakonska obaveza. Ako si zaposlen, poslodavac te prijavljuje — ali <strong>kasu biraš ti</strong>, i taj izbor te košta ili štedi nekoliko stotina eura godišnje. Većina ljudi to nikad ne provjeri, pa ostanu tamo gdje ih je neko upisao prvi dan.</p>

<h2>Prvo ono najvažnije</h2>

<p><strong>Osnovni paket je zakonom identičan u svim kasama.</strong> Ljekar, bolnica, lijekovi, operacije, porod — isto kod najveće i kod najmanje kase. Zakonski katalog usluga je jedinstven.</p>

<p>Razlikuju se samo dvije stvari: <strong>dodatni doprinos</strong> i <strong>dobrovoljne dodatne usluge</strong>. Svaka reklama koja ti sugeriše da je neka kasa „bolja za liječenje" prodaje maglu.</p>

<p>I da bude izričito, jer se ovo često pita: <strong>kod ljekara ne plaćaš ništa</strong> — ni pregled, ni uput, ni operaciju, ni porod. Ljekaru se novac ne daje nikad i niko ti ga na šalteru ne smije tražiti.</p>

<p>Participacija postoji na tačno dva mjesta:</p>

<ul>
<li><strong>U apoteci</strong>, kad podižeš lijek na recept: 10&nbsp;posto cijene lijeka, najmanje 5 a najviše 10&nbsp;eura <strong>po pakovanju</strong>. Zato mnogi misle da „plaćaju lijek" — ne plaćaš lijek, nego participaciju. <strong>Djeca do 18 godina ne plaćaju ništa</strong>, a za dosta jeftinijih lijekova participacije uopšte nema (zvanična lista se osvježava svake dvije sedmice) — zato je mnogi nikad nisu ni primijetili. U parlamentu je prijedlog da poraste na 7,50–15&nbsp;eura; dok se ne usvoji, važi 5–10.</li>
<li><strong>U bolnici:</strong> 10&nbsp;eura po danu, najviše 28 dana godišnje — dakle najviše 280&nbsp;eura, pa makar ležao i tri mjeseca. Djeca ništa.</li>
</ul>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Postoji i godišnji plafon: kad ti participacije u jednoj godini pređu <strong>2&nbsp;posto bruto prihoda domaćinstva</strong> (1&nbsp;posto za hronične bolesnike), kasa te na zahtjev oslobodi do kraja godine i vrati višak. Čuvaj račune iz apoteke — oslobođenje se traži svake godine iznova.</blockquote>

<h2>Javno ili privatno</h2>

<p>Kao zaposlenik si obavezno u javnom osiguranju (GKV) dok ti bruto plata ne pređe <strong>77.400&nbsp;eura godišnje, odnosno 6.450&nbsp;eura mjesečno</strong>. Iznad toga možeš birati između javnog i privatnog.</p>

<p>Za skoro sve koji dolaze iz BiH to znači jedno: <strong>ideš u javnu kasu.</strong> Privatno ostavi po strani — ne samo zbog plate, nego i zato što je povratak iz privatnog u javno kasnije težak.</p>

<h2>Koliko se plaća</h2>

<p><strong>Opšti doprinos je 14,6&nbsp;posto</strong> bruto plate i isti je svuda. Sniženi od 14,0&nbsp;posto važi za članove bez prava na naknadu za bolovanje.</p>

<p><strong>Dodatni doprinos svaka kasa određuje sama.</strong> Prosjek za 2026. je <strong>2,9&nbsp;posto</strong>, u odnosu na 2,5&nbsp;posto u 2025. Ukupno prosječno <strong>17,5&nbsp;posto bruto plate, podijeljeno na pola između tebe i poslodavca</strong>.</p>

<p>Doprinosi se računaju do plate od <strong>69.750&nbsp;eura godišnje (5.812,50 mjesečno)</strong>. Iznad toga ne rastu.</p>

<p><strong>Njega (Pflegeversicherung)</strong> dolazi uz to i mnogi je zaborave: 3,6&nbsp;posto, a za osobe bez djece starije od 23 godine 4,2&nbsp;posto. Od dvoje djece mlađe od 25 doprinos se snižava za 0,25 poena po djetetu, najniže do 2,60&nbsp;posto kod petero i više. Udio poslodavca je uvijek 1,80&nbsp;posto — snižava se samo tvoj dio.</p>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Ako imaš djecu — prijavi ih. Plaćaš manje.</blockquote>

<h2>Porodica se osigurava besplatno</h2>

<p>Ovo je glavna prednost javnog sistema.</p>

<p>Supružnik i djeca osiguravaju se uz tebe <strong>bez ikakvog dodatnog doprinosa</strong>, ako nemaju vlastiti prihod iznad granice — za 2026. je to <strong>565&nbsp;eura mjesečno</strong>, odnosno <strong>603&nbsp;eura ako partner radi mini-job</strong>. Isti iznos preko običnog ugovora ruši besplatno osiguranje — razlika je u vrsti ugovora, ne u iznosu.</p>

<p>Žena koja ne radi i troje djece: svi pokriveni, doprinos ostaje isti. U privatnom osiguranju svaka osoba plaća svoju polisu. Zato se privatno većini porodica ne isplati, bez obzira na platu.</p>

<h2>Stope za 2026</h2>

<blockquote class="vd-upozorenje"><strong>⚠️ Važno:</strong> Ove brojke se mijenjaju svakog januara. Podaci važe za jul 2026 — provjeri aktuelno stanje prije nego se prijaviš.</blockquote>

<p>TK je najveća kasa u Njemačkoj, Barmer druga, pa DAK. AOK je regionalna — svaka pokrajina ima svoju, sa svojom stopom.</p>

<table class="vd-tabela">
<thead><tr><th>Kasa</th><th>Dodatni doprinos</th><th>Ukupno</th></tr></thead>
<tbody>
<tr><td>BKK firmus (regionalno)</td><td>2,18&nbsp;%</td><td>16,78&nbsp;%</td></tr>
<tr><td>TUI BKK</td><td>2,50&nbsp;%</td><td>17,10&nbsp;%</td></tr>
<tr><td>hkk</td><td>2,59&nbsp;%</td><td>17,19&nbsp;%</td></tr>
<tr><td>TK</td><td>2,69&nbsp;%</td><td>17,29&nbsp;%</td></tr>
<tr><td>DAK</td><td>3,20&nbsp;%</td><td>17,80&nbsp;%</td></tr>
<tr><td>Barmer</td><td>3,29&nbsp;%</td><td>17,89&nbsp;%</td></tr>
<tr><td>Knappschaft</td><td>4,30&nbsp;%</td><td>18,90&nbsp;%</td></tr>
<tr><td>BKK24</td><td>4,39&nbsp;%</td><td>18,99&nbsp;%</td></tr>
</tbody>
</table>

<p>Prosjek je 2,9&nbsp;posto, raspon od 2,18 do 4,39. Tridesetak kasa poskupjelo je već 1. januara 2026., a tokom godine ih je preko 40.</p>

<p><strong>Šta to znači u novcu:</strong> razlika između TK-a i Barmera je 0,6&nbsp;postotnih poena. Na bruto plati od 3.000&nbsp;eura to je oko 9&nbsp;eura mjesečno tvog dijela. Nije ogromno, ali je besplatno — jedan formular.</p>

<blockquote class="vd-upozorenje"><strong>⚠️ Važno:</strong> BKK firmus je najjeftinija, ali od 14. aprila 2026. ne prima nove zahtjeve iz šest pokrajina: Schleswig-Holstein, Rheinland-Pfalz, Brandenburg, Mecklenburg-Vorpommern, Saarland i Thüringen. Postojeći članovi ostaju osigurani. Nisu sve kase otvorene u svim pokrajinama — provjeri je li ta koju hoćeš dostupna tamo gdje živiš.</blockquote>

<h2>Zubi — ovdje ljudi najviše pogriješe</h2>

<p>Ovo je najčešći neprijatan račun kod novopridošlih — jer niko ne kaže unaprijed šta je besplatno, a šta nije. Zato izričito:</p>

<p><strong>Besplatno ti je (kasa plaća u cijelosti):</strong></p>

<ul>
<li>dva kontrolna pregleda godišnje,</li>
<li>uklanjanje kamenca jednom godišnje,</li>
<li>vađenje zuba i liječenje,</li>
<li>plombe u standardnoj varijanti — amalgamska na bočnim, bijela na prednjim zubima,</li>
<li>PSI pregled na parodontozu svake dvije godine.</li>
</ul>

<p><strong>Sam plaćaš:</strong> profesionalno čišćenje zuba (PZR) — poliranje, fluorizacija i čišćenje međuzubnih prostora nisu zakonska usluga. <strong>Cijena je 80 do 150&nbsp;eura po tretmanu</strong>, kod implantata ili jakog kamenca i do 200. Doplaćuješ i razliku ako hoćeš bijelu plombu na bočnom zubu — besplatna varijanta uvijek postoji, zubar ti je mora ponuditi.</p>

<p><strong>Djelimično plaćaš:</strong> krunice, mostove i proteze. Kasa daje fiksni doprinos od 60&nbsp;posto standardne terapije, ostatak je tvoj.</p>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Vodi <strong>Bonusheft</strong> — pečat zubara jednom godišnje pri kontroli. Poslije 5 godina urednih pečata kasin doprinos za krunicu ili protezu raste sa 60 na 70&nbsp;posto, poslije 10 godina na 75. Jedan pečat godišnje, stotine do hiljade eura razlike kad jednom zatreba.</blockquote>

<p><strong>Skoro sve kase daju dobrovoljni doprinos, ali razlike su ogromne</strong> — od 40 do 250&nbsp;eura godišnje:</p>

<ul>
<li>IKK Innovationskasse — do 250&nbsp;€ godišnje</li>
<li>BKK firmus — do 100&nbsp;€ godišnje od 2026, plus besplatno čišćenje kroz partnersku mrežu</li>
<li>AOK Rheinland-Pfalz/Saarland — do 50&nbsp;€ godišnje od 18. godine; za trudnice do 100&nbsp;posto kroz poseban budžet</li>
<li>TK — 40&nbsp;€ godišnje</li>
</ul>

<p>Ko ide dvaput godišnje, zavisno od kase plaća iz svog džepa između 0 i 160&nbsp;eura.</p>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Trudnice provjerite posebno — više kasa nudi besplatno čišćenje tokom trudnoće, kod nekih i više puta. Bonus programi su odvojena stavka: kod nekih kasa dobiješ bodove za kontrolu i čišćenje, koji se pretvaraju u novac ili usluge.</blockquote>

<blockquote class="vd-upozorenje"><strong>⚠️ Važno:</strong> Iznosi za zube se mijenjaju svake godine i razlikuju se čak i unutar iste porodice kasa. Prije prijave pitaj kasu direktno ili pogledaj njihov statut. Ne oslanjaj se ni na jedan članak, uključujući ovaj — brojke su tačne na dan objave, ne zauvijek.</blockquote>

<h2>Koju kasu izabrati</h2>

<p>Nema jednog odgovora, ali ima jasnih pravila:</p>

<ul>
<li><strong>Trebaju ti zubi</strong> → kasa koja plaća PZR i ima partnersku mrežu. Ušteda od 100&nbsp;eura na doprinosu ne vrijedi ništa ako dva čišćenja koštaju 200 iz džepa.</li>
<li><strong>Mlad si i zdrav</strong> → najjeftinija otvorena u tvojoj pokrajini. Osnovni paket ti je ionako isti.</li>
<li><strong>Imaš porodicu</strong> → gledaj bonus programe, često se boduju i djeca.</li>
<li><strong>Slabije govoriš njemački</strong> → provjeri ima li kasa dobru aplikaciju i online prijavu. Kad ti treba potvrda, to je razlika između pet minuta i pola dana na šalteru.</li>
</ul>

<h2>Kako se prijaviti</h2>

<ul>
<li>Izaberi kasu prije nego poslodavac izabere umjesto tebe.</li>
<li>Popuni pristupnicu, obično online.</li>
<li>Predaj poslodavcu potvrdu o članstvu koju dobiješ.</li>
<li>Kartica stiže poštom.</li>
</ul>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Nijedna kasa te ne smije odbiti zbog godina, pola ili zdravstvenog stanja. Ako te odbijaju, to nije po zakonu.</blockquote>

<h2>Promjena kase</h2>

<ul>
<li>Nakon učlanjenja si <strong>vezan 12 mjeseci</strong>.</li>
<li>Poslije toga mijenjaš uz <strong>otkazni rok od dva mjeseca do kraja mjeseca</strong>.</li>
<li><strong>Ne otkazuješ sam</strong> — nova kasa to uradi umjesto tebe. Ti samo obavijestiš poslodavca.</li>
<li>Tekuće terapije, recepti i odobreni tretmani nastavljaju se bez prekida.</li>
</ul>

<p><strong>Dva izuzetka kad ne moraš čekati:</strong></p>

<p>Kad ti kasa <strong>poveća dodatni doprinos</strong>, imaš pravo na vanredni otkaz i vezanost od 12 mjeseci ne važi. Kasa te mora obavijestiti u pisanom obliku najmanje mjesec dana prije.</p>

<p>Kad <strong>promijeniš poslodavca</strong>, možeš odmah promijeniti i kasu. Prvih dana na novom poslu si u najboljoj poziciji da biraš — iskoristi to.</p>

<h2>Kod ljekara — kako sistem stvarno radi</h2>

<p>Njemačka nema dom zdravlja gdje se ide „na šalter". Sve ide preko <strong>privatnih ordinacija</strong> koje rade za kasu, i preko jednog čovjeka: tvog <strong>Hausarzta</strong> (porodični ljekar).</p>

<ul>
<li><strong>Hausarzt je prva stanica za sve</strong> — od prehlade do bola u leđima. On te dalje šalje specijalisti uputom (<em>Überweisung</em>).</li>
<li><strong>Specijalisti</strong> (Facharzt) — ginekolog, zubar, oftalmolog i dermatolog primaju i bez uputa; ostalima je uput pametan jer se brže dobije termin.</li>
<li><strong>Termini se čekaju.</strong> Kod specijaliste zna proći i par mjeseci. Ako čekaš duže od 4 sedmice, zovi <strong>116 117</strong> — to je služba koja ti je po zakonu dužna naći termin.</li>
</ul>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Nađi Hausarzta <strong>čim dođeš</strong>, dok si zdrav. Mnoge ordinacije ne primaju nove pacijente, a kad ti zatreba hitno, tada je najteže. Kad si već upisan, dobiješ termin za dan-dva.</blockquote>

<h2>Hitno — koji broj kad</h2>

<div class="vd-tabela-wrap"><table class="vd-tabela">
<thead><tr><th>Situacija</th><th>Šta zoveš</th></tr></thead>
<tbody>
<tr><td>Životna opasnost — infarkt, teška nesreća, gubitak svijesti</td><td><strong>112</strong> — hitna pomoć i vatrogasci, besplatno, radi 24 sata</td></tr>
<tr><td>Treba ti ljekar, a ordinacije su zatvorene (noć, vikend, praznik)</td><td><strong>116 117</strong> — dežurna ljekarska služba, besplatno</td></tr>
<tr><td>Trovanje</td><td>centar za trovanja tvoje pokrajine (Giftnotruf)</td></tr>
<tr><td>Policija</td><td><strong>110</strong></td></tr>
</tbody>
</table></div>

<blockquote class="vd-upozorenje"><strong>⚠️ Ne idi u bolnicu za sitnicu.</strong> Odlazak na urgentni prijem (Notaufnahme) bez prave hitnosti znači čekanje od pola dana — tamo se ide po težini stanja, ne po redu dolaska. Za sve što nije životno ugrožavajuće: 116 117.</blockquote>

<p><strong>Apoteka noću i vikendom:</strong> uvijek je bar jedna dežurna u okolini (<em>Notdienst</em>). Piše na vratima svake apoteke, ili na aponet.de. Van radnog vremena se plaća mala dodatna naknada za dežurstvo.</p>

<h2>Bolovanje — pravila koja moraš znati napamet</h2>

<p>Ovdje se gubi najviše novca iz neznanja, jer se pravila razlikuju od bosanskih.</p>

<ul>
<li><strong>Prvi dan javljaš poslodavcu</strong> — telefonom ili mejlom, <em>prije</em> početka smjene. To je obaveza, i to je najčešći razlog problema.</li>
<li><strong>Papir od ljekara (AU)</strong> traži se <strong>najkasnije četvrti dan</strong> — ali <strong>mnogi ugovori traže već prvi dan</strong>. Pogledaj svoj ugovor prije nego zatreba.</li>
<li>Ljekar danas šalje bolovanje <strong>elektronski direktno kasi</strong>; ti sam samo obavještavaš poslodavca.</li>
</ul>

<p><strong>Ko ti plaća, i koliko:</strong></p>

<div class="vd-tabela-wrap"><table class="vd-tabela">
<thead><tr><th>Period</th><th>Ko plaća</th><th>Koliko</th></tr></thead>
<tbody>
<tr><td>Prvih <strong>6 sedmica</strong></td><td>poslodavac</td><td><strong>100&nbsp;% plate</strong> — ne gubiš ništa</td></tr>
<tr><td>Poslije toga</td><td>zdravstvena kasa (Krankengeld)</td><td><strong>70&nbsp;% bruta</strong>, najviše 90&nbsp;% neta</td></tr>
</tbody>
</table></div>

<p>Krankengeld traje najviše <strong>78 sedmica</strong> (godinu i po) za istu bolest u tri godine, računajući i onih 6 sedmica poslodavca.</p>

<blockquote class="vd-upozorenje"><strong>⚠️ Zaštita od otkaza:</strong> bolovanje samo po sebi <strong>nije razlog za otkaz</strong> — ali te ne čini ni nedodirljivim. Ono što jeste opasno: ne javiti se poslodavca prvi dan, ili raditi drugi posao dok si na bolovanju. To je razlog za otkaz na licu mjesta.</blockquote>

<blockquote class="vd-savjet"><strong>💡 Dijete ti je bolesno?</strong> Imaš pravo na plaćeno odsustvo i naknadu kase (<em>Kinderkrankengeld</em>) — po djetetu, po roditelju, više dana godišnje. Traži od pedijatra poseban papir za to, ne obično bolovanje.</blockquote>

<h2>Djeca kod ljekara</h2>

<p>Djeca imaju svog pedijatra (<em>Kinderarzt</em>) i sistem redovnih pregleda <strong>U1 do U9</strong> — od rođenja do školskog uzrasta. Sve plaća kasa, sve se upisuje u <strong>žutu knjižicu</strong> (<em>U-Heft</em>) koju dobiješ u porodilištu.</p>

<p><strong>Ta knjižica se traži pri upisu u vrtić i školu</strong> — čuvaj je kao pasoš. Vakcine su besplatne; obavezna je samo ospica (Masern) za vrtić i školu. Djeca ne plaćaju nikakvu participaciju — ni u apoteci ni u bolnici.</p>

<h2>Dodatna osiguranja — šta se stvarno isplati</h2>

<p>Kasa pokriva osnovno. Za ostalo postoje dopunske polise, ali samo dvije-tri imaju smisla za većinu:</p>

<ul>
<li><strong>Zubi</strong> (8–15&nbsp;€ mjesečno) — isplati se ako imaš loše zube ili planiraš krunice; vidi računicu gore.</li>
<li><strong>Putno zdravstveno</strong> (10–20&nbsp;€ godišnje) — obavezno ako ideš u Bosnu, jer BH 6 ne pokriva povratak sanitetom.</li>
<li><strong>Bolnica jednokrevetna soba / glavni ljekar</strong> — luksuz, ne potreba.</li>
</ul>

<blockquote class="vd-savjet"><strong>💡 Za psihu:</strong> psihoterapija je <strong>zakonska usluga kase</strong> i ne plaća se — ali se termin čeka mjesecima. Prvi korak je <em>Sprechstunde</em> kod terapeuta, koji se zakazuje preko 116 117. Ne treba ti uput od Hausarzta.</blockquote>

<h2>Kad ideš u Bosnu — kartica ne vrijedi</h2>

<p>Na poleđini tvoje zdravstvene kartice je EHIC, evropska kartica. Ona vrijedi u EU — <strong>u BiH ne vrijedi</strong>, jer BiH ide preko posebnog sporazuma s Njemačkom, a on radi preko obrasca.</p>

<ul>
<li>Prije puta traži od kase <strong>obrazac BH 6</strong> (Urlaubskrankenschein). Besplatan je, a iz Bosne se ne može izvaditi naknadno.</li>
<li>U Bosni ga <strong>prvo predaj</strong> kantonalnom Zavodu (FBiH) ili filijali Fonda RS — <em>prije</em> odlaska ljekaru. Za oba entiteta trebaju <strong>dva odvojena obrasca</strong>.</li>
<li>Pokriva samo hitno i neodložno: ljekar, bolnica, lijekovi s liste. <strong>Ne pokriva</strong> privatne klinike ni prevoz nazad u Njemačku.</li>
</ul>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Putno zdravstveno osiguranje od 10–20&nbsp;€ godišnje pokriva baš ono što BH 6 ne pokriva — povratak sanitetom i privatno liječenje. Za porodicu koja svako ljeto ide dole, najisplativija polisa koju ćeš kupiti.</blockquote>

<h2>Česta pitanja</h2>

<h3>Mogu li se prijaviti prije Anmeldunga?</h3>

<p>Prijava u kasu vezana je za zaposlenje, ne za prijavu prebivališta. Za period do prve plate obično ti treba putno osiguranje — pitaj poslodavca od kojeg datuma te prijavljuje.</p>

<h3>Šta ako se vratim u BiH?</h3>

<p>Trajnim odlaskom i odjavom prebivališta prestaje i članstvo u kasi.</p>

<h3>Isplati li mi se dodatno osiguranje za zube?</h3>

<p>Polisa košta oko 8 do 15&nbsp;eura mjesečno i pokriva 80 do 100&nbsp;posto čišćenja. Ako ideš jednom godišnje a kasa ti daje 100&nbsp;eura — ne treba ti. Ako imaš problematične zube ili ideš tri-četiri puta godišnje, računica se mijenja.</p>

<h3>Koja je kasa najbolja?</h3>

<p>Ne postoji jedan odgovor. Osnovne usluge su svuda iste, pa se odluka svodi na cijenu i na to koje ti dodatne usluge stvarno trebaju. Više o samom dolasku i prijavi u vodiču: <a href="/vodic/radna-viza-njemacka">Radna viza za Njemačku — dva puta i koji je tvoj</a>.</p>

<p><em>Ovaj tekst je informativan i ne predstavlja pravni ni medicinski savjet. Iznosi i uslovi se mijenjaju — provjeri aktuelno stanje kod izabrane kase.</em></p>

  $vodic$,
  true
)
on conflict (slug) do update set
  naziv = excluded.naziv, opis = excluded.opis, ikona = excluded.ikona,
  kategorija = excluded.kategorija, min_citanja = excluded.min_citanja,
  tagovi = excluded.tagovi, tekst = excluded.tekst,
  aktivan = true, updated_at = now();

update vodici set provjereno = date '2026-08-08' where slug = 'krankenkasse';

select slug, naziv, provjereno, length(tekst) as duzina from vodici where slug = 'krankenkasse';
