"use client";

import clsx from "clsx";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useReducedMotion } from "@/features/landing/hooks/useReducedMotion";

interface RevealProps {
  className?: string;
  /** Stagger step; each unit adds 80ms of delay. */
  delay?: number;
  children: ReactNode;
}

/**
 * Fades and lifts content in as it scrolls into view. Only content that starts below the fold is
 * hidden, and only after mount, so server HTML and the first painted frame are always complete.
 */
export function Reveal({ className, delay = 0, children }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const el = ref.current;
    // `reduce` starts as the server value (false) and flips after hydration, so an element hidden
    // on that first pass has to be shown again here, not just left alone.
    if (!el || reduce || typeof IntersectionObserver === "undefined") {
      setPending(false);
      return;
    }
    if (el.getBoundingClientRect().top <= window.innerHeight) return;

    setPending(true);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPending(false);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <div
      ref={ref}
      className={clsx("lp-reveal", pending && "is-pending", className)}
      style={delay ? ({ "--d": delay } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
