import type { Metadata } from "next";
import "./globals.css";
import SearchModal from "@/components/SearchModal";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://kodnas.de";

// Verifikacija za Google Search Console i Bing Webmaster Tools.
// Tokene dobiješ u tim alatima i staviš kao env varijable u Vercelu:
//   GOOGLE_SITE_VERIFICATION = <token iz Google Search Console>
//   BING_SITE_VERIFICATION   = <token iz Bing Webmaster Tools>
const verification: Metadata["verification"] = {};
if (process.env.GOOGLE_SITE_VERIFICATION) {
  verification.google = process.env.GOOGLE_SITE_VERIFICATION;
}
if (process.env.BING_SITE_VERIFICATION) {
  verification.other = { "msvalidate.01": process.env.BING_SITE_VERIFICATION };
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Dijaspora.ba — Tvoj vodič kroz život vani",
  description:
    "Portal za Bosance u Njemačkoj i Austriji. Vijesti, vodiči i praktične informacije o vizi, poslu, stanu, zdravstvu, porezu i penziji.",
  keywords: [
    "dijaspora",
    "Bosanci u Njemačkoj",
    "Bosanci u Austriji",
    "radna viza",
    "Aufenthaltstitel",
    "Elterngeld",
    "Kindergeld",
    "Krankenkasse",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Dijaspora.ba — Tvoj vodič kroz život vani",
    description: "Portal za Bosance u Njemačkoj i Austriji.",
    url: SITE,
    siteName: "Dijaspora.ba",
    locale: "bs_BA",
    type: "website",
  },
  verification,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bs">
      <body>
        {children}
        <SearchModal />
      </body>
    </html>
  );
}
