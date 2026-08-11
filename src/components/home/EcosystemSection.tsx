"use client";

import { Handshake, Store, ShoppingCart, ArrowRight } from "lucide-react";

export default function EcosystemSection() {
  return (
    <section
      id="ecosystem"
      className="scroll-mt-20 py-24 px-margin-mobile md:px-gutter text-center transition-colors min-h-[calc(100vh-80px)] flex flex-col justify-center bg-surface relative overflow-hidden z-0"
    >
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto space-y-4 mb-20 relative z-10">
        <p className="font-mono text-label-caps text-primary tracking-widest uppercase font-bold">
          The MapAnytime Ecosystem
        </p>
        <h2 className="font-display text-headline-lg text-on-surface tracking-tight font-extrabold transition-colors">
          One Platform. Every Journey.
        </h2>
        <p className="text-on-surface-variant max-w-2xl mx-auto mt-4 text-lg">
          Whether you want to shop locally, grow your store, or help businesses
          join the market, MapAnytime has a place for you.
        </p>
      </div>

      <div className="relative max-w-7xl mx-auto w-full z-10">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 w-full relative z-10">
          {/* Agent Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 p-8 rounded-3xl shadow-lg hover:shadow-xl text-center flex flex-col items-center justify-between space-y-6 relative border-t-4 border-t-tertiary transition-all duration-300 hover:-translate-y-2 group">
            <div className="space-y-4 flex flex-col items-center">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-tertiary-container text-on-tertiary-container transition-colors shadow-sm group-hover:scale-110 duration-300">
                <Handshake className="w-8 h-8" />
              </div>
              <h3 className="font-display text-on-surface font-bold transition-colors">
                Agent
              </h3>
              <p className="font-body text-on-surface-variant text-center">
                Find local businesses and connect them to the MapAnytime market.
              </p>
            </div>
            <button className="w-full py-3.5 bg-surface text-tertiary border border-tertiary/30 font-display rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-tertiary hover:text-on-tertiary transition-colors group-hover:border-tertiary font-bold">
              Become an Agent <ArrowRight className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Seller Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 p-8 rounded-3xl shadow-lg hover:shadow-xl text-center flex flex-col items-center justify-between space-y-6 relative border-t-4 border-t-secondary transition-all duration-300 hover:-translate-y-2 group lg:-mt-8">
            {/* Connecting Line from Agent */}
            <div className="hidden lg:flex absolute top-[40%] -left-[3rem] xl:-left-[3rem] w-[3rem] items-center -z-10 justify-center">
              <div className="h-0.5 w-full border-t-2 border-dashed border-tertiary/40" />
              <div className="absolute right-0 w-2 h-2 rounded-full bg-tertiary/50" />
            </div>
            {/* Connecting Line to Buyer */}
            <div className="hidden lg:flex absolute top-[40%] -right-[3rem] xl:-right-[3rem] w-[3rem] items-center -z-10 justify-center">
              <div className="h-0.5 w-full border-t-2 border-dashed border-secondary/40" />
              <div className="absolute right-0 w-2 h-2 rounded-full bg-secondary/50" />
            </div>
            {/* Connecting Line from Buyer back to Seller (Continuous network effect) */}
            <div className="hidden lg:flex absolute top-[60%] -right-[3rem] xl:-right-[3rem] w-[3rem] items-center -z-10 justify-center">
              <div className="h-0.5 w-full border-t-2 border-dashed border-primary/40" />
              <div className="absolute left-0 w-2 h-2 rounded-full bg-primary/50" />
            </div>

            <div className="space-y-4 flex flex-col items-center">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-secondary-container text-on-secondary-container transition-colors shadow-sm group-hover:scale-110 duration-300">
                <Store className="w-8 h-8" />
              </div>
              <h3 className="font-display text-on-surface font-bold transition-colors">
                Seller
              </h3>
              <p className="font-body text-on-surface-variant text-center">
                Bring your products online and reach nearby buyers.
              </p>
            </div>
            <button className="w-full py-3.5 bg-secondary text-on-secondary font-display rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-secondary-fixed hover:shadow-lg transition-all font-bold">
              Start Selling <ArrowRight className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Buyer Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 p-8 rounded-3xl shadow-lg hover:shadow-xl text-center flex flex-col items-center justify-between space-y-6 relative border-t-4 border-t-primary transition-all duration-300 hover:-translate-y-2 group">
            <div className="space-y-4 flex flex-col items-center">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-primary-container text-on-primary-container transition-colors shadow-sm group-hover:scale-110 duration-300">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h3 className="font-display text-on-surface font-bold transition-colors">
                Buyer
              </h3>
              <p className="font-body text-on-surface-variant text-center">
                Discover nearby products and shop from local stores.
              </p>
            </div>
            <button className="w-full py-3.5 bg-primary text-on-primary font-display rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-primary-fixed hover:shadow-lg transition-all font-bold">
              Start Shopping <ArrowRight className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
