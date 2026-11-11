import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Khand, Mukta, Tiro_Devanagari_Hindi, Yatra_One } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { SITE } from "@/lib/site";
import "./globals.css";

// next/font downloads these at build time and serves them from our own site.
const yatra = Yatra_One({ weight: "400", subsets: ["latin", "devanagari"], variable: "--font-yatra" });
// Chatpata look (11 Nov 2026): Yatra One for signboard headlines, Khand (made for Indian signs) for
// labels and buttons, Mukta for reading. All three write Hindi too.
const mukta = Mukta({ weight: ["400", "500", "700"], subsets: ["latin", "devanagari"], variable: "--font-body" });
const khand = Khand({ weight: ["500", "600", "700"], subsets: ["latin", "devanagari"], variable: "--font-label" });
const bodoni = Bodoni_Moda({ style: "italic", weight: ["500"], subsets: ["latin"], variable: "--font-bodoni" });
const tiro = Tiro_Devanagari_Hindi({ weight: "400", subsets: ["devanagari", "latin"], variable: "--font-tiro" });

// Defaults for every page; each page sets its own title, description and canonical address.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.tagline} | ${SITE.name}`, template: `%s | ${SITE.name}` },
  description: SITE.definition,
  applicationName: SITE.name,
  openGraph: { type: "website", siteName: SITE.name, locale: SITE.locale, images: ["/og/home.jpg"] },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
  // ownership checks for Google Search Console, Bing and Pinterest (set these in Vercel when you have them)
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
    other: {
      ...(process.env.NEXT_PUBLIC_BING_VERIFICATION ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION } : {}),
      ...(process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION ? { "p:domain_verify": process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION } : {}),
    },
  },
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffd84d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${yatra.variable} ${mukta.variable} ${khand.variable} ${bodoni.variable} ${tiro.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
