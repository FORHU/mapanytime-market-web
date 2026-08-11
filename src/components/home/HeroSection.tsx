"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag, Store } from "lucide-react";

interface HeroSectionProps {
  setIsDownloadModalOpen: (open: boolean) => void;
}

export default function HeroSection({
  setIsDownloadModalOpen,
}: HeroSectionProps) {
  const router = useRouter();

  return (
    <section
      id="home"
      className="scroll-mt-20 px-margin-mobile md:px-gutter min-h-[calc(100vh-80px)] max-w-container-max mx-auto relative overflow-hidden flex flex-col justify-center"
    >
      {/* Decorative background glow */}
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex flex-col gap-12 items-center text-center relative z-10 w-full">
        {/* Text Content */}
        <div className="max-w-5xl space-y-stack-md flex flex-col items-center">
          <p className="font-mono text-label-caps text-primary tracking-widest uppercase">
            Shop the map, anytime, anywhere.
          </p>
          <h1 className="font-display text-display-xl text-on-surface leading-tight transition-colors">
            Connecting <span className="text-primary">Local</span> Stores to the
            World Through a Map, a Photo, and a Seamless Pickup Experience.
          </h1>
          <p className="font-body text-body-lg text-on-surface-variant max-w-2xl transition-colors">
            Discover hyperlocal products from neighborhood stores, markets, and
            pop-ups — pinned live on a map near you.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 pt-8 w-full max-w-3xl">
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="group relative flex items-center bg-surface border border-outline-variant/30 rounded-full p-2 pr-8 hover:border-primary/50 hover:bg-surface-container-low hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 active:scale-95"
            >
              <div className="bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="ml-4 flex flex-col text-left">
                <span className="font-display text-on-surface text-[16px] font-bold leading-tight">
                  Shop the Market
                </span>
                <span className="text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold">
                  GET THE APP
                </span>
              </div>
            </button>

            <button
              onClick={() => router.push("/register")}
              className="group relative flex items-center bg-surface border border-outline-variant/30 rounded-full p-2 pr-8 hover:border-secondary/50 hover:bg-surface-container-low hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 active:scale-95"
            >
              <div className="bg-secondary text-on-secondary w-12 h-12 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300">
                <Store className="w-5 h-5" />
              </div>
              <div className="ml-4 flex flex-col text-left">
                <span className="font-display text-on-surface text-[16px] font-bold leading-tight">
                  Join the Market
                </span>
                <span className="text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold">
                  Seller Sign Up
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
