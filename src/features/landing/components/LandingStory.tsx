import React from "react";
import {
  MapPin,
  Sparkles,
  PackageCheck,
  Store,
  Flower2,
  BookOpen,
} from "lucide-react";
import {
  InfiniteCoverflow,
  CoverflowItem,
} from "@/features/landing/components/ui/InfiniteCoverflow";

function Badge({
  icon,
  label,
  dot,
}: {
  icon: React.ReactNode;
  label: string;
  dot?: string;
}) {
  return (
    <div
      className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold text-white"
      style={{
        background: "rgba(255,255,255,0.16)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.22)",
      }}
    >
      {icon}
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: dot }}
        />
      )}
      {label}
    </div>
  );
}

const items: CoverflowItem[] = [
  {
    id: "on-the-map",
    image: "/placeholders/uploading-girl.jpg",
    alt: "Independent shop interior",
    badge: <Badge icon={<MapPin size={13} />} label="Uploaded" dot="#00FF00" />,
    title: "Every storefront deserves a digital front door.",
    subtitle: "A live pin shoppers find the moment they search nearby.",
  },
  {
    id: "listed-by-ai",
    image: "/placeholders/ai-product.jpg",
    alt: "Fresh flowers, ready to be photographed and listed",
    badge: (
      <Badge
        icon={<Sparkles size={13} />}
        label="Listed product"
        dot="#a78bfa"
      />
    ),
    title: "One photo in, a clean listing out.",
    subtitle: "About 30 seconds from snapshot to live listing.",
  },
  {
    id: "storefronts",
    image: "/placeholders/store.jpg",
    alt: "Coffee roaster pouring fresh beans",
    badge: (
      <Badge icon={<Store size={13} />} label="Hidden Gem" dot="#f59e0b" />
    ),
    title: "Whimsical Finds",
    subtitle: "Discover eclectic treasures, cuddly bears, and colorful charm!",
  },
  {
    id: "florist",
    image: "/placeholders/floral.jpg",
    alt: "Florist arranging a bouquet",
    badge: (
      <Badge icon={<Flower2 size={13} />} label="Florists" dot="#f472b6" />
    ),
    title: "Same-day bouquets, found in seconds.",
  },
  {
    id: "bookstore",
    image: "/placeholders/book-store.jpg",
    alt: "Shelves inside an independent bookstore",
    badge: (
      <Badge icon={<BookOpen size={13} />} label="Bookstores" dot="#60a5fa" />
    ),
    title: "Browse the shelf before you walk in.",
  },
  {
    id: "pickup",
    image: "/placeholders/pickup-girl.jpg",
    alt: "Fresh bread and pastries, packed and waiting at a local bakery",
    badge: (
      <Badge
        icon={<PackageCheck size={13} />}
        label="Ready for pickup"
        dot="#22d3ee"
      />
    ),
    title: "Skip the wait, reserve directly on the map.",
  },
];

export function LandingStory() {
  return (
    <section id="story" className="py-24 max-w-container-max mx-auto">
      <div className="mb-14 max-w-2xl mx-auto space-y-4 px-margin-mobile text-center md:px-gutter">
        <span
          className="inline-block rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest"
          style={{
            background: "var(--md-sys-color-primary-container)",
            color: "var(--md-sys-color-on-primary-container)",
          }}
        >
          The Small Business Renaissance
        </span>
        <h2
          className="text-4xl font-extrabold tracking-tight md:text-5xl"
          style={{ color: "var(--text-primary)" }}
        >
          Local businesses already have
          <br />
          <span
            className="font-normal italic"
            style={{ color: "var(--md-sys-color-primary)" }}
          >
            everything people want.
          </span>
        </h2>
      </div>

      <InfiniteCoverflow
        items={items}
        cardWidth={320}
        cardHeight={440}
        speed={55}
      />
    </section>
  );
}
