import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const title = "Vivrun | AI Longevity Scan";
const description =
  "An AI longevity model that estimates your date of death from your lifestyle. (It is a parody. It predicts nothing.)";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  // The OG/Twitter images are provided by app/opengraph-image.tsx and
  // app/twitter-image.tsx; the favicon/apple icon by app/icon.svg and
  // app/apple-icon.tsx. Next discovers those file conventions automatically.
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "Vivrun",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-[100dvh] antialiased font-sans">
        <div className="flex min-h-[100dvh] flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
