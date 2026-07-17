import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import SearchModal from "@/components/SearchModal";
import AdminModeracija from "@/components/admin/AdminModeracija";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://kodnas.de";

// Google Analytics (GA4). Mjerni ID (G-XXXXXXXXXX) dobiješ u analytics.google.com
// i upišeš u Vercel kao env varijablu NEXT_PUBLIC_GA_ID. Bez ID-a se ništa ne
// učitava, pa sajt normalno radi i prije nego ga postaviš.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

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
  title: "kodnas.de — Tvoj vodič kroz život vani",
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
    title: "kodnas.de — Tvoj vodič kroz život vani",
    description: "Portal za Bosance u Njemačkoj i Austriji.",
    url: SITE,
    siteName: "kodnas.de",
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
        <AdminModeracija />

        {/* Vercel Web Analytics + Speed Insights (posjete i brzina stranice).
            Paketi su bili instalirani ali komponente nikad montirane — zato
            Vercel Analytics nije prikazivao podatke. Sada rade automatski. */}
        <Analytics />
        <SpeedInsights />

        {/* Google Analytics — učita se samo ako je NEXT_PUBLIC_GA_ID postavljen */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
