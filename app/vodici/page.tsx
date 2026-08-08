import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import VodiciKlijent, { type VodicKartica } from "@/components/VodiciKlijent";
import { getVodici } from "@/lib/vodici-db";
import { getAllVodici } from "@/lib/data/vodici";
import type { Metadata } from "next";

export const revalidate = 600; // ISR: keširano 10 min (+ instant osvježavanje na izmjenu u adminu)

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
  // SVI vodiči = kod (statični) + baza (admin), spojeni po slug-u (baza pobjeđuje kod dupliranja).
  const mapa = new Map<string, VodicKartica>();

  for (const v of getAllVodici()) {
    mapa.set(v.slug, {
      slug: v.slug,
      naziv: v.naziv,
      opis: v.opis,
      ikona: v.ikona,
      kategorija: v.kategorija,
      min_citanja: v.minCitanja,
      brojKoraka: v.koraci.length,
      imaTekst: false,
      provjereno: null,
    });
  }

  try {
    for (const v of await getVodici()) {
      mapa.set(v.slug, {
        slug: v.slug,
        naziv: v.naziv,
        opis: v.opis,
        ikona: v.ikona,
        kategorija: v.kategorija,
        min_citanja: v.min_citanja,
        brojKoraka: v.koraci?.length ?? 0,
        imaTekst: !!v.tekst,
        provjereno: v.provjereno ?? null,
      });
    }
  } catch {
    /* baza nedostupna — ostaju statični */
  }

  const vodici = Array.from(mapa.values());

  return (
    <>
      <Nav />
      <VodiciKlijent vodici={vodici} />
      <Footer />
    </>
  );
}
