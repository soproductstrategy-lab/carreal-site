import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { business, IS_NOINDEX, SITE_URL } from "@/content/business";
import "./globals.css";

// Archivo (Omnibus-Type, SIL OFL 1.1) : une seule famille variable, largeur 62 % → 125 %.
// font-stretch déclaré sur le @font-face, sinon le lettrage large retombe en largeur normale.
const archivo = localFont({
  src: [
    { path: "../fonts/Archivo-Variable.woff2", weight: "400 900", style: "normal" },
    { path: "../fonts/Archivo-Italic-Variable.woff2", weight: "400 600", style: "italic" },
  ],
  variable: "--font-archivo",
  display: "swap",
  preload: true,
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  fallback: ["Arial", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${business.tagline} | ${business.name}`, template: `%s | ${business.name}` },
  description: business.description,
  applicationName: business.name,
  authors: [{ name: business.founder.name }],
  formatDetection: { telephone: true, address: true, email: true },
  openGraph: { locale: "fr_FR", siteName: business.name, type: "website" },
  ...(IS_NOINDEX
    ? {
        robots: {
          index: false,
          follow: false,
          nocache: true,
          googleBot: { index: false, follow: false, noimageindex: true },
        },
      }
    : {}),
  // TODO : ajouter les codes de vérification Search Console et Bing Webmaster Tools.
  // verification: { google: "...", other: { "msvalidate.01": "..." } },
};

export const viewport: Viewport = {
  themeColor: "#ecedea",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={archivo.variable}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
