"use client";

import { useEffect, useState } from "react";

export interface AnchorMeasurement {
  /** Viewport-relative, so it can be used directly by a `position: fixed` overlay. */
  rect: DOMRect;
  /** The target's own corner rounding, mirrored so the spotlight hugs its shape. */
  radius: string;
}

/** How many frames to keep looking before giving up on a target that never mounts. */
const MAX_RESOLVE_FRAMES = 40;

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Tracks the on-screen box of `[data-tour="<id>"]`, or `null` while nothing matches. */
export function useAnchorRect(
  targetTourId: string | null,
): AnchorMeasurement | null {
  const [measurement, setMeasurement] = useState<AnchorMeasurement | null>(
    null,
  );

  useEffect(() => {
    if (!targetTourId || typeof window === "undefined") {
      setMeasurement(null);
      return;
    }

    let frame = 0;
    let frames = 0;
    let observer: ResizeObserver | null = null;
    let element: HTMLElement | null = null;
    let cancelled = false;

    const measure = () => {
      if (cancelled || !element) return;
      setMeasurement({
        rect: element.getBoundingClientRect(),
        radius: window.getComputedStyle(element).borderRadius || "0px",
      });
    };

    // Coalesce scroll/resize to one measurement per frame.
    const scheduleMeasure = () => {
      if (cancelled) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    const attach = (found: HTMLElement) => {
      element = found;

      // Scrolls every scrollable ancestor; the scroll listener keeps the spotlight in sync.
      found.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });

      measure();

      // Capture phase, since the seller layout's inner scrollers don't bubble scroll events.
      document.addEventListener("scroll", scheduleMeasure, true);
      window.addEventListener("resize", scheduleMeasure);

      // The mobile sidebar slides in via transform, which fires neither scroll nor resize.
      document.addEventListener("transitionend", scheduleMeasure, true);

      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(scheduleMeasure);
        observer.observe(found);
      }
    };

    // Retry for a few frames — the drawer or a skeleton tile may not have mounted yet.
    const resolve = () => {
      if (cancelled) return;

      const found = document.querySelector<HTMLElement>(
        `[data-tour="${targetTourId}"]`,
      );

      if (found) {
        attach(found);
        return;
      }

      if (++frames >= MAX_RESOLVE_FRAMES) {
        setMeasurement(null);
        return;
      }

      frame = requestAnimationFrame(resolve);
    };

    resolve();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      document.removeEventListener("scroll", scheduleMeasure, true);
      window.removeEventListener("resize", scheduleMeasure);
      document.removeEventListener("transitionend", scheduleMeasure, true);
      observer?.disconnect();
    };
  }, [targetTourId]);

  return measurement;
}
