"use client";

import React from "react";
import type { AnchorMeasurement } from "@/shared/hooks/useAnchorRect";

/** Keeps the ring clear of the target's own text and borders. */
const PADDING = 4;

/** Dimmed backdrop with a click-through hole over the target, via one huge box-shadow. */
export function TourSpotlight({
  anchor,
}: {
  anchor: AnchorMeasurement | null;
}) {
  // No target — an even dim so the card still reads as modal.
  if (!anchor) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black/60" aria-hidden="true" />
    );
  }

  const { rect, radius } = anchor;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[10000] transition-[top,left,width,height] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
      style={{
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
        borderRadius: radius,
        // Ring first, then the spread that dims the rest of the page.
        boxShadow:
          "0 0 0 2px var(--md-sys-color-primary), 0 0 0 9999px rgba(0, 0, 0, 0.6)",
      }}
    />
  );
}
