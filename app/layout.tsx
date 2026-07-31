import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import SearchModal from "@/components/SearchModal";
import AdminModeracija from "@/components/admin/AdminModeracija";
import BottomNav from "@/components/BottomNav";

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
  // PWA — omogućava "Dodaj na početni ekran" i app-izgled.
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "kodnas.de",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
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

// theme-color (boja gornje trake u PWA/na mobilnom)
export const viewport: Viewport = {
  themeColor: "#1a8a4a",
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

        {/* Donja nav traka (mobilni): Vijesti · Akcije · Vodiči · Brutto-Netto */}
        <BottomNav />

        {/* PWA — registruj service worker (bez keširanja, samo za instalabilnost) */}
        <Script id="sw-register" strategy="afterInteractive">
          {`if ("serviceWorker" in navigator) {
              window.addEventListener("load", function () {
                navigator.serviceWorker.register("/sw.js").catch(function(){});
              });
            }`}
        </Script>

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
