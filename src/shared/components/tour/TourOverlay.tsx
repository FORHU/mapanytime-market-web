"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useAnchorRect } from "@/shared/hooks/useAnchorRect";
import { useIsMobile } from "@/shared/hooks/useIsMobile";
import { TourCard } from "@/shared/components/tour/TourCard";
import { TourSpotlight } from "@/shared/components/tour/TourSpotlight";
import {
  useTourPosition,
  type Size,
} from "@/shared/components/tour/useTourPosition";

export interface TourStep {
  id: string;
  /** The `data-tour` value to spotlight, or null for a step with no target. */
  targetTourId: string | null;
  title: string;
  body: string;
}

interface TourOverlayProps {
  /** Already filtered by the host — whatever is here is what gets counted. */
  steps: TourStep[];
  stepIndex: number;
  onBack: () => void;
  onNext: () => void;
  /** Skip and Finish are separate so the host can tell them apart; both end the tour. */
  onSkip: () => void;
  onFinish: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function TourOverlay({
  steps,
  stepIndex,
  onBack,
  onNext,
  onSkip,
  onFinish,
}: TourOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [cardSize, setCardSize] = useState<Size | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const step: TourStep | undefined = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const anchor = useAnchorRect(step?.targetTourId ?? null);
  const isMobile = useIsMobile();
  const position = useTourPosition(anchor?.rect ?? null, cardSize, isMobile);

  const advance = useCallback(() => {
    if (isLast) onFinish();
    else onNext();
  }, [isLast, onFinish, onNext]);

  // Latest handlers for the once-registered keydown listener, so it never sees stale step values.
  const keys = useRef({ advance, onBack, onSkip, stepIndex });
  keys.current = { advance, onBack, onSkip, stepIndex };

  useEffect(() => setMounted(true), []);

  // Measure the card before paint so it's placed correctly on the first frame.
  useLayoutEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const measure = () => {
      // Measure the uncapped height, or the maxHeight cap would oscillate on and off.
      const constrained = node.style.maxHeight;
      node.style.maxHeight = "none";
      const width = node.offsetWidth;
      const height = node.offsetHeight;
      node.style.maxHeight = constrained;

      // Bail on unchanged size so the ResizeObserver doesn't loop.
      setCardSize((previous) =>
        previous && previous.width === width && previous.height === height
          ? previous
          : { width, height },
      );
    };

    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
    // `mounted` is needed: the portal renders late, so cardRef is null on the first pass.
  }, [stepIndex, isMobile, mounted]);

  // Dialog contract from apk-download-modal.tsx (focus trap, Escape, focus restore) plus arrow-key navigation.
  useEffect(() => {
    if (!mounted || !step) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    cardRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        keys.current.onSkip();
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        keys.current.advance();
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (keys.current.stepIndex > 0) keys.current.onBack();
        return;
      }

      if (e.key !== "Tab") return;

      const items = cardRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!items || items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (!cardRef.current?.contains(active)) {
        e.preventDefault();
        first.focus();
        return;
      }

      if (e.shiftKey && (active === first || active === cardRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus();
    };
    // Keyed on `mounted` only so focus isn't pulled back to the card on every step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted || !step) return null;

  return createPortal(
    <>
      <TourSpotlight anchor={anchor} />

      {/* Screen readers get the step change without focus moving. */}
      <div className="sr-only" role="status" aria-live="polite">
        {`Step ${stepIndex + 1} of ${steps.length}: ${step.title}`}
      </div>

      <TourCard
        ref={cardRef}
        title={step.title}
        body={step.body}
        stepNumber={stepIndex + 1}
        totalSteps={steps.length}
        position={position}
        onBack={stepIndex > 0 ? onBack : undefined}
        onNext={advance}
        onSkip={onSkip}
      />
    </>,
    document.body,
  );
}
