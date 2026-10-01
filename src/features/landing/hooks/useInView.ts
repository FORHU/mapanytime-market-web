"use client";

import { useEffect, useState, type RefObject } from "react";

interface Options {
  rootMargin?: string;
}

/**
 * Whether the element is on screen. Used to run loops (map drift, seller notifications) only while
 * they can be seen. Without IntersectionObserver (old browsers, jsdom) it reports `true` so
 * nothing is left in a broken half-state.
 */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { rootMargin = "0px" }: Options = {},
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
