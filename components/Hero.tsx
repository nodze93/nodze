import { dajHero } from "@/lib/data";
import HeroRotator, { type HeroClanak } from "./HeroRotator";

// Fallback za GLAVNU vijest dok baza nema današnjih objavljenih članaka
const FALLBACK_GLAVNI: HeroClanak[] = [
  {
    slug: "nova-radna-viza-2026",
    kategorija: "viza",
    label: "Viza",
    naslov: "Nova pravila za radnu vizu u Njemačkoj — što se mijenja za Bosance od 2026. godine",
    excerpt:
      "Fachkräfteeinwanderungsgesetz je promijenio sve. Koje dokumente trebaš, koji je rok čekanja, i kako aplicirati korak po korak iz BiH.",
    meta: "Danas · 8 min · 2.4k pročitano",
    datum: "Danas",
    slika: "https://loremflickr.com/900/600/passport,documents?lock=51",
  },
];

// TRI BOČNE KARTICE — fiksne, ručno se postavljaju ovdje (ne rotiraju)
// slika: URL naslovne fotografije (može se zamijeniti pravom slikom kasnije)
const BOCNI_FIKSNI: HeroClanak[] = [
  {
    slug: "elterngeld-2026",
    kategorija: "porodica",
    label: "Porodica",
    naslov: "Elterngeld 2026 — koliko para dobijaš i kako aplicirati odmah nakon poroda",
    excerpt: "",
    meta: "Jučer · 6 min",
    datum: "Jučer",
    slika: "https://loremflickr.com/200/200/office,documents?lock=41",
  },
  {
    slug: "stan-minhen-bez-schufe",
    kategorija: "stan",
    label: "Stan",
    naslov: "Kako naći stan u Minhenu bez Schufe — provjeren vodič za novopridošle",
    excerpt: "",
    meta: "2 dana · 5 min",
    datum: "2 dana",
    slika: "https://loremflickr.com/200/200/apartment,building?lock=42",
  },
  {
    slug: "sedmicni-pregled-bih",
    kategorija: "bih",
    label: "BiH",
    naslov: "Sedmični pregled iz BiH — što se desilo dok si bio na poslu",
    excerpt: "",
    meta: "Jučer · 3 min",
    datum: "Jučer",
    slika: "https://loremflickr.com/200/200/sarajevo,city?lock=43",
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

  return (
    <HeroRotator
      glavniInitial={glavniInitial}
      glavniFallback={FALLBACK_GLAVNI}
      bocni={BOCNI_FIKSNI}
    />
  );
}
