"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import ApkDownloadModal from "@/components/apk-download-modal";
import HomeNavBar from "@/components/home/HomeNavBar";
import HeroSectionNew from "@/components/home/HeroSection_New";
import NearbyProductsSection from "@/components/home/NearbyProductsSection";
import JourneySection from "@/components/home/JourneySection";
import LocalPickupSection from "@/components/home/LocalPickupSection";
import TrendingNearYouSection from "@/components/home/TrendingNearYouSection";
import DifferentiationSection from "@/components/home/DifferentiationSection";
import RealEstateMarketplaceSection from "@/components/home/RealEstateMarketplaceSection";
import ExploreMapSection from "@/components/home/ExploreMapSection";
import MobileAppSection from "@/components/home/MobileAppSection";
import FinalCTASection from "@/components/home/FinalCTASection";
import EcosystemSection from "@/components/home/EcosystemSection";
import HomeFooter from "@/components/home/HomeFooter";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("home");
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  useEffect(() => {
    if (!mounted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <HomeNavBar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        toggleTheme={toggleTheme}
        mounted={mounted}
        resolvedTheme={resolvedTheme}
      />

      <main className="flex-grow">
        {/* NEW MARKETING LANDING PAGE SECTIONS */}

        {/* 1. Simplified Hero Section */}
        <HeroSectionNew setIsDownloadModalOpen={setIsDownloadModalOpen} />

        {/* 2. What's Around You - Real Products Section */}
        <NearbyProductsSection />

        {/* 3. Discover → Shop → Pickup Journey */}
        <JourneySection />

        {/* 4. Local Pickup Benefits Section */}
        <LocalPickupSection />

        {/* 5. Trending Near You Section */}
        <TrendingNearYouSection />

        {/* 6. Differentiation Section - Why MapAnytime is Different */}
        <DifferentiationSection />

        {/* 6.5. Real Estate Marketplace Section - NEW */}
        <RealEstateMarketplaceSection />

        {/* CORE INTERACTIVE MAP - PRESERVED UNCHANGED ✅ */}
        <ExploreMapSection
          mounted={mounted}
          setIsDownloadModalOpen={setIsDownloadModalOpen}
        />

        {/* 7. Mobile App Section */}
        <MobileAppSection />

        {/* 8. Ecosystem Section */}
        <EcosystemSection />

        {/* 9. Final CTA Section */}
        <FinalCTASection setIsDownloadModalOpen={setIsDownloadModalOpen} />
      </main>

      <HomeFooter />

      <ApkDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
}
