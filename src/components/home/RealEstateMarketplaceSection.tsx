"use client";

import { MapPin, Home, Building2, Key } from "lucide-react";

interface RealEstateProperty {
  id: string;
  type: "apartment" | "boarding-house" | "land" | "condo";
  name: string;
  price: string;
  location: string;
  distance: string;
  beds?: number;
  image: string;
  featured?: boolean;
}

export default function RealEstateMarketplaceSection() {
  const properties: RealEstateProperty[] = [
    {
      id: "1",
      type: "apartment",
      name: "Modern Studio Apartment",
      price: "₱8,000/month",
      location: "Downtown District",
      distance: "0.5 km",
      beds: 1,
      image: "🏢",
      featured: true,
    },
    {
      id: "2",
      type: "boarding-house",
      name: "Cozy Boarding House",
      price: "₱3,500/month",
      location: "University Area",
      distance: "1.2 km",
      beds: 1,
      image: "🏠",
    },
    {
      id: "3",
      type: "condo",
      name: "Condo with City View",
      price: "₱12,500/month",
      location: "Business District",
      distance: "2.1 km",
      beds: 2,
      image: "🏗️",
    },
    {
      id: "4",
      type: "land",
      name: "Residential Land Plot",
      price: "₱1,500,000",
      location: "Suburban Area",
      distance: "3.5 km",
      image: "🏞️",
      featured: true,
    },
  ];

  return (
    <section
      id="real-estate"
      className="scroll-mt-20 py-section-gap px-margin-mobile md:px-gutter transition-colors bg-surface-container-low/50 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/2 left-0 w-1/2 h-1/2 bg-secondary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-1/3 h-2/3 bg-tertiary/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <p className="font-mono text-label-caps text-secondary tracking-widest uppercase mb-4">
            🏘️ Expand to Real Estate
          </p>
          <h2 className="font-display text-headline-lg text-on-surface mb-6 transition-colors">
            Find Your Next Home or Investment. On the Map.
          </h2>
          <p className="text-on-surface-variant text-body-lg">
            MapAnytime now connects you with rentals, boarding houses, condos,
            and land listings in your neighborhood. Discover real estate
            opportunities near you.
          </p>
        </div>

        {/* Two Pathways */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* For Renters */}
          <div className="bg-surface rounded-2xl p-8 border border-outline-variant/20 hover:border-secondary/40 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-secondary-container rounded-xl flex items-center justify-center mb-6">
              <Home className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="font-display text-headline-md text-on-surface font-bold mb-4 transition-colors">
              For Renters & Buyers
            </h3>
            <p className="text-on-surface-variant text-body-md mb-6">
              Browse apartments, boarding houses, condos, and land listings on a
              map. See exactly where properties are located relative to your
              workplace or favorite areas.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Filter by price and distance",
                "View property photos and details",
                "Contact landlords/agents directly",
                "Save favorites for later",
                "Real-time availability",
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-secondary font-bold mt-1">✓</span>
                  <span className="text-on-surface-variant text-body-md">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            <button className="w-full py-3 bg-secondary text-on-secondary rounded-lg font-display font-bold text-button-text hover:bg-secondary/90 transition-colors">
              Find Properties
            </button>
          </div>

          {/* For Sellers */}
          <div className="bg-surface rounded-2xl p-8 border border-outline-variant/20 hover:border-tertiary/40 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-tertiary-container rounded-xl flex items-center justify-center mb-6">
              <Building2 className="w-8 h-8 text-tertiary" />
            </div>
            <h3 className="font-display text-headline-md text-on-surface font-bold mb-4 transition-colors">
              For Landlords & Developers
            </h3>
            <p className="text-on-surface-variant text-body-md mb-6">
              List your properties, lands, and rental units on MapAnytime. Reach
              potential tenants and buyers searching in your area. Manage
              inquiries and viewings easily.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Easy property listing creation",
                "Upload photos and floor plans",
                "Set rental or sale prices",
                "Map visibility to local searchers",
                "Inquiry management system",
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-tertiary font-bold mt-1">✓</span>
                  <span className="text-on-surface-variant text-body-md">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            <button className="w-full py-3 bg-tertiary text-on-tertiary rounded-lg font-display font-bold text-button-text hover:bg-tertiary/90 transition-colors">
              List a Property
            </button>
          </div>
        </div>

        {/* Featured Properties Grid */}
        <div className="mb-16">
          <h3 className="font-display text-headline-md text-on-surface font-bold text-center mb-12 transition-colors">
            Featured Properties Near You
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((property) => (
              <div
                key={property.id}
                className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                  property.featured
                    ? "border-secondary/50 shadow-lg hover:shadow-xl lg:col-span-2 lg:row-span-1"
                    : "border-outline-variant/20 shadow-sm hover:shadow-lg hover:border-primary/40"
                }`}
              >
                {/* Featured Badge */}
                {property.featured && (
                  <div className="absolute top-4 right-4 z-20 bg-secondary text-on-secondary px-4 py-2 rounded-full text-xs font-bold">
                    Featured
                  </div>
                )}

                {/* Property Type Badge */}
                <div className="absolute top-4 left-4 z-20 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-on-surface capitalize">
                  {property.type.replace("-", " ")}
                </div>

                {/* Background */}
                <div className="bg-surface-container p-6 aspect-square flex items-center justify-center group-hover:bg-surface-container-high transition-colors">
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                    {property.image}
                  </span>
                </div>

                {/* Content */}
                <div className="bg-surface p-6">
                  <h4 className="font-display text-on-surface font-bold text-lg mb-2 line-clamp-2">
                    {property.name}
                  </h4>

                  {/* Price */}
                  <p className="font-display text-secondary font-bold text-xl mb-3">
                    {property.price}
                  </p>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <MapPin className="w-4 h-4 text-secondary flex-shrink-0" />
                      <span>{property.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <Key className="w-4 h-4 text-secondary flex-shrink-0" />
                      <span>{property.distance} away</span>
                    </div>
                    {property.beds && (
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <Home className="w-4 h-4 text-secondary flex-shrink-0" />
                        <span>
                          {property.beds} bed{property.beds > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <button className="w-full py-2.5 bg-secondary/20 text-secondary rounded-lg font-display font-bold text-sm hover:bg-secondary hover:text-on-secondary transition-colors group-hover:shadow-md">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why MapAnytime for Real Estate */}
        <div className="bg-surface rounded-2xl p-12 border border-outline-variant/20 mb-16">
          <h3 className="font-display text-headline-md text-on-surface font-bold text-center mb-12 transition-colors">
            Why Search Real Estate on MapAnytime?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: MapPin,
                title: "Location First",
                description:
                  "Find properties exactly where you want to live or invest.",
              },
              {
                icon: Home,
                title: "Neighborhood Insight",
                description:
                  "See nearby stores, amenities, and community features.",
              },
              {
                icon: Building2,
                title: "Direct Connection",
                description:
                  "Connect directly with landlords and property owners.",
              },
              {
                icon: Key,
                title: "Real Listings",
                description:
                  "Browse verified properties from local landlords and agents.",
              },
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-6 h-6 text-secondary" />
                  </div>
                  <h4 className="font-display text-on-surface font-bold text-lg mb-2">
                    {item.title}
                  </h4>
                  <p className="text-on-surface-variant text-sm">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-on-surface-variant text-body-lg mb-8">
            Expand your marketplace experience with real estate
          </p>
          <button
            onClick={() => {
              const mapElement = document.getElementById("map");
              if (mapElement) {
                mapElement.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="inline-flex items-center px-10 py-4 bg-secondary text-on-secondary rounded-full font-display font-bold text-button-text hover:bg-secondary/90 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <MapPin className="w-5 h-5 mr-3" />
            Browse Properties on Map
          </button>
        </div>
      </div>
    </section>
  );
}
