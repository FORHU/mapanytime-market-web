import { describe, expect, it } from "vitest";
import type { NearbyStore } from "@/features/stores/hooks/useNearbyStores";
import { colorForStore, monogramFor, pinIconIdFor } from "./storePinImages";

function store(overrides: Partial<NearbyStore> = {}): NearbyStore {
  return {
    id: "store-1",
    storeName: "Baguio Fresh Harvest",
    description: null,
    isActive: true,
    distanceKm: 1.2,
    coordinates: { lat: 16.409, lng: 120.596 },
    logoUrl: null,
    markerPhotoUrl: null,
    rating: 4.5,
    ratingCount: 12,
    categoryId: "cat-1",
    categoryName: "Food & Beverage",
    isOpen: true,
    markerDisplayMode: "PHOTO_CARD",
    markerPrice: null,
    markerSubtitle: null,
    address: {
      currentAddress: "18 Naguilian Road",
      city: "Baguio City",
      province: "Benguet",
      country: "PH",
    },
    ...overrides,
  };
}

describe("pinIconIdFor", () => {
  it("is stable for an unchanged store, so its bitmap is reused", () => {
    expect(pinIconIdFor(store())).toBe(pinIconIdFor(store()));
  });

  it("changes when the open/closed state flips", () => {
    expect(pinIconIdFor(store({ isOpen: true }))).not.toBe(
      pinIconIdFor(store({ isOpen: false })),
    );
  });

  it("changes when the marker photo changes", () => {
    expect(pinIconIdFor(store({ markerPhotoUrl: "https://a/1.jpg" }))).not.toBe(
      pinIconIdFor(store({ markerPhotoUrl: "https://a/2.jpg" })),
    );
  });

  it("changes when the display mode changes", () => {
    expect(pinIconIdFor(store({ markerDisplayMode: "PHOTO_CARD" }))).not.toBe(
      pinIconIdFor(store({ markerDisplayMode: "PRICE_CARD" })),
    );
  });

  it("distinguishes the selected variant", () => {
    expect(pinIconIdFor(store(), true)).not.toBe(pinIconIdFor(store(), false));
  });
});

describe("colorForStore", () => {
  it("uses the shared category colour so web and mobile agree", () => {
    expect(colorForStore(store({ categoryName: "Food & Beverage" }))).toBe(
      "#D97C3A",
    );
    expect(colorForStore(store({ categoryName: "Electronics" }))).toBe(
      "#498AD4",
    );
  });

  it("falls back to a stable palette entry for an unknown category", () => {
    const first = colorForStore(
      store({ categoryName: "Nonexistent Category" }),
    );
    const second = colorForStore(
      store({ categoryName: "Nonexistent Category" }),
    );
    expect(first).toBe(second);
    expect(first).toMatch(/^#[0-9A-F]{6}$/);
  });

  it("falls back to hashing the id when there is no category at all", () => {
    const uncategorised = store({ categoryName: null, categoryId: null });
    expect(colorForStore(uncategorised)).toBe(colorForStore(uncategorised));
  });
});

describe("monogramFor", () => {
  it("takes the initials of the first two words", () => {
    expect(monogramFor("Baguio Fresh Harvest")).toBe("BF");
  });

  it("takes a single initial for a one-word name", () => {
    expect(monogramFor("Electrico")).toBe("E");
  });

  it("collapses extra whitespace", () => {
    expect(monogramFor("  Session   Brews  ")).toBe("SB");
  });

  it("returns a placeholder for a blank name", () => {
    expect(monogramFor("   ")).toBe("?");
  });
});
