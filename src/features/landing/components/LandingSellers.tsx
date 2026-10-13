"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
} from "react";
import Image from "next/image";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";
import { PillButton } from "./ui/PillButton";
import { Reveal } from "./ui/Reveal";
import { useReducedMotion } from "../hooks/useReducedMotion";

/*
 * For sellers, as one full-bleed band: a shop glowing at night under a navy wash, and a blue pin
 * that drops onto the headline as the band comes into view. One line, one button, three words.
 *
 * The pin is the same teardrop the How it works story drops on its map, so the two read as one
 * system. The photo is hotlinked from Unsplash (allowed in next.config.ts), free to use under the
 * Unsplash License: "A small shop illuminated at night" by Kareem Abo El Magd.
 */

const PHOTO =
  "https://images.unsplash.com/photo-1748524099882-0b12bb9e7b78?auto=format&fit=crop&w=2400&q=80";

/* Fades into the page at the top and bottom, and keeps the centre dark enough for the type. */
const WASH: CSSProperties = {
  background:
    "linear-gradient(180deg, var(--lp-bg) 0%, rgba(7,13,18,0) 24%, rgba(7,13,18,0) 76%, var(--lp-bg) 100%), radial-gradient(ellipse 60% 70% at 50% 50%, rgba(10,30,48,0.62) 0%, rgba(7,13,18,0.9) 100%)",
};

const WORDS = ["List it", "Get found", "Sell nearby"];

export function LandingSellers() {
  const pinRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [dropped, setDropped] = useState(false);

  // The pin drops once, when the band is well on screen. Under reduced motion it is just there.
  useEffect(() => {
    const pin = pinRef.current;
    if (!pin || reduce || typeof IntersectionObserver === "undefined") {
      setDropped(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDropped(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(pin);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <section
      id="sellers"
      aria-labelledby="lp-sellers-title"
      className="relative isolate grid min-h-0 scroll-mt-24 place-items-center overflow-hidden px-4 pb-20 pt-[88px] text-center md:min-h-[min(70vh,760px)] md:px-8 md:py-28"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-[1]">
        {/* Softened so the shop reads as atmosphere and its fridge branding stays out of the way */}
        <Image
          src={PHOTO}
          alt=""
          fill
          sizes="100vw"
          className="scale-[1.04] object-cover object-[50%_62%] blur-[3px] saturate-[0.8]"
        />
        <div className="absolute inset-0" style={WASH} />
      </div>

      <div className="grid max-w-[1100px] justify-items-center gap-[22px] md:gap-7">
        <Pin ref={pinRef} dropped={dropped} pulse={dropped && !reduce} />

        <Reveal className="grid justify-items-center gap-[22px] md:gap-7">
          <h2
            id="lp-sellers-title"
            className="pb-[0.04em] text-[clamp(52px,8.6vw,140px)] font-extrabold leading-[0.9] tracking-[-0.055em]"
          >
            Your shop.{" "}
            <em className="not-italic text-[var(--lp-brand-deep)]">
              On the map.
            </em>
          </h2>
          <p className="max-w-[44ch] text-[17px] text-[var(--lp-ink-2)] md:text-[clamp(17px,1.5vw,20px)]">
            Apply on the web, get approved, and shoppers nearby can find you and
            order for pickup.
          </p>
          <PillButton href="/register" icon={ArrowUpRight} magnetic>
            Start selling
          </PillButton>
          <ul aria-label="How selling works" className="mt-2 flex">
            {WORDS.map((word) => (
              <li
                key={word}
                className="border-l border-[var(--lp-hair-2)] px-3 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--lp-ink-3)] [font-family:var(--lp-display)] first:border-l-0 md:px-6 md:text-[13px] md:tracking-[0.18em]"
              >
                {word}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/** The glowing pin, with its landing shadow and a ring that keeps pulsing out beneath it. */
function Pin({
  ref,
  dropped,
  pulse,
}: {
  ref: Ref<HTMLDivElement>;
  dropped: boolean;
  pulse: boolean;
}) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative -mb-1.5 h-[84px] w-16 md:h-[108px] md:w-[84px]"
    >
      <span
        className="absolute bottom-0 left-1/2 h-[34px] w-[120px] -translate-x-1/2 rounded-full border-2 border-[rgba(125,189,230,0.7)] opacity-0"
        style={
          pulse
            ? {
                animation:
                  "lp-tap 2.6s cubic-bezier(0.16, 1, 0.3, 1) 1.1s infinite",
              }
            : undefined
        }
      />
      <span
        className={clsx(
          "absolute bottom-0 left-1/2 h-2.5 w-[38px] -translate-x-1/2 rounded-full bg-[rgba(74,162,218,0.55)] blur-[4px] transition-transform delay-300 duration-1000",
          dropped ? "scale-100" : "scale-0",
        )}
      />
      <span
        className={clsx(
          "absolute left-1/2 top-0 h-14 w-14 -translate-x-1/2 transition-[transform,opacity] duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] md:h-[72px] md:w-[72px]",
          dropped ? "opacity-100" : "-translate-y-[260px] opacity-0",
        )}
      >
        <span className="absolute inset-0 -rotate-45 rounded-[50%_50%_50%_10px] border-[3px] border-[var(--lp-ink)] bg-[var(--lp-action)] shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_0_48px_6px_rgba(74,162,218,0.55),0_18px_36px_-10px_rgba(0,0,0,0.7)]" />
        <span className="absolute left-1/2 top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--lp-bg)] md:h-[22px] md:w-[22px]" />
      </span>
    </div>
  );
}
