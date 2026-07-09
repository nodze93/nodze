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
        opis: "Do 77.400€ godišnje bruto (2026. = 6.450€/mj) moraš biti u javnoj blagajni (gesetzliche KV). Tek iznad toga možeš birati privatno. Privatno je jeftinije za mlade samce, ali skuplje za starije i porodice.",
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
        opis: "Suprug/a i djeca bez većih prihoda mogu biti BESPLATNO suosigurani (Familienversicherung). Granica prihoda u 2026: do 565€/mj, ili do 603€/mj ako je riječ o mini-jobu. Donesi rodni list i vjenčani list.",
        savjet: "Hack: ako partner mora nešto zaraditi, neka to bude mini-job (do 603€) — tako ostaje besplatno suosiguran. Isti iznos preko 'običnog' posla bi prekinuo besplatno osiguranje.",
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
        opis: "Aplicirati za Elterngeld u Elterngeldstelle tvog grada. Retroaktivno se odobrava samo za 3 mj. — ne čekaj! Iznos: 65-100% neto plaće, min 300€, maks 1.800€/mj. Pažnja: od aprila 2025. nema Elterngeld-a ako je oporezivi prihod (par ili samac) preko 175.000€ godišnje.",
        savjet: "Hack: granica se gleda po oporezivom prihodu godine PRIJE poroda — uplate u penziono (Rürup/Riester) i priznati troškovi mogu te spustiti ispod 175.000€ i sačuvati pravo.",
      },
      {
        broj: 4,
        naslov: "Prijavi dijete za Kindergeld",
        opis: "U roku od 6 mj. od poroda prijavi se u Familienkasse. Iznos od januara 2026: 259€/mj po djetetu. Ako dijete živi s tobom u Njemačkoj — dobijaš pun iznos. Za dijete koje živi u BiH pravila su posebna: puni njemački Kindergeld se NE isplaćuje, već po sporazumu samo mali iznos i samo ako si zaposlen s obaveznim osiguranjem — obavezno provjeri sa Familienkasse.",
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
        opis: "Maksimalni depozit je 3 neto najamnine (hladna kirija, bez režija). Prenesi na poseban bankovni račun (zatraži potvrdu). Stanodavac ne smije koristiti ovaj novac.",
        savjet: "Hack: po zakonu imaš pravo platiti kauciju u 3 mjesečne rate — ne treba ti dozvola stanodavca. Ako nemaš keš, postoji i Mietkautionsbürgschaft (jemstvo) pa ne zamrzavaš pare, ali ima godišnju naknadu.",
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
        opis: "Werbungskosten (troškovi zaposlenja): prijevoz do posla, radna odjeća, školovanje. Sonderausgaben: doprinosi, osiguranja. Außergewöhnliche Belastungen: medicinski troškovi. Homeoffice paušal (6€/dan, maks 210 dana = 1.260€).",
        savjet: "Hack: prvih 1.230€ troškova rada (Arbeitnehmer-Pauschbetrag) priznaje ti se AUTOMATSKI — sabiraj stvarne troškove samo ako prelaze taj iznos. I od 2023. za isti dan smiješ prijaviti i homeoffice paušal i kilometražu do posla (Pendlerpauschale).",
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
        opis: "Niederlassungserlaubnis (trajni boravak) po pravilu istekne nakon 6 mjeseci provedenih u inostranstvu. Za dužu odsutnost PRIJE odlaska u Ausländerbehörde zatraži produženi rok za povratak (nema fiksnih 2 godine — odlučuje služba). Izuzetak: ako si zakonito živio u Njemačkoj 15+ godina uz sigurna primanja, boravak ti ne istekne ni uz dužu odsutnost.",
        savjet: "Hack: prije dužeg puta uzmi pisanu potvrdu 'Bescheinigung über das Nichterlöschen des Aufenthaltstitels' ili produženi rok — jeftino osiguranje da ne izgubiš status. (Beibehaltungsgenehmigung je nešto drugo — to je za zadržavanje njemačkog DRŽAVLJANSTVA.)",
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
        opis: "Većina gradova zahtijeva termin (online zakazivanje). Neki manji gradovi primaju bez termina. Berlin ima izrazito duga čekanja — zakažite odmah po dolasku.",
        savjet: "Hack: termini se oslobađaju rano ujutro i kad neko otkaže — osvježavaj portal u 7-8h i tokom dana. U velikim gradovima probaj i Bürgeramt u susjednoj četvrti/mjestu; nadležan je bilo koji ured u gradu, ne samo onaj najbliži.",
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
        opis: "Ako tek dođeš u Njemačku, imaš pravo na Integrationskurs (A1-B1) po cijeni od 2.29€ po nastavnom satu. BAMF plaća ostatak. Prijavi se odmah u BAMF ili direktno u jezičnu školu.",
        savjet: "Hack: ako primaš Bürgergeld ili imaš niska primanja, možeš tražiti oslobađanje od plaćanja (Kostenbefreiung) — kurs ti je onda potpuno besplatan. A ako završiš kurs u roku od 2 godine, vraća ti se 50% onoga što si platio.",
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
        opis: "Ispit je zlatni standard za posao. Goethe B2 danas košta oko 289€. Isti priznati B2 nivo je jeftiniji preko telc-a ili Volkshochschule (VHS) — obično 150-200€, a vrijedi jednako za boravak i državljanstvo.",
        savjet: "Hack: ako padneš samo jedan dio (modul), ne moraš ponovo cijeli ispit — prijavi i plati samo taj jedan modul.",
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
        opis: "Bodovi (2026): kvalifikacija djelimično priznata u Njemačkoj = 4 · deficitarno zanimanje (IT, zdravstvo, tehnika) = 1 · iskustvo 2 god (u zadnjih 5) = 2, ili 3 god (u zadnjih 7) = 3 · njemački A2 = 1, B1 = 2, B2+ = 3 · engleski C1+ = 1 (bonus) · godine ispod 35 = 2, od 35 do 40 = 1 · ranije boravio u Njemačkoj 6+ mj (ne turistički) = 1 · partner/ica ispunjava uslove = 1.",
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
        savjet: "Ovo je najpristupačniji put za većinu Bosanaca — građevina, ugostiteljstvo, transport, njega, proizvodnja... Hack: godišnja kvota (50.000) se brzo popuni, a najavljeno je i moguće smanjenje — apliciraj što ranije u godini, čim imaš ponudu posla.",
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
  {
    id: "15",
    slug: "zamjena-vozacke-njemacka",
    naziv: "Zamjena bosanske vozačke za njemačku",
    opis: "Za auto i motor NEMA ispita — samo papiri. Rok je 6 mjeseci od prijave prebivališta. Evo koraka.",
    ikona: "🚗",
    kategorija: "gastarbajter",
    minCitanja: 8,
    tagovi: ["vozačka", "Führerschein", "Umschreibung"],
    koraci: [
      {
        broj: 1,
        naslov: "Rok od 6 mjeseci je za VOŽNJU (ne za samu zamjenu)",
        opis: "Bitno da se razumije: sa bosanskom vozačkom smiješ voziti u Njemačkoj najviše 6 mjeseci od prijave prebivališta (Anmeldung). Poslije toga NE smiješ voziti dok je ne zamijeniš — vožnja bez važeće dozvole je prekršaj s visokom kaznom. Samu zamjenu (Umschreibung) možeš pokrenuti i kasnije, ali dok je ne završiš ne smiješ za volan.",
        savjet: "Hack: predaj zahtjev za zamjenu još unutar prvih 6 mjeseci (uz prijevod i Meldebescheinigung) — tako nikad ne ostaneš bez prava na vožnju dok se obrađuje. Pazi samo da ti bosanska vozačka ne istekne prije zamjene: mora biti važeća kad predaješ zahtjev.",
      },
      {
        broj: 2,
        naslov: "Dobra vijest: za auto i motor NEMA ispita",
        opis: "BiH je na posebnoj listi (Anlage 11), pa za kategorije B (auto), A i A1 (motor) po pravilu NE moraš polagati ni teoriju ni vožnju — samo predaš papire. Za kamione i autobuse (C, D) potrebni su ispiti i ljekarski nalazi.",
        savjet: "Ovo je velika prednost bosanske vozačke u odnosu na mnoge druge zemlje — samo je iskoristi na vrijeme.",
      },
      {
        broj: 3,
        naslov: "Ovjereni prijevod vozačke",
        opis: "Treba ti zvanični prijevod i klasifikacija tvoje vozačke. Najjednostavnije preko ADAC-a ili sudskog tumača (otprilike 40–60€). Do same zamjene, ovaj prijevod MORAŠ nositi uz vozačku da bi ona uopšte važila u Njemačkoj.",
      },
      {
        broj: 4,
        naslov: "Test vida (Sehtest)",
        opis: "Kratak pregled vida u bilo kojoj optici (Optiker) ili kod okuliste. Traje par minuta i košta ispod 10€. Dobiješ potvrdu koju prilažeš uz zahtjev.",
      },
      {
        broj: 5,
        naslov: "Kurs prve pomoći (Erste-Hilfe-Kurs)",
        opis: "Jednodnevni kurs prve pomoći (9 nastavnih sati), otprilike 40–70€. Nude ga Johanniter, DRK, Malteser, ASB i mnoge auto-škole. Isti je kao kad se prvi put vadi vozačka.",
        savjet: "Kurseve ima i vikendom, ponekad i na više jezika — potraži termin blizu kuće da ne gubiš dan.",
      },
      {
        broj: 6,
        naslov: "Prikupi ostale dokumente",
        opis: "Treba ti još: važeća bosanska vozačka (original), pasoš ili lična karta, prijava prebivališta (Anmeldebestätigung) i jedna biometrijska slika (~10€).",
      },
      {
        broj: 7,
        naslov: "Zakaži termin i predaj zahtjev",
        opis: "Zahtjev se predaje u Führerscheinstelle (Fahrerlaubnisbehörde), a u nekim gradovima preko Bürgeramt-a. Zakaži termin online, ponesi sve papire i plati taksu (otprilike 35–45€). Služba zatim provjeri tvoju dozvolu kod izdavaoca u BiH.",
      },
      {
        broj: 8,
        naslov: "Čekanje i preuzimanje",
        opis: "Obrada obično traje 2–6 sedmica (u većim gradovima poput Berlina zna i 2–4 mjeseca). Kad je gotovo, dobiješ njemačku vozačku, a bosanski original zadržava služba (vraća se izdavaocu u BiH).",
        savjet: "Dok čekaš, i dalje smiješ voziti sa starom vozačkom uz prijevod — ako rok od 6 mjeseci nije istekao.",
      },
    ],
  },
  {
    id: "16",
    slug: "priznavanje-diplome-anerkennung",
    naziv: "Priznavanje diplome (Anerkennung)",
    opis: "Kako da tvoja bosanska diploma vrijedi u Njemačkoj — kad je obavezno, gdje se traži i koliko košta.",
    ikona: "🎓",
    kategorija: "posao",
    minCitanja: 11,
    tagovi: ["posao", "Anerkennung", "diploma", "anabin"],
    koraci: [
      {
        broj: 1,
        naslov: "Prvo provjeri da li ti uopšte treba",
        opis: "Zanimanja se dijele na regulisana i neregulisana. Za REGULISANA (ljekar, medicinska sestra/tehničar, apotekar, učitelj, pravnik, dio inženjera) priznavanje je OBAVEZNO — bez njega ne smiješ raditi u struci. Za NEREGULISANA (većina IT-a, ekonomija, marketing, mnogi zanati) možeš raditi i bez priznavanja, ali ono pomaže kod plate i ugleda.",
        savjet: "Ako radiš preko Westbalkan regulacije u zanimanju koje ne traži diplomu — priznavanje ti najčešće ne treba.",
      },
      {
        broj: 2,
        naslov: "Provjeri fakultet na anabin",
        opis: "Za fakultetske diplome idi na anabin.kmk.org i upiši svoj univerzitet i studij. Ako je ocijenjen sa 'H+', diploma se u načelu priznaje. Baza je besplatna i pokazuje kako Njemačka gleda na tvoju ustanovu.",
      },
      {
        broj: 3,
        naslov: "Nađi nadležnu službu (Anerkennungsfinder)",
        opis: "Na zvaničnom portalu anerkennung-in-deutschland.de imaš alat 'Anerkennungsfinder' — upišeš zanimanje i grad, i on ti kaže tačno koja ustanova rješava tvoj slučaj. Različita zanimanja idu na različite adrese.",
      },
      {
        broj: 4,
        naslov: "Univerzitetska diploma bez regulisanog zanimanja → Zeugnisbewertung",
        opis: "Ako samo želiš da tvoja fakultetska diploma bude 'prevedena' u njemački sistem (za poslodavca), zatraži Zeugnisbewertung kod ZAB-a (Zentralstelle für ausländisches Bildungswesen). Košta oko 200€ i dobiješ zvaničnu potvrdu vrijednosti diplome.",
      },
      {
        broj: 5,
        naslov: "Zanat ili stručno zvanje → IHK FOSA / komora",
        opis: "Za zanatska i stručna zvanja (npr. kuhar, električar, automehaničar, komercijalista) nadležne su komore: IHK FOSA za trgovačko-industrijska zanimanja, Handwerkskammer (HWK) za zanate. Oni upoređuju tvoje obrazovanje s njemačkim i izdaju rješenje.",
      },
      {
        broj: 6,
        naslov: "Pripremi dokumente i prijevode",
        opis: "Obično treba: diploma i dodatak diplomi, svjedočanstva, dokaz o radnom iskustvu, pasoš i ovjereni prijevodi na njemački (sudski tumač). Trošak samog postupka je najčešće 100–600€, plus prijevodi. Odluka stiže obično za 3–4 mjeseca od kompletnih papira.",
        savjet: "Ako rješenje bude 'djelimično priznavanje', dobiješ i spisak šta ti fali — pa to dopuniš kroz kurs (Anpassungslehrgang) ili ispit.",
      },
      {
        broj: 7,
        naslov: "Iskoristi BESPLATNO savjetovanje i podršku za troškove",
        opis: "Mreža IQ (Förderprogramm IQ) nudi besplatno savjetovanje na više jezika — vode te kroz cijeli postupak. Ako imaš niska primanja, možeš dobiti 'Anerkennungszuschuss' — državnu pomoć koja pokriva dio troškova (prijevodi, takse).",
        savjet: "Prvo idi na besplatno IQ savjetovanje prije nego išta platiš — uštedjet ćeš i vrijeme i novac.",
      },
      {
        broj: 8,
        naslov: "Novo: priznavanje PARALELNO s radom (Anerkennungspartnerschaft)",
        opis: "Od reforme zakona o useljavanju stručnjaka, možeš doći i početi raditi, a priznavanje diplome završiti tek u Njemačkoj (Anerkennungspartnerschaft — dogovor između tebe i poslodavca). Ne moraš više sve završiti prije dolaska.",
      },
    ],
  },
  {
    id: "17",
    slug: "njemacko-drzavljanstvo-einburgerung",
    naziv: "Njemačko državljanstvo (Einbürgerung)",
    opis: "Novi zakon: dvojno državljanstvo dozvoljeno, standard 5 godina. Uslovi, test i koraci.",
    ikona: "📜",
    kategorija: "viza",
    minCitanja: 10,
    tagovi: ["državljanstvo", "Einbürgerung", "pasoš"],
    koraci: [
      {
        broj: 1,
        naslov: "Najveća promjena: NE moraš se odreći bosanskog",
        opis: "Od reforme 2024. Njemačka dozvoljava dvojno državljanstvo. To znači da uz njemački pasoš možeš zadržati i bosanski — ne moraš birati. Ovo je ogromna promjena za našu dijasporu.",
        savjet: "Provjeri i bosanska pravila — BiH takođe dozvoljava zadržavanje državljanstva, pa u praksi ostaješ i Bosanac i Nijemac.",
      },
      {
        broj: 2,
        naslov: "Koliko godina boravka treba",
        opis: "Standard je 5 godina zakonitog boravka u Njemačkoj (ranije 8). VAŽNO: ubrzano državljanstvo za 3 godine (za izuzetnu integraciju) je UKINUTO 2025. — te opcije više nema. Za većinu ljudi cilj je, dakle, 5 godina.",
      },
      {
        broj: 3,
        naslov: "Provjeri ostale uslove",
        opis: "Treba ti: siguran boravišni status, njemački na nivou B1, položen test 'Leben in Deutschland', da se sam izdržavaš (bez oslanjanja na socijalu, uz izuzetke), čist kazneni dosje i priznavanje slobodarskog demokratskog ustavnog poretka.",
        savjet: "Ako duže primaš Bürgergeld ili socijalu bez svoje krivice — provjeri svoj slučaj, jer izdržavanje je jedan od ključnih uslova.",
      },
      {
        broj: 4,
        naslov: "Položi Einbürgerungstest",
        opis: "Test 'Leben in Deutschland' ima 33 pitanja o njemačkom društvu, pravima i historiji; treba tačno odgovoriti najmanje 17. Pitanja su javna — možeš vježbati unaprijed online. Test košta oko 25€.",
        savjet: "Postoji baza svih mogućih pitanja — prođi je nekoliko puta i test je lagan.",
      },
      {
        broj: 5,
        naslov: "Djeca rođena u Njemačkoj",
        opis: "Dijete rođeno u Njemačkoj automatski dobija njemačko državljanstvo ako je bar jedan roditelj zakonito živio u Njemačkoj 5 godina i ima trajni boravak. I ta djeca sada mogu zadržati oba državljanstva.",
      },
      {
        broj: 6,
        naslov: "Predaj zahtjev i dokumente",
        opis: "Zahtjev se predaje u nadležnoj Einbürgerungsbehörde (u tvom gradu/okrugu). Treba: pasoš, boravišna dozvola, dokaz o prihodima i zaposlenju, B1 certifikat, potvrda o testu, rodni/vjenčani listovi. Taksa je oko 255€ po osobi (za djecu manje).",
      },
      {
        broj: 7,
        naslov: "Čekanje i zakletva",
        opis: "Obrada zna trajati dugo — od nekoliko mjeseci do preko godinu, zavisno od grada. Na kraju potpisuješ izjavu o vjernosti ustavu i dobijaš Einbürgerungsurkunde (potvrdu), pa možeš vaditi njemački pasoš.",
        savjet: "Prikupi papire uredno i kompletno — najveći zastoji su zbog dokumenata koji fale.",
      },
    ],
  },
  {
    id: "18",
    slug: "kindergeld-poreske-klase",
    naziv: "Kindergeld i poreske klase — više para u džepu",
    opis: "Dječiji doplatak (259€ od 2026) i kako bračni parovi biraju poreske klase da im ostane više neto.",
    ikona: "💶",
    kategorija: "finansije",
    minCitanja: 9,
    tagovi: ["finansije", "Kindergeld", "Steuerklasse", "porodica"],
    koraci: [
      {
        broj: 1,
        naslov: "Kindergeld 2026: 259€ po djetetu",
        opis: "Od januara 2026. Kindergeld iznosi 259€ mjesečno po svakom djetetu (povećan sa 255€). Isplaćuje se do 18. godine, a ako dijete studira ili je na Ausbildungu — do 25. godine.",
      },
      {
        broj: 2,
        naslov: "Ko ima pravo",
        opis: "Pravo imaš ako živiš i radiš u Njemačkoj i imaš odgovarajući boravišni status, a dijete po pravilu živi s tobom u Njemačkoj (ili u EU/EEA). Za djecu koja žive u BiH pravila su ograničena i posebna — to obavezno provjeri direktno s Familienkasse.",
        savjet: "Ne oslanjaj se na priče iz druge ruke o 'Kindergeldu za djecu u Bosni' — svaki slučaj Familienkasse gleda posebno.",
      },
      {
        broj: 3,
        naslov: "Kako aplicirati za Kindergeld",
        opis: "Zahtjev se podnosi Familienkasse (pri Bundesagentur für Arbeit), može online. Trebaš porezni broj (Steuer-ID) i svoj i djetetov, te rodni list djeteta. Isplata ide na tvoj račun mjesečno.",
        savjet: "Prijavi se što prije — Kindergeld se unazad isplaćuje samo za ograničen period.",
      },
      {
        broj: 4,
        naslov: "Poreske klase — osnove",
        opis: "Njemačka ima 6 poreskih klasa (Steuerklassen). One određuju koliko ti se poreza skida s plaće svaki mjesec. Samci su obično u klasi I, samohrani roditelji u II, a bračni parovi biraju kombinaciju.",
      },
      {
        broj: 5,
        naslov: "Bračni parovi: III/V ili IV/IV ili IV s faktorom",
        opis: "Ako jedan partner zarađuje ZNATNO više — kombinacija III (veći zarađivač) i V (manji) daje najviše neto svaki mjesec. Ako su plate slične — IV/IV je pravednije. 'IV s faktorom' (Faktorverfahren) najtačnije rasporedi porez tokom godine.",
        savjet: "Kod III/V veći zarađivač uzima III, manji V. Ali pazi na sljedeći korak.",
      },
      {
        broj: 6,
        naslov: "Pažnja kod III/V: obavezna godišnja prijava",
        opis: "Kombinacija III/V daje više novca mjesečno, ALI na kraju godine morate podnijeti poresku prijavu (Steuererklärung) i može se desiti da nešto morate doplatiti. IV/IV s faktorom to uglavnom izbjegava. Promjenu klase tražite u Finanzamt-u.",
      },
      {
        broj: 7,
        naslov: "Napomena: reforma poreskih klasa",
        opis: "Planirano je da se klase III i V vremenom ukinu i svi pređu na sistem IV s faktorom. Za sada (2026.) III/V i dalje postoje i mogu se koristiti — ali računaj da će se pravila jednom promijeniti.",
      },
    ],
  },
  {
    id: "19",
    slug: "ausbildung-njega-medicina",
    naziv: "Ausbildung i posao u njezi/medicini",
    opis: "Plaćeno dualno školovanje (724€ u 2026) i kako priznati medicinsku/njegovateljsku diplomu — struka koju Njemačka očajnički traži.",
    ikona: "🩺",
    kategorija: "posao",
    minCitanja: 11,
    tagovi: ["posao", "Ausbildung", "Pflege", "njega", "medicina"],
    koraci: [
      {
        broj: 1,
        naslov: "Šta je Ausbildung (i zašto je dobar)",
        opis: "Duale Ausbildung je njemačko stručno školovanje: dio vremena si u firmi (praksa), dio u školi (teorija), i za to VRIJEME PRIMAŠ PLATU. Traje 2–3,5 godine i na kraju imaš priznato zvanje i skoro siguran posao.",
      },
      {
        broj: 2,
        naslov: "Koliko se plaća",
        opis: "Postoji zakonski minimum (Mindestausbildungsvergütung): u 2026. godini 724€ mjesečno u prvoj godini, a raste svake naredne godine školovanja. Mnoge firme, pogotovo u njezi, plaćaju znatno više po tarifnom ugovoru.",
      },
      {
        broj: 3,
        naslov: "Kako doći na Ausbildung kao Bosanac",
        opis: "Trebaš mjesto (ugovor) kod poslodavca i boravišnu dozvolu za stručno školovanje. Jezik je obično B1–B2. Mjesta se traže na berzama komora (IHK/HWK Lehrstellenbörse), portalima za posao i direktno kod firmi.",
        savjet: "Za mlade bez fakulteta Ausbildung je jedan od najsigurnijih puteva u Njemačku — uči, zarađuje i ima papir na kraju.",
      },
      {
        broj: 4,
        naslov: "Njega (Pflege) — najtraženija struka",
        opis: "Školovanje za 'Pflegefachfrau/-mann' traje 3 godine, plaćeno je (često 1.300€+ već u prvoj godini) i potražnja je ogromna. Mnogi poslodavci u njezi sami sponzorišu dolazak i papire, jer im hitno trebaju ljudi.",
        savjet: "Ako već imaš iskustvo u njezi iz BiH — to ti je velika prednost pri traženju mjesta.",
      },
      {
        broj: 5,
        naslov: "Priznavanje strane njegovateljske/medicinske diplome",
        opis: "Ako si već medicinska sestra/tehničar iz BiH, tražiš priznavanje (Anerkennung als Pflegefachkraft) kod nadležne službe u saveznoj zemlji. Obično treba njemački B2 i, ako fali dio znanja, prilagodbeni kurs (Anpassungslehrgang) ili ispit znanja (Kenntnisprüfung).",
      },
      {
        broj: 6,
        naslov: "Ljekari — Approbation",
        opis: "Za rad ljekara treba Approbation (dozvola za rad). Uslovi: njemački B2 opšti + stručni jezički ispit (Fachsprachprüfung, nivo C1 u medicini), a često i ispit znanja (Kenntnisprüfung). Dok to ne završiš, možeš raditi s privremenom dozvolom (Berufserlaubnis).",
        savjet: "Bolnice koje traže ljekare često pomognu oko papira i pripreme za jezički ispit — pitaj poslodavca.",
      },
      {
        broj: 7,
        naslov: "Gdje tražiti mjesto",
        opis: "Berze mjesta komora (IHK i HWK Lehrstellenbörse), portali Indeed.de i Stepstone.de, stranice bolnica i domova za njegu, te agencije specijalizovane za dovođenje osoblja iz Balkana. Za njegu i medicinu — javljaj se direktno ustanovama.",
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
