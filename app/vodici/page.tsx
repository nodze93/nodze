import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import VodiciKlijent, { type VodicKartica } from "@/components/VodiciKlijent";
import { getVodici } from "@/lib/vodici-db";
import { getAllVodici } from "@/lib/data/vodici";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vodiči za život u Njemačkoj — kodnas.de",
  description:
    "Praktični vodiči za našu dijasporu: vize i boravak, posao, stanovanje, porodica, zdravstvo, porezi i finansije.",
  alternates: { canonical: "/vodici" },
  openGraph: {
    title: "Vodiči za život u Njemačkoj — kodnas.de",
    description: "Praktični vodiči za Bosance u Njemačkoj i Austriji.",
    url: "/vodici",
    siteName: "kodnas.de",
    locale: "bs_BA",
    type: "website",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "kodnas.de vodiči" }],
  },
};

export default async function VodiciPage() {
  let vodici: VodicKartica[] = [];

  // Primarno iz baze (usklađeno s detalj-stranicom).
  try {
    const rows = await getVodici();
    if (rows.length) {
      vodici = rows.map((v) => ({
        slug: v.slug,
        naziv: v.naziv,
        opis: v.opis,
        ikona: v.ikona,
        kategorija: v.kategorija,
        min_citanja: v.min_citanja,
        brojKoraka: v.koraci?.length ?? 0,
        imaTekst: !!v.tekst,
      }));
    }
  } catch {
    /* baza nedostupna — pada na rezervu ispod */
  }

  // Rezerva: ako baza prazna/pukne, koristi hard-kodirane vodiče (da lista ne bude prazna).
  if (vodici.length === 0) {
    vodici = getAllVodici().map((v) => ({
      slug: v.slug,
      naziv: v.naziv,
      opis: v.opis,
      ikona: v.ikona,
      kategorija: v.kategorija,
      min_citanja: v.minCitanja,
      brojKoraka: v.koraci.length,
      imaTekst: false,
    }));
  }

  return (
    <>
      <Nav />
      <VodiciKlijent vodici={vodici} />
      <Footer />
    </>
  );
}
