"use client";

import { useRouter } from "next/navigation";
import { MapPin, Download } from "lucide-react";

interface HeroSectionNewProps {
  setIsDownloadModalOpen: (open: boolean) => void;
}

export default function HeroSectionNew({
  setIsDownloadModalOpen,
}: HeroSectionNewProps) {
  const router = useRouter();

  return (
    <section
      id="home"
      className="scroll-mt-20 px-margin-mobile md:px-gutter min-h-[calc(100vh-80px)] max-w-container-max mx-auto relative overflow-hidden flex flex-col justify-center"
    >
      {/* Decorative background elements */}
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/8 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-1/4 w-1/3 h-1/3 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex flex-col gap-12 items-center text-center relative z-10 w-full">
        {/* Hero Content */}
        <div className="max-w-4xl space-y-stack-md flex flex-col items-center">
          {/* Subheading */}
          <p className="font-mono text-label-caps text-primary tracking-widest uppercase">
            🗺️ Your Local Market
          </p>

          {/* Main Headline */}
          <h1 className="font-display text-display-xl md:text-[72px] text-on-surface leading-tight transition-colors">
            Your Local Market,{" "}
            <span className="text-primary font-bold">On the Map.</span>
          </h1>

          {/* Supporting Text */}
          <p className="font-body text-body-lg text-on-surface-variant max-w-2xl transition-colors">
            Discover nearby stores and products. Shop online. Pick up locally.
            What&apos;s around you is now shoppable.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 pt-8 w-full max-w-3xl">
            {/* Primary CTA - Explore Map */}
            <button
              onClick={() => {
                const mapElement = document.getElementById("map");
                if (mapElement) {
                  mapElement.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="group relative flex items-center bg-primary text-on-primary rounded-full px-8 py-4 hover:bg-primary/90 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,101,141,0.25)] transition-all duration-300 active:scale-95 font-display font-bold text-button-text"
            >
              <MapPin className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              Explore the Map
            </button>

            {/* Secondary CTA - Get App */}
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="group relative flex items-center bg-surface border-2 border-primary text-primary rounded-full px-8 py-4 hover:bg-primary-container hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,101,141,0.15)] transition-all duration-300 active:scale-95 font-display font-bold text-button-text"
            >
              <Download className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              Get the App
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
