import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/shared/lib/providers/query-provider";
import { Toaster } from "sonner";
import { AuthListener } from "@/features/auth/components/AuthListener";
import { ThemeProvider } from "next-themes"; // 👈 1. Import ThemeProvider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Marketplace",
    default: "Marketplace | Premium Next.js Starter",
  },
  description:
    "Connecting 450M Offline Stores to the World Through a Map, a Photo, and a Pickup.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://boilerplate-2026.vercel.app",
  ),
  openGraph: {
    title: "Boilerplate 2026 | Premium Starter",
    description:
      "Experience the next generation of development with Boilerplate 2026.",
    url: "https://boilerplate-2026.vercel.app",
    siteName: "Boilerplate 2026",
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
    title: "Boilerplate 2026 | Premium Starter",
    description:
      "Experience the next generation of development with Boilerplate 2026.",
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
      <body
        className={`${poppins.variable} ${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background-primary text-text-primary`}
      >
        <QueryProvider>
          {/* 2. Wrap your layout tree inside ThemeProvider */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-right" theme="system" richColors />
            <AuthListener />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
