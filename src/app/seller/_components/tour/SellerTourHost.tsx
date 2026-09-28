"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  TourOverlay,
  type TourStep,
} from "@/shared/components/tour/TourOverlay";
import { useIsMobile } from "@/shared/hooks/useIsMobile";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { useStoreOverviewStats } from "@/shared/hooks/useOrdersPipeline";
import { useActiveStore } from "@/features/stores/hooks/useActiveStore";
import { hasSeenTour, markTourSeen } from "@/shared/lib/tutorial-prefs";
import {
  PRODUCTS_TOUR_ID,
  PROMOTIONS_TOUR_ID,
  WELCOME_TOUR_ID,
  productsTourSteps,
  promotionsTourSteps,
  sellerWelcomeTourSteps,
} from "@/app/seller/_components/tour/sellerTourSteps";

interface Tour {
  id: string;
  steps: TourStep[];
  /** Anchor that must exist before steps are filtered, for UI mounted on demand. */
  readyAnchor?: string;
  /** Control that mounts `readyAnchor`; clicked only on an explicit Help press. */
  openWith?: string;
}

const TOURS_BY_ROUTE: Record<string, Tour> = {
  "/seller/dashboard": { id: WELCOME_TOUR_ID, steps: sellerWelcomeTourSteps },
  "/seller/products": { id: PRODUCTS_TOUR_ID, steps: productsTourSteps },
  "/seller/promotions": {
    id: PROMOTIONS_TOUR_ID,
    steps: promotionsTourSteps,
    // The form is unmounted until opened, so this tour waits for that click.
    readyAnchor: "promo-type",
    openWith: "new-promotion",
  },
};

/** Drops steps whose target isn't on the page, which also filters by permission and promotion type. */
function stepsPresentOn(steps: TourStep[]): TourStep[] {
  return steps.filter(
    (step) =>
      !step.targetTourId ||
      document.querySelector(`[data-tour="${step.targetTourId}"]`),
  );
}

interface ActiveTour {
  id: string;
  /** `source` filtered by what's currently on the page. */
  steps: TourStep[];
  /** The unfiltered list, kept for re-filtering when the page changes. */
  source: TourStep[];
}

interface SellerTourHostProps {
  accessStatus: "pending" | "error" | "ready";
  /** True for a seller awaiting verification — nothing to tour, the nav is locked. */
  disabled: boolean;
  /** Incremented by the header Help button to replay the current route's tour. */
  openRequest: number;
}

/** Decides whether a guided tour should be on screen, and which one. */
export function SellerTourHost({
  accessStatus,
  disabled,
  openRequest,
}: SellerTourHostProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { userId, rolesStatus, isHydrated } = useCurrentUser();
  const { activeStoreId } = useActiveStore();
  const { isLoading: statsLoading } = useStoreOverviewStats({ userId });

  const [tour, setTour] = useState<ActiveTour | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [contextHydrated, setContextHydrated] = useState(false);
  const [isPropertyContext, setIsPropertyContext] = useState(false);

  /** Tours opened this session, so a failed storage write can't reopen a finished tour. */
  const startedRef = useRef<Set<string>>(new Set());

  const candidate = TOURS_BY_ROUTE[pathname] ?? null;

  // Mirrors dashboard/page.tsx context resolution; reads location.search to avoid a Suspense boundary.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const queryProperty =
      params.get("context") === "property" || Boolean(params.get("propertyId"));

    let storedPropertyId: string | null = null;
    try {
      storedPropertyId = window.localStorage.getItem(
        "active_property_context_id",
      );
    } catch {
      storedPropertyId = null;
    }

    setIsPropertyContext(
      queryProperty || Boolean(storedPropertyId && !activeStoreId),
    );
    setContextHydrated(true);
  }, [pathname, activeStoreId]);

  const startTour = useCallback(
    (next: Tour) => {
      const steps = stepsPresentOn(next.steps);

      startedRef.current.add(next.id);

      if (steps.length === 0) {
        markTourSeen(next.id, userId);
        return;
      }

      setTour({ id: next.id, steps, source: next.steps });
      setStepIndex(0);
    },
    [userId],
  );

  // Starts `next` once its readyAnchor mounts; only `mayOpen` (Help press) may click it open.
  const startWhenReady = useCallback(
    (next: Tour, { mayOpen }: { mayOpen: boolean }) => {
      const isReady = () =>
        !next.readyAnchor ||
        Boolean(document.querySelector(`[data-tour="${next.readyAnchor}"]`));

      if (isReady()) {
        startTour(next);
        return undefined;
      }

      if (mayOpen && next.openWith) {
        document
          .querySelector<HTMLElement>(`[data-tour="${next.openWith}"]`)
          ?.click();
      }

      const observer = new MutationObserver(() => {
        if (!isReady()) return;
        observer.disconnect();
        startTour(next);
      });
      observer.observe(document.body, { childList: true, subtree: true });

      return () => observer.disconnect();
    },
    [startTour],
  );

  // Auto-open, first visit only.
  useEffect(() => {
    if (!candidate || tour || disabled) return;
    if (startedRef.current.has(candidate.id)) return;

    const baseReady =
      isHydrated && rolesStatus === "ready" && accessStatus === "ready";
    if (!baseReady) return;

    // Wait for stats so the tour never spotlights skeletons, and skip the property dashboard.
    if (candidate.id === WELCOME_TOUR_ID) {
      if (!contextHydrated || isPropertyContext || statsLoading) return;
    }

    if (hasSeenTour(candidate.id, userId)) return;

    return startWhenReady(candidate, { mayOpen: false });
  }, [
    candidate,
    tour,
    disabled,
    isHydrated,
    rolesStatus,
    accessStatus,
    contextHydrated,
    isPropertyContext,
    statsLoading,
    userId,
    startWhenReady,
  ]);

  // Replay from the Help button, ignoring "seen"; routes without a tour fall back to the welcome tour.
  useEffect(() => {
    if (openRequest === 0) return;

    return startWhenReady(
      candidate ?? { id: WELCOME_TOUR_ID, steps: sellerWelcomeTourSteps },
      { mayOpen: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openRequest]);

  // On mobile, open the off-canvas sidebar when the current step's target is off screen.
  useEffect(() => {
    if (!isMobile || !tour) return;

    const targetId = tour.steps[stepIndex]?.targetTourId;
    if (!targetId) return;

    const target = document.querySelector<HTMLElement>(
      `[data-tour="${targetId}"]`,
    );
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const onScreen = rect.right > 0 && rect.left < window.innerWidth;
    if (onScreen) return;

    document.querySelector<HTMLElement>('[data-tour="mobile-menu"]')?.click();
  }, [isMobile, tour, stepIndex]);

  // Re-filter steps when the page changes shape mid-tour (e.g. promotion Type switched).
  useEffect(() => {
    if (!tour) return;

    let frame = 0;

    const resync = () => {
      const next = stepsPresentOn(tour.source);

      // Nothing left to point at — keep the current list rather than tearing down.
      if (next.length === 0) return;

      const signature = (steps: TourStep[]) => steps.map((s) => s.id).join("|");
      if (signature(next) === signature(tour.steps)) return;

      const currentId = tour.steps[stepIndex]?.id;
      const kept = next.findIndex((step) => step.id === currentId);

      // If the current step vanished, move to the next surviving one.
      const following = tour.steps
        .slice(stepIndex + 1)
        .map((step) => next.findIndex((n) => n.id === step.id))
        .find((index) => index >= 0);

      setTour({ ...tour, steps: next });
      setStepIndex(
        kept >= 0 ? kept : (following ?? Math.min(stepIndex, next.length - 1)),
      );
    };

    // Coalesce mutation bursts to one pass per frame.
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(resync);
    };

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [tour, stepIndex]);

  const endTour = useCallback(() => {
    if (tour) markTourSeen(tour.id, userId);
    setTour(null);
    setStepIndex(0);
  }, [tour, userId]);

  if (!tour) return null;

  return (
    <TourOverlay
      steps={tour.steps}
      stepIndex={stepIndex}
      onBack={() => setStepIndex((i) => Math.max(0, i - 1))}
      onNext={() => setStepIndex((i) => Math.min(tour.steps.length - 1, i + 1))}
      // Skipping counts as seen, so the tour doesn't re-nag on the next load.
      onSkip={endTour}
      onFinish={endTour}
    />
  );
}
