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

function createStoreMarkerElement(
  store: any,
  onClick?: (store: any) => void,
): HTMLElement {
  const el = document.createElement("div");
  el.className =
    "flex items-center rounded-full shadow-lg overflow-hidden text-[10px] sm:text-[11px] font-extrabold cursor-pointer hover:scale-110 transition-transform origin-bottom border-2 border-white bg-white";

  if (onClick) {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick(store);
    });
  }

  let style = { bg: "bg-blue-500", text: "text-white" };
  let svgPaths =
    '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>';

  const categoryName = (store.categoryName || "").toLowerCase();

  if (
    categoryName.includes("food") ||
    categoryName.includes("restaurant") ||
    categoryName.includes("cafe") ||
    categoryName.includes("coffee")
  ) {
    style = { bg: "bg-orange-500", text: "text-white" };
    // Coffee cup / food icon
    svgPaths =
      '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>';
  } else if (
    categoryName.includes("fashion") ||
    categoryName.includes("clothing") ||
    categoryName.includes("apparel") ||
    categoryName.includes("boutique")
  ) {
    style = { bg: "bg-purple-500", text: "text-white" };
    // Shirt icon
    svgPaths =
      '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>';
  } else if (
    categoryName.includes("electronics") ||
    categoryName.includes("tech") ||
    categoryName.includes("gadget") ||
    categoryName.includes("computer") ||
    categoryName.includes("mobile")
  ) {
    style = { bg: "bg-indigo-500", text: "text-white" };
    // Smartphone icon
    svgPaths =
      '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>';
  } else if (
    categoryName.includes("home") ||
    categoryName.includes("furniture") ||
    categoryName.includes("hardware") ||
    categoryName.includes("tools")
  ) {
    style = { bg: "bg-teal-500", text: "text-white" };
    // Hammer / tools icon
    svgPaths =
      '<path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H11.2l-1.65 1.65a2.5 2.5 0 0 0 0 3.53l.35.35c.6.6 1.4.93 2.25.93h.86l2.72 2.73c.43.43 1.02.66 1.63.66h2.08l1.65-1.65a2.5 2.5 0 0 0 0-3.53Z"/>';
  } else if (
    categoryName.includes("health") ||
    categoryName.includes("beauty") ||
    categoryName.includes("pharmacy") ||
    categoryName.includes("medical") ||
    categoryName.includes("spa")
  ) {
    style = { bg: "bg-pink-500", text: "text-white" };
    // Heart icon
    svgPaths =
      '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>';
  } else if (
    categoryName.includes("grocer") ||
    categoryName.includes("market") ||
    categoryName.includes("supermarket") ||
    categoryName.includes("meat")
  ) {
    style = { bg: "bg-green-500", text: "text-white" };
    // Shopping basket
    svgPaths =
      '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>';
  } else if (
    categoryName.includes("sports") ||
    categoryName.includes("fitness") ||
    categoryName.includes("gym")
  ) {
    style = { bg: "bg-red-500", text: "text-white" };
    // Dumbbell
    svgPaths =
      '<path d="M14.4 14.4 9.6 9.6"/><path d="M18.65 21.35a2 2 0 0 1-2.83 0l-5.66-5.66a2 2 0 0 1 0-2.83l.06-.06a2 2 0 0 1 2.83 0l5.66 5.66a2 2 0 0 1 0 2.83Z"/><path d="m2 2 2.83 2.83"/><path d="m22 2-2.83 2.83"/><path d="M2.65 8.35a2 2 0 0 1 0-2.83l.06-.06a2 2 0 0 1 2.83 0l5.66 5.66a2 2 0 0 1 0 2.83l-5.66-5.66a2 2 0 0 1-2.83 0Z"/>';
  } else if (
    categoryName.includes("auto") ||
    categoryName.includes("car") ||
    categoryName.includes("vehicle") ||
    categoryName.includes("motor")
  ) {
    style = { bg: "bg-yellow-500", text: "text-white" };
    // Car
    svgPaths =
      '<path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H8.3a2 2 0 0 0-1.6.8L4 11l-5.16.86a1 1 0 0 0-.84.99V16h3"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>';
  } else if (!categoryName) {
    // If no category, pick a pseudo-random color based on ID
    const colors = [
      { bg: "bg-blue-500", text: "text-white" },
      { bg: "bg-orange-500", text: "text-white" },
      { bg: "bg-green-500", text: "text-white" },
      { bg: "bg-purple-500", text: "text-white" },
      { bg: "bg-teal-500", text: "text-white" },
    ];
    style = colors[store.id ? store.id.charCodeAt(0) % 5 : 0];
  }

  const iconContainer = document.createElement("div");
  iconContainer.className = `w-6 h-6 flex items-center justify-center rounded-full ${style.bg} ${style.text}`;

  const svgNS = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(svgNS, "svg");
  icon.setAttribute("width", "12");
  icon.setAttribute("height", "12");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", "currentColor");
  icon.setAttribute("stroke-width", "2.5");
  icon.setAttribute("stroke-linecap", "round");
  icon.setAttribute("stroke-linejoin", "round");

  icon.innerHTML = svgPaths;
  iconContainer.appendChild(icon);

  // Use my location indicator style (special case if id is "current-location")
  if (store.id === "current-location") {
    el.className =
      "w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(255,255,255,1),0_0_15px_rgba(0,0,0,0.3)] animate-pulse border-2 border-white";
    return el;
  }

  el.appendChild(iconContainer);

  // Promoted / Sale Badge Overlay for active promotions
  const hasPromo =
    store.hasPromo ||
    store.isPromoted ||
    (store.id && store.id.charCodeAt(0) % 3 === 0);
  if (hasPromo) {
    el.className +=
      " relative ring-2 ring-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.4)] scale-105";
    const promoBadge = document.createElement("span");
    promoBadge.className =
      "absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[7px] font-black bg-rose-500 text-white shadow-md border border-white tracking-tight";
    promoBadge.textContent = "SALE";
    el.appendChild(promoBadge);
  }

  return el;
}

interface LiveHeroMapProps {
  onStoreClick?: (store: any) => void;
}

export default function LiveHeroMap({ onStoreClick }: LiveHeroMapProps = {}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef(new Map<string, mapboxgl.Marker>());
  const onStoreClickRef = useRef(onStoreClick);
  const { resolvedTheme } = useTheme();

  // Keep the ref always pointing to the latest callback — avoids stale closures
  // inside marker click handlers which are registered once and never re-registered.
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
              const el = createStoreMarkerElement(store, (s) =>
                onStoreClickRef.current?.(s),
              );

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
