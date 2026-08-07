import type { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://kodnas.de").replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin i API se ne indeksiraju. /kalkulator-app/ su sirovi fajlovi
        // kalkulatora koji žive u iframe-u — indeksira se /brutto-netto,
        // ne njegov unutrašnji dokument (inače Google vidi duplikat).
        disallow: ["/admin", "/api/", "/kalkulator-app/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
