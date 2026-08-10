-- =====================================================================
--  VODIC: Vozačka i auto — zamjena BiH dozvole i uvoz auta
--  Zadrzava slug 'zamjena-vozacke-njemacka' (SEO).
--  Provjereno 8.8.2026: BiH JESTE u Anlage 11 FeV — A1/A/B bez ispita,
--  C/CE/D SA ispitima. Bezbjedno pokrenuti i ponovo.
-- =====================================================================

alter table vodici add column if not exists provjereno date;

insert into vodici (slug, naziv, opis, ikona, kategorija, min_citanja, tagovi, tekst, aktivan)
values (
  'zamjena-vozacke-njemacka',
  'Vozačka i auto — zamjena BiH dozvole i uvoz auta',
  'Rok od 6 mjeseci, za auto bez ijednog ispita a za kamion sa ispitima, šta ponijeti i koliko košta — i da li se isplati dovesti auto iz Bosne',
  '🚗', 'gastarbajter', 7,
  array['vozačka','Führerschein','zamjena','auto','uvoz','carina'],
  $vodic$
<p>Bosanska vozačka u Njemačkoj vrijedi <strong>tačno šest mjeseci</strong> od dana kad ti se tu nastani prebivalište — i onda prestaje važiti. Ne „ne priznaje se", nego <em>prestaje važiti</em>: ko poslije toga sjedne za volan, vozi bez dozvole, a to je krivično djelo, ne saobraćajna kazna.</p>

<p>Dobra vijest koja se ne zna: <strong>za auto se ne polaže ništa ponovo.</strong> BiH je na zvaničnoj listi zemalja s kojima Njemačka priznaje vozačku — pa se za obične kategorije samo mijenja papir za papir.</p>

<h2>Ko polaže, a ko ne — izričito</h2>

<div class="vd-tabela-wrap"><table class="vd-tabela">
<thead><tr><th>Kategorija</th><th>Šta te čeka</th></tr></thead>
<tbody>
<tr><td><strong>B</strong> (auto), <strong>A</strong> i <strong>A1</strong> (motor)</td><td><strong>Bez ijednog ispita</strong> — ni teorija ni vožnja. Samo zamjena papira.</td></tr>
<tr><td><strong>C, CE</strong> (kamion), <strong>D</strong> (autobus)</td><td><strong>Polaže se</strong> — i teorija i vožnja, plus ljekarski pregledi. Ovdje se ne štedi.</td></tr>
</tbody>
</table></div>

<blockquote class="vd-upozorenje"><strong>⚠️ Ovo je najskuplja greška:</strong> ako voziš kamion, tvoja C kategorija <strong>ne prelazi sama</strong>. Mnogi dođu na Westbalkan vizu da voze kamion, promijene papir za B i misle da su sređeni — a za C moraju kroz ispite. Raspitaj se prvog mjeseca, ne šestog.</blockquote>

<h2>Rok od 6 mjeseci — kad počinje da teče</h2>

<p>Rok teče od <strong>prijave prebivališta</strong> (Anmeldung), ne od ulaska u zemlju. Vidi <a href="/vodic/prijavljivanje-adrese">Anmeldung — prijava adrese</a>.</p>

<ul>
<li>Prvih 6 mjeseci voziš normalno sa bosanskom vozačkom.</li>
<li>Rok se može produžiti na <strong>12 mjeseci</strong>, ali samo ako dokažeš da ostaješ kraće od godinu dana — što za nas koji dolazimo raditi ne važi.</li>
<li><strong>Zahtjev predaj bar 2 mjeseca ranije.</strong> Obrada traje sedmicama, a rok ne staje dok se čeka rješenje.</li>
</ul>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Zahtjev se predaje već <strong>prvog mjeseca po dolasku</strong> — čim imaš Anmeldung. Ne košta ništa više, a izbjegneš situaciju da ostaneš bez vozačke usred posla.</blockquote>

<h2>Šta ponijeti u Führerscheinstelle</h2>

<ol>
<li><strong>Originalna bosanska vozačka</strong> + <strong>ovjereni prevod</strong> (sudski tumač ili ADAC).</li>
<li><strong>Pasoš</strong> i <strong>Anmeldebestätigung</strong> (potvrda o prijavi adrese).</li>
<li><strong>Biometrijska fotografija.</strong></li>
<li><strong>Potvrda o kursu prve pomoći</strong> (<em>Erste-Hilfe-Kurs</em>) — 9 nastavnih jedinica, ima ih vikendom, često i na engleskom.</li>
<li><strong>Test vida</strong> (<em>Sehtest</em>) — radi ga svaki optičar za par minuta.</li>
<li>Za C i D kategorije: dodatni ljekarski pregled i psihotest.</li>
</ol>

<p><strong>Koliko košta ukupno:</strong> taksa <strong>35–50&nbsp;€</strong>, prva pomoć <strong>20–40&nbsp;€</strong>, test vida <strong>do 10&nbsp;€</strong>, slika <strong>5–20&nbsp;€</strong>, prevod <strong>30–60&nbsp;€</strong>. Realno <strong>oko 150&nbsp;€ za B kategoriju</strong> i gotovo.</p>

<blockquote class="vd-upozorenje"><strong>⚠️ Bosanska vozačka se predaje.</strong> Originalnu ti zadržava njemački ured i šalje je nazad izdavaocu u BiH. Ako ti treba i dole — izvadi duplikat u BiH <em>prije</em> nego predaš zahtjev ovdje.</blockquote>

<h2>Auto — dovoziš svoje ili kupuješ ovdje?</h2>

<p>Ovo je druga velika greška: ljudi dovezu auto iz Bosne i tek onda saznaju šta to košta.</p>

<p>Auto iz BiH je uvoz iz zemlje van EU. Standardno se plaća <strong>10&nbsp;% carine + 19&nbsp;% PDV-a</strong> na vrijednost auta i prevoz — na auto od 8.000&nbsp;€ to je oko <strong>2.400&nbsp;€</strong> nameta.</p>

<blockquote class="vd-savjet"><strong>💡 Izuzetak koji vrijedi znati:</strong> ako se <strong>trajno seliš</strong> u Njemačku, auto može ući <strong>bez carine i PDV-a</strong> kao selidbena roba (<em>Umzugsgut</em>) — pod uslovom da je bio <strong>tvoj i u tvojoj upotrebi najmanje 6 mjeseci prije selidbe</strong>. Poslije uvoza ga u pravilu <strong>ne smiješ prodati 12 mjeseci</strong>. Papire za to sređuješ na carini pri ulasku, ne naknadno.</blockquote>

<p>Uz to, za njemačku registraciju treba: <strong>COC papir</strong> (potvrda o usklađenosti od proizvođača), <strong>TÜV</strong> (tehnički + izduvni), potvrda carine i <strong>eVB broj</strong> od osiguranja. Bez COC papira ide pojedinačna procjena po §21 StVZO — skupo i sporo.</p>

<p>Zato za starije aute računica često ispadne ovako: <strong>jeftinije je prodati auto u Bosni nego ga dovesti.</strong> Prije nego kreneš, saberi carinu, PDV, TÜV i eventualne prepravke — pa uporedi s cijenom polovnjaka ovdje.</p>

<h2>Troškovi auta u Njemačkoj — da znaš na šta računaš</h2>

<ul>
<li><strong>Osiguranje je obavezno</strong> i bez njega nema registracije. Kao novopridošli počinješ bez bonusa (SF klasa 0), pa je prva godina najskuplja — <strong>ali bosanski bonus se često prizna</strong> ako doneseš potvrdu svog osiguravača o godinama bez štete. Traži je dok si dole.</li>
<li><strong>Porez na vozilo</strong> (Kfz-Steuer) — godišnje, po zapremini i emisiji; za obični auto obično 100–250&nbsp;€.</li>
<li><strong>TÜV</strong> svake 2 godine (novi auto prvi put nakon 3), oko 130&nbsp;€.</li>
<li><strong>Zelena/žuta plaketa</strong> za ulaz u ekološke zone gradova — bez nje kazna.</li>
</ul>

<h2>Česta pitanja</h2>

<h3>Vozim samo kad dođem na godišnji, ne živim tu. Moram li mijenjati?</h3>
<p>Ne. Pravilo od 6 mjeseci vezano je za <strong>prebivalište</strong>. Ko dolazi u posjetu vozi normalno bosanskom vozačkom.</p>

<h3>Prošlo mi je 6 mjeseci, nisam mijenjao. Šta sad?</h3>
<p><strong>Prestani voziti odmah</strong> i predaj zahtjev. Zamjena je i dalje moguća — ali svaka vožnja u međuvremenu je krivično djelo, a ako se desi nesreća, osiguranje ne pokriva štetu.</p>

<h3>Imam i B i C. Mogu li zamijeniti samo B?</h3>
<p>Možeš — B ide bez ispita i dobiješ njemačku vozačku odmah, a C polažeš kasnije. Mnogi tako i rade: prvo osiguraju vožnju auta, pa se onda spremaju za kamion.</p>

<h3>Koliko traje cijeli postupak?</h3>
<p>Od predaje do nove kartice obično <strong>4–8 sedmica</strong>, ovisno o gradu. Zato se predaje rano.</p>

<p><em>Informativno, nije pravni savjet. Praksa se razlikuje po gradovima i pokrajinama, a za kategorije C i D uslovi su stroži — obavezujuću informaciju ti daje Führerscheinstelle tvog grada.</em></p>

  $vodic$,
  true
)
on conflict (slug) do update set
  naziv = excluded.naziv, opis = excluded.opis, ikona = excluded.ikona,
  kategorija = excluded.kategorija, min_citanja = excluded.min_citanja,
  tagovi = excluded.tagovi, tekst = excluded.tekst,
  aktivan = true, updated_at = now();

update vodici set provjereno = date '2026-08-08' where slug = 'zamjena-vozacke-njemacka';

select slug, naziv, provjereno, length(tekst) as duzina from vodici where slug = 'zamjena-vozacke-njemacka';
