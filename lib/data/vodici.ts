export interface KorakVodica {
  broj: number;
  naslov: string;
  opis: string;
  savjet?: string;
}

export interface VodicData {
  id: string;
  slug: string;
  naziv: string;
  opis: string;
  ikona: string;
  koraci: KorakVodica[];
  kategorija: string;
  minCitanja: number;
  tagovi?: string[];
}

export const vodici: VodicData[] = [
  {
    id: "1",
    slug: "radna-viza-njemacka",
    naziv: "Radna viza za Njemačku",
    opis: "Od ugovora o radu do prvog dana na poslu — kompletan vodič korak po korak",
    ikona: "📋",
    kategorija: "viza",
    minCitanja: 15,
    tagovi: ["viza", "Fachkräfte", "Anerkennung"],
    koraci: [
      {
        broj: 1,
        naslov: "Pronađi posao",
        opis: "Aplicirati na njemacke portale: Indeed.de, Stepstone.de, LinkedIn. Poslodavac mora potpisati Arbeitsvertrag (ugovor o radu) koji ćeš ponijeti uz vizu.",
        savjet: "Mnogi BiH IT stručnjaci nalaze posao bez poznavanja njemackog. Za medicinare i tehničare B2 niveau je obavezan.",
      },
      {
        broj: 2,
        naslov: "Provjeri da li treba Anerkennung diplome",
        opis: "Idi na anabin.kmk.org i upišite tvoj fakultet i studij. Ako je regulirano zanimanje (ljekar, inženjer, nastavnik) — Anerkennung je obavezan. Za IT i većinu poslovnih zanimanja nije.",
        savjet: "Anerkennung traje 3-6 mj. Počni odmah čim potpišeš ugovor.",
      },
      {
        broj: 3,
        naslov: "Zakažite termin u Ambasadi",
        opis: "Online rezervacija na antrag.diplo.de za Ambasadu u Sarajevu. Termini su ograničeni — rezerviraj što je moguće ranije.",
        savjet: "Provjeri portal svakih par dana u 8:00 ujutro — termini se otvaraju tada.",
      },
      {
        broj: 4,
        naslov: "Pribavi dokumente",
        opis: "Lista: pasoš (min 6 mj. valjanosti), 2 biometrijske slike, Arbeitsvertrag, diploma i prijevod, potvrda o Anerkanntu (ako je potreban), dokaz o smještaju.",
      },
      {
        broj: 5,
        naslov: "Dođi na termin u Ambasadu",
        opis: "Dođi 15 min ranije. Ponesi originale i kopije svega. Plati konzularnu taksu (~75€). Viza se obično odobrava za 3-6 sedmica.",
        savjet: "Ako nisi siguran u prijevod, naruči ovjereni sudski prijevod (sworn translator).",
      },
      {
        broj: 6,
        naslov: "Dolazak u Njemačku",
        opis: "Čim stigneš, moraš se prijaviti u Einwohnermeldeamt (ured za prijavu) u roku od 14 dana. Bez Anmeldung ne možeš otvoriti bankovni račun ni prijaviti se u Krankenkasse.",
      },
      {
        broj: 7,
        naslov: "Registracija kod Ausländerbehörde",
        opis: "S vizom možeš ući u Njemačku, ali za dugoročni boravak trebaš Aufenthaltstitel. Zakaži termin u Ausländerbehörde svog grada odmah po dolasku.",
      },
      {
        broj: 8,
        naslov: "Krankenkasse (zdravstveno osiguranje)",
        opis: "Odaberi javnu blagajnu (Techniker Krankenkasse, AOK, Barmer...) i prijavi se. Poslodavac automatski uplaćuje doprinos — tvoj dio se oduzima iz plaće.",
      },
      {
        broj: 9,
        naslov: "Otvori bankovni račun",
        opis: "S Anmeldebestätigung možeš otvoriti nalog u banci. N26 i DKB nude online otvaranje bez filijale. ING je popularan za dijasporu zbog besplatnih usluga.",
        savjet: "N26 ili Commerzbank su dobri za početak. Izbjegavaj Deutsche Bank za početak — visoke naknade.",
      },
    ],
  },
  {
    id: "2",
    slug: "krankenkasse",
    naziv: "Krankenkasse — kako se prijaviti",
    opis: "Javno ili privatno zdravstveno osiguranje, ko može biti suosiguran, kako promijeniti blagajnu",
    ikona: "🏥",
    kategorija: "zdravstvo",
    minCitanja: 8,
    tagovi: ["zdravstvo", "osiguranje", "Krankenkasse"],
    koraci: [
      {
        broj: 1,
        naslov: "Odaberi između javnog i privatnog",
        opis: "Do 66.600€ godišnje bruto — moraš biti u javnoj blagajni (gesetzliche KV). Iznad toga možeš birati. Privatno je jeftinije za mlade ali skuplje za starije i porodice.",
        savjet: "Za porodice s djecom javno je gotovo uvijek bolje — djeca su besplatno osigurana.",
      },
      {
        broj: 2,
        naslov: "Odaberi javnu blagajnu",
        opis: "Usporedi Zusatzbeitrag (dodatni doprinos). TK i Barmer imaju odlične digitalne usluge. HKK i BKK su jeftinije. AOK je dobra za lokalne usluge.",
      },
      {
        broj: 3,
        naslov: "Prijavi se online ili u filijali",
        opis: "Popuni prijavu na web stranici odabrane blagajne. Trebaš: Anmeldebestätigung, Lohnsteuerbescheinigung (od poslodavca), pasoš.",
      },
      {
        broj: 4,
        naslov: "Obavijesti poslodavca",
        opis: "Daj poslodavcu naziv i broj blagajne. Oni automatski prijavljuju tebe i uplaćuju doprinos (half/half podjela).",
      },
      {
        broj: 5,
        naslov: "Prijavi članove porodice",
        opis: "Suprug/a i djeca bez vlastitih prihoda (do 505€/mj.) mogu biti besplatno suosigurani (Familienversicherung). Donesi rodni list i vjenčani list.",
      },
    ],
  },
  {
    id: "3",
    slug: "trudnoca-njemacka",
    naziv: "Trudnoća u Njemačkoj",
    opis: "Mutterschutz, Elterngeld, Kindergeld — sve naknade i prava za roditelje",
    ikona: "👶",
    kategorija: "porodica",
    minCitanja: 12,
    tagovi: ["porodica", "Elterngeld", "Kindergeld", "Mutterschutz"],
    koraci: [
      {
        broj: 1,
        naslov: "Prijavi trudnoću ljekar i poslodavcu",
        opis: "Čim saznaš za trudnoću idi kod Frauenarzt-a (ginekolog). On izdaje Mutterpass — knjižicu trudnoće. Poslodavca obavijesti što je ranije moguće.",
      },
      {
        broj: 2,
        naslov: "Mutterschutz — zaštita na poslu",
        opis: "Od 6 sedmica prije termina i 8 sedmica poslije poroda nisi obavezna raditi. Plaća se isplaćuje u punom iznosu (kombinacija poslodavca i blagajne). Nikakav otkaz za to vrijeme nije moguć.",
        savjet: "Mutterschutzfrist je zakonski garantovana — čak i ako ne uzmeš Elterngeld.",
      },
      {
        broj: 3,
        naslov: "Prijavi se za Elterngeld odmah",
        opis: "Aplicirati za Elterngeld u Elterngeldstelle tvog grada. Retroaktivno se odobrava samo za 3 mj. — ne čekaj! Iznos: 67-100% neto plaće, min 300€, maks 1.800€/mj.",
      },
      {
        broj: 4,
        naslov: "Prijavi dijete za Kindergeld",
        opis: "U roku od 6 mj. od poroda prijavi se u Familienkasse. Iznos 2026: 255€/mj. Dijete ne mora živjeti u Njemačkoj ako je u BiH (bilateralni sporazum).",
      },
      {
        broj: 5,
        naslov: "Dođi na Vorsorgeuntersuchungen",
        opis: "Obavezni prenatalni pregledi (U1-U9) su besplatni kroz Krankenkasse. Ovo je dio zdravstvene zaštite djeteta.",
      },
      {
        broj: 6,
        naslov: "Upis djeteta u Kindergarten",
        opis: "Svako dijete od 1 god. ima pravo na mjesto u vrtiću (Rechtsanspruch). Prijavi dijete čim saznaš za trudnoću — liste čekanja su duge u gradovima.",
        savjet: "U Münchenu i Berlinu prijavi dijete na listu čekanja što je moguće ranije — ponekad i prije poroda.",
      },
      {
        broj: 7,
        naslov: "Baukindergeld i ostali bonusi",
        opis: "Ako kupuješ nekretninu s djecom, možeš aplicirati za Baukindergeld. Neke savezne zemlje imaju dodatne porodične naknade. Provjeri portale deines Bundeslandes.",
      },
    ],
  },
  {
    id: "4",
    slug: "pronalazak-stana",
    naziv: "Pronalazak stana u Njemačkoj",
    opis: "Schufa, Mietvertrag, prava stanara — od pretrage do useljenja",
    ikona: "🏠",
    kategorija: "stan",
    minCitanja: 10,
    tagovi: ["stan", "Mietvertrag", "Schufa", "Kaution"],
    koraci: [
      {
        broj: 1,
        naslov: "Pripremi Schufa-Auskunft",
        opis: "Zatraži besplatni Schufa izvještaj jednom godišnje na meineschufa.de. Ako nemaš historiju — to je OK, ali budi spreman objasniti da si novi u Njemačkoj.",
        savjet: "Bez Schufe ponudi veći depozit (2-3 neto najamnine) ili garancijsko pismo.",
      },
      {
        broj: 2,
        naslov: "Pripremi Bewerbungsmappe",
        opis: "Folder s: kratkim životopisom, potvrdom o zaposlenju, 3 posljednja platna lista, kopija pasoša, referentno pismo prethodnog stanodavca (i BiH je OK), motivacijsko pismo.",
      },
      {
        broj: 3,
        naslov: "Pretraži portale",
        opis: "ImmoScout24.de, Immowelt.de, Ebay Kleinanzeigen. Za sobe: WG-Gesucht.de. Postavi alert za nove oglase — reagiraj u roku od sata od objave.",
        savjet: "Što ranije ujutro, to bolje — vlasnici provjere oglase jutrom.",
      },
      {
        broj: 4,
        naslov: "Idite na Besichtigungen",
        opis: "Razgledi stanova su grupni — 10-20 kandidata istovremeno. Budi profesionalan, ljubazan i spreman odmah predati Bewerbungsmappe.",
      },
      {
        broj: 5,
        naslov: "Provjeri Mietvertrag",
        opis: "Pažljivo pročitaj ugovor. Obrati pažnju na: trajanje, uvjete otkaza (obično 3 mj.), Nebenkosten (troškovi), klauzule o Schönheitsreparaturen (bojenje).",
      },
      {
        broj: 6,
        naslov: "Plati Kaution i potpiši ugovor",
        opis: "Maksimalni depozit je 3 neto najamnine. Prenesi na poseban bankovni račun (zatraži potvrdu). Stanodavac ne smije koristiti ovaj novac.",
      },
    ],
  },
  {
    id: "5",
    slug: "povrat-poreza",
    naziv: "Povrat poreza (Steuererklärung)",
    opis: "Kako dobiti natrag novac od njemacke države svake godine",
    ikona: "💰",
    kategorija: "porez",
    minCitanja: 7,
    tagovi: ["porez", "Steuererklärung", "ELSTER", "Finanzamt"],
    koraci: [
      {
        broj: 1,
        naslov: "Da li si dužan podnijeti prijavu?",
        opis: "Obavezan si ako: imaš prihode iz više izvora, tražiš beneficije, ili Finanzamt pošalje poziv. Ako nisi obavezan, možeš dobrovoljno podnijeti — i obično dobiješ povrat.",
        savjet: "Prosječan povrat poreza za zaposlene u Njemačkoj je ~1.000€/godišnje. Vrijedi aplicirati!",
      },
      {
        broj: 2,
        naslov: "Prikupi dokumente",
        opis: "Trebaš: Lohnsteuerbescheinigung od poslodavca (stiže u januaru), Spendenquittungen (donacije), računi za Handwerker (majstore), dokazi o Werbungskosten (troškovi rada).",
      },
      {
        broj: 3,
        naslov: "Popuni preko ELSTER ili app-a",
        opis: "ELSTER.de je besplatni državni portal. Alternativa: Wundertax, SteuerGo, Taxfix (plaćene apps oko 35€ ali jednostavnije). Smartsteuer je dobar za kompleksnije situacije.",
      },
      {
        broj: 4,
        naslov: "Što možeš odbiti",
        opis: "Werbungskosten (troškovi zaposlenja): prijevoz do posla, radna odjeća, školovanje. Sonderausgaben: doprinosi, osiguranja. Außergewöhnliche Belastungen: medicinski troškovi. Homeoffice paušal (6€/dan, maks 210 dana).",
      },
    ],
  },
  {
    id: "6",
    slug: "povratak-bih",
    naziv: "Povratak u BiH",
    opis: "Šta gubiš, šta zadržavaš, kako planirati povratak iz Njemačke",
    ikona: "✈️",
    kategorija: "penzija",
    minCitanja: 14,
    tagovi: ["povratak", "penzija", "Niederlassungserlaubnis"],
    koraci: [
      {
        broj: 1,
        naslov: "Provjeri status boravišne dozvole",
        opis: "Niederlassungserlaubnis (trajni boravak) dozvoljava odsutnost do 6 mj. bez gubitka. Za dulje odsutnosti traži Beibehaltungsgenehmigung — može se dobiti za do 2 godine.",
      },
      {
        broj: 2,
        naslov: "Razgovaraj s Deutsche Rentenversicherung",
        opis: "Sve uplaćene godine ostaju. Penzija se isplaćuje u BiH putem internationale Überweisung. Zatraži Rentenauskunft (informaciju o očekivanoj penziji) na drv.de.",
      },
      {
        broj: 3,
        naslov: "Finansijsko planiranje",
        opis: "Otvori BiH bankovni račun 6+ mj. ranije. Prenosi štednju postupno da izbjegneš kursne gubitke. Razmisli o deviznim računima u EUR za fleksibilnost.",
      },
      {
        broj: 4,
        naslov: "Imovina i nekretnine",
        opis: "Ako imaš nekretninu u Njemačkoj — možeš je prodati ili iznajmiti. Porezi na prihode od najma prijavljuju se Finanzamt-u čak i kad živiš u BiH.",
      },
      {
        broj: 5,
        naslov: "Abmeldung — odjava adrese",
        opis: "Odjavi se iz Einwohnermeldeamt-a (Abmeldung) najkasnije dan prije odlaska ili nedelju dana nakon. Ovo je važno za poreze i administrativne obaveze.",
      },
      {
        broj: 6,
        naslov: "Zdravstveno osiguranje u prijelaznom periodu",
        opis: "Europ Assistance ili AXA Travel nudi kratkoročno pokriće za prijelazni period. Potom se prijavi u ZZOIR BiH.",
      },
      {
        broj: 7,
        naslov: "Psihološka priprema",
        opis: 'Reverse culture shock je realan. Bosanci koji se vrate nakon 10+ g. prolaze period prilagodbe. Povežite se s lokalnim zajednicama, ne izolujte se.',
        savjet: "Planiraj 6 mj. adapatcije. Imaš vrijedna iskustva i vještine iz Njemačke — to je prednost na BiH tržištu rada.",
      },
      {
        broj: 8,
        naslov: "Biznis mogućnosti po povratku",
        opis: "Dijaspora donosi kapital, međunarodna iskustva i mrežu kontakata. Sektor IT, turizma i ugostiteljstva u BiH traži upravo takve ljude. Razgovaraj s USAID, GIZ i sličnim organizacijama o startup podršci.",
      },
    ],
  },
  {
    id: "7",
    slug: "prijavljivanje-adrese",
    naziv: "Anmeldung — prijava adrese u Njemačkoj",
    opis: "Sve što trebaš znati o prvoj obavezi u Njemačkoj — prijavi mjesta stanovanja",
    ikona: "🏛️",
    kategorija: "viza",
    minCitanja: 5,
    tagovi: ["viza", "Anmeldung", "Einwohnermeldeamt"],
    koraci: [
      {
        broj: 1,
        naslov: "Zašto je Anmeldung obavezan",
        opis: "Bez Anmeldebestätigung (potvrde o prijavi) ne možeš otvoriti bankovni račun, prijaviti se u Krankenkasse, aplikirati za Kindergeld, ili dobiti Steuer-ID.",
      },
      {
        broj: 2,
        naslov: "Zakažite termin ili dođite bez termina",
        opis: "Većina gradova zahtijeva termin (online zakazivanje). Neki gradovi (manji) primaju bez termina. Berlin ima izrazito duga čekanja — zakažite odmah po dolasku.",
      },
      {
        broj: 3,
        naslov: "Donesi Wohnungsgeberbestätigung",
        opis: "Stanodavac mora potpisati Wohnungsgeberbestätigung (potvrda o smještaju). Ovo je obavezno od 2015. Bez toga Anmeldung nije moguć.",
        savjet: "Ako stanuješ kod prijatelja/porodice, oni moraju potpisati ovaj dokument.",
      },
      {
        broj: 4,
        naslov: "Dođi na Einwohnermeldeamt",
        opis: "Ponesi: pasoš, ispunjeni Anmeldeformular (može se preuzeti online), Wohnungsgeberbestätigung. Usluga je besplatna.",
      },
      {
        broj: 5,
        naslov: "Dobij Anmeldebestätigung",
        opis: "Odmah dobivaš potvrdu. Sačuvaj je — trebaš je za sve daljnje administrativne postupke. Porezni broj (Steuer-ID) stiže poštom za 2-3 sedmice.",
      },
    ],
  },
  {
    id: "8",
    slug: "njemacki-jezik-ucenje",
    naziv: "Kako naučiti njemački do B2 nivoa",
    opis: "Praktičan plan za učenje njemackog od nule do radne sposobnosti",
    ikona: "🇩🇪",
    kategorija: "posao",
    minCitanja: 9,
    tagovi: ["njemacki", "jezik", "integracija"],
    koraci: [
      {
        broj: 1,
        naslov: "Procijeni gdje si sada",
        opis: "Uradi besplatni test na goethe.de ili deutsch-test.de. Ovo ti pokazuje polaznu tačku i koliko vremena trebas do cilja.",
      },
      {
        broj: 2,
        naslov: "Integrationskurs — subvencionirani tečaj",
        opis: "Ako tek dođeš u Njemačku, imaš pravo na Integrationskurs (A1-B1) po cijeni od 1.95€/satu. BAMF plaća ostatak. Prijavi se odmah u BAMF ili direktno u jezičnu školu.",
        savjet: "Integrationskurs ti je besplatan ili skoro besplatan — nema razloga ga ne koristiti.",
      },
      {
        broj: 3,
        naslov: "Online platforme za svakodnevnu vježbu",
        opis: "Duolingo za svakodnevnih 15 min (zabavno ali nije dovoljno samo). Anki za kartice s rječnikom. Deutsche Welle Deutsch Lernen — besplatno i odlično. Babbel za strukturirani pristup.",
      },
      {
        broj: 4,
        naslov: "Gledaj TV i čitaj njemacki",
        opis: "ARD Mediathek, ZDF i DW nude besplatni sadržaj. Čitaj Der Spiegel ili Süddeutsche Zeitung. Postavi telefon na njemacki. Svaki kontakt s jezikom je učenje.",
      },
      {
        broj: 5,
        naslov: "Govori s Nijemcima",
        opis: "Tandem partneri (tandem-app.com), Meetup jezični eventi, Volkshochschule konverzacijske grupe. Nikad se ne stidjeti greška — svi prolaze kroz to.",
        savjet: "Bosanci imaju prednost — naš mozak je naviknut na komplikovanu gramatiku. Njemacka gramatika je teža ali dostižna.",
      },
      {
        broj: 6,
        naslov: "Položi Goethe Zertifikat",
        opis: "Ispit na goethe.de. Goethe B2 je zlatni standard za posao. Koštа 170-220€ ali je investicija koja se višestruko isplati.",
      },
    ],
  },
  {
    id: "11",
    slug: "chancenkarte",
    naziv: "Chancenkarte — dođi bez ponude posla",
    opis: "Karta prilike: dođi u Njemačku i traži posao do godinu dana. Sistem bodova objašnjen.",
    ikona: "🎯",
    kategorija: "viza",
    minCitanja: 10,
    tagovi: ["viza", "Chancenkarte", "traženje posla"],
    koraci: [
      {
        broj: 1,
        naslov: "Provjeri osnovne uslove",
        opis: "Trebaš: (1) fakultetsku diplomu ILI najmanje 2 godine stručnog obrazovanja priznatog u BiH, (2) engleski B2 ILI njemački A1, i (3) dokaz sredstava za život — u 2026. oko 1.091€ mjesečno (blokirani račun / Sperrkonto ~13.092€ godišnje) ili dozvola za rad do 20 sati sedmično.",
        savjet: "Ako ispunjavaš uslove Plave karte ili radne vize — njih je lakše. Chancenkarte je za one koji još nemaju ponudu posla.",
      },
      {
        broj: 2,
        naslov: "Izračunaj svoje bodove (treba 6+)",
        opis: "Bodovi (2026): kvalifikacija djelimično priznata u Njemačkoj = 4 · deficitarno zanimanje (IT, zdravstvo, tehnika) = 1 · iskustvo 2 god (u zadnjih 5) = 2, ili 5 god (u zadnjih 7) = 3 · njemački A2 = 1, B1 = 2, B2+ = 3 · engleski C1+ = 1 (bonus) · godine ispod 35 = 2, od 35 do 40 = 1 · ranije boravio u Njemačkoj 6+ mj (ne turistički) = 1 · partner/ica ispunjava uslove = 1.",
        savjet: "Primjer: diploma (4) + njemački B1 (2) + ispod 35 (2) = 8 bodova → prolaziš.",
      },
      {
        broj: 3,
        naslov: "Osiguraj dokaz sredstava",
        opis: "Najčešće blokirani račun (Sperrkonto) kod npr. Fintiba, Coracle ili Expatrio. Uplatiš iznos za godinu dana (~13.092€) i podižeš mjesečno po dolasku. Alternativa: dokaz o dijelu posla (20 sati sedmično) ili garant u Njemačkoj (Verpflichtungserklärung).",
      },
      {
        broj: 4,
        naslov: "Zakaži termin u Ambasadi Sarajevo",
        opis: "Rezervacija online preko antrag.diplo.de / digital.diplo.de. Termini su ograničeni — provjeravaj redovno, otvaraju se ujutro.",
        savjet: "Provjeri portal svakih par dana rano ujutro — termini brzo nestanu.",
      },
      {
        broj: 5,
        naslov: "Pripremi dokumente",
        opis: "Pasoš (min 6 mj valjanosti), diploma + ovjereni prijevod, dokaz jezika (Goethe/telc certifikat ili engleski), dokaz sredstava (Sperrkonto potvrda), CV, popunjen obrazac, biometrijske slike.",
      },
      {
        broj: 6,
        naslov: "Dolazak i traženje posla",
        opis: "Chancenkarte vrijedi do 1 godinu za traženje posla. Smiješ probno raditi i honorarno do 20 sati sedmično. Čim nađeš stalni posao, prelaziš na radnu vizu ili Plavu kartu (bez izlaska iz Njemačke).",
        savjet: "Prvo Anmeldung (prijava adrese) u roku 14 dana, pa Krankenkasse i bankovni račun.",
      },
    ],
  },
  {
    id: "12",
    slug: "eu-plava-karta",
    naziv: "EU Plava karta (Blue Card)",
    opis: "Najbrži put za visokokvalificirane s diplomom i ponudom posla — i brz stalni boravak.",
    ikona: "🔵",
    kategorija: "viza",
    minCitanja: 9,
    tagovi: ["viza", "Blue Card", "Fachkräfte"],
    koraci: [
      {
        broj: 1,
        naslov: "Provjeri uslove",
        opis: "Trebaš: priznatu fakultetsku diplomu (ili u nekim IT slučajevima dokazano iskustvo) i konkretnu ponudu posla u struci u Njemačkoj. Plava karta je vezana za taj posao.",
      },
      {
        broj: 2,
        naslov: "Provjeri da plata dostiže prag (2026)",
        opis: "U 2026. minimalna bruto plata je 50.700€ godišnje (4.225€ mjesečno). Za deficitarna zanimanja (Engpassberufe) i za one kojima je diploma mlađa od 3 godine, prag je niži: 45.934,20€ godišnje (3.827,85€ mjesečno).",
        savjet: "Deficitarna zanimanja uključuju IT, inženjere, ljekare, medicinsko osoblje, prirodne nauke, matematiku.",
      },
      {
        broj: 3,
        naslov: "Anerkennung diplome (ako treba)",
        opis: "Provjeri diplomu na anabin.kmk.org. Za regulirana zanimanja (ljekar, inženjer) treba priznavanje. Za IT i mnoga poslovna zanimanja nije obavezno ako imaš odgovarajuću ponudu i platu.",
      },
      {
        broj: 4,
        naslov: "Zakaži termin i apliciraj",
        opis: "Aplikacija preko digital.diplo.de/Blaue-Karte ili termin u Ambasadi u Sarajevu. Poslodavac ti šalje ugovor koji nosiš uz aplikaciju.",
      },
      {
        broj: 5,
        naslov: "Pripremi dokumente",
        opis: "Pasoš, ugovor o radu, diploma + ovjereni prijevod, potvrda o Anerkanntu (ako je potrebna), biometrijske slike, popunjen obrazac, dokaz zdravstvenog osiguranja.",
      },
      {
        broj: 6,
        naslov: "Prednosti Plave karte",
        opis: "Brz stalni boravak: Niederlassungserlaubnis već za 27 mjeseci, a sa njemačkim B1 za samo 21 mjesec. Lakše spajanje porodice (partner ne mora znati njemački), i lakša mobilnost unutar EU.",
        savjet: "Zato je Plava karta najbolja opcija ako ispunjavaš uslove — vodi najbrže do trajnog statusa.",
      },
    ],
  },
  {
    id: "13",
    slug: "westbalkan-regulacija",
    naziv: "Westbalkan regulacija — rad BEZ diplome",
    opis: "Poseban put samo za Balkance: radi u Njemačkoj bez fakultета — treba samo ponuda posla.",
    ikona: "🇧🇦",
    kategorija: "viza",
    minCitanja: 9,
    tagovi: ["viza", "Westbalkan", "posao"],
    koraci: [
      {
        broj: 1,
        naslov: "Šta je Westbalkan regulacija",
        opis: "Poseban propis za državljane BiH (i Srbije, Kosova, Crne Gore, Sj. Makedonije, Albanije). NE treba ti fakultet ni priznata kvalifikacija — dovoljna je konkretna ponuda posla u BILO KOJEM zanimanju. Od 2023. je trajna, a kvota je od 2024. podignuta na 50.000 viza godišnje.",
        savjet: "Ovo je najpristupačniji put za većinu Bosanaca — građevina, ugostiteljstvo, transport, njega, proizvodnja...",
      },
      {
        broj: 2,
        naslov: "Nađi poslodavca u Njemačkoj",
        opis: "Ponuda posla je ključna. Traži na Indeed.de, Stepstone.de, ili preko agencija specijaliziranih za Balkan. Poslodavac mora ponuditi ugovor pod uslovima kao za domaće radnike (plata, sati).",
      },
      {
        broj: 3,
        naslov: "Poslodavac traži odobrenje (Zustimmung)",
        opis: "Njemački Zavod za rad (Bundesagentur für Arbeit / ZAV) mora dati saglasnost — provjeravaju da su uslovi rada korektni. Ovaj korak pokreće poslodavac, ne ti.",
      },
      {
        broj: 4,
        naslov: "Zakaži termin u Ambasadi Sarajevo",
        opis: "Online preko antrag.diplo.de. Za Westbalkan termini su najtraženiji i brzo se popune — rezerviraj čim imaš ponudu posla.",
        savjet: "Provjeravaj portal rano ujutro. Neki koriste i profesionalne agencije za zakazivanje.",
      },
      {
        broj: 5,
        naslov: "Pripremi dokumente",
        opis: "Pasoš (min 6 mj), ugovor/ponuda posla, Zustimmung od ZAV-a, biometrijske slike, popunjen obrazac, dokaz smještaja (ako se traži), konzularna taksa.",
      },
      {
        broj: 6,
        naslov: "Dolazak u Njemačku",
        opis: "Po dolasku: Anmeldung (prijava adrese) u 14 dana, prijava u Krankenkasse, otvaranje bankovnog računa, i termin u Ausländerbehörde za Aufenthaltstitel (boravišnu dozvolu).",
      },
    ],
  },
  {
    id: "14",
    slug: "spajanje-porodice",
    naziv: "Spajanje porodice (Familienzusammenführung)",
    opis: "Dovedi bračnog partnera i djecu u Njemačku — uslovi, dokumenti i izuzeci od jezika.",
    ikona: "👨‍👩‍👧",
    kategorija: "viza",
    minCitanja: 8,
    tagovi: ["viza", "porodica", "spajanje"],
    koraci: [
      {
        broj: 1,
        naslov: "Ko može doći",
        opis: "Bračni/registrovani partner i maloljetna djeca (do 18) osobe koja u Njemačkoj ima radnu vizu, Plavu kartu ili boravišnu dozvolu. Cilj je zajednički život u Njemačkoj.",
      },
      {
        broj: 2,
        naslov: "Osnovni uslovi",
        opis: "Osoba u Njemačkoj mora imati dovoljan prihod i dovoljno velik stan za porodicu. Bračni partner obično mora dokazati osnovno znanje njemačkog (A1) prije dolaska.",
        savjet: "Bitni izuzeci od A1: partneri nosilaca Plave karte i visokokvalificiranih često NE moraju znati njemački. Provjeri svoj slučaj.",
      },
      {
        broj: 3,
        naslov: "Pripremi dokumente",
        opis: "Vjenčani list (internacionalni oblik ili s apostille i ovjerenim prijevodom), rodni listovi djece, pasoši, A1 certifikat (ako se traži), dokaz o prihodu i stanu osobe u Njemačkoj, dokaz zdravstvenog osiguranja.",
        savjet: "Vjenčani i rodni listovi trebaju biti internacionalni ili s apostille — pribavi ih na vrijeme u matičnom uredu.",
      },
      {
        broj: 4,
        naslov: "Zakaži termin u Ambasadi",
        opis: "Aplikaciju za vizu spajanja porodice podnosi član porodice u Ambasadi u Sarajevu (antrag.diplo.de). Osoba u Njemačkoj priprema dokaze o prihodu i stanu.",
      },
      {
        broj: 5,
        naslov: "Dolazak i boravak",
        opis: "Po dolasku član porodice radi Anmeldung i traži boravišnu dozvolu u Ausländerbehörde. Bračni partner obično dobija i pravo na rad.",
        savjet: "Uslovi se razlikuju po statusu osobe u Njemačkoj — uvijek provjeri konkretno na stranici Ambasade prije zakazivanja.",
      },
    ],
  },
];

export function getVodic(slug: string): VodicData | undefined {
  return vodici.find((v) => v.slug === slug);
}

export function getAllVodici(): VodicData[] {
  return vodici;
}

export function getVodiciByKategorija(kategorija: string): VodicData[] {
  return vodici.filter((v) => v.kategorija === kategorija);
}
