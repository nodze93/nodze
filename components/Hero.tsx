import { dajHero } from "@/lib/data";
import HeroRotator, { type HeroClanak } from "./HeroRotator";

// Fallback za GLAVNU vijest dok baza nema današnjih objavljenih članaka.
// Vodi na PRAVU stranicu (vodič), ne na izmišljeni članak.
const FALLBACK_GLAVNI: HeroClanak[] = [
  {
    slug: "radna-viza-njemacka",
    href: "/vodic/radna-viza-njemacka",
    kategorija: "viza",
    label: "Vodič",
    naslov: "Radna viza za Njemačku — korak po korak, od ugovora do slijetanja",
    excerpt:
      "Fachkräfteeinwanderungsgesetz, Chancenkarte, Plava karta — koje dokumente trebaš i kako aplicirati. Sve u jednom vodiču.",
    meta: "Vodič · 15 min",
    datum: "",
    slika: "https://loremflickr.com/900/600/passport,documents?lock=51",
  },
];

// BOČNE KARTICE kad baza nema članaka — vode na PRAVE vodiče (nema mrtvih linkova).
const FALLBACK_BOCNI: HeroClanak[] = [
  {
    slug: "krankenkasse",
    href: "/vodic/krankenkasse",
    kategorija: "zdravstvo",
    label: "Vodič",
    naslov: "Krankenkasse — kako se prijaviti i ko može biti suosiguran",
    excerpt: "",
    meta: "Vodič · 8 min",
    datum: "",
    slika: "https://loremflickr.com/200/200/hospital,healthcare?lock=41",
  },
  {
    slug: "pronalazak-stana",
    href: "/vodic/pronalazak-stana",
    kategorija: "stan",
    label: "Vodič",
    naslov: "Pronalazak stana — Schufa, Mietvertrag i prava stanara",
    excerpt: "",
    meta: "Vodič · 10 min",
    datum: "",
    slika: "https://loremflickr.com/200/200/apartment,building?lock=42",
  },
  {
    slug: "povrat-poreza",
    href: "/vodic/povrat-poreza",
    kategorija: "finansije",
    label: "Vodič",
    naslov: "Povrat poreza — kako dobiti natrag novac od države svake godine",
    excerpt: "",
    meta: "Vodič · 7 min",
    datum: "",
    slika: "https://loremflickr.com/200/200/tax,money?lock=43",
  },
];

export default async function Hero() {
  let svi: HeroClanak[] = [];
  try {
    svi = await dajHero(12);
  } catch {
    svi = [];
  }
  // Za glavnu vijest preferiraj današnje; ako nema današnjih, uzmi sve novije
  const danasnji = svi.filter((k) => k.danasnji);
  const glavniInitial = danasnji.length >= 1 ? danasnji : svi;

  // Bočne kartice = PRAVI objavljeni članci iz baze (pravi /clanak/ linkovi).
  // Ako baza nema dovoljno članaka — dopuni pravim vodičima (nema 404).
  const bocniIzBaze = svi.slice(0, 3);
  const bocni =
    bocniIzBaze.length >= 3
      ? bocniIzBaze
      : [...bocniIzBaze, ...FALLBACK_BOCNI].slice(0, 3);

  return (
    <HeroRotator
      glavniInitial={glavniInitial}
      glavniFallback={FALLBACK_GLAVNI}
      bocni={bocni}
    />
  );
}
