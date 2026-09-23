"use client";

/** Breathing room between the spotlit element and the card explaining it. */
const GAP = 12;
/** Smallest allowed distance from any viewport edge. */
const MARGIN = 8;
/** Below this, docking beats squeezing the card into the gap. */
const MIN_CARD_HEIGHT = 180;

export type TourCardPosition =
  /** Below `md`, or too cramped to sit beside the target: pinned to the bottom. */
  | { mode: "docked" }
  /** No target at all — treat it as a plain centred dialog. */
  | { mode: "centered" }
  | {
      mode: "anchored";
      top: number;
      left: number;
      placement: "top" | "bottom";
      /** Set only when the card had to be shrunk to fit; its body then scrolls. */
      maxHeight?: number;
    };

export interface Size {
  width: number;
  height: number;
}

/** Places the card below the target, else above, else capped on the roomier side — never on top of it. */
export function useTourPosition(
  anchor: DOMRect | null,
  card: Size | null,
  isMobile: boolean,
): TourCardPosition {
  if (isMobile) return { mode: "docked" };
  if (!anchor || !card) return { mode: "centered" };

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const roomBelow = viewportHeight - anchor.bottom - GAP - MARGIN;
  const roomAbove = anchor.top - GAP - MARGIN;

  let placement: "top" | "bottom";
  let height = card.height;
  let maxHeight: number | undefined;

  if (card.height <= roomBelow) {
    placement = "bottom";
  } else if (card.height <= roomAbove) {
    placement = "top";
  } else {
    const roomiest = Math.max(roomBelow, roomAbove);

    // Neither side fits a usable card; docking is guaranteed not to cover the target.
    if (roomiest < MIN_CARD_HEIGHT) return { mode: "docked" };

    placement = roomBelow >= roomAbove ? "bottom" : "top";
    height = roomiest;
    maxHeight = roomiest;
  }

  const top =
    placement === "bottom" ? anchor.bottom + GAP : anchor.top - GAP - height;

  const left = Math.min(
    Math.max(anchor.left, MARGIN),
    Math.max(viewportWidth - card.width - MARGIN, MARGIN),
  );

  return { mode: "anchored", top, left, placement, maxHeight };
}
