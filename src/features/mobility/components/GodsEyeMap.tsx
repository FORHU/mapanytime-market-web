"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "next-themes";
import { env } from "@/shared/lib/env";
import { useGodsEye } from "../hooks/useGodsEye";
import { VehicleInspector } from "./VehicleInspector";
import { Compass, Car, Navigation, Radio, Activity } from "lucide-react";

const TRAIL_SOURCE_ID = "gods-eye-trail-source";
const TRAIL_LAYER_ID = "gods-eye-trail-layer";

const INITIAL_CENTER: [number, number] = [120.596, 16.4023]; // Baguio City center
const INITIAL_ZOOM = 13;

export function GodsEyeMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const { resolvedTheme } = useTheme();

  const {
    vehicles,
    selectedVehicle,
    selectedVehicleId,
    trail,
    trailMetadata,
    isLoadingTrail,
    showTrail,
    setShowTrail,
    setSelectedVehicleId,
    updateBounds,
  } = useGodsEye();

  const [mapLoaded, setMapLoaded] = useState(false);
  const mapboxToken = env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    const style =
      resolvedTheme === "dark"
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/navigation-day-v1";

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      attributionControl: false,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: true }),
      "bottom-right",
    );

    map.on("load", () => {
      setMapLoaded(true);

      // Add breadcrumb trail line source & layer
      map.addSource(TRAIL_SOURCE_ID, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        },
      });

      map.addLayer({
        id: TRAIL_LAYER_ID,
        type: "line",
        source: TRAIL_SOURCE_ID,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#06b6d4",
          "line-width": 4,
          "line-opacity": 0.85,
        },
      });

      // Report initial bounds
      const b = map.getBounds();
      if (b) {
        updateBounds({
          north: b.getNorth(),
          south: b.getSouth(),
          east: b.getEast(),
          west: b.getWest(),
        });
      }
    });

    const handleMoveEnd = () => {
      const b = map.getBounds();
      if (b) {
        updateBounds({
          north: b.getNorth(),
          south: b.getSouth(),
          east: b.getEast(),
          west: b.getWest(),
        });
      }
    };

    map.on("moveend", handleMoveEnd);
    mapRef.current = map;

    return () => {
      map.off("moveend", handleMoveEnd);
      map.remove();
      mapRef.current = null;
    };
  }, [resolvedTheme, updateBounds, mapboxToken]);

  // Synchronize Vehicle Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const currentMarkers = markersRef.current;
    const activeIds = new Set(vehicles.map((v) => v.id));

    // Remove markers that are no longer active
    for (const [id, marker] of currentMarkers.entries()) {
      if (!activeIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    }

    // Add or update markers
    for (const v of vehicles) {
      let marker = currentMarkers.get(v.id);

      if (!marker) {
        // Create custom marker DOM element
        const el = document.createElement("div");
        el.className =
          "gods-eye-vehicle-marker cursor-pointer transition-transform duration-300";
        el.setAttribute("data-vehicle-id", v.id);

        const isMoving = v.status === "moving";
        const isSelected = v.id === selectedVehicleId;

        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 transition-all ${
              isSelected
                ? "bg-cyan-500 border-white text-slate-950 scale-125 z-30"
                : isMoving
                  ? "bg-slate-900/90 border-emerald-400 text-emerald-400"
                  : "bg-slate-900/90 border-amber-400 text-amber-400"
            }">
              <svg class="w-5 h-5" style="transform: rotate(${v.heading ?? 0}deg);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
            </div>
            <span class="absolute -bottom-5 px-1.5 py-0.2 rounded bg-slate-900/95 text-[10px] font-mono font-bold text-white shadow border border-slate-700 whitespace-nowrap">
              ${v.plateNumber}
            </span>
          </div>
        `;

        el.addEventListener("click", () => {
          setSelectedVehicleId(v.id);
        });

        marker = new mapboxgl.Marker({ element: el })
          .setLngLat([v.lng, v.lat])
          .addTo(map);

        currentMarkers.set(v.id, marker);
      } else {
        // Smoothly update location & rotation
        marker.setLngLat([v.lng, v.lat]);

        const el = marker.getElement();
        const iconSvg = el.querySelector("svg");
        if (iconSvg) {
          iconSvg.style.transform = `rotate(${v.heading ?? 0}deg)`;
        }

        const ring = el.querySelector("div > div");
        const isSelected = v.id === selectedVehicleId;
        const isMoving = v.status === "moving";

        if (ring) {
          ring.className = `w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 transition-all ${
            isSelected
              ? "bg-cyan-500 border-white text-slate-950 scale-125 z-30"
              : isMoving
                ? "bg-slate-900/90 border-emerald-400 text-emerald-400"
                : "bg-slate-900/90 border-amber-400 text-amber-400"
          }`;
        }
      }
    }
  }, [vehicles, selectedVehicleId, mapLoaded, setSelectedVehicleId]);

  // Update Breadcrumb Polyline Trail on Map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const source = map.getSource(TRAIL_SOURCE_ID) as
      mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    if (showTrail && trail.length > 0) {
      const coordinates: [number, number][] = trail.map((p) => [p.lng, p.lat]);
      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates,
        },
      });
    } else {
      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [],
        },
      });
    }
  }, [trail, showTrail, mapLoaded]);

  // Fly to selected vehicle when selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedVehicleId) return;
    const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
    if (!vehicle) return;

    map.easeTo({
      center: [vehicle.lng, vehicle.lat],
      zoom: Math.max(map.getZoom(), 14),
      duration: 1000,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVehicleId]);

  const movingCount = vehicles.filter((v) => v.status === "moving").length;
  const stoppedCount = vehicles.filter((v) => v.status === "stopped").length;

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 overflow-hidden bg-slate-950">
      {/* Mapbox Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Floating Status & Stats Pill */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-xl text-white">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700/60">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            God&apos;s Eye Fleet
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] block uppercase">
              Active
            </span>
            <span className="font-bold text-white text-sm">
              {vehicles.length}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block uppercase">
              Moving
            </span>
            <span className="font-bold text-emerald-400 text-sm">
              {movingCount}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block uppercase">
              Stopped
            </span>
            <span className="font-bold text-amber-400 text-sm">
              {stoppedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Mapbox Token Missing Warning Banner */}
      {!mapboxToken && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6 text-center">
          <div className="max-w-md bg-slate-900 border border-amber-500/30 rounded-xl p-6 shadow-2xl space-y-3">
            <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-400 mb-2">
              <Compass className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Mapbox Access Token Required
            </h3>
            <p className="text-sm text-slate-300">
              Fleet God&apos;s Eye map requires a valid Mapbox GL token. Please
              set{" "}
              <code className="text-amber-300 font-mono text-xs bg-slate-800 px-1 py-0.5 rounded">
                NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
              </code>{" "}
              in your environment configuration to enable real-time map
              surveillance.
            </p>
          </div>
        </div>
      )}

      {/* Vehicle Inspector Drawer */}
      <VehicleInspector
        vehicle={selectedVehicle}
        trailData={trailMetadata}
        showTrail={showTrail}
        isLoadingTrail={isLoadingTrail}
        onToggleTrail={() => setShowTrail((prev) => !prev)}
        onClose={() => setSelectedVehicleId(null)}
      />
    </div>
  );
}
