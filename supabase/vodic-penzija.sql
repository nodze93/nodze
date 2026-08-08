-- =====================================================================
--  VODIC: Penzija i povratak u BiH — staž, isplata i povrat doprinosa
--  Svi iznosi provjereni 8.8.2026. Bezbjedno pokrenuti i ponovo.
-- =====================================================================

alter table vodici add column if not exists provjereno date;

insert into vodici (slug, naziv, opis, ikona, kategorija, min_citanja, tagovi, tekst, aktivan)
values (
  'penzija-i-povratak', 'Penzija i povratak u BiH — staž, isplata i povrat doprinosa', 'Staž se sabira, penzija u BiH stiže puna, a ko ima manje od 5 godina može tražiti povrat doprinosa — i kad to (ne) treba uraditi',
  '🧳', 'penzija', 7, array['penzija', 'povratak', 'BiH', 'DRV', 'povrat doprinosa', 'staž'],
  $vodic$
<p>Dvije brige muče svakog našeg čovjeka koji radi u Njemačkoj: hoće li mu se staž računati kad se vrati, i hoće li penzija stizati u Bosnu. Obje imaju čist odgovor: <strong>da</strong>. Njemačka i BiH imaju sporazum o socijalnom osiguranju koji to garantuje — ali ima nekoliko stvari koje moraš uraditi na vrijeme, i jedna opcija za koju skoro niko ne zna: povrat doprinosa.</p>

<h2>Staž iz obje zemlje se sabira</h2>

<p>Za njemačku penziju treba <strong>najmanje 5&nbsp;godina staža</strong> (Wartezeit). Ako u Njemačkoj imaš manje, <strong>dodaje se bosanski staž da se uslov ispuni</strong>.</p>

<p>Primjer: 3 godine Njemačke + 20 godina BiH = uslov ispunjen. Njemačka ti onda plaća penziju <strong>za svoje 3 godine</strong>, BiH za svojih 20 — <strong>svaka zemlja plaća svoj dio, i primaš dvije penzije</strong>. Sabiranje služi samo da se pravo otvori, niko ne plaća tuđi staž.</p>

<h2>Penzija se u BiH isplaćuje u punom iznosu</h2>

<p>Njemačka penzija se u BiH <strong>ne umanjuje</strong> — stiže u punom iznosu, na tvoj račun u BiH. Za BiH je nadležna veza <strong>Deutsche Rentenversicherung Bayern Süd</strong> — oni vode predmete naših ljudi.</p>

<p>Zahtjev ne moraš predavati u Njemačkoj: <strong>podnosi se i preko bh fonda PIO/MIO</strong> u tvom mjestu, koji ga po sporazumu proslijedi njemačkoj strani. Jedan zahtjev pokreće postupak u obje zemlje.</p>

<blockquote class="vd-upozorenje"><strong>⚠️ Važno — porez:</strong> njemačka penzija se oporezuje u Njemačkoj i kad živiš u BiH. Za penzionere u inostranstvu nadležan je Finanzamt Neubrandenburg — i on <strong>šalje pisma u Bosnu</strong>. Nemoj ih ignorisati: neodgovoreno pismo postane rješenje s procjenom i kamatom. Kod prvog pisma se javi poreskom savjetniku.</blockquote>

<h2>Povrat doprinosa — opcija za one s manje od 5 godina</h2>

<p>Ako u Njemačkoj imaš <strong>manje od 5&nbsp;godina staža</strong> i vratio si se u BiH, možeš tražiti da ti se <strong>vrate tvoji uplaćeni doprinosi</strong> — odjednom, na račun. Uslovi:</p>

<ul>
<li>prošlo je <strong>24 mjeseca</strong> od zadnjeg doprinosa u Njemačkoj,</li>
<li>nisi više obavezno osiguran u njemačkom sistemu,</li>
<li>ne primaš bh penziju u koju su njemački periodi već uračunati.</li>
</ul>

<p>Vraća se <strong>tvoj dio</strong> doprinosa (9,3&nbsp;% plate za svaku godinu rada) — poslodavčev dio ostaje sistemu. Za tri godine rada s platom od 3.000&nbsp;€ to je oko <strong>10.000&nbsp;€ odjednom</strong>.</p>

<blockquote class="vd-upozorenje"><strong>⚠️ Važno:</strong> Povratom se ti periodi <strong>trajno gase</strong> — kao da nikad nisi radio u Njemačkoj. Ako postoji i najmanja šansa da se vratiš raditi, ili da sa bh stažom jednom ispuniš uslov za njemačku penziju, <strong>promisli dvaput</strong>. Jednom vraćeno ne može se uplatiti nazad.</blockquote>

<blockquote class="vd-savjet"><strong>💡 Savjet:</strong> Prije odluke zatraži besplatan <strong>Rentenauskunft</strong> (pregled tvog konta) od DRV — vidiš tačno koliko bi ti penzija bila za tvoje godine, pa računica povrat-ili-penzija postane jasna. Sabiranje sa bh stažom često čini da se i 3 njemačke godine isplate kao doživotna penzija.</blockquote>

<h2>Prije povratka u BiH — spisak</h2>

<ol>
<li><strong>Sredi konto (Kontenklärung):</strong> provjeri kod DRV da su ti upisane sve godine i svi poslodavci — rupe se najlakše krpe dok si još tu i dok su papiri pri ruci.</li>
<li><strong>Sačuvaj sve:</strong> platne liste, potvrde o radu, Sozialversicherungsausweis. To su dokazi ako nešto zafali za 20 godina.</li>
<li><strong>Javi se svojoj kasi</strong> za zdravstveno: penzioner s njemačkom penzijom u BiH ostvaruje zdravstvenu zaštitu po sporazumu preko bh fonda — kako tačno za tebe, kaže ti kasa prije selidbe, ne poslije.</li>
<li><strong>Odjavi adresu</strong> uredno (Abmeldung) — inače Rundfunkbeitrag i pošta teku dalje. Kako, i šta sve gasiš: <a href="/vodic/prijavljivanje-adrese">Anmeldung i odjava</a>.</li>
<li><strong>Kindergeld i slična primanja prestaju</strong> odlaskom — javi Familienkassi, jer preplaćeno traže nazad.</li>
</ol>

<h2>Kad se ide u penziju</h2>

<p>Za godišta <strong>1964. i mlađa</strong> redovna granica je <strong>67 godina</strong> (starija godišta idu postepeno ranije). Ranije se može od 63 uz uslove staža — ali uz trajni odbitak od <strong>0,3&nbsp;% za svaki mjesec</strong> ranijeg odlaska. Ko ima 45&nbsp;godina staža (računa se i bh staž za uslov), može bez odbitka nešto ranije — to je pitanje za Rentenauskunft, ne za napamet.</p>

<h2>Česta pitanja</h2>

<h3>Imam 3 godine njemačkog staža i vraćam se. Propada li?</h3>
<p>Ne propada nikad. Dvije opcije: ostaviš ih — pa se jednom, sabrane s bh stažom, pretvore u malu doživotnu njemačku penziju; ili poslije 24 mjeseca tražiš povrat svojih doprinosa. Prvo Rentenauskunft, pa odluka.</p>

<h3>Hoće li mi bh penzija smetati njemačkoj, ili obratno?</h3>
<p>Ne. Svaka zemlja računa i plaća samo svoj staž. Jedina veza je što se periodi sabiraju da se ispuni uslov.</p>

<h3>Gdje predajem zahtjev kad dođe vrijeme, a živim u BiH?</h3>
<p>U svoj PIO/MIO fond — oni po sporazumu proslijede zahtjev u Njemačku (DRV Bayern Süd). Priloži dokaze o njemačkom stažu koje si sačuvao.</p>

<p><em>Informativno, nije pravni ni penzioni savjet. Svaki staž je priča za sebe — prije odluka zatraži Rentenauskunft od DRV i provjeri detalje u svom PIO/MIO fondu.</em></p>

  $vodic$,
  true
)
on conflict (slug) do update set
  naziv = excluded.naziv, opis = excluded.opis, ikona = excluded.ikona,
  kategorija = excluded.kategorija, min_citanja = excluded.min_citanja,
  tagovi = excluded.tagovi, tekst = excluded.tekst,
  aktivan = true, updated_at = now();

update vodici set provjereno = date '2026-08-08' where slug = 'penzija-i-povratak';

select slug, naziv, provjereno, length(tekst) as duzina from vodici where slug = 'penzija-i-povratak';
