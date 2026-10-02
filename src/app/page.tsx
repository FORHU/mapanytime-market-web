"use client";

import { useState } from "react";
import "@/features/landing/landing.css";
import { LandingNav } from "@/features/landing/components/LandingNav";
import { LandingHero } from "@/features/landing/components/LandingHero";
import { LandingHowItWorks } from "@/features/landing/components/LandingHowItWorks";
import { LandingFeatures } from "@/features/landing/components/LandingFeatures";
import { LandingSellers } from "@/features/landing/components/LandingSellers";
import { LandingCTA } from "@/features/landing/components/LandingCTA";
import { LandingFooter } from "@/features/landing/components/LandingFooter";
import { useLatestRelease } from "@/features/app-releases/hooks";
import ApkDownloadModal from "@/components/apk-download-modal";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { resolveHomeRoute } from "@/features/auth/utils/resolveHomeRoute";

export default function MapAnytimeLanding() {
  const { roles, rolesStatus } = useCurrentUser();
  // Gated on `rolesStatus`, not `isHydrated`: roles now arrive from /users/me, so
  // a hydrated-but-unresolved render would resolve this against an empty array
  // and point a signed-in seller's nav at the wrong place until the fetch landed.
  const homeRoute =
    rolesStatus === "ready" ? resolveHomeRoute(roles) : undefined;
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  // Same source as the download modal, so the button, the QR and the modal always agree. The
  // install link names no version: the API serves whichever version an admin made downloadable.
  const { release, downloadUrl } = useLatestRelease();

  return (
    <div className="landing">
      <div className="lp-grain" aria-hidden="true" />
      <LandingNav homeRoute={homeRoute} />

      <main>
        <LandingHero />
        <LandingHowItWorks />
        <LandingFeatures />
        <LandingSellers />
        <LandingCTA
          downloadUrl={downloadUrl}
          release={release}
          onShowDetails={() => setIsDownloadModalOpen(true)}
        />
      </main>

      <LandingFooter />

      <ApkDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
}
