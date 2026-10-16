"use client";

import { MapPin, Clock } from "lucide-react";

interface NearbyProduct {
  id: string;
  name: string;
  price: string;
  distance: string;
  availability: string;
  store: string;
  category: string;
  image?: string;
}

export default function NearbyProductsSection() {
  // Sample data - will be replaced with real API data
  const nearbyProducts: NearbyProduct[] = [
    {
      id: "1",
      name: "Running Shoes",
      price: "₱1,999",
      distance: "1.2 km",
      availability: "In stock",
      store: "SportZone",
      category: "Sports",
      image: "🏃",
    },
    {
      id: "2",
      name: "Specialty Coffee",
      price: "₱150",
      distance: "0.5 km",
      availability: "Available now",
      store: "Local Brew Café",
      category: "Café",
      image: "☕",
    },
    {
      id: "3",
      name: "Fresh Produce",
      price: "₱299",
      distance: "0.8 km",
      availability: "Fresh today",
      store: "Community Market",
      category: "Groceries",
      image: "🥗",
    },
    {
      id: "4",
      name: "Artisan Bread",
      price: "₱85",
      distance: "1.1 km",
      availability: "Just baked",
      store: "Local Bakery",
      category: "Food",
      image: "🍞",
    },
  ];

  return (
    <section className="scroll-mt-20 py-section-gap px-margin-mobile md:px-gutter text-center transition-colors min-h-screen flex flex-col justify-center bg-surface-container-low/40 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/3 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Section Header */}
        <div className="text-center mb-section-gap max-w-2xl mx-auto">
          <p className="font-mono text-label-caps text-primary tracking-widest uppercase mb-4">
            💡 Real Marketplace Activity
          </p>
          <h2 className="font-display text-headline-lg text-on-surface mb-6 transition-colors">
            What&apos;s Around You Right Now?
          </h2>
          <p className="text-on-surface-variant text-body-lg">
            Discover local stores, products, and deals available in your
            neighborhood. Everything is just a few clicks away.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {nearbyProducts.map((product) => (
            <div
              key={product.id}
              className="bg-surface rounded-2xl p-6 border border-outline-variant/20 hover:border-primary/40 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group overflow-hidden relative"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Product Image / Icon */}
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {product.image}
              </div>

              {/* Product Info */}
              <div className="text-left relative z-10">
                <h3 className="font-display text-on-surface font-bold text-lg mb-2 line-clamp-2">
                  {product.name}
                </h3>

                <p className="text-on-surface-variant text-sm mb-4">
                  {product.store}
                </p>

                {/* Price */}
                <div className="mb-4">
                  <p className="font-display text-primary font-bold text-2xl">
                    {product.price}
                  </p>
                </div>

                {/* Distance & Availability */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{product.distance} away</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{product.availability}</span>
                  </div>
                </div>

                {/* CTA Button */}
                <button className="w-full py-3 bg-primary text-on-primary rounded-lg font-display font-bold text-button-text hover:bg-primary/90 transition-colors group-hover:shadow-lg">
                  View & Order
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA to Map */}
        <div className="text-center">
          <button
            onClick={() => {
              const mapElement = document.getElementById("map");
              if (mapElement) {
                mapElement.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="inline-flex items-center px-8 py-4 bg-primary text-on-primary rounded-full font-display font-bold text-button-text hover:bg-primary/90 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <MapPin className="w-5 h-5 mr-3" />
            See More on Map
          </button>
        </div>
      </div>
    </section>
  );
}
