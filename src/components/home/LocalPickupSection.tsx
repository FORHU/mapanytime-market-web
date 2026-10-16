"use client";

import { Clock, MapPin, Zap, Leaf, TrendingUp } from "lucide-react";

export default function LocalPickupSection() {
  const benefits = [
    {
      icon: Clock,
      title: "Faster Access",
      description: "Get what you need within hours, not days.",
      color: "text-primary",
    },
    {
      icon: Zap,
      title: "No Extra Costs",
      description: "Avoid delivery fees. Pay only for the product.",
      color: "text-secondary",
    },
    {
      icon: MapPin,
      title: "Know What's Near",
      description: "See exactly where your products come from.",
      color: "text-tertiary",
    },
    {
      icon: Leaf,
      title: "Support Local",
      description: "Keep money in your community.",
      color: "text-primary",
    },
    {
      icon: TrendingUp,
      title: "Fresh Products",
      description: "Direct from local stores, fresh quality.",
      color: "text-secondary",
    },
    {
      icon: Zap,
      title: "Convenience",
      description: "Order online, pick up when you're ready.",
      color: "text-tertiary",
    },
  ];

  return (
    <section className="py-section-gap px-margin-mobile md:px-gutter transition-colors bg-surface relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <p className="font-mono text-label-caps text-primary tracking-widest uppercase mb-4">
            📦 Key Advantage
          </p>
          <h2 className="font-display text-headline-lg text-on-surface mb-6 transition-colors">
            Order Online. Pick Up Locally.
          </h2>
          <p className="text-on-surface-variant text-body-lg">
            Find what you need nearby, order online for convenience, and pick it
            up directly from the store. Fast, local, and supportive.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div
                key={index}
                className="bg-surface-container rounded-2xl p-8 border border-outline-variant/20 hover:border-primary/40 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Icon */}
                <div className="w-16 h-16 bg-primary-container/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg">
                  <IconComponent className={`w-8 h-8 ${benefit.color}`} />
                </div>

                {/* Title */}
                <h3 className="font-display text-on-surface font-bold text-xl mb-3 transition-colors group-hover:text-primary">
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="text-on-surface-variant text-body-md leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Comparison Section */}
        <div className="bg-surface-container rounded-3xl p-12 border border-outline-variant/30 mb-16">
          <h3 className="font-display text-headline-md text-on-surface font-bold text-center mb-12 transition-colors">
            Why Local Pickup Makes Sense
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Delivery */}
            <div className="text-center">
              <p className="font-display text-lg font-bold text-on-surface mb-6">
                📫 Traditional Delivery
              </p>
              <ul className="space-y-3 text-sm text-on-surface-variant">
                <li>⏱️ 2-5 days</li>
                <li>💰 Extra delivery fees</li>
                <li>❓ Uncertain availability</li>
                <li>🤷 Limited local knowledge</li>
              </ul>
            </div>

            {/* Divider */}
            <div className="hidden md:flex items-center justify-center">
              <div className="h-full w-0.5 bg-gradient-to-b from-transparent via-outline-variant to-transparent" />
            </div>

            {/* MapAnytime */}
            <div className="text-center">
              <p className="font-display text-lg font-bold text-primary mb-6">
                🗺️ MapAnytime Pickup
              </p>
              <ul className="space-y-3 text-sm text-on-surface-variant">
                <li>✅ Minutes to hours</li>
                <li>✅ No delivery fees</li>
                <li>✅ Real-time availability</li>
                <li>✅ Strong local connections</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
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
            Find Products to Pickup
          </button>
        </div>
      </div>
    </section>
  );
}
