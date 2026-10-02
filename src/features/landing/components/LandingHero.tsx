"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import clsx from "clsx";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { PillButton } from "./ui/PillButton";
import { HERO_SLIDES } from "../landing.content";
import { useReducedMotion } from "../hooks/useReducedMotion";

const WORDS = ["Shop", "the", "map,"];

/**
 * Full-bleed hero over a slow cycle of photos. The progress bar under the active tab is a CSS
 * animation; its `animationend` advances the slide, so hovering the tabs (which pauses the bar)
 * pauses the cycle too. With reduced motion there is no autoplay, but the tabs still switch slides.
 */
export function LandingHero() {
  const reduce = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const next = () => setCurrent((c) => (c + 1) % HERO_SLIDES.length);

  return (
    <section
      id="top"
      className={clsx("lp-hero", !reduce && "lp-autoplay")}
      aria-label="Introduction"
    >
      <div className="lp-slides" aria-hidden="true">
        {HERO_SLIDES.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className={clsx(
              "lp-slide",
              slide.fit === "globe" && "lp-slide--globe",
              i === current && "is-on",
            )}
          />
        ))}
      </div>
      <div className="lp-scrim" />

      <div className="lp-wrap lp-hero__inner">
        <div className="lp-hero__copy">
          <h1 aria-label="Shop the map, anytime.">
            <span aria-hidden="true">
              {WORDS.map((word, i) => (
                <span key={word}>
                  <span className="lp-word">
                    <span style={{ "--i": i } as CSSProperties}>{word}</span>
                  </span>{" "}
                </span>
              ))}
              <em>
                <span className="lp-word">
                  <span style={{ "--i": WORDS.length } as CSSProperties}>
                    anytime.
                  </span>
                </span>
              </em>
            </span>
          </h1>
          <p className="lp-hero__sub">
            Find nearby stores on a live map, see what they sell, and pick up
            your order in person.
          </p>
          <div className="lp-hero__ctas">
            <PillButton href="#install" icon={ArrowDownRight} magnetic>
              Install the App
            </PillButton>
            <PillButton
              href="#sellers"
              variant="quiet"
              icon={ArrowUpRight}
              magnetic
            >
              Sell on MapAnytime
            </PillButton>
          </div>
        </div>

        <div className="lp-tabs" role="tablist" aria-label="Hero background">
          {HERO_SLIDES.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={slide.label}
              onClick={() => setCurrent(i)}
            >
              <span className="lp-tabs__label">{slide.label}</span>
              <span className="lp-tabs__bar">
                <b onAnimationEnd={() => i === current && next()} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
