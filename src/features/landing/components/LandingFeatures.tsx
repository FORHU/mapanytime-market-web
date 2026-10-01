"use client";

import type { PointerEvent } from "react";
import Image from "next/image";
import { Check, Heart, Navigation, ScanQrCode } from "lucide-react";
import { Bezel } from "./ui/Bezel";
import { Reveal } from "./ui/Reveal";
import { ViewportMapDemo } from "./ViewportMapDemo";
import { NEAR_STORES, PERKS } from "../landing.content";

/** Feeds the cursor position to whichever bento card it's over, for the hover glow. */
function trackGlow(e: PointerEvent<HTMLDivElement>) {
  const card = (e.target as HTMLElement).closest<HTMLElement>("[data-glow]");
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${e.clientX - r.left}px`);
  card.style.setProperty("--my", `${e.clientY - r.top}px`);
}

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="lp-sec lp-sec--tight"
      aria-labelledby="lp-features-title"
    >
      <div className="lp-wrap">
        <Reveal className="lp-head">
          <h2 id="lp-features-title" className="lp-h2">
            Everything nearby,
            <br />
            in one app.
          </h2>
          <p className="lp-lede">
            Built around the map, so what you see is what&apos;s around you.
          </p>
        </Reveal>

        <div className="lp-bento" onPointerMove={trackGlow}>
          <Reveal className="lp-b-map">
            <div className="lp-shell">
              <ViewportMapDemo />
            </div>
          </Reveal>

          <Reveal className="lp-b-near" delay={1}>
            <Bezel coreClassName="lp-cell" glow>
              <span className="lp-ic" aria-hidden="true">
                <Navigation />
              </span>
              <h3>Closest first</h3>
              <p>Stores are sorted by distance from you.</p>
              <ul className="lp-near" aria-label="Example nearby stores">
                {NEAR_STORES.map((s) => (
                  <li key={s.name}>
                    <span>
                      <b>{s.name}</b>
                      <small>{s.category}</small>
                    </span>
                    <span className="lp-mono">{s.distance}</span>
                  </li>
                ))}
              </ul>
            </Bezel>
          </Reveal>

          <Reveal className="lp-b-pass" delay={2}>
            <Bezel coreClassName="lp-cell" glow>
              <span className="lp-ic" aria-hidden="true">
                <ScanQrCode />
              </span>
              <h3>Pickup pass</h3>
              <p>
                Show your pass at the counter, or scan the store&apos;s code to
                confirm a cash order.
              </p>
              <span className="lp-tag">
                <Check aria-hidden="true" />
                Ready for pickup
              </span>
            </Bezel>
          </Reveal>

          <Reveal className="lp-b-save">
            <Bezel glow>
              <div className="lp-cell">
                <span className="lp-ic" aria-hidden="true">
                  <Heart />
                </span>
                <h3>Save stores, earn MapPoints</h3>
                <p>
                  Keep a wishlist of the stores and products you love, and hear
                  the moment your order is ready.
                </p>
                <div className="lp-perks">
                  {PERKS.map(({ icon: Icon, label }) => (
                    <span key={label}>
                      <Icon aria-hidden="true" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="lp-b-save__photo">
                <Image
                  src="/landing/floral.jpg"
                  alt="A shopper holding a bouquet at a flower stall"
                  fill
                  sizes="(max-width: 767px) 100vw, 600px"
                />
              </div>
            </Bezel>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
