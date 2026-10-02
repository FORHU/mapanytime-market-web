import type { Metadata } from "next";
import "./fonts.css";
import "./globals.css";
import QueryProvider from "@/shared/lib/providers/query-provider";
import { Toaster } from "sonner";
import { AuthListener } from "@/features/auth/components/AuthListener";
import ThemeProvider from "@/shared/lib/providers/theme-provider";
import { AnalyticsListener } from "@/shared/components/AnalyticsListener";
import { CookieConsentBanner } from "@/shared/components/CookieConsentBanner";

// Fonts are self-hosted (fonts.css + public/fonts) rather than loaded through next/font/google,
// which downloads them from Google during `next build`; a malformed Google response once failed
// the CI build. fonts.css sets the same --font-plus-jakarta / --font-hanken / --font-jetbrains-mono
// variables next/font did, so nothing that reads them changed.
//
// Three families at 11 weights was a lot to load on a public landing page. Plus Jakarta is the
// display family — every `font-display` site in src/ pairs it with a type style of 600, 700 or
// 800, and none with font-normal/font-medium, so 400 and 500 were downloaded and never drawn.
// Hanken (body) and JetBrains (mono) weights are all still in use; if the LCP budget needs more,
// measure before cutting those, since dropping a used weight causes synthetic-bold fallback.
// These are variable fonts, so each language subset is one file covering all its weights.

/** The latin files, preloaded as next/font did; the other subsets load only when a page needs them. */
const PRELOADED_FONTS = [
  "/fonts/plus-jakarta-sans-latin.woff2",
  "/fonts/hanken-grotesk-latin.woff2",
  "/fonts/jetbrains-mono-latin.woff2",
];

export const metadata: Metadata = {
  title: {
    template: "%s | MapAnytime",
    default: "MapAnytime | Hyperlocal Commerce Ecosystem",
  },
  description:
    "Connecting 450M Offline Stores to the World Through a Map, a Photo, and a Pickup.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://mapanytime.com",
  ),
  openGraph: {
    title: "MapAnytime | Hyperlocal Commerce Ecosystem",
    description:
      "Connecting 450M Offline Stores to the World Through a Map, a Photo, and a Pickup.",
    url: "https://mapanytime.com",
    siteName: "MapAnytime",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MapAnytime | Hyperlocal Commerce Ecosystem",
    description:
      "Connecting 450M Offline Stores to the World Through a Map, a Photo, and a Pickup.",
    images: ["/og-image.png"],
  },
  // Icons come from Next's file conventions in this folder: favicon.ico (16/32/48), icon1.svg,
  // icon2.png and apple-icon.png. Listing paths here instead linked a /favicon.ico that did not exist.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {PRELOADED_FONTS.map((href) => (
          <link
            key={href}
            rel="preload"
            href={href}
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        ))}
      </head>
      {/* `font-body` sets the family; `text-body-md` sets the base size/line-height. This
          previously read `font-body-md`, which resolved to a family only — the document had no
          base type size at all. */}
      <body
        className={`font-body text-body-md antialiased bg-background text-on-surface min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container`}
      >
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster position="top-right" theme="system" richColors />
            <AuthListener />
            <AnalyticsListener />
            <CookieConsentBanner />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
