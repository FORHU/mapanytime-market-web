"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ClampedNoteProps {
  /** e.g. "Reason", "Changes requested" — rendered before the note. */
  label: string;
  text: string;
  /** Rejection is rose, a revision request is orange. */
  tone: "danger" | "warning";
  /** Lines shown before the note collapses. One keeps the cards uniform. */
  lines?: number;
}

const TONE = {
  danger: "text-rose-500 dark:text-rose-400",
  warning: "text-orange-500 dark:text-orange-400",
} as const;

/**
 * A reviewer's note on a card that people scan.
 *
 * Three problems, one component, because all four call sites have all three:
 *
 *  - **It must wrap.** A note can be a thousand characters with no spaces in it,
 *    and without `break-words` the browser has nowhere to break the line.
 *  - **It must not stretch its container.** `min-w-0` here stops this text
 *    being the reason a parent grid or flex track refuses to shrink. Note that
 *    `break-words` alone does not fix that: `overflow-wrap` changes how a line
 *    is broken, not the intrinsic min-content width that flex and grid size
 *    against — so the parent tracks need `min-w-0` too.
 *  - **It must stay short.** One long note on a queue card otherwise pushes
 *    every card below it off the screen.
 *
 * The full text is always in the DOM; the clamp is purely visual, so search and
 * screen readers still reach all of it.
 */
export function ClampedNote({
  label,
  text,
  tone,
  lines = 1,
}: ClampedNoteProps) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  /**
   * Measure rather than guess. A character-count heuristic is wrong at some
   * viewport width, and offering "Show more" on a note that is already fully
   * visible is worse than offering nothing.
   */
  const measure = useCallback(() => {
    const el = textRef.current;
    if (!el) return;
    setOverflows(el.scrollHeight > el.clientHeight + 1);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // `text` re-runs the measurement when the note itself changes.
  }, [measure, text]);

  return (
    <div className={`min-w-0 pt-2 text-xs ${TONE[tone]}`}>
      <span className="font-semibold">{label}: </span>
      <span
        ref={textRef}
        className="break-words"
        // Set inline rather than with `line-clamp-${lines}`: Tailwind scans for
        // literal class names, so an interpolated one is never generated.
        style={
          expanded
            ? undefined
            : {
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: lines,
                overflow: "hidden",
              }
        }
      >
        {text}
      </span>

      {overflows && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={(event) => {
            // These sit inside clickable cards on the seller side; opening a
            // note should not also open the store.
            event.stopPropagation();
            setExpanded((prev) => !prev);
          }}
          className="mt-0.5 block rounded-md font-semibold underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
