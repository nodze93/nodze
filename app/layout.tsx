import type { Metadata } from "next";
import "./globals.css";
import SearchModal from "@/components/SearchModal";
import AdminModeracija from "@/components/admin/AdminModeracija";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
  title: "kodnas.de — Njemačke vijesti na našem jeziku",
  description:
    "Sve važne vijesti iz Njemačke, na našem jeziku — aktuelno, svaki dan. Plus praktični vodiči za dijasporu: viza, posao, stan, zdravstvo, porez.",
  keywords: [
    "njemačke vijesti na bosanskom",
    "vijesti Njemačka dijaspora",
    "Bosanci u Njemačkoj",
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
    title: "Sve njemačke vijesti — na našem jeziku",
    description: "Aktuelne vijesti iz Njemačke, svaki dan.",
    url: SITE,
    siteName: "kodnas.de",
    locale: "bs_BA",
    type: "website",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "kodnas.de" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sve njemačke vijesti — na našem jeziku",
    description: "Aktuelne vijesti iz Njemačke, svaki dan.",
    images: ["/og-default.jpg"],
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
        <AdminModeracija />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
