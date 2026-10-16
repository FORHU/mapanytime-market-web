"use client";

import { MapPin, Download } from "lucide-react";

interface FinalCTASectionProps {
  setIsDownloadModalOpen: (open: boolean) => void;
}

export default function FinalCTASection({
  setIsDownloadModalOpen,
}: FinalCTASectionProps) {
  return (
    <section className="py-section-gap px-margin-mobile md:px-gutter transition-colors bg-gradient-to-b from-surface to-surface-container-low relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto w-full text-center relative z-10">
        {/* Main Message */}
        <h2 className="font-display text-display-xl md:text-[64px] text-on-surface leading-tight mb-6 transition-colors">
          What&apos;s Near You?
        </h2>

        <p className="font-body text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-12">
          Discover it on MapAnytime. Your local market is waiting.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <button
            onClick={() => {
              const mapElement = document.getElementById("map");
              if (mapElement) {
                mapElement.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="group px-10 py-4 bg-primary text-on-primary rounded-full font-display font-bold text-button-text hover:bg-primary/90 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 sm:flex-1 max-w-sm"
          >
            <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Explore the Map
          </button>

          <button
            onClick={() => setIsDownloadModalOpen(true)}
            className="group px-10 py-4 bg-secondary text-on-secondary rounded-full font-display font-bold text-button-text hover:bg-secondary/90 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 sm:flex-1 max-w-sm"
          >
            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Get the App
          </button>
        </div>

        {/* Secondary CTAs */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 flex-wrap">
          <a
            href="/seller"
            className="px-8 py-3 border-2 border-primary text-primary rounded-full font-display font-bold text-button-text hover:bg-primary-container transition-colors duration-300"
          >
            Become a Seller
          </a>
          <a
            href="/agent"
            className="px-8 py-3 border-2 border-secondary text-secondary rounded-full font-display font-bold text-button-text hover:bg-secondary-container transition-colors duration-300"
          >
            Join as Agent
          </a>
        </div>
      </div>
    </section>
  );
}
