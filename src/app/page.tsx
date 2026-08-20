"use client";

import { useLandingPage } from "@/features/landing/hooks/useLandingPage";
import { LandingNav } from "@/features/landing/components/LandingNav";
import { LandingHero } from "@/features/landing/components/LandingHero";
import { LandingStats } from "@/features/landing/components/LandingStats";
import { LandingStory } from "@/features/landing/components/LandingStory";
import { LandingHowItWorks } from "@/features/landing/components/LandingHowItWorks";
import { LandingBenefits } from "@/features/landing/components/LandingBenefits";
import { LandingCTA } from "@/features/landing/components/LandingCTA";
import { LandingFooter } from "@/features/landing/components/LandingFooter";
import ExploreMapSection from "@/components/home/ExploreMapSection";
import { useState, useEffect } from "react";

export default function MapAnytimeLanding() {
  const landing = useLandingPage();
  const [mounted, setMounted] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7fafc] font-body text-white">
      <div
        className="pointer-events-none fixed z-[100] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen motion-reduce:hidden"
        style={{
          left: landing.mouse.x,
          top: landing.mouse.y,
          background:
            "radial-gradient(circle, rgba(34, 211, 238, 0.09), transparent 70%)",
        }}
      />

      <LandingNav scrolled={landing.scrolled} />

      <LandingHero
        submitted={landing.submitted}
        onSubmit={landing.handleSubmit}
        activePin={landing.activePin}
        onPinHover={landing.setActivePin}
        mapRef={landing.mapRef}
        onMapMove={landing.handleMapMove}
        onMapLeave={landing.handleMapLeave}
        pins={landing.pins}
      />

      <LandingHowItWorks />

      <LandingBenefits />

      <LandingStory />

      <LandingCTA />

      <LandingFooter />
    </main>
  );
}
