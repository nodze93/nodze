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
