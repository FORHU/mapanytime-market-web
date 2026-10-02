"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Calls `onFrame` once per animation frame while `ref` is on screen (or within `rootMargin` of
 * it), and once on mount. Used for scroll-scrubbed animation: `onFrame` reads scroll position and
 * writes styles straight to the DOM, so nothing re-renders per frame and nothing runs while the
 * element is off screen. Without IntersectionObserver (old browsers, jsdom) it only runs the
 * mount call, which leaves everything in its starting state.
 */
export function useFrameWhileVisible<T extends Element>(
  ref: RefObject<T | null>,
  onFrame: () => void,
  rootMargin = "200px 0px",
): void {
  const callback = useRef(onFrame);
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
    const loop = () => {
      callback.current();
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(loop);
      },
      { rootMargin },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [ref, rootMargin]);
}
