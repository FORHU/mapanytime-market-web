"use client";

import React, { forwardRef } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import type { TourCardPosition } from "@/shared/components/tour/useTourPosition";

export const TOUR_TITLE_ID = "seller-tour-title";

interface TourCardProps {
  title: string;
  body: string;
  /** 1-based, counted against the steps that survived filtering. */
  stepNumber: number;
  totalSteps: number;
  position: TourCardPosition;
  onBack?: () => void;
  onNext: () => void;
  onSkip: () => void;
}

// MD3 tokens, since the legacy `--background-*` vars ignore dark theme.
const PANEL_CLASSES =
  "rounded-3xl border border-outline-variant bg-surface-container-high text-on-surface shadow-2xl focus:outline-none";

function positionStyles(position: TourCardPosition): React.CSSProperties {
  switch (position.mode) {
    case "docked":
      // Capped so a long step scrolls instead of becoming a full-screen sheet.
      return { left: 16, right: 16, bottom: 16, maxHeight: "60vh" };
    case "centered":
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxHeight: "80vh",
      };
    case "anchored":
      return {
        top: position.top,
        left: position.left,
        maxHeight: position.maxHeight,
      };
  }
}

export const TourCard = forwardRef<HTMLDivElement, TourCardProps>(
  function TourCard(
    { title, body, stepNumber, totalSteps, position, onBack, onNext, onSkip },
    ref,
  ) {
    const isLast = stepNumber === totalSteps;
    const percent = (stepNumber / totalSteps) * 100;

    return (
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TOUR_TITLE_ID}
        tabIndex={-1}
        className={`fixed z-[10001] flex flex-col p-5 md:p-6 ${PANEL_CLASSES} ${
          // Docked spans the screen; otherwise a fixed width that still fits narrow windows.
          position.mode === "docked" ? "" : "w-[min(22rem,calc(100vw-1rem))]"
        }`}
        style={positionStyles(position)}
      >
        <div className="mb-4 shrink-0">
          <div className="mb-2 flex items-center justify-between text-[11px] font-bold">
            <span className="text-on-surface">Seller tutorial</span>
            <span className="text-on-surface-variant">
              Step {stepNumber} of {totalSteps}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-container-highest">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 motion-reduce:transition-none"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Only this part scrolls, so progress and buttons stay put. */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <h2
            id={TOUR_TITLE_ID}
            className="mb-1.5 text-base font-semibold text-on-surface"
          >
            {title}
          </h2>
          <p className="text-sm leading-relaxed text-on-surface-variant">
            {body}
          </p>
        </div>

        <div className="mt-5 flex shrink-0 items-center justify-between gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="rounded-lg px-1 py-1 text-xs font-semibold text-on-surface-variant underline-offset-2 transition-colors hover:text-on-surface hover:underline"
          >
            Skip tutorial
          </button>

          <div className="flex items-center gap-2">
            {/* No Back on the first step, matching PropertyListingForm's StepNav. */}
            {onBack ? (
              <Button type="button" variant="secondary" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <span />
            )}
            <Button type="button" onClick={onNext}>
              {isLast ? (
                <>
                  Finish <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  },
);
