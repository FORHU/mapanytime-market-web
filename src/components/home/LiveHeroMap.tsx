"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "next-themes";
import { env } from "@/shared/lib/env";
import type { NearbyStore } from "@/features/stores/hooks/useNearbyStores";
import {
  ICON_SIZE_EXPRESSION,
  INK,
  ensurePinImage,
  pinIconIdFor,
} from "@/components/home/storePinImages";

const SOURCE_ID = "stores";
const CLUSTER_LAYER_ID = "store-clusters";
const CLUSTER_COUNT_LAYER_ID = "store-cluster-count";
const PIN_LAYER_ID = "store-pins";

/**
 * The store source's payload.
 *
 * Declared locally rather than pulled from `@types/geojson`, which this project
 * does not depend on — mapbox-gl keeps its own copy internal.
 */
interface StoreFeatureCollection {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    properties: { storeId: string; iconId: string };
    geometry: { type: "Point"; coordinates: [number, number] };
  }[];
}

const EMPTY_COLLECTION: StoreFeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

/**
 * Adds the clustered store source and its three layers.
 *
 * Called on first load and again after every `setStyle`, because switching the
 * basemap drops custom sources, layers and images — the same reason the Flutter
 * client rebuilds its layers on each style load.
 */
function addStoreLayers(map: mapboxgl.Map) {
  if (map.getSource(SOURCE_ID)) return;

  map.addSource(SOURCE_ID, {
    type: "geojson",
    data: EMPTY_COLLECTION,
    cluster: true,
    // 60px matches the Flutter clusterer's grid cell radius, so the two clients
    // group at comparable densities. 19 is its cluster zoom ceiling: by then a
    // cell is ~18m across, below the threshold at which stores are considered
    // the same building.
    clusterRadius: 60,
    clusterMaxZoom: 19,
  });

  map.addLayer({
    id: CLUSTER_LAYER_ID,
    type: "circle",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": INK,
      "circle-stroke-width": 1.5,
      "circle-stroke-color": "#FFFFFF",
      // Four tiers, mirroring the Flutter bubble diameters.
      "circle-radius": [
        "step",
        ["get", "point_count"],
        18,
        10,
        21,
        50,
        25,
        100,
        28,
      ],
    },
  });

  map.addLayer({
    id: CLUSTER_COUNT_LAYER_ID,
    type: "symbol",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["DIN Offc Pro Bold", "Arial Unicode MS Bold"],
      "text-size": ["step", ["get", "point_count"], 14, 100, 12],
      "text-allow-overlap": true,
    },
    paint: { "text-color": "#FFFFFF" },
  });

  map.addLayer({
    id: PIN_LAYER_ID,
    type: "symbol",
    source: SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    layout: {
      "icon-image": ["get", "iconId"],
      "icon-anchor": "center",
      // Collision-managed, like the Flutter symbol layer: a crowded pin hides
      // rather than overlapping its neighbour.
      "icon-allow-overlap": false,
      "icon-ignore-placement": false,
      "icon-padding": 12,
      "icon-size":
        ICON_SIZE_EXPRESSION as unknown as mapboxgl.ExpressionSpecification,
    },
  });
}

function toFeatureCollection(stores: NearbyStore[]): StoreFeatureCollection {
  return {
    type: "FeatureCollection",
    features: stores.map((store) => ({
      type: "Feature",
      // GeoJSON properties carry primitives only, so the full store is looked
      // up by id from a side map when a pin is clicked.
      properties: { storeId: store.id, iconId: pinIconIdFor(store) },
      geometry: {
        type: "Point",
        coordinates: [store.coordinates.lng, store.coordinates.lat],
      },
    })),
  };
}

interface LiveHeroMapProps {
  onStoreClick?: (store: NearbyStore) => void;
}

export default function LiveHeroMap({ onStoreClick }: LiveHeroMapProps = {}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  /** id → store, so a clicked feature can be resolved back to its full record. */
  const storesRef = useRef(new Map<string, NearbyStore>());
  const onStoreClickRef = useRef(onStoreClick);
  const { resolvedTheme } = useTheme();

  // Keep the ref always pointing to the latest callback — avoids stale closures
  // inside map click handlers which are registered once and never re-registered.
  useEffect(() => {
    onStoreClickRef.current = onStoreClick;
  }, [onStoreClick]);

  const [lng, setLng] = useState(120.596); // Default: Baguio City
  const [lat, setLat] = useState(16.409);
  const [zoom, setZoom] = useState(14);
  const [isLocating, setIsLocating] = useState(true);

  // Fetch initial location before rendering the map
  useEffect(() => {
    let mounted = true;

    // Fallback if geolocation takes too long or fails
    const fallbackId = setTimeout(() => {
      if (mounted) {
        setIsLocating(false);
      }
    }, 5000); // 5 second timeout

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!mounted) return;
          clearTimeout(fallbackId);
          setLng(position.coords.longitude);
          setLat(position.coords.latitude);
          setIsLocating(false);
        },
        (error) => {
          if (!mounted) return;
          clearTimeout(fallbackId);
          console.warn("Geolocation failed or denied, using default location.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 4500, maximumAge: 300_000 },
      );
    } else {
      clearTimeout(fallbackId);
      setIsLocating(false);
    }

    return () => {
      mounted = false;
      clearTimeout(fallbackId);
    };
  }, []);

  useEffect(() => {
    if (isLocating) return; // Wait for initial location
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return;

    mapboxgl.accessToken = env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style:
        resolvedTheme === "dark"
          ? "mapbox://styles/mapbox/navigation-night-v1"
          : "mapbox://styles/mapbox/outdoors-v12",
      center: [lng, lat],
      zoom: zoom,
      pitch: 60, // 3D tilt (Snap Map style)
      bearing: -20, // Slight angle
      projection: "globe", // Display as a 3D globe when zoomed out
      attributionControl: false, // Hide for cleaner look in hero
    });

    // Add zoom and rotation controls to the map
    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    // Function to fetch stores dynamically
    const fetchStores = async () => {
      const current = map.current;
      if (!current) return;
      const bounds = current.getBounds();
      if (!bounds) return;

      const north = bounds.getNorth();
      const south = bounds.getSouth();
      const east = bounds.getEast();
      const west = bounds.getWest();
      const centre = current.getCenter();

      try {
        const res = await fetch(
          `${env.NEXT_PUBLIC_API_URL}/api/v1/stores/nearby?north=${north}&south=${south}&east=${east}&west=${west}` +
            `&lat=${centre.lat}&lng=${centre.lng}&limit=100`,
        );
        const json = await res.json();
        if (json.status !== "success" || !json.data?.items) return;

        const stores = json.data.items as NearbyStore[];
        for (const store of stores) {
          storesRef.current.set(store.id, store);
        }

        // Every pin's bitmap must be registered before the symbol layer can
        // reference it by name; an unknown icon-image renders nothing at all.
        const viewportWidth = current.getContainer().clientWidth || 375;
        await Promise.all(
          stores.map((store) =>
            ensurePinImage(current, store, viewportWidth).catch(
              () => undefined,
            ),
          ),
        );

        const source = current.getSource(SOURCE_ID) as
          mapboxgl.GeoJSONSource | undefined;
        // Replaces the whole set rather than appending markers, so panning can
        // no longer leak: the source holds only what the viewport returned.
        source?.setData(toFeatureCollection([...storesRef.current.values()]));
      } catch (err) {
        console.error("Failed to fetch stores for map:", err);
      }
    };

    const handlePinClick = (
      e: mapboxgl.MapMouseEvent & { features?: mapboxgl.GeoJSONFeature[] },
    ) => {
      const storeId = e.features?.[0]?.properties?.storeId as
        string | undefined;
      if (!storeId) return;
      const store = storesRef.current.get(storeId);
      if (store) onStoreClickRef.current?.(store);
    };

    const handleClusterClick = (
      e: mapboxgl.MapMouseEvent & { features?: mapboxgl.GeoJSONFeature[] },
    ) => {
      const current = map.current;
      const feature = e.features?.[0];
      if (!current || !feature) return;
      const clusterId = feature.properties?.cluster_id as number | undefined;
      if (clusterId === undefined) return;

      const source = current.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;
      // Mapbox computes the zoom at which this cluster splits, so a click always
      // makes visible progress instead of a fixed zoom step that may not.
      source.getClusterExpansionZoom(clusterId, (err, zoomTo) => {
        if (err || zoomTo == null) return;
        current.easeTo({
          // A cluster feature is always a Point; the union includes
          // GeometryCollection, which has no `coordinates`.
          center: (
            feature.geometry as unknown as { coordinates: [number, number] }
          ).coordinates,
          zoom: zoomTo,
          duration: 500,
        });
      });
    };

    const setCursor = (value: string) => () => {
      if (map.current) map.current.getCanvas().style.cursor = value;
    };

    const registerStoreLayers = () => {
      const current = map.current;
      if (!current) return;
      addStoreLayers(current);
      void fetchStores();
    };

    // Attach map events for dynamic fetching
    map.current.on("moveend", fetchStores);
    map.current.on("zoomend", fetchStores);

    map.current.on("click", PIN_LAYER_ID, handlePinClick);
    map.current.on("click", CLUSTER_LAYER_ID, handleClusterClick);
    map.current.on("mouseenter", PIN_LAYER_ID, setCursor("pointer"));
    map.current.on("mouseleave", PIN_LAYER_ID, setCursor(""));
    map.current.on("mouseenter", CLUSTER_LAYER_ID, setCursor("pointer"));
    map.current.on("mouseleave", CLUSTER_LAYER_ID, setCursor(""));

    // setStyle() drops custom sources, layers and images, so the store layers
    // are rebuilt on every style load rather than only the first.
    map.current.on("style.load", registerStoreLayers);

    // Store layers and the first fetch are driven by "style.load" above, which
    // also fires on the initial load — this handler owns terrain and buildings.
    map.current.on("load", () => {
      // Add 3D Terrain
      if (map.current && !map.current.getSource("mapbox-dem")) {
        map.current.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        map.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
      }

      // Add 3D Buildings
      if (map.current && !map.current.getLayer("3d-buildings")) {
        map.current.addLayer({
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": resolvedTheme === "dark" ? "#333" : "#aaa",
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": ["get", "min_height"],
            "fill-extrusion-opacity": 0.6,
          },
        });
      }
    });
  }, [isLocating, lat, lng, zoom, resolvedTheme]);

  // Update map style when theme changes
  useEffect(() => {
    if (!map.current) return;
    const newStyle =
      resolvedTheme === "dark"
        ? "mapbox://styles/mapbox/navigation-night-v1"
        : "mapbox://styles/mapbox/outdoors-v12";

    const updateStyle = () => {
      try {
        // Prevent setting the exact same style if it's already active
        const currentStyle = map.current?.getStyle();
        if (
          currentStyle &&
          currentStyle.sprite?.includes(
            resolvedTheme === "dark" ? "dark" : "light",
          )
        )
          return;

        map.current?.setStyle(newStyle);
      } catch (e) {
        console.warn("Ignored mapbox style error:", e);
      }
    };

    if (map.current.isStyleLoaded()) {
      updateStyle();
    } else {
      map.current.once("styledata", updateStyle);
    }

    // Ensure 3D terrain and buildings are re-applied when style changes
    map.current.once("style.load", () => {
      if (map.current && !map.current.getSource("mapbox-dem")) {
        map.current.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        map.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
      }
      if (map.current && !map.current.getLayer("3d-buildings")) {
        map.current.addLayer({
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": resolvedTheme === "dark" ? "#333" : "#aaa",
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": ["get", "min_height"],
            "fill-extrusion-opacity": 0.6,
          },
        });
      }
    });
  }, [resolvedTheme]);

  if (isLocating) {
    return (
      <div
        className="absolute inset-0 w-full h-full rounded-xl bg-surface-variant/20 flex flex-col items-center justify-center"
        style={{ zIndex: 0 }}
      >
        <div className="flex flex-col items-center gap-4 text-primary opacity-80">
          <span className="material-symbols-outlined text-4xl animate-bounce">
            location_on
          </span>
          <p className="font-mono tracking-widest text-sm uppercase">
            Locating you...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      className="absolute inset-0 w-full h-full transition-opacity duration-1000 rounded-xl"
      style={{ zIndex: 0 }}
    />
  );
}
