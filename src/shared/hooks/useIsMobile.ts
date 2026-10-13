"use client";

import { useEffect, useState } from "react";

/** Tailwind's `md` breakpoint, below which the seller sidebar is an off-canvas drawer. */
const MOBILE_QUERY = "(max-width: 767px)";

/** Starts `false` to match SSR, then corrects in an effect to avoid a hydration mismatch. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mql = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(mql.matches);

    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isMobile;
}
