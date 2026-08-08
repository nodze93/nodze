-- =====================================================================
--  VODIC: Porodica u Njemačkoj — od trudnoće do škole
--  Svi iznosi provjereni 8.8.2026. Bezbjedno pokrenuti i ponovo.
-- =====================================================================

alter table vodici add column if not exists provjereno date;

insert into vodici (slug, naziv, opis, ikona, kategorija, min_citanja, tagovi, tekst, aktivan)
values (
  'porodica-u-njemackoj', 'Porodica u Njemačkoj — od trudnoće do škole', 'Šta ti država daje po fazama: Mutterschutz i puna plata, Elterngeld do 1.800 €, Kindergeld 259 €, vrtić, škola — i vjenčanje preko Bosne',
  '👶', 'porodica', 8, array['porodica', 'trudnoća', 'Elterngeld', 'Kindergeld', 'vrtić', 'škola'],
  $vodic$
<p>Od trudnoće do škole, njemačka država daje više nego što iko od nas očekuje kad dođe — ali ništa ne dolazi samo. Sve se traži, i skoro sve ima rok. Ovo je redoslijed: šta ti pripada u kojoj fazi, u eurima, i kojim redom se vade papiri da ništa ne propadne.</p>

<h2>Trudnoća — sve plaća kasa</h2>

<p>Svi pregledi, ultrazvuci i porod u bolnici idu na zdravstveno osiguranje, bez ijednog eura iz džepa. Uz to:</p>

<ul>
<li><strong>Mutterschutz:</strong> zabrana rada <strong>6 sedmica prije</strong> i <strong>8 sedmica poslije</strong> poroda — a od objave trudnoće do 4 mjeseca poslije poroda poslodavac te <strong>ne smije otkazati</strong>.</li>
<li><strong>Mutterschaftsgeld:</strong> za vrijeme Mutterschutza kasa plaća 13&nbsp;€ dnevno, a <strong>poslodavac dopunjava do pune prosječne neto plate</strong> — znači u tom periodu ne gubiš ništa.</li>
<li><strong>Babica (Hebamme):</strong> pravo na njenu pomoć prije i poslije poroda pokriva kasa — ali babica se traži <strong>čim saznaš za trudnoću</strong>, jer ih nema dovoljno.</li>
</ul>

<h2>Beba je tu — papiri, tačnim redom</h2>

<ol>
<li><strong>Rodni list</strong> — bolnica šalje prijavu u Standesamt, ti podigneš izvod. Odmah uzmi <strong>više primjeraka</strong>, trebaju za sve dalje.</li>
<li><strong>Zdravstveno:</strong> prijavi bebu svojoj kasi — ide besplatno uz tebe (Familienversicherung), vidi <a href="/vodic/krankenkasse">Krankenkasse</a>.</li>
<li><strong>Kindergeld:</strong> zahtjev Familienkassi — <strong>259&nbsp;€ mjesečno</strong>. Može se tražiti i unazad, ali najviše 6 mjeseci — ne odugovlači.</li>
<li><strong>Elterngeld:</strong> zahtjev pokrajinskoj Elterngeldstelle (vidi dolje) — isto važi pravilo: unazad plaća najviše 3 mjeseca.</li>
<li><strong>BiH papiri:</strong> preko konzulata upišeš dijete u matične knjige BiH i izvadiš mu bh državljanstvo i pasoš.</li>
</ol>

<blockquote class="vd-savjet"><strong>💡 Savjet — njemački pasoš za bebu:</strong> dijete rođeno u Njemačkoj automatski dobija i <strong>njemačko državljanstvo</strong> ako jedan roditelj u tom trenutku legalno živi ovdje <strong>najmanje 5 godina</strong> i ima pravo trajnog boravka. Od reforme 2024. dvojno državljanstvo je dozvoljeno — ne mora se više birati između njemačkog i bosanskog.</blockquote>

<h2>Elterngeld — plata za godinu kod bebe</h2>

<p>Elterngeld nadoknađuje platu roditelju koji ostane kod djeteta: <strong>65&nbsp;% dosadašnjeg neta</strong>, najmanje <strong>300&nbsp;€</strong> a najviše <strong>1.800&nbsp;€ mjesečno</strong>. I roditelj koji <strong>nije radio</strong> dobija minimalnih 300&nbsp;€.</p>

<ul>
<li><strong>Basiselterngeld:</strong> 12 mjeseci — <strong>+2 mjeseca</strong> ako i drugi roditelj uzme bar dva (znači 14 zajedno).</li>
<li><strong>ElterngeldPlus:</strong> pola iznosa, duplo trajanje — do 24+ mjeseci; isplati se kad radiš skraćeno uz bebu.</li>
<li><strong>Granica:</strong> za djecu rođenu od 1.&nbsp;4.&nbsp;2025. nema Elterngelda ako oporezivi prihod domaćinstva prelazi <strong>175.000&nbsp;€</strong> godišnje — za veliku većinu nas nebitno.</li>
<li><strong>Elternzeit</strong> (neplaćeno odsustvo uz zaštitu od otkaza) je odvojeno pravo: do <strong>3 godine</strong> po djetetu, radno mjesto te čeka.</li>
</ul>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Elterngeld se računa iz <strong>neta prije poroda</strong> — pa poreska klasa igra ulogu. Ako majka planira primati Elterngeld, prelazak u povoljniju klasu mora se desiti <strong>bar 7 mjeseci prije Mutterschutza</strong> da bi se računao. Tema klasa: <a href="/vodic/porezi-njemacka">Porezi — klase i povrat</a>.</blockquote>

<h2>Vrtić — pravo postoji, mjesta ne</h2>

<p>Od <strong>prve godine</strong> dijete ima <strong>zakonsko pravo na mjesto</strong> u vrtiću (Kita). U praksi mjesta fali svuda, pa je pravilo jedno: <strong>na liste se upisuješ čim se dijete rodi</strong>, na više vrtića odjednom. Cijena zavisi od grada i prihoda — od potpuno besplatnog (Berlin) do par stotina eura; u mnogim gradovima ide preko vaučera (Kita-Gutschein) koji prvo izvadiš u opštini.</p>

<p>Ne nađeš li mjesto uprkos zahtjevu, grad ti ga po zakonu duguje — pismeni zahtjev + žalba preko Jugendamta zna ubrzati stvar bolje od čekanja.</p>

<h2>Škola</h2>

<p>Škola je <strong>obavezna i besplatna</strong>, upis ide po adresi stanovanja, obično godinu prije polaska (grad te pismeno pozove). Djeca koja tek stižu iz BiH dobijaju pripremna odjeljenja za jezik (Willkommensklasse) — raspituj se u školskoj upravi grada, ne čekaj septembar.</p>

<p>Porodice s manjim primanjima (Wohngeld ili Kinderzuschlag — vidi <a href="/vodic/porezi-njemacka">Porezi</a>): dijete ima pravo na <strong>BuT paket</strong> — školski pribor, užina, izleti i prevoz plaćeni.</p>

<h2>Vjenčanje — najlakše preko Bosne</h2>

<blockquote class="vd-savjet"><strong>💡 Provjereno naše iskustvo:</strong> vjenčanje u njemačkom Standesamtu traži brdo papira s apostilama, prevodima i terminima koji se čekaju mjesecima. U BiH se vjenčaš <strong>za par dana</strong>, a u Njemačkoj onda samo prijaviš brak — <strong>međunarodni vjenčani list</strong> (višejezični obrazac) primaju bez prevoda. Od prijave braka ide i promjena poreske klase i Familienversicherung za supružnika.</blockquote>

<h2>Česta pitanja</h2>

<h3>Žena mi ne radi — košta li nas njeno osiguranje?</h3>
<p>Ne. Supružnik bez prihoda (ili do 565&nbsp;€ mjesečno, odnosno 603&nbsp;€ uz mini-job) osiguran je besplatno uz tebe. Detalji u vodiču <a href="/vodic/krankenkasse">Krankenkasse</a>.</p>

<h3>Dijete nam živi u Bosni kod babe — dobijamo li Kindergeld?</h3>
<p>Samo sporazumski, umanjeni iznos (5,11&nbsp;€ za prvo dijete). Punih 259&nbsp;€ tek kad dijete živi u Njemačkoj — računica i izvor u vodiču <a href="/vodic/porezi-njemacka">Porezi</a>.</p>

<h3>Majka nije radila prije poroda — ima li Elterngeld?</h3>
<p>Ima, minimalnih 300&nbsp;€ mjesečno, 12 mjeseci. Uz to ide Kindergeld od 259&nbsp;€ — znači i bez njene plate porodica prima najmanje 559&nbsp;€ mjesečno prve godine.</p>

<p><em>Informativno, nije pravni savjet. Iznosi važe za 2026. i mijenjaju se; za svoj slučaj provjeri kod Elterngeldstelle, Familienkasse i svoje kase.</em></p>

  $vodic$,
  true
)
on conflict (slug) do update set
  naziv = excluded.naziv, opis = excluded.opis, ikona = excluded.ikona,
  kategorija = excluded.kategorija, min_citanja = excluded.min_citanja,
  tagovi = excluded.tagovi, tekst = excluded.tekst,
  aktivan = true, updated_at = now();

update vodici set provjereno = date '2026-08-08' where slug = 'porodica-u-njemackoj';

select slug, naziv, provjereno, length(tekst) as duzina from vodici where slug = 'porodica-u-njemackoj';
