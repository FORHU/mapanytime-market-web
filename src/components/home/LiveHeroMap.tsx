"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "next-themes";
import { env } from "@/shared/lib/env";

const FALLBACK_STORE_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80";

/**
 * Store fields below are seller-supplied and arrive from the unauthenticated
 * /stores/nearby endpoint, so nothing here may be interpolated into markup.
 *
 * For the logo we additionally restrict to absolute http(s) URLs and re-serialise
 * through the URL parser, which percent-encodes the double quote that would
 * otherwise break out of the CSS url("...") value.
 */
function safeImageUrl(raw: unknown): string {
  if (typeof raw !== "string" || raw.trim() === "") return FALLBACK_STORE_IMAGE;
  try {
    const parsed = new URL(raw, window.location.origin);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return FALLBACK_STORE_IMAGE;
    }
    return parsed.href;
  } catch {
    return FALLBACK_STORE_IMAGE;
  }
}

function createStorePopupContent(store: any): HTMLElement {
  const root = document.createElement("div");
  root.className = "store-popup";

  const image = document.createElement("div");
  image.className = "store-popup__image";
  image.style.backgroundImage = `url("${safeImageUrl(store.logoUrl)}")`;
  root.appendChild(image);

  const body = document.createElement("div");
  body.className = "store-popup__body";

  const name = document.createElement("strong");
  name.className = "store-popup__name";
  name.textContent = store.storeName ?? "";
  body.appendChild(name);

  const address = document.createElement("p");
  address.className = "store-popup__address";
  address.textContent = store.address?.currentAddress ?? "";
  body.appendChild(address);

  root.appendChild(body);
  return root;
}

function createStoreMarkerElement(store: any): HTMLElement {
  const el = document.createElement("div");
  el.className = "store-marker";

  const pill = document.createElement("div");
  pill.className = "store-marker-pill";

  const icon = document.createElement("span");
  icon.className = "material-symbols-outlined store-marker-pill__icon";
  icon.textContent = "storefront";
  pill.appendChild(icon);

  const label = document.createElement("span");
  label.textContent = store.storeName ?? "";
  pill.appendChild(label);

  el.appendChild(pill);
  return el;
}

export default function LiveHeroMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef(new Map<string, mapboxgl.Marker>());
  const { resolvedTheme } = useTheme();

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
      scrollZoom: false, // Prevent getting stuck when scrolling page
      cooperativeGestures: true, // Use Mapbox's built in cooperative gestures
    });

    // Add zoom and rotation controls to the map
    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    // Function to fetch stores dynamically
    const fetchStores = async () => {
      if (!map.current) return;
      const bounds = map.current.getBounds();
      if (!bounds) return;

      const north = bounds.getNorth();
      const south = bounds.getSouth();
      const east = bounds.getEast();
      const west = bounds.getWest();

      try {
        const res = await fetch(
          `${env.NEXT_PUBLIC_API_URL}/api/v1/stores/nearby?north=${north}&south=${south}&east=${east}&west=${west}&limit=100`,
        );
        const json = await res.json();

        if (json.status === "success" && json.data?.items) {
          json.data.items.forEach((store: any) => {
            if (!markersRef.current.has(store.id)) {
              const popup = new mapboxgl.Popup({
                offset: 25,
                closeButton: false,
              }).setDOMContent(createStorePopupContent(store));

              // Custom marker for store (Text Pill style)
              const el = createStoreMarkerElement(store);

              const newMarker = new mapboxgl.Marker({ element: el })
                .setLngLat([store.coordinates.lng, store.coordinates.lat])
                .setPopup(popup)
                .addTo(map.current!);

              markersRef.current.set(store.id, newMarker);
            }
          });
        }
      } catch (err) {
        console.error("Failed to fetch stores for map:", err);
      }
    };

    // Attach map events for dynamic fetching
    map.current.on("moveend", fetchStores);
    map.current.on("zoomend", fetchStores);

    // Initial fetch once map style loads
    map.current.on("load", () => {
      fetchStores();

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
