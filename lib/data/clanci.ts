import { TagTip } from "@/lib/types";

export interface ClanakData {
  id: string;
  slug: string;
  naslov: string;
  excerpt: string;
  sadrzaj: string;
  kategorija: TagTip;
  datum: string;
  minCitanja: number;
  procitano: number;
  slika?: string | null;
  autoGenerisan?: boolean;
  izvor?: string;
}

export const clanci: ClanakData[] = [
  {
    id: "1",
    slug: "nova-radna-viza-2026",
    naslov: "Nova pravila za radnu vizu u Njemačkoj — što se mijenja za Bosance od 2026. godine",
    excerpt: "Fachkräfteeinwanderungsgesetz je promijenio sve. Koje dokumente trebaš, koji je rok čekanja, i kako aplicirati korak po korak iz BiH.",
    kategorija: "viza",
    datum: "28. juna 2026.",
    minCitanja: 8,
    procitano: 2400,
    sadrzaj: `
<h2>Šta se mijenja od 2026?</h2>
<p>Novi Zakon o useljavanju stručnih kadrova (Fachkräfteeinwanderungsgesetz) koji je stupio na snagu pruža znatno više mogućnosti za Bosance koji žele raditi u Njemačkoj. Ključne izmjene uključuju proširenje priznatih kvalifikacija, brže procedure i novu "Chancenkarte" — kartu šansi za traženje posla.</p>

<h2>Tri načina da dođeš u Njemačku</h2>
<h3>1. Radna viza uz ponudu posla</h3>
<p>Ovo je najbrži put. Trebaš imati pisanu ponudu posla od njemačkog poslodavca. Tvoja kvalifikacija mora biti anerkannt (uznata) ili poslodavac mora dokazati da je tvoja diploma ekvivalentna. Rok obrade: 3-8 sedmica zavisno od Ausländerbehörde.</p>

<h3>2. Chancenkarte (Karta šansi)</h3>
<p>Nova mogućnost od 2024/2025 — možeš doći u Njemačku bez ponude posla i tražiti posao 1 godinu. Uvjeti: diploma (minimalno 3 godine studija), B1 nivo njemackog ili B2 engleskog, minimum 2 godine radnog iskustva.</p>

<h3>3. Plava karta EU (Blue Card)</h3>
<p>Za visokokvalificirane stručnjake. Minimalna godišnja plaća: 43.800€ (za deficitarna zanimanja 38.500€). Uz Plavu kartu možeš nakon 21 mj. aplicirati za trajni boravak.</p>

<h2>Koje dokumente trebaš</h2>
<ul>
<li>Važeći pasoš (min. 6 mj. nakon predviđenog datuma dolaska)</li>
<li>Potvrda o zaposlenju / ugovor o radu</li>
<li>Diploma prevedena i ovjerena</li>
<li>Potvrda o anerkanntu (od Anabin baze ili IQ.net)</li>
<li>Potvrda o zdravstvenom osiguranju</li>
<li>Dokaz o smještaju (Wohnungsbestätigung)</li>
<li>Motivacijsko pismo (za neke procedure)</li>
</ul>

<h2>Gdje aplicirati</h2>
<p>Apliciraš u Ambasadi Njemačke u Sarajevu (Bundestag str. 11). Termini se zakazuju online na portalu antrag.diplo.de. Trenutno čekanje: 8-14 sedmica za termin. Preporučujemo aplicirati čim potpišeš ugovor s poslodavcem.</p>

<h2>Korak-po-korak postupak</h2>
<ol>
<li>Potpiši ugovor o radu s njemačkim poslodavcem</li>
<li>Zatraži Anerkennung diploma (od 4-12 sedmica)</li>
<li>Zakažite termin u Ambasadi u Sarajevu</li>
<li>Pribavi sve dokumente (lista gore)</li>
<li>Dođi na termin s kompletnom dokumentacijom</li>
<li>Čekaj odobrenje (obično 3-6 sedmica)</li>
<li>Preuzmi vizu i registriraj se u Njemačkoj u roku od 2 sedmice od dolaska</li>
</ol>

<h2>Korisni linkovi</h2>
<p>Ambasada u Sarajevu: <strong>sarajevo.diplo.de</strong><br>
Provjera diplome: <strong>anabin.kmk.org</strong><br>
Zakažite termin: <strong>antrag.diplo.de</strong></p>
    `,
  },
  {
    id: "2",
    slug: "elterngeld-2026",
    naslov: "Elterngeld 2026 — koliko para dobijaš i kako aplicirati odmah nakon poroda",
    excerpt: "Roditeljska naknada u Njemačkoj jedna je od najvažnijih beneficija. Evo tačnih iznosa, pravila i kako aplicirati u roku.",
    kategorija: "porodica",
    datum: "27. juna 2026.",
    minCitanja: 6,
    procitano: 1900,
    sadrzaj: `
<h2>Što je Elterngeld?</h2>
<p>Elterngeld je naknada koja se isplaćuje roditeljima koji privremeno smanje ili prestanu raditi kako bi se brinuli o novorođenom djetetu. Iznos ovisi o tvojoj prethodnoj plaći.</p>

<h2>Koliko para dobijaš?</h2>
<p>Dobivaš između <strong>67% i 100%</strong> neto prihoda koji si imao/la 12 mj. prije poroda. Minimum je <strong>300€/mj.</strong>, maksimum <strong>1.800€/mj.</strong></p>

<h3>Primjer obračuna:</h3>
<ul>
<li>Neto plaća 2.000€/mj. → Elterngeld ≈ 1.340€/mj.</li>
<li>Neto plaća 3.000€/mj. → Elterngeld ≈ 1.800€/mj. (maksimum)</li>
<li>Bez prihoda → 300€/mj. (minimum)</li>
</ul>

<h2>Koliko dugo traje?</h2>
<ul>
<li><strong>Basiselterngeld</strong>: 14 mj. ukupno (12 mj. jedan roditelj + 2 mj. partner)</li>
<li><strong>ElterngeldPlus</strong>: može trajati duže uz manji iznos dok radiš part-time</li>
</ul>

<h2>Kako aplicirati</h2>
<ol>
<li>Preuzmi obrazac na web stranici svog Bundesland-a ili Elterngeldstelle</li>
<li>Popuni s podacima o djetetu (Geburtsurkunde) i plaći (Lohnbescheinigung)</li>
<li>Priloži: rodni list djeteta, tvoja posljednja 3 platna lista, potvrda o porezu</li>
<li>Pošalji poštom ili predaj lično u Elterngeldstelle tvojeg grada</li>
</ol>

<h2>Važno: rok prijave</h2>
<p>Elterngeld se isplaćuje retroaktivno samo za <strong>zadnja 3 mj.</strong> Aplicirati trebaš što je moguće prije — idealno u prvom mj. nakon poroda.</p>

<h2>Da li možeš aplicirati iz BiH?</h2>
<p>Da, ako si plaćao/la doprinose u Njemačkoj. Djetetu ne mora biti u Njemačkoj da bi roditelj ostvario pravo. No, za Kindergeld (drugi benefit) dijete mora živjeti u EU ili BiH (postoji bilateralni sporazum).</p>
    `,
  },
  {
    id: "3",
    slug: "stan-minhen-bez-schufe",
    naslov: "Kako naći stan u Minhenu bez Schufe — provjeren vodič za novopridošle",
    excerpt: "Wohnungsmarkt u Minhenu je najteži u Njemačkoj. Evo konkretnih trikova kako doći do stana čak i bez Schufe bodova.",
    kategorija: "stan",
    datum: "26. juna 2026.",
    minCitanja: 5,
    procitano: 3100,
    sadrzaj: `
<h2>Zašto je München poseban problem</h2>
<p>München ima najniži postotak slobodnih stanova u cijeloj Njemačkoj — oko 0.2%. Prosječna cijena iznajmljivanja je 22€/m². Tražiš stan — dobro dobrodošao na lov koji može trajati 3-6 mj.</p>

<h2>Što je Schufa i zašto je problem</h2>
<p>Schufa je privatna agencija koja prati kreditnu povijest u Njemačkoj. Ako si tek stigao iz BiH, nemaš Schufa historiju — a većina stanodavaca zahtijeva Schufa-Auskunft (potvrdu). Bez nje, moraš kompenzirati na drugi način.</p>

<h2>Strategije bez Schufe</h2>

<h3>1. Kaution 3-6 mj. unaprijed</h3>
<p>Nudi stanodavcu dvostruki ili trostruki depozit (Kaution) umjesto standardnog 3 mj. Mnogi privatni stanodavci prihvataju ovo kao zamjenu za Schufa.</p>

<h3>2. Napiši jaki "Bewerbungsmappe"</h3>
<p>Profil stanara treba sadržavati: kratki životopis, potvrdu o zaposlenju (Arbeitsvertrag), 3 platna lista, pismo preporuke prethodnog stanodavca (i iz BiH!), motivacijsko pismo. Što je kompletnije, to bolje.</p>

<h3>3. WG-Zimmer kao prelazno rješenje</h3>
<p>Pronađi sobu u zajedničkom stanu (WG) — stanari se međusobno biraju i Schufa se rjeđe traži. Portali: WG-Gesucht.de, Facebook grupe "WG München Bosanci".</p>

<h3>4. Korporativni stanovi</h3>
<p>Pitaj svog poslodavca ima li ugovore sa stanodavnim agencijama ili Werkswohnungen (stanovi kompanije). Mnogi veliki poslodavci imaju ove aranžmane.</p>

<h3>5. GEWOFAG i GWG München</h3>
<p>Gradske stambene kompanije. Duga čekalna lista (2-4 god.) ali fer uvjeti i bez Schufa zahtjeva za nove useljenike.</p>

<h2>Gdje tražiti</h2>
<ul>
<li>ImmoScout24.de — najveći portal</li>
<li>Immowelt.de</li>
<li>WG-Gesucht.de — za sobe</li>
<li>Facebook: "Bosanci u Münchenu Stan"</li>
<li>Ebay Kleinanzeigen — mnogi privatni stanodavci</li>
</ul>

<h2>Upozorenje na prevare</h2>
<p>Nikad ne plaćaj depozit unaprijed bez da si vidio stan. Ne daj ključeve za "međunarodne transfere". Ako je previše jeftino — prevara je.</p>
    `,
  },
  {
    id: "4",
    slug: "krankenkasse-2026",
    naslov: "Krankenkasse povećava doprinos u 2026 — koliko više plaćaš i šta možeš uraditi",
    excerpt: "Prosječna stopa doprinosa u javnom zdravstvenom osiguranju raste. Evo kako to utječe na tvoj džep i možeš li promijeniti blagajnu.",
    kategorija: "zdravstvo",
    datum: "28. juna 2026.",
    minCitanja: 3,
    procitano: 1200,
    sadrzaj: `
<h2>Koliko raste doprinos</h2>
<p>Prosječni dodatni doprinos (Zusatzbeitrag) porastao je na 2.5% u 2026. godini. Uz osnovnu stopu od 14.6%, ukupno plaćaš oko 17.1% bruto plaće — a posodavac plaća pola.</p>

<h3>Primjer na bruto plaći 3.000€:</h3>
<ul>
<li>Tvoj dio: ~257€/mj.</li>
<li>Poslodavac plaća: ~257€/mj.</li>
<li>Ukupno za Krankenkasse: ~514€/mj.</li>
</ul>

<h2>Koja blagajna je najjeftinija?</h2>
<p>Razlikuju se po Zusatzbeitrag-u. Neke od najjeftinijih u 2026:</p>
<ul>
<li>HKK — 1.98% Zusatzbeitrag</li>
<li>BKK VBU — 2.15%</li>
<li>TK (Techniker Krankenkasse) — 2.4% ali odlična usluga</li>
<li>AOK — varira po regiji</li>
</ul>

<h2>Kako promijeniti blagajnu</h2>
<p>Možeš promijeniti Krankenkasse jednom godišnje (otkaz do 31.12. za promjenu od 1.1.). Ako blagajna poveća doprinos, imaš specijalno pravo otkaza u roku 2 mj. od obavijesti.</p>

<ol>
<li>Odaberi novu blagajnu i potpishi prijavu</li>
<li>Nova blagajna šalje otkaz staroj automatski</li>
<li>Obavijesti poslodavca o promjeni</li>
</ol>

<h2>Privatno vs. javno</h2>
<p>Privatno osiguranje (PKV) može biti jeftinije kad si mlad i zdrav, ali postaje skuplje kako stariš. Za porodice s djecom javno je skoro uvijek bolje jer djeca besplatno osigurana uz roditelja.</p>
    `,
  },
  {
    id: "5",
    slug: "steuerklasse-vodic",
    naslov: "Steuerklasse — koja klasa ti najviše odgovara i kako je promijeniti",
    excerpt: "Izbor prave Steuerklasse može ti donijeti stotine eura razlike u godišnjem povratu poreza. Evo jasnog vodiča.",
    kategorija: "porez",
    datum: "27. juna 2026.",
    minCitanja: 6,
    procitano: 2200,
    sadrzaj: `
<h2>Šest poreskih klasa</h2>
<ul>
<li><strong>Klasa I</strong>: Samci, razvedeni, udovci bez djece</li>
<li><strong>Klasa II</strong>: Samohrani roditelji (bonus Entlastungsbetrag)</li>
<li><strong>Klasa III</strong>: Oženjen/udata, bračni partner ima Klasu V ili nema prihode</li>
<li><strong>Klasa IV</strong>: Oženjen/udata, oba partnera sličnih prihoda</li>
<li><strong>Klasa V</strong>: Bračni partner s višim prihodima ima Klasu III</li>
<li><strong>Klasa VI</strong>: Drugi posao (više poslodavaca)</li>
</ul>

<h2>Bračni par — kombinacija III/V vs. IV/IV</h2>
<p>Ovo je ključna odluka za bračne parove:</p>
<ul>
<li><strong>III/V</strong>: Partner s višom plaćom bira III (niži porez svaki mj.), a partner s nižom bira V (viši porez). Ukupno neto veće tokom godine ali može doći do doplate na kraju.</li>
<li><strong>IV/IV</strong>: Ravnomjernija raspodjela. Manja šansa za doplatu.</li>
<li><strong>IV/IV s Faktorverfahren</strong>: Automatski izračun — preporučujemo ako imate različite plaće.</li>
</ul>

<h2>Kako promijeniti Steuerklasse</h2>
<p>Prijava se podnosi u Finanzamt-u tvog mjesta stanovanja. Online putem: ELSTER.de. Promjena se odobrava i vrijedi od sljedećeg mj. Možeš mijenjati jednom godišnje (do 30.11. za isti porezni period).</p>

<h2>Savjet za Bosance u braku</h2>
<p>Ako jedan partner radi u Njemačkoj a drugi je u BiH (ili ne radi) — provjeri da li imaš pravo na Klasu III. Pod određenim uvjetima da, čak i kad suprug/a nije u Njemačkoj.</p>
    `,
  },
  {
    id: "6",
    slug: "kindergeld-dijete-bih",
    naslov: "Kindergeld za dijete koje živi u BiH — da li imaš pravo i kako aplicirati",
    excerpt: "Zahvaljujući bilateralnom sporazumu Bosanci koji rade u Njemačkoj mogu primati Kindergeld čak i kad djeca žive u BiH.",
    kategorija: "porodica",
    datum: "26. juna 2026.",
    minCitanja: 5,
    procitano: 1800,
    sadrzaj: `
<h2>Bilateralni sporazum BiH-Njemačka</h2>
<p>Postoji sporazum o socijalnoj sigurnosti između Bosne i Hercegovine i Njemačke koji omogućava primanje Kindergeld-a za djecu koja žive u BiH, ukoliko roditelj radi i plaća doprinose u Njemačkoj.</p>

<h2>Uvjeti za Kindergeld</h2>
<ul>
<li>Ti radiš u Njemačkoj i plaćaš poreze/doprinose</li>
<li>Dijete je tvoje (biološko, posvojeno ili pastorak)</li>
<li>Dijete je mlađe od 18 god. (do 25 ako studira)</li>
<li>Dijete živi u BiH (bilateralni sporazum pokriva ovo!)</li>
</ul>

<h2>Iznos Kindergeld 2026</h2>
<ul>
<li>1. i 2. dijete: <strong>255€/mj.</strong> po djetetu</li>
<li>3. dijete: <strong>255€/mj.</strong></li>
<li>4. i svako sljedeće: <strong>255€/mj.</strong></li>
</ul>

<h2>Kako aplicirati</h2>
<ol>
<li>Idi u Familienkasse (ured za porodične naknade) — pri svakom Jobcenter-u</li>
<li>Donesi: pasoš, rodni list djeteta (apostille!), dokaz o životu u BiH</li>
<li>Popuni obrazac KG1 (na nijemackom) i KG5 (za djecu u inostranstvu)</li>
<li>Dostavi potvrdu bosanske škole/doktora da dijete živi u BiH</li>
<li>Obrađivanje traje 4-8 sedmica</li>
</ol>

<h2>Bitno: retroaktivna isplata samo 6 mj.</h2>
<p>Kindergeld se može retroaktivno tražiti za samo zadnjih 6 mj. Apliciraj što prije.</p>
    `,
  },
  {
    id: "7",
    slug: "penzija-bih-njemacka",
    naslov: "Penzija u Njemačkoj za Bosance — BiH-DE sporazum o socijalnom osiguranju objašnjen",
    excerpt: "Radni staž iz BiH može se pribrojati njemačkom stažu. Evo kako funkcioniše sporazum i što to znači za tvoju penziju.",
    kategorija: "penzija",
    datum: "25. juna 2026.",
    minCitanja: 10,
    procitano: 2700,
    sadrzaj: `
<h2>Sporazum o socijalnom osiguranju BiH-Njemačka</h2>
<p>Bosna i Hercegovina ima bilateralni sporazum s Njemačkom koji omogućava uzajamno priznavnje penzijskog staža. To znači da staz koji si ostvario u BiH može se pribrojati njemačkom stažu za određivanje prava na penziju.</p>

<h2>Kako funkcionira totalizacija staža</h2>
<p>Primjer: Ako imaš 8 godina staža u BiH i 27 godina u Njemačkoj, za provjeru <strong>prava</strong> na penziju računa se 35 godina (ispunjavaš uvjet za prijevremenu penziju). Međutim, svaka zemlja plaća svoju penziju razmjerno — Njemačka plaća za 27 god. staža, BiH za 8 god.</p>

<h2>Minimalni uvjeti za njemacku penziju</h2>
<ul>
<li>Altersrente (starosna penzija): 45 godina staža, odlazak sa 63 godine</li>
<li>Regularna starosna: 67 godina</li>
<li>Minimalnih 5 godina uplaćenih doprinosa u Njemačkoj</li>
</ul>

<h2>Koliko ćeš dobiti?</h2>
<p>Penzija u Njemačkoj se izračunava prema Entgeltpunkte (bodovi zarađivanja). Svake godine rada sa prosječnom plaćom = 1 bod. U 2026 jedan bod vrijedi <strong>37.60€/mj.</strong></p>

<p>Primjer: 30 godina rada sa prosječnom plaćom = 30 bodova × 37.60€ = <strong>1.128€/mj.</strong> bruto</p>

<h2>Kako aplicirati</h2>
<p>Za penziju apliciraš u Deutsche Rentenversicherung (drv.de). Oni koordiniraju s Federalnim zavodom PIO u BiH za provjeru staža. Proces traje 3-6 mj.</p>

<h2>Bitno: prijavi sav rad u BiH</h2>
<p>Donesi sve radne knjižice i potvrde o radu iz BiH. Svaka godina staža je važna za ukupni obračun.</p>
    `,
  },
  {
    id: "8",
    slug: "nostrifikacija-diplome",
    naslov: "Nostrifikacija diplome u Njemačkoj — novi brži postupak 2026",
    excerpt: "Anerkennung bosanske diplome je obavezan korak za mnoga zanimanja. Evo konkretnih koraka i koji organi su nadležni.",
    kategorija: "viza",
    datum: "28. juna 2026.",
    minCitanja: 5,
    procitano: 890,
    sadrzaj: `
<h2>Regulirana vs. neregulirana zanimanja</h2>
<p>Za <strong>regulirana zanimanja</strong> (ljekar, stomatolog, farmaceut, arhitekt, inženjer, nastavnik, pravnik) — Anerkennung je <strong>obavezan</strong>. Za sva druga zanimanja nije zakonski obavezan ali ga mnogi poslodavci traže.</p>

<h2>Gdje aplicirati</h2>
<ul>
<li><strong>Lijekari, stomatolozi, farmaceuti</strong>: Landesärztekammer (komora liječnika savezne zemlje)</li>
<li><strong>Inženjeri, arhitekti</strong>: Ingenieurkammer savezne zemlje</li>
<li><strong>Nastavnici</strong>: Kultusministerium savezne zemlje</li>
<li><strong>Ostale struke</strong>: ANABIN baza podataka ili IQ.net agencija</li>
</ul>

<h2>Brzi check — ANABIN baza</h2>
<p>Na anabin.kmk.org možeš provjeriti kako je tvoja diploma klasificirana. H+ znači automatsko priznanje, H- znači da treba ocjena, H+/- znači situacija je složenija.</p>

<h2>Dokumenti potrebni</h2>
<ul>
<li>Originalna diploma + ovjereni prijevod (sudski tumač za njemački)</li>
<li>Transcript ocjena (Prijepis ocjena)</li>
<li>Potvrda o akreditaciji fakulteta (od HEAN-a za BiH)</li>
<li>Putovnica</li>
<li>Motivacijsko pismo (nekad)</li>
</ul>

<h2>Rok i cijena</h2>
<p>Postupak traje 3-6 mj. Cijena varira: 100-300€ zavisno od savezne zemlje i zanimanja. IQ.net agencija pomaže besplatno i može ubrzati.</p>

<h2>Što ako dobijem "djelimično" priznanje?</h2>
<p>Možeš tražiti "Anpassungslehrgang" (dodatna obuka) ili polaganje "Eignungsprüfung" (prilagodnih ispita). Nakon toga dobivaš puno priznanje.</p>
    `,
  },
  {
    id: "9",
    slug: "auslander-termin",
    naslov: "Ausländerbehörde — kako zakazati termin i što ponijeti",
    excerpt: "Kancelarija za strance je obavezna stanica za svaki boravišni status. Evo kako funkcioniše sistem zakazivanja i što moraš donijeti.",
    kategorija: "viza",
    datum: "25. juna 2026.",
    minCitanja: 5,
    procitano: 4800,
    sadrzaj: `
<h2>Zašto ti treba Ausländerbehörde</h2>
<p>Ausländerbehörde (ABH) je nadležna za sve boravišne dozvole stranih državljana. Dolazak na termin je obavezan za: prvu prijavu, produženje boravka, promjenu statusa, familienachzug i mnoge druge postupke.</p>

<h2>Kako zakazati termin</h2>
<p>Svaki grad ima vlastiti sistem. Najčešće online putem gradskog portala. Primjeri:</p>
<ul>
<li>Berlin: service.berlin.de</li>
<li>München: muenchen.de/termin</li>
<li>Frankfurt: frankfurt.de/terminbuchung</li>
<li>Hamburg: hamburg.de/auslaenderbehoerde</li>
</ul>
<p>Termini se "pune" odmah nakon objave (obično 8:00 ujutro). Postavi alarm i budi spreman.</p>

<h2>Što ponijeti — universalna lista</h2>
<ul>
<li>Važeći pasoš + fotokopija svih stranica</li>
<li>Biometrijska slika (35x45mm, bijela pozadina)</li>
<li>Anmeldebestätigung (potvrda o prijavi adrese)</li>
<li>Dokaz o zdravstvenom osiguranju</li>
<li>Dokaz o financijskim sredstvima (platni listovi, bankovna izvoda)</li>
<li>Ugovor o radu (za radnu dozvolu)</li>
<li>Ugovor o najmu stana</li>
<li>Diploma/Anerkennung (ako je relevantno)</li>
</ul>

<h2>Na šta pazi na terminu</h2>
<p>Dođi 15 min ranije. Ponesi originale i kopije svega. Ne dolazi bez zakazanog termina — neće te primiti. Ako propustiš termin, moraš zakazati novi (može trajati sedmicama).</p>

<h2>Što ako nema slobodnih termina?</h2>
<p>U nekim gradovima (Berlin posebno) termini su rasprodati mesecima unaprijed. Opcije: koristi Terminator browser ekstenziju, zakaži u susjednom gradu, kontaktiraj ABH direktno mailom.</p>
    `,
  },
  {
    id: "10",
    slug: "vozacka-fuhrerschein",
    naslov: "Vozačka dozvola BiH → Führerschein — kako zamijeniti bez ispita",
    excerpt: "Bosanci koji dolaze u Njemačku mogu zamjeniti BiH vozačku dozvolu bez polaganja teorijskog ili praktičnog ispita. Evo kako.",
    kategorija: "viza",
    datum: "24. juna 2026.",
    minCitanja: 6,
    procitano: 3900,
    sadrzaj: `
<h2>Dobre vijesti za Bosance</h2>
<p>BiH i Njemačka imaju ugovor koji omogućava direktnu zamjenu vozačke dozvole bez polaganja ispita. Ovo ne vrijedi za sve kategorije.</p>

<h2>Koje kategorije možeš zamijeniti</h2>
<ul>
<li>B (osobna vozila) ✓</li>
<li>A, A1, A2 (motocikli) ✓</li>
<li>AM (mopedi) ✓</li>
<li>BE (prikolice) ✓</li>
<li>C, CE, D kategorije — treba posebna provjera</li>
</ul>

<h2>Procedura zamjene</h2>
<ol>
<li>Idi u Straßenverkehrsamt (ili KFZ-Zulassungsbehörde) tvog grada</li>
<li>Donesi: BiH vozačku dozvolu (original), pasoš/osobna, Anmeldung, biometrijska slika, 35€ taksa</li>
<li>Vozačka se zamjenjuje na licu mjesta ili za 2-4 sedmice</li>
<li>Tvoja BiH vozačka ostaje kod Straßenverkehrsamt-a</li>
</ol>

<h2>Rok za zamjenu</h2>
<p>Ne postoji strogi rok, ali preporučujemo zamjenu unutar 6 mj. od prijavljivanja adrese. Dok ne zamijeniš, BiH dozvola je validna u Njemačkoj.</p>

<h2>Što ako si dozvolu dobio u BiH ali si onda živio negdje drugdje?</h2>
<p>U tom slučaju situacija je kompleksnija. Savjetujemo direktan kontakt s lokalnim Straßenverkehrsamt-om i opisivanje situacije.</p>
    `,
  },
  {
    id: "11",
    slug: "mietkaution-depozit",
    naslov: "Mietkaution — kako dobiti natrag depozit kad izlaziš iz stana",
    excerpt: "Stanodavci smiju zadržati Mietkaution samo za opravdane štete. Evo tvojih prava i kako osigurati povrat depozita.",
    kategorija: "stan",
    datum: "26. juna 2026.",
    minCitanja: 4,
    procitano: 956,
    sadrzaj: `
<h2>Što je Mietkaution</h2>
<p>Mietkaution je depozit koji plaćaš stanodavcu na početku najma. Maksimalni iznos po zakonu je 3 neto najamnine (Nettokaltmiete). Stanodavac ga mora položiti na poseban račun (ne može koristiti).</p>

<h2>Tvoja prava pri izlasku</h2>
<p>Stanodavac mora vratiti depozit u razumnom roku — u praksi do 6 mj. Može zadržati dio samo za:</p>
<ul>
<li>Oštećenja koja nadilaze normalni wear and tear</li>
<li>Neplaćenu najamninu</li>
<li>Troškove finalnog čišćenja (ako je navedeno u ugovoru)</li>
<li>Troškove potrebnog renoviranja</li>
</ul>

<h2>Šta NE smije zadržati</h2>
<ul>
<li>Normalni tragovi korištenja (male ogrebotine, blago izblijedjele boje)</li>
<li>Renoviranje koje je ionako trebalo (stara soba s puno malih oštećenja)</li>
<li>Schönheitsreparaturen ako su klauzule o tome u ugovoru nevažeće (a mnoge jesu!)</li>
</ul>

<h2>Kako osigurati povrat</h2>
<ol>
<li>Na ulasku napravi detaljan Übergabeprotokoll (zapisnik o stanju) s fotografijama</li>
<li>Isti protokol uradi na izlasku</li>
<li>Zatraži pisanu potvrdu od stanodavca o svakom eventualnm trošku</li>
<li>Ako stanodavac neodgovorno zadržava kaution, kontaktiraj Mieterverein (udruženje stanara)</li>
</ol>

<h2>Ako stanodavac ne vraća depozit</h2>
<p>Pošalji pismeni opomenu (Mahnung) s rokom 14 dana. Ako ni tada ne vrati, idi u Mieterverein ili tužu podnesi pred Amtsgericht. Za iznose do 5.000€ nije ti potreban advokat.</p>
    `,
  },
  {
    id: "12",
    slug: "wise-vs-western-union",
    naslov: "Wise vs. Western Union — ko šalje jeftinije novac u BiH",
    excerpt: "Slanje novca u BiH je redovna potreba dijaspore. Usporedba najpopularnijih servisa — ko uzima manje provizije.",
    kategorija: "porez",
    datum: "24. juna 2026.",
    minCitanja: 4,
    procitano: 2100,
    sadrzaj: `
<h2>Usporedba servisa 2026</h2>
<p>Testirali smo slanje 500€ iz Njemacke u BiH (konverzija u KM) u junu 2026:</p>

<table style="width:100%; border-collapse:collapse; margin:16px 0;">
<tr style="background:#f0f0f0;"><th style="padding:8px;text-align:left;">Servis</th><th style="padding:8px;">Naknada</th><th style="padding:8px;">Kurs</th><th style="padding:8px;">Prima</th></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee;">Wise</td><td style="padding:8px;">~4.50€</td><td style="padding:8px;">Realni</td><td style="padding:8px;font-weight:600;color:#1D9E75;">974 KM</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee;">Revolut</td><td style="padding:8px;">~2€ (sub.)</td><td style="padding:8px;">Realni</td><td style="padding:8px;">972 KM</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee;">Western Union</td><td style="padding:8px;">~9€</td><td style="padding:8px;">Lošiji</td><td style="padding:8px;">941 KM</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee;">MoneyGram</td><td style="padding:8px;">~8€</td><td style="padding:8px;">Lošiji</td><td style="padding:8px;">945 KM</td></tr>
<tr><td style="padding:8px;">Banka transfer</td><td style="padding:8px;">~25€</td><td style="padding:8px;">Lošiji</td><td style="padding:8px;">918 KM</td></tr>
</table>

<h2>Naš savjet</h2>
<p><strong>Wise</strong> je pobjednik za regularno slanje. Koristi realni srednji kurs bez skrivenih marži. <strong>Revolut</strong> je jeftiniji za premijum korisnike ali limit bez naknade je 1.000€/mj. <strong>Western Union</strong> ima smisla samo za hitne gotovinske isplate (primanje na Pošti odmah).</p>

<h2>Praktični savjeti</h2>
<ul>
<li>Slji u KM direktno (ne EUR→EUR pa pa onda konverzija u BiH)</li>
<li>Izbjegavaj vikende — kursi su često lošiji</li>
<li>Wise ima opciju "best time to send" — koristi je</li>
<li>Za iznose iznad 2.000€ provjeri Wise Business nalog</li>
</ul>
    `,
  },
  {
    id: "13",
    slug: "zanimanja-njemacka-2026",
    naslov: "Ova zanimanja Njemačka traži u 2026 — i plaće su više nego ikad",
    excerpt: "Nedostatak radne snage u Njemačkoj dostiže rekordne nivoe. Evo koje struke imaju najlakši put i najviše plaće.",
    kategorija: "posao",
    datum: "27. juna 2026.",
    minCitanja: 4,
    procitano: 3100,
    sadrzaj: `
<h2>Kritična zanimanja u 2026</h2>
<p>Bundesagentur für Arbeit godišnje objavljuje listu Engpassberufe — zanimanja s kritičnim nedostatkom radne snage. Za ova zanimanja viza se odobrava brže.</p>

<h3>Zdravstvo i njega</h3>
<ul>
<li>Medicinska sestra/tehničar (Pflegefachkraft): 2.800–3.500€/mj.</li>
<li>Ljekar opće prakse: 5.500–8.000€/mj.</li>
<li>Fizioterapeut: 2.400–3.200€/mj.</li>
<li>Logoped: 2.600–3.400€/mj.</li>
</ul>

<h3>IT i tehnologija</h3>
<ul>
<li>Software Developer: 4.500–7.500€/mj.</li>
<li>Cloud/DevOps inžinjer: 5.000–8.000€/mj.</li>
<li>Data Scientist: 4.800–7.000€/mj.</li>
<li>IT Sicherheit (cybersecurity): 5.000–8.500€/mj.</li>
</ul>

<h3>Zanatska zanimanja</h3>
<ul>
<li>Elektroinžinjer/elektricar: 3.000–4.500€/mj.</li>
<li>Vodoinstalater: 2.800–4.000€/mj.</li>
<li>Klima tehničar: 3.200–4.500€/mj.</li>
<li>CNC operater: 2.600–3.500€/mj.</li>
</ul>

<h2>Gdje tražiti posao</h2>
<ul>
<li>Arbeitsagentur.de — Jobbörse (državni portal)</li>
<li>Indeed.de</li>
<li>LinkedIn — ključno za IT</li>
<li>Stepstone.de</li>
<li>Xing.com — popularan u Njemačkoj</li>
</ul>

<h2>Bez poznavanja njemačkog?</h2>
<p>IT industrija sve više nudi pozicije samo na engleskom. Za zdravstvo, zanat i većinu ostalih — B2 nivo njemačkog je minimum. Investicija u učenje se višestruko isplati.</p>
    `,
  },
  {
    id: "14",
    slug: "povratak-bih-planiranje",
    naslov: "Povratak u BiH — šta gubiš, šta zadržavaš i kako planirati odlazak",
    excerpt: "Odluka o povratku je kompleksna. Evo što se dešava s tvojom vizom, zdravstvenim osiguranjem, penzijom i imovinom kad odeš.",
    kategorija: "penzija",
    datum: "23. juna 2026.",
    minCitanja: 8,
    procitano: 1600,
    sadrzaj: `
<h2>Što se dešava s boravišnom dozvolom</h2>
<p>Ako imaš Niederlassungserlaubnis (trajni boravak) — možeš biti odsutan iz Njemačke do 6 mj. bez gubitka statusa. Za dužu odsutnost možeš tražiti Beibehaltungsgenehmigung (pravo zadržavanja status-a).</p>
<p>Ako imaš privremenu dozvolu — povratak znači gubitak statusa. Vratak bi zahtijevao novu vizu.</p>

<h2>Penzija — što se dešava</h2>
<p>Sve uplaćene godine u Deutschen Rentenversicherung ostaju — nema "gubitka". Možeš ih primiti od 67 god. bez obzira gdje živiš. Uz BiH-DE sporazum, penzija se isplaćuje direktno na BiH račun.</p>

<h2>Zdravstveno osiguranje</h2>
<p>Njemacko zdravstveno osiguranje vrijedi samo u Njemačkoj. Po povratku u BiH miraš se prijaviti u ZZOIR BiH. Ako planiraš povratak, savjetujemo zadržati njemački osigurani status dok god je moguće.</p>

<h2>Imovina i oporezivanje</h2>
<p>Ako imaš nekretninu u Njemačkoj, možeš je zadržati ili prodati. Prihodi od najma i kapitalnih dobitaka se oporezuju u Njemačkoj. Porez na dohodak od BiH aktivnosti prijavit ćeš u BiH.</p>

<h2>Financijsko planiranje za povratak</h2>
<ul>
<li>Otvori BiH bankovni račun 6+ mj. prije povratka</li>
<li>Prenesi stednju postupno (izbjegni kursne gubitke)</li>
<li>Provjeri sa DRV pitanje penzije i moguće prijevremene isplate</li>
<li>Obavijesti Finanzamt o promjeni rezidentnosti (Abmeldung)</li>
<li>Otkaži pretplate, osiguranja, račune</li>
</ul>

<h2>Psihološka strana povratka</h2>
<p>"Reverse culture shock" je realna pojava. Bosanci koji se vrate nakon 10+ godina često su iznenađeni koliko se zemlja promjenila — i koliko su se oni sami promjenili. Planiraj prijelazni period od minimalno 6 mj. adaptacije.</p>
    `,
  },
  {
    id: "15",
    slug: "minimalna-placa-njemacka-2026",
    naslov: "Minimalna plaća u Njemačkoj raste na 13.50€/sat od 2026",
    excerpt: "Gesetzlicher Mindestlohn se ponovo povećava. Evo što to znači za radnike u maloprodaji, ugostiteljstvu i dostavi.",
    kategorija: "posao",
    datum: "28. juna 2026.",
    minCitanja: 3,
    procitano: 1400,
    sadrzaj: `
<h2>Nova minimalna plaća</h2>
<p>Od 1. januara 2026. zakonska minimalna plaća (gesetzlicher Mindestlohn) iznosi <strong>13.50€/sat</strong>. Povećanje od 5.5% u odnosu na prethodnu godinu.</p>

<h2>Koliko to iznosi na månadu?</h2>
<p>Pri 40h/sedmici rad:</p>
<ul>
<li>Bruto: ~2.340€/mj.</li>
<li>Neto (Steuerklasse I): ~1.560€/mj.</li>
<li>Neto (Steuerklasse III): ~1.800€/mj.</li>
</ul>

<h2>Kojih sektora se tiče</h2>
<p>Minimum vrijedi za sve sektore bez granskog sporazuma (Tarifvertrag). Posebno relevantno za: ugostiteljstvo, maloprodaju, dostavu, čišćenje, sezonski rad u poljoprivredi.</p>

<h2>Mini Job limit raste</h2>
<p>Mini Job (538€ limit) se automatski prilagodio na <strong>556€/mj.</strong> — iznos koji odgovara 10-satnom tjednom radu na minimalnoj plaći.</p>

<h2>Što ako poslodavac plaća manje</h2>
<p>Zollbehörde (carina) vrši inspekcije. Ako ti se dešava — pravi zapisnik, kontaktiraj Zoll ili Gewerbeaufsichtsamt. Zaštita od otkaza za prijavljivanje je zakonski garantovana.</p>
    `,
  },
];

export function getClanak(slug: string): ClanakData | undefined {
  return clanci.find((c) => c.slug === slug);
}

export function getClanciByKategorija(kategorija: string): ClanakData[] {
  if (kategorija === "sve") return clanci;
  return clanci.filter((c) => c.kategorija === kategorija);
}

export function getPopularneClanci(limit = 5): ClanakData[] {
  return [...clanci].sort((a, b) => b.procitano - a.procitano).slice(0, limit);
}

export function getNajnovijeClanci(limit = 6): ClanakData[] {
  return clanci.slice(0, limit);
}
