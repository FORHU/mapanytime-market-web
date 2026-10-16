"use client";

import { MapPin, ShoppingBag, Package } from "lucide-react";

export default function JourneySection() {
  const steps = [
    {
      number: "01",
      title: "Discover",
      description:
        "Find stores, products, and deals around you on an interactive map.",
      icon: MapPin,
      color: "text-primary",
      bgColor: "bg-primary-container",
    },
    {
      number: "02",
      title: "Shop",
      description:
        "Browse products and place your order directly through MapAnytime.",
      icon: ShoppingBag,
      color: "text-secondary",
      bgColor: "bg-secondary-container",
    },
    {
      number: "03",
      title: "Pick Up",
      description: "Collect your order from the local store within hours.",
      icon: Package,
      color: "text-tertiary",
      bgColor: "bg-tertiary-container",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-section-gap px-margin-mobile md:px-gutter transition-colors bg-surface-container-low/30"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <p className="font-mono text-label-caps text-primary tracking-widest uppercase mb-4">
            🎯 Simple Process
          </p>
          <h2 className="font-display text-headline-lg text-on-surface mb-6 transition-colors">
            Discover. Shop. Pick Up.
          </h2>
          <p className="text-on-surface-variant text-body-lg">
            Three simple steps to find and buy from local stores near you.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center"
              >
                {/* Connector Line (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-20 -right-1/2 w-1/2 h-1 bg-gradient-to-r from-primary/40 to-transparent" />
                )}

                {/* Step Number Background */}
                <div className="relative mb-8 w-full flex justify-center">
                  {/* Animated background circle */}
                  <div
                    className={`absolute w-32 h-32 ${step.bgColor} rounded-full blur-2xl opacity-40 animate-pulse`}
                  />

                  {/* Main Circle */}
                  <div
                    className={`relative w-24 h-24 rounded-full ${step.bgColor} flex items-center justify-center shadow-lg border-4 border-surface transition-all duration-300 hover:scale-110 hover:shadow-xl`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <IconComponent
                        className={`w-10 h-10 ${step.color} mb-1`}
                      />
                      <span className="font-display font-black text-on-surface text-sm">
                        {step.number}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step Title */}
                <h3 className="font-display text-headline-md text-on-surface font-bold mb-4 transition-colors">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-on-surface-variant text-body-md leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-on-surface-variant text-body-lg mb-8">
            Ready to find what&apos;s near you?
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
            Start Exploring Now
          </button>
        </div>
      </div>
    </section>
  );
}
