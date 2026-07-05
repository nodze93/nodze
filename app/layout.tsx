import type { Metadata } from "next";
import "./globals.css";
import SearchModal from "@/components/SearchModal";

export const metadata: Metadata = {
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
  openGraph: {
    title: "Dijaspora.ba — Tvoj vodič kroz život vani",
    description: "Portal za Bosance u Njemačkoj i Austriji.",
    locale: "bs_BA",
    type: "website",
  },
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
