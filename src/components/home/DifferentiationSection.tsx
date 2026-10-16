"use client";

import { MapPin, Search, ShoppingCart } from "lucide-react";

export default function DifferentiationSection() {
  const comparisons = [
    {
      platform: "Google Maps",
      icon: MapPin,
      capability: "Find Places",
      description: "You can find store locations on a map.",
      limitations: "No shopping, no products, no orders.",
      color: "text-on-surface-variant",
      bgColor: "bg-surface-container",
    },
    {
      platform: "Shopee / Lazada",
      icon: ShoppingCart,
      capability: "Buy Products",
      description: "You can browse and buy products online.",
      limitations: "No local discovery, long delivery times.",
      color: "text-on-surface-variant",
      bgColor: "bg-surface-container",
    },
    {
      platform: "MapAnytime",
      icon: MapPin,
      capability: "Discover & Buy Locally",
      description:
        "Find nearby stores, see what they sell, order online, pick up locally.",
      limitations: "None — complete local commerce experience.",
      color: "text-primary",
      bgColor: "bg-primary-container/50",
      featured: true,
    },
  ];

  return (
    <section className="py-section-gap px-margin-mobile md:px-gutter transition-colors bg-surface relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-primary/3 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <p className="font-mono text-label-caps text-primary tracking-widest uppercase mb-4">
            🎯 Why MapAnytime?
          </p>
          <h2 className="font-display text-headline-lg text-on-surface mb-6 transition-colors">
            More Than a Map. More Than a Marketplace.
          </h2>
          <p className="text-on-surface-variant text-body-lg">
            MapAnytime connects local discovery with local commerce. Here&apos;s
            what makes us different.
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {comparisons.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className={`relative rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-2 ${
                  item.featured
                    ? "bg-primary-container/30 border-primary/50 shadow-lg hover:shadow-xl scale-100 md:scale-105"
                    : "bg-surface-container border-outline-variant/30 shadow-sm hover:shadow-lg hover:border-primary/40"
                }`}
              >
                {/* Featured Badge */}
                {item.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                    ⭐ Best Choice
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${item.bgColor}`}
                >
                  <IconComponent className={`w-8 h-8 ${item.color}`} />
                </div>

                {/* Platform Name */}
                <h3
                  className={`font-display text-xl font-bold mb-3 transition-colors ${
                    item.featured ? "text-primary" : "text-on-surface"
                  }`}
                >
                  {item.platform}
                </h3>

                {/* Capability */}
                <div className="bg-surface rounded-lg p-4 mb-4">
                  <p className="text-on-surface-variant text-sm font-mono uppercase tracking-wider mb-2">
                    Can Do:
                  </p>
                  <p className="font-display font-bold text-on-surface">
                    {item.capability}
                  </p>
                </div>

                {/* Description */}
                <p className="text-on-surface-variant text-body-md mb-4">
                  {item.description}
                </p>

                {/* Limitations */}
                <div className="border-t border-outline-variant/20 pt-4">
                  <p className="text-on-surface-variant text-sm font-mono uppercase tracking-wider mb-2">
                    {item.featured ? "✓ Complete" : "✗ Limited"}
                  </p>
                  <p
                    className={`font-body text-sm ${
                      item.featured
                        ? "text-primary font-medium"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {item.limitations}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Key Points Section */}
        <div className="bg-surface-container rounded-2xl p-12 border border-outline-variant/20 mb-16">
          <h3 className="font-display text-headline-md text-on-surface font-bold text-center mb-12 transition-colors">
            MapAnytime&apos;s Unique Value
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Map-Powered",
                description:
                  "See exactly where products are and how close they are to you.",
              },
              {
                title: "Real Inventory",
                description:
                  "Live product availability from actual local stores.",
              },
              {
                title: "Instant Pickup",
                description:
                  "No waiting for delivery. Pick up within hours, not days.",
              },
              {
                title: "Support Local",
                description:
                  "Direct transactions with neighborhood businesses.",
              },
            ].map((point, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-display text-primary font-bold text-lg">
                    {index + 1}
                  </span>
                </div>
                <h4 className="font-display text-on-surface font-bold text-lg mb-2">
                  {point.title}
                </h4>
                <p className="text-on-surface-variant text-sm">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <p className="text-on-surface-variant text-body-lg mb-8">
            Experience the future of local commerce today.
          </p>
          <button
            onClick={() => {
              const mapElement = document.getElementById("map");
              if (mapElement) {
                mapElement.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="inline-flex items-center px-10 py-4 bg-primary text-on-primary rounded-full font-display font-bold text-button-text hover:bg-primary/90 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <MapPin className="w-5 h-5 mr-3" />
            Explore Now
          </button>
        </div>
      </div>
    </section>
  );
}
