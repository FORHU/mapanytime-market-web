"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { MousePointer2, Radar } from "lucide-react";
import { Bezel } from "./ui/Bezel";
import { VIEWPORT_PINS } from "../landing.content";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

const INSET = 8;

/**
 * Shows how map search works: results follow what's on screen. A dashed "visible area" eases toward
 * the pointer (or drifts on its own when idle) and every store inside it lights up.
 *
 * Position lives in a ref and is written straight to the DOM from a rAF loop, so the animation never
 * re-renders React. The loop runs only while the card is on screen and never under reduced motion;
 * in that case the box jumps to the pointer instead of easing.
 */
export function ViewportMapDemo() {
  const mapRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const pos = useRef({ x: -1, y: -1, tx: 0, ty: 0, hover: false });
  const inView = useInView(mapRef);
  const reduce = useReducedMotion();

  useEffect(() => {
    const map = mapRef.current;
    const box = boxRef.current;
    const count = countRef.current;
    if (!map || !box || !count) return;

    const pins = Array.from(map.querySelectorAll<HTMLElement>("[data-pin]"));
    let W = 0;
    let H = 0;
    let bw = 0;
    let bh = 0;
    let points: { el: HTMLElement; x: number; y: number }[] = [];
    const p = pos.current;

    const clamp = (v: number, lo: number, hi: number) =>
      Math.max(lo, Math.min(hi, v));
    const measure = () => {
      W = map.clientWidth;
      H = map.clientHeight;
      bw = box.offsetWidth;
      bh = box.offsetHeight;
      points = pins.map((el) => ({
        el,
        x: (Number(el.dataset.x) / 100) * W,
        y: (Number(el.dataset.y) / 100) * H,
      }));
    };
    const paint = () => {
      box.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
      let n = 0;
      for (const pt of points) {
        const inside =
          pt.x > p.x + INSET &&
          pt.x < p.x + bw - INSET &&
          pt.y > p.y + INSET &&
          pt.y < p.y + bh - INSET;
        if (inside) n++;
        pt.el.classList.toggle("is-in", inside);
      }
      const text = String(n);
      if (count.textContent !== text) count.textContent = text;
    };

    measure();
    if (p.x < 0) {
      p.x = p.tx = W * 0.4 - bw / 2;
      p.y = p.ty = H * 0.34 - bh / 2;
    }
    paint();

    const onMove = (e: PointerEvent) => {
      const r = map.getBoundingClientRect();
      p.hover = true;
      p.tx = clamp(e.clientX - r.left - bw / 2, 0, W - bw);
      p.ty = clamp(e.clientY - r.top - bh / 2, 0, H - bh);
      if (reduce) {
        p.x = p.tx;
        p.y = p.ty;
        paint();
      }
    };
    const onLeave = () => {
      p.hover = false;
    };
    const onResize = () => {
      measure();
      paint();
    };
    map.addEventListener("pointermove", onMove);
    map.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);

    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      if (!p.hover) {
        const t = (now - start) / 1000;
        p.tx = W * (0.4 + 0.24 * Math.sin(t * 0.32)) - bw / 2;
        p.ty = H * (0.34 + 0.12 * Math.sin(t * 0.47 + 1.2)) - bh / 2;
      }
      p.x = clamp(p.x + (p.tx - p.x) * 0.08, 0, W - bw);
      p.y = clamp(p.y + (p.ty - p.y) * 0.08, 0, H - bh);
      paint();
      raf = requestAnimationFrame(frame);
    };
    if (inView && !reduce) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      map.removeEventListener("pointermove", onMove);
      map.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [inView, reduce]);

  return (
    <div ref={mapRef} className="lp-core lp-scan" data-glow="">
      <Image
        src="/landing/map-day.jpg"
        alt="City map with store pins"
        fill
        sizes="(max-width: 1000px) 100vw, 800px"
      />
      <div ref={boxRef} className="lp-viewport" aria-hidden="true">
        <span className="lp-viewport__tag">
          <span ref={countRef}>0</span> stores in view
        </span>
      </div>
      {VIEWPORT_PINS.map(({ icon: Icon, x, y }) => (
        <span
          key={`${x}-${y}`}
          className="lp-mp"
          data-pin=""
          data-x={x}
          data-y={y}
          style={{ left: `${x}%`, top: `${y}%` }}
          aria-hidden="true"
        >
          <Icon />
        </span>
      ))}
      <Bezel size="sm" className="lp-cap lp-float" coreClassName="lp-cell">
        <span className="lp-ic" aria-hidden="true">
          <Radar />
        </span>
        <h3>A live map of local stores</h3>
        <p>
          Results follow your screen. Move the map and the store list updates to
          what&apos;s in view.
        </p>
        <span className="lp-hint">
          <MousePointer2 aria-hidden="true" />
          Move across the map to try it
        </span>
      </Bezel>
    </div>
  );
}
