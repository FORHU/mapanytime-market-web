"use client";

import { useEffect, useState } from "react";
import type { MapPinData } from "../types";

interface LandingHeroProps {
  submitted: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  activePin: string;
  onPinHover: (name: string) => void;
  mapRef: React.RefObject<HTMLDivElement | null>;
  onMapMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMapLeave: () => void;
  pins: MapPinData[];
}

const WORDS: { word: string; duration: number }[] = [
  { word: "uploading", duration: 4000 },
  { word: "browsing", duration: 4000 },
  { word: "supporting", duration: 4000 },
  { word: "shopping", duration: 8000 },
  { word: "picking up", duration: 4000 },
];

const EXIT_MS = 280;

function CyclingWord() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"entering" | "leaving">("entering");

  useEffect(() => {
    const { duration } = WORDS[index];

    const leaveTimer = window.setTimeout(() => {
      setPhase("leaving");
    }, duration - EXIT_MS);

    const nextTimer = window.setTimeout(() => {
      setIndex((prev) => (prev + 1) % WORDS.length);
      setPhase("entering");
    }, duration);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(nextTimer);
    };
  }, [index]);

  return (
    <span
      className="inline-block align-baseline bg-gradient-to-r from-[#67e8f9] via-[#22d3ee] to-[#a5f3fc] bg-clip-text text-transparent leading-[1.08] pb-[0.06em] transition-[opacity,transform] ease-out"
      style={{
        transitionDuration: `${EXIT_MS}ms`,
        opacity: phase === "leaving" ? 0 : 1,
        transform: phase === "leaving" ? "translateY(-10px)" : "translateY(0)",
      }}
    >
      {WORDS[index].word}
    </span>
  );
}

export function LandingHero({ activePin, pins }: LandingHeroProps) {
  const activePinData = pins.find((pin) => pin.name === activePin) ?? pins[0];

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#021521] px-6 pb-[60px] pt-[135px] max-landing-sm:px-4 max-landing-sm:pb-[50px] max-landing-sm:pt-[110px]">
      {/* Video Background */}
      <video
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
        src="/placeholders/hero-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      {/* Dark Overlay */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[#021521]/70" />

      {/* Grid Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          maskImage: "linear-gradient(to bottom, black, transparent 95%)",
        }}
      />

      {/* Glows */}
      <div className="pointer-events-none absolute -right-[280px] -top-[300px] z-[1] h-[600px] w-[600px] rounded-full bg-[rgba(34,211,238,0.15)] blur-[5px]" />
      <div className="pointer-events-none absolute -bottom-[400px] -left-[300px] z-[1] h-[600px] w-[600px] rounded-full bg-[rgba(99,102,241,0.09)] blur-[5px]" />

      <div className="relative z-[2] mx-auto grid w-full max-w-[1200px] grid-cols-[0.85fr_1.15fr] items-center gap-[65px] max-landing-lg:grid-cols-1 max-landing-lg:gap-[70px]">
        {/* Hero Copy */}
        <div className="animate-hero-in max-landing-lg:mx-auto max-landing-lg:max-w-[700px] max-landing-lg:text-center mt-20">
          {/* Heading */}
          <h1 className="mt-[23px] max-w-[650px] text-[clamp(44px,5.5vw,75px)] leading-[1] tracking-[-0.06em] max-landing-lg:mx-auto max-landing-sm:text-[clamp(40px,11vw,58px)]">
            <span className="text-white">Stop guessing.</span>

            <br />

            <span className="animate-gradient bg-gradient-to-r from-[#67e8f9] via-[#22d3ee] to-[#a5f3fc] bg-[length:200%_auto] bg-clip-text text-transparent">
              Start{" "}
            </span>

            <CyclingWord />

            <span className="animate-gradient bg-gradient-to-r from-[#67e8f9] via-[#22d3ee] to-[#a5f3fc] bg-[length:200%_auto] bg-clip-text text-transparent">
              {" "}
              locally.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-[25px] max-w-[520px] text-[15px] leading-[1.75] text-[#91aebb] max-landing-lg:mx-auto max-landing-sm:text-[13px]">
            MapAnytime turns independent shops into live storefronts on the map.
            See what&apos;s actually in stock, reserve it online, and pick it up
            when you arrive.
          </p>
        </div>
      </div>
    </section>
  );
}
