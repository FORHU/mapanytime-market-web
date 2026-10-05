"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";

/** How long frames keep coming after the last scroll or change, for transitions to settle. */
const TAIL_MS = 1000;

/**
 * Calls `onFrame` on animation frames while `ref` is on screen (or within `rootMargin` of it):
 * once on mount, then whenever the page scrolls or resizes, and for as long as `onFrame` returns
 * `true` ("still settling"), plus a short tail. Used for scroll-scrubbed animation: `onFrame`
 * reads scroll position and writes styles straight to the DOM, so nothing re-renders per frame,
 * and nothing runs while the page sits still or the element is off screen. Without
 * IntersectionObserver (old browsers, jsdom) it only runs the mount call, which leaves everything
 * in its starting state.
 *
 * Returns a function that asks for frames again, for changes that are not a scroll.
 */
export function useFrameWhileVisible<T extends Element>(
  ref: RefObject<T | null>,
  onFrame: () => boolean | void,
  rootMargin = "200px 0px",
): () => void {
  const callback = useRef(onFrame);
  const wakeRef = useRef<() => void>(() => {});
  useEffect(() => {
    callback.current = onFrame;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    callback.current();
    if (typeof IntersectionObserver === "undefined") return;

    let visible = false;
    let raf = 0;
    /** Frames keep coming until this time (a `requestAnimationFrame` timestamp). */
    let until = 0;
    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      if (callback.current()) until = now + TAIL_MS;
      if (now < until) raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      until = performance.now() + TAIL_MS;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    };
    wakeRef.current = wake;

    const listen = (on: boolean) => {
      for (const type of ["scroll", "resize"] as const) {
        if (on) window.addEventListener(type, wake, { passive: true });
        else window.removeEventListener(type, wake);
      }
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting === visible) return;
        visible = entry.isIntersecting;
        listen(visible);
        if (visible) wake();
        else {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      listen(false);
      cancelAnimationFrame(raf);
      wakeRef.current = () => {};
    };
  }, [ref, rootMargin]);

  return useCallback(() => wakeRef.current(), []);
}
