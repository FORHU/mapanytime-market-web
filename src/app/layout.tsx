import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Hanken_Grotesk,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import QueryProvider from "@/shared/lib/providers/query-provider";
import { Toaster } from "sonner";
import { AuthListener } from "@/features/auth/components/AuthListener";
import { ThemeProvider } from "next-themes";

// Three families at 11 weights was a lot to load on a public landing page. Plus Jakarta is the
// display family — every `font-display` site in src/ pairs it with a type style of 600, 700 or
// 800, and none with font-normal/font-medium, so 400 and 500 were downloaded and never drawn.
// Hanken (body) and JetBrains (mono) weights are all still in use; if the LCP budget needs more,
// measure before cutting those, since dropping a used weight causes synthetic-bold fallback.
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

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
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* `font-body` sets the family; `text-body-md` sets the base size/line-height. This
          previously read `font-body-md`, which resolved to a family only — the document had no
          base type size at all. */}
      <body
        className={`${plusJakarta.variable} ${hanken.variable} ${jetbrainsMono.variable} font-body text-body-md antialiased bg-background text-on-surface min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster position="top-right" theme="system" richColors />
            <AuthListener />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
