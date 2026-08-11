"use client";

import { useEffect, useState } from "react";
import { env } from "@/shared/lib/env";

export interface NearbyStore {
  id: string;
  storeName: string;
  description: string | null;
  isActive: boolean;
  distanceKm: number;
  coordinates: { lat: number; lng: number };
  logoUrl: string | null;
  address: {
    currentAddress: string;
    city: string;
    province: string;
    country: string;
  };
}

/** Baguio City — the same fallback centre LiveHeroMap uses when geolocation is unavailable. */
const FALLBACK_CENTRE = { lat: 16.409, lng: 120.596 };

/** Roughly a 5-6 km box around the centre. Wide enough to find neighbours, tight enough to stay local. */
const BOX_DEGREES = 0.05;

async function currentCentre(): Promise<{ lat: number; lng: number }> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    return FALLBACK_CENTRE;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      // Denied or timed out: show the default area rather than an empty section.
      () => resolve(FALLBACK_CENTRE),
      { enableHighAccuracy: false, timeout: 4000, maximumAge: 300_000 },
    );
  });
}

/**
 * Real storefronts near the visitor, for the landing page's discovery section.
 *
 * That section previously rendered three hardcoded entries with Unsplash photography and invented
 * ratings ("Mang Juan's Sari-Sari Store", 4.9 stars, 145 reviews). Presenting fabricated reviews
 * as real listings on a public marketing page is not a placeholder problem, it is a truthfulness
 * one — so the card now shows only fields this endpoint actually returns. There is no rating or
 * review count in `/stores/nearby`, and inventing them again would be the same mistake.
 *
 * Unauthenticated, like the endpoint. Resolves to an empty list on any failure so the section can
 * render an honest empty state rather than break the page.
 */
export function useNearbyStores(limit = 6) {
  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { lat, lng } = await currentCentre();
        if (cancelled) return;

        const base = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
        const params = new URLSearchParams({
          north: String(lat + BOX_DEGREES),
          south: String(lat - BOX_DEGREES),
          east: String(lng + BOX_DEGREES),
          west: String(lng - BOX_DEGREES),
          limit: String(limit),
        });

        const res = await fetch(`${base}/api/v1/stores/nearby?${params}`);
        if (!res.ok) throw new Error(`nearby stores: ${res.status}`);

        const json = await res.json();
        if (cancelled) return;

        if (json.status === "success" && Array.isArray(json.data?.items)) {
          setStores(json.data.items.slice(0, limit));
        }
      } catch (err) {
        if (!cancelled) console.warn("Failed to load nearby stores:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { stores, loading };
}
