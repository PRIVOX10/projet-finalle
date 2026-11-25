import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { siteUrl } from "@/lib/site";
import { THEME_SCRIPT } from "@/lib/theme-script";
import "./globals.css";

const title = Fraunces({
  subsets: ["latin"],
  variable: "--font-title",
  axes: ["SOFT", "opsz"],
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Kandili · Bougies fleuries faites à la main", template: "%s · Kandili" },
  description:
    "Bouquets de bougies fleuries faites à la main, à la senteur douce. Livraison dans les 58 wilayas, paiement à la livraison.",
  openGraph: { siteName: "Kandili", locale: "fr_FR", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2e9dc" },
    { media: "(prefers-color-scheme: dark)", color: "#160e13" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="light" className={`${title.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
