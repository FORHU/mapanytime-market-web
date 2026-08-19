"use client";

import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * InfiniteCoverflow
 * ─────────────────────────────────────────────────────────────────────────
 * A continuously auto-scrolling, infinitely-looping horizontal carousel
 * with a coverflow-style depth effect (center item scaled up + opaque,
 * side items scaled down + faded).
 *
 * HOW THE MOTION WORKS (important — two systems working together):
 *
 * 1. The base "marquee" motion is pure CSS: the item list is rendered
 *    TWICE back to back, and a `@keyframes` animation translates the
 *    track from `translateX(0)` to `translateX(-50%)`. Since the second
 *    half of the track is an exact duplicate of the first, the instant it
 *    hits -50% it looks identical to 0% — so we snap the animation back
 *    to 0% with no visible seam. This is the standard CSS-only infinite
 *    marquee technique, and it's why item counts/widths must stay fixed
 *    (see CARD_WIDTH/CARD_GAP below) — the loop math depends on it.
 *
 * 2. The coverflow depth effect (scale/opacity by distance from center)
 *    CANNOT be done in pure CSS here, because it depends on each card's
 *    live position on screen while the marquee is continuously moving.
 *    A `requestAnimationFrame` loop measures every card's bounding box
 *    each frame and writes `transform`/`opacity` directly to the DOM node
 *    (bypassing React state) for performance. This runs independently of
 *    the CSS animation — it just reads wherever the cards currently are.
 *
 * Pausing is a single `animation-play-state: paused` toggle on the track,
 * which freezes the CSS animation exactly where it is (no manual transform
 * bookkeeping needed). The nav buttons apply a *separate* translateX on an
 * outer wrapper that composes with the paused track — so a nudge is just
 * "shift everything left/right by one card" on top of wherever autoplay
 * had gotten to, and resuming autoplay continues from that same point.
 * ─────────────────────────────────────────────────────────────────────────
 */

export type CoverflowItem = {
  id: string;
  image: string;
  alt: string;
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
};

type InfiniteCoverflowProps = {
  items: CoverflowItem[];
  /** px per second the track travels at full speed. Default 60. */
  speed?: number;
  /** Card width in px. Keep fixed — the loop math depends on it. */
  cardWidth?: number;
  /** Gap between cards in px. */
  cardGap?: number;
  /** How tall each card is. */
  cardHeight?: number;
};

const DEFAULT_CARD_WIDTH = 320;
const DEFAULT_CARD_GAP = 28;
const DEFAULT_CARD_HEIGHT = 420;
const RESUME_AFTER_MS = 2600;

export function InfiniteCoverflow({
  items,
  speed = 60,
  cardWidth = DEFAULT_CARD_WIDTH,
  cardGap = DEFAULT_CARD_GAP,
  cardHeight = DEFAULT_CARD_HEIGHT,
}: InfiniteCoverflowProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [isHovered, setIsHovered] = useState(false);
  const [isNudging, setIsNudging] = useState(false);
  const [nudgeOffset, setNudgeOffset] = useState(0);
  const [duration, setDuration] = useState(30);

  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const step = cardWidth + cardGap;

  // Duration is derived from total track width so speed stays consistent
  // no matter how many items are passed in.
  useLayoutEffect(() => {
    const totalWidth = items.length * step;
    setDuration(Math.max(totalWidth / speed, 4));
  }, [items.length, step, speed]);

  // ── Coverflow depth effect: rAF loop reading live DOM positions ───────
  useLayoutEffect(() => {
    let frameId: number;

    const tick = () => {
      const container = containerRef.current;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2;
        const maxDistance = containerRect.width / 2 + cardWidth / 2;

        cardRefs.current.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          const distance = Math.abs(cardCenter - centerX);
          const proximity = Math.max(0, 1 - distance / maxDistance); // 1 = dead center, 0 = off to the side

          const scale = 0.88 + proximity * 0.22; // 0.88 → 1.10
          const opacity = 0.4 + proximity * 0.6; // 0.4 → 1.0
          const z = Math.round(proximity * 100);

          el.style.transform = `scale(${scale.toFixed(3)})`;
          el.style.opacity = opacity.toFixed(3);
          el.style.zIndex = String(z);
        });
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [cardWidth]);

  const registerCard = useCallback((key: string, el: HTMLDivElement | null) => {
    if (el) cardRefs.current.set(key, el);
    else cardRefs.current.delete(key);
  }, []);

  const nudge = (direction: 1 | -1) => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    setIsNudging(true);
    // direction 1 ("→") moves further in the autoplay direction (left);
    // direction -1 ("←") backs up (right).
    setNudgeOffset((prev) => prev - direction * step);
    resumeTimeoutRef.current = setTimeout(
      () => setIsNudging(false),
      RESUME_AFTER_MS,
    );
  };

  const paused = isHovered || isNudging;
  const loopItems = [...items, ...items]; // duplicated set → seamless -50% loop

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden select-none"
      style={{ height: cardHeight }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Local keyframes + play-state toggle. Scoped via a fixed class name;
          move into a global stylesheet if you'd rather not inline it. */}
      <style>{`
        @keyframes coverflow-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .coverflow-track {
          animation-name: coverflow-marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .coverflow-track[data-paused="true"] {
          animation-play-state: paused;
        }
      `}</style>

      {/* Outer wrapper: carries the manual nudge offset, composes with the
          inner track's CSS-animated transform. */}
      <div
        className="h-full"
        style={{
          transform: `translateX(${nudgeOffset}px)`,
          transition: "transform 520ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          className="coverflow-track flex h-full items-center"
          data-paused={paused}
          style={{
            animationDuration: `${duration}s`,
            gap: cardGap,
            width: "max-content",
          }}
        >
          {loopItems.map((item, i) => {
            const key = `${item.id}-${i}`;
            return (
              <div
                key={key}
                ref={(el) => registerCard(key, el)}
                className="relative shrink-0 overflow-hidden rounded-3xl shadow-xl transition-shadow duration-300"
                style={{
                  width: cardWidth,
                  height: cardHeight * 0.86,
                  willChange: "transform, opacity",
                }}
              >
                <Image
                  fill
                  src={item.image}
                  alt={item.alt}
                  draggable={false}
                  className="object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.05) 75%)",
                  }}
                />
                {(item.badge || item.title || item.subtitle) && (
                  <div className="absolute inset-x-0 bottom-0 z-10 space-y-2 p-5">
                    {item.badge}
                    {item.title && (
                      <h3 className="text-lg font-bold leading-snug text-white">
                        {item.title}
                      </h3>
                    )}
                    {item.subtitle && (
                      <p className="max-w-[90%] text-xs text-white/70">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
