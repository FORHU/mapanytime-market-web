"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Inject your token directly from your verified env configuration
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

interface MapSelectionProps {
  initialLat?: number;
  initialLng?: number;
  onChange: (lat: number, lng: number) => void;
  label?: string;
  hint?: string;
}

export function MapSelection({
  initialLat,
  initialLng,
  onChange,
  label = "Mapbox Geo-Lock Node",
  hint = "* Drag the marker or click on the map to target your storefront location inside Baguio City.",
}: MapSelectionProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // 💡 SAFE FALLBACKS: Force default to clear Baguio City coordinates if form values are undefined/0
  const lat = initialLat && initialLat !== 0 ? initialLat : 16.4164;
  const lng = initialLng && initialLng !== 0 ? initialLng : 120.5931;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // If a map instance already exists, just update its center viewport rather than rebuilding
    if (mapRef.current) {
      mapRef.current.setCenter([lng, lat]);
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      }
      return;
    }

    try {
      // Initialize the interactive Mapbox viewport node
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [lng, lat], // [Longitude, Latitude]
        zoom: 14,
        trackResize: true,
      });

      mapRef.current = map;

      // Append standard zoom navigation buttons
      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Drop an interactive branding marker onto the grid matrix
      const marker = new mapboxgl.Marker({
        draggable: true,
        color: "#18181b", // Zinc-900 custom brand styling
      })
        .setLngLat([lng, lat])
        .addTo(map);

      markerRef.current = marker;

      // Handle drag placement state changes
      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        onChange(lngLat.lat, lngLat.lng);
      });

      // Handle casual canvas click marker shifts
      map.on("click", (e) => {
        marker.setLngLat(e.lngLat);
        onChange(e.lngLat.lat, e.lngLat.lng);
      });

      // Force-trigger an explicit resize computation check once layout maps render
      map.on("load", () => {
        map.resize();
      });
    } catch (error) {
      console.error("Mapbox Canvas Initialization Failure Context:", error);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [lat, lng, onChange]);

  return (
    <div className="col-span-2 flex flex-col gap-1 w-full">
      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
        {label}
      </label>

      {/* Target canvas mounting element */}
      <div
        ref={mapContainerRef}
        className="w-full h-48 rounded-xl border-[1.5px] border-black bg-zinc-100 overflow-hidden shadow-inner relative"
        style={{ minHeight: "192px" }}
      />

      <p className="text-[9px] text-zinc-400 mt-0.5 italic">{hint}</p>
    </div>
  );
}
