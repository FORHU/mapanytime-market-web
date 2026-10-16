"use client";

import { Download, MapPin } from "lucide-react";

export default function MobileAppSection() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-gutter transition-colors bg-surface-container-low/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -top-1/4 right-0 w-1/2 h-full bg-primary/8 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: App Content */}
          <div>
            <p className="font-mono text-label-caps text-primary tracking-widest uppercase mb-4">
              📱 Mobile First Experience
            </p>
            <h2 className="font-display text-headline-lg text-on-surface mb-6 transition-colors">
              Your Local Market, Wherever You Go
            </h2>
            <p className="text-on-surface-variant text-body-lg mb-8">
              MapAnytime is designed for mobile. Discover, browse, and order
              from local stores right from your phone. Get instant notifications
              about new products, deals, and nearby discoveries.
            </p>

            {/* Features List */}
            <div className="space-y-4 mb-12">
              {[
                "Interactive map of all nearby stores",
                "Real-time product availability",
                "Quick checkout and payment",
                "Order tracking and notifications",
                "Personalized recommendations",
                "Wishlists and favorites",
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary font-bold text-xs">✓</span>
                  </div>
                  <span className="text-on-surface-variant text-body-md">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-primary text-on-primary rounded-full font-display font-bold text-button-text hover:bg-primary/90 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                App Store
              </button>
              <button className="px-8 py-4 bg-secondary text-on-secondary rounded-full font-display font-bold text-button-text hover:bg-secondary/90 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Google Play
              </button>
            </div>

            {/* QR Code */}
            <div className="mt-12 p-6 bg-surface rounded-2xl border border-outline-variant/20 inline-block">
              <p className="text-on-surface-variant text-sm mb-3 font-mono uppercase tracking-wider">
                Quick Download:
              </p>
              <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                {/* Placeholder QR Code - will be replaced with actual QR */}
                <div className="text-center">
                  <p className="text-xs text-gray-500">QR Code</p>
                  <p className="text-xs text-gray-400">Coming Soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: App Mockup */}
          <div className="flex justify-center items-center">
            <div className="relative w-full max-w-xs">
              {/* Phone Frame */}
              <div className="bg-black rounded-[40px] shadow-2xl border-8 border-gray-900 aspect-[9/19] flex flex-col overflow-hidden relative">
                {/* Notch */}
                <div className="bg-black h-8 flex justify-center items-center">
                  <div className="w-40 h-6 bg-black rounded-b-2xl"></div>
                </div>

                {/* Screen Content */}
                <div className="flex-1 bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center p-6 overflow-hidden relative">
                  {/* Map visualization mockup */}
                  <div className="absolute inset-0">
                    {/* Animated map pins */}
                    <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-primary rounded-full animate-pulse opacity-70" />
                    <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-secondary rounded-full animate-pulse opacity-60" />
                    <div className="absolute bottom-1/3 left-1/3 w-7 h-7 bg-tertiary rounded-full animate-pulse opacity-50" />
                    <div className="absolute top-1/2 right-1/3 w-5 h-5 bg-primary rounded-full animate-pulse opacity-40" />

                    {/* Connecting lines */}
                    <svg className="absolute inset-0 w-full h-full opacity-20">
                      <line
                        x1="25%"
                        y1="25%"
                        x2="75%"
                        y2="33%"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-primary"
                      />
                      <line
                        x1="75%"
                        y1="33%"
                        x2="33%"
                        y2="67%"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-secondary"
                      />
                    </svg>
                  </div>

                  {/* Content overlay */}
                  <div className="relative z-10 text-center">
                    <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                    <p className="font-display text-on-surface font-bold text-lg">
                      Explore Your Map
                    </p>
                    <p className="text-on-surface-variant text-xs mt-2">
                      Tap to discover nearby stores
                    </p>
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="bg-black h-6 flex justify-center items-end pb-1">
                  <div className="w-32 h-1 bg-gray-700 rounded-full"></div>
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute -inset-12 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl -z-10 opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
