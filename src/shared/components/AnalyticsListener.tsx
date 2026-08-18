"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/shared/lib/analytics";

export function AnalyticsListener() {
  const pathname = usePathname();

  useEffect(() => {
    // Generate session on load and track page view
    trackEvent("PAGE_VIEW", {
      metadata: { path: pathname },
    });
  }, [pathname]);

  return null;
}
