"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import ApkDownloadModal from "@/components/apk-download-modal";
import HomeNavBar from "@/components/home/HomeNavBar";
import HeroSection from "@/components/home/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import ExploreMapSection from "@/components/home/ExploreMapSection";
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
        <HeroSection setIsDownloadModalOpen={setIsDownloadModalOpen} />
        <HowItWorksSection />
        <ExploreMapSection
          mounted={mounted}
          setIsDownloadModalOpen={setIsDownloadModalOpen}
        />
        <EcosystemSection />
      </main>

      <HomeFooter />

      <ApkDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
}
