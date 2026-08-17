"use client";

import dynamic from "next/dynamic";

/**
 * Lazy boundary in front of the Mapbox map.
 *
 * `mapbox-gl` is ~500 kB of JS and CSS that only matters once a map is actually
 * on screen, but it was imported at module scope. Because four call sites pull
 * MapSelection in statically — the three onboarding forms and the agent's
 * register-seller page — every one of those routes shipped the whole map engine
 * in its first load, which is what put them at ~650 kB against a ~103 kB
 * baseline.
 *
 * Splitting here rather than at the call sites keeps the import path
 * (`./MapSelection`) unchanged, so no consumer needed editing and no future one
 * can accidentally reintroduce the static import.
 *
 * `ssr: false` is required, not stylistic: the implementation touches `window`
 * and a real DOM node on mount.
 */
const MapSelectionImpl = dynamic(
  () => import("./MapSelectionImpl").then((m) => m.MapSelection),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full animate-pulse rounded-lg border border-[var(--border-default)] bg-[var(--background-secondary)]" />
    ),
  },
);

export interface MapSelectionProps {
  initialLat?: number;
  initialLng?: number;
  onChange: (lat: number, lng: number) => void;
  label?: string;
  hint?: string;
}

export function MapSelection(props: MapSelectionProps) {
  return <MapSelectionImpl {...props} />;
}
