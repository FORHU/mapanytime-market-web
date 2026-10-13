"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/** Routes that always render dark, whatever theme the visitor picked inside the app. */
const DARK_ONLY_ROUTES = new Set(["/"]);

/**
 * The site's theme provider. On dark-only routes (the landing page) it uses `forcedTheme`, which
 * puts `.dark` on <html> for that route without touching the stored preference, so a visitor who
 * chose light mode in the app still gets light mode back as soon as they leave the landing page.
 * The pathname is known during server rendering too, so the forced theme is in the first paint.
 */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      forcedTheme={DARK_ONLY_ROUTES.has(pathname) ? "dark" : undefined}
    >
      {children}
    </NextThemesProvider>
  );
}
