"use client";

import { Flame, MapPin, Tag } from "lucide-react";

interface TrendingItem {
  id: string;
  name: string;
  store: string;
  originalPrice: string;
  discountedPrice?: string;
  discount?: string;
  distance: string;
  category: string;
  emoji: string;
}

export default function TrendingNearYouSection() {
  const trendingItems: TrendingItem[] = [
    {
      id: "1",
      name: "Nike Running Shoes",
      store: "SportZone",
      originalPrice: "₱2,499",
      discountedPrice: "₱1,999",
      discount: "-20%",
      distance: "1.4 km",
      category: "Sports",
      emoji: "👟",
    },
    {
      id: "2",
      name: "Artisan Coffee Blend",
      store: "Local Brew",
      originalPrice: "₱280",
      discountedPrice: "₱199",
      discount: "-29%",
      distance: "0.6 km",
      category: "Café",
      emoji: "☕",
    },
    {
      id: "3",
      name: "Fresh Organic Vegetables",
      store: "Community Market",
      originalPrice: "₱450",
      discountedPrice: "₱299",
      discount: "-33%",
      distance: "0.9 km",
      category: "Groceries",
      emoji: "🥬",
    },
    {
      id: "4",
      name: "Homemade Bread Loaf",
      store: "Local Bakery",
      originalPrice: "₱150",
      discountedPrice: "₱99",
      discount: "-34%",
      distance: "1.2 km",
      category: "Food",
      emoji: "🍞",
    },
    {
      id: "5",
      name: "Handmade Ceramic Mug",
      store: "Artisan Studio",
      originalPrice: "₱399",
      discountedPrice: "₱299",
      discount: "-25%",
      distance: "1.8 km",
      category: "Crafts",
      emoji: "🍶",
    },
    {
      id: "6",
      name: "Local Honey Jar",
      store: "Farm Direct",
      originalPrice: "₱320",
      discountedPrice: "₱249",
      discount: "-22%",
      distance: "2.1 km",
      category: "Food",
      emoji: "🍯",
    },
  ];

  return (
    <section className="py-section-gap px-margin-mobile md:px-gutter transition-colors bg-surface-container-low/50">
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="w-6 h-6 text-primary" />
            <p className="font-mono text-label-caps text-primary tracking-widest uppercase">
              Hot Deals & Trending
            </p>
          </div>
          <h2 className="font-display text-headline-lg text-on-surface mb-6 transition-colors">
            Trending Near You Right Now
          </h2>
          <p className="text-on-surface-variant text-body-lg">
            See what&apos;s hot in your neighborhood. Real products, real deals,
            real stores.
          </p>
        </div>

        {/* Trending Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {trendingItems.map((item) => (
            <div
              key={item.id}
              className="group relative bg-surface rounded-2xl overflow-hidden border border-outline-variant/20 hover:border-primary/40 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              {/* Trending Badge */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-primary/90 text-on-primary px-3 py-1 rounded-full text-xs font-bold">
                <Flame className="w-3 h-3" />
                Trending
              </div>

              {/* Discount Badge (if applicable) */}
              {item.discount && (
                <div className="absolute top-4 left-4 z-20 bg-tertiary text-on-tertiary px-3 py-1 rounded-full text-sm font-bold">
                  {item.discount}
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {/* Product Icon */}
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.emoji}
                </div>

                {/* Product Name */}
                <h3 className="font-display text-on-surface font-bold text-lg mb-2 line-clamp-2">
                  {item.name}
                </h3>

                {/* Store Name */}
                <p className="text-on-surface-variant text-sm mb-4 font-medium">
                  {item.store}
                </p>

                {/* Pricing */}
                <div className="mb-4">
                  {item.discountedPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="font-display text-primary font-bold text-xl">
                        {item.discountedPrice}
                      </span>
                      <span className="text-on-surface-variant line-through text-sm">
                        {item.originalPrice}
                      </span>
                    </div>
                  ) : (
                    <span className="font-display text-primary font-bold text-xl">
                      {item.originalPrice}
                    </span>
                  )}
                </div>

                {/* Distance */}
                <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-6">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{item.distance} away</span>
                </div>

                {/* CTA Button */}
                <button className="w-full py-3 bg-primary text-on-primary rounded-lg font-display font-bold text-button-text hover:bg-primary/90 transition-colors group-hover:shadow-lg">
                  View Deal
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-on-surface-variant text-body-lg mb-8">
            Explore more trending deals on the map
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
            View All on Map
          </button>
        </div>
      </div>
    </section>
  );
}
