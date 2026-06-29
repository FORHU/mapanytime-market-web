"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface StorePickerMapProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  searchAddress?: string;
}

export default function StorePickerMap({
  onLocationSelect,
  searchAddress,
}: StorePickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Default coordinate center point focused on Baguio City Center
  const [coords, setCoords] = useState({ lat: 16.4164, lng: 120.5931 });

  // 🔒 Local lock to break infinite loops between user typing and geocoding responses
  const [lastProgrammaticAddress, setLastProgrammaticAddress] = useState("");

  const liveToken =
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
    "pk.eyJ1IjoianVuZ2t3YW5zaGluIiwiYSI6ImNtcW9xcGE2aDA1d2wycXF2cXFzdG14bWcifQ.HR1a5C0MxCY4M0f1yEt6-A";

  // 1️⃣ Map Initialization Hook
  useEffect(() => {
    if (!liveToken || !mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = liveToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [coords.lng, coords.lat],
      zoom: 16,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const marker = new mapboxgl.Marker({
      color: "#10b981",
      draggable: true,
    })
      .setLngLat([coords.lng, coords.lat])
      .addTo(map);

    markerRef.current = marker;

    const handleMarkerDragEnd = async () => {
      if (!markerRef.current) return;
      const lngLat = markerRef.current.getLngLat();
      setCoords({ lat: lngLat.lat, lng: lngLat.lng });

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${liveToken}`,
        );
        const data = await response.json();
        const readableAddress =
          data?.features?.[0]?.place_name || "Selected Coordinate Node";

        setLastProgrammaticAddress(readableAddress);
        onLocationSelect(lngLat.lat, lngLat.lng, readableAddress);
      } catch (error) {
        console.error("Reverse geocoding map lookup failed:", error);
      }
    };

    marker.on("dragend", handleMarkerDragEnd);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2️⃣ Upgraded Forward Geocoding: Mapbox Search Box API with Circular Dependency Lock
  useEffect(() => {
    if (
      !mapRef.current ||
      !markerRef.current ||
      !searchAddress ||
      searchAddress.length < 5 ||
      searchAddress === lastProgrammaticAddress
    )
      return;

    const delayDebounceFn = setTimeout(async () => {
      try {
        const query = encodeURIComponent(searchAddress);

        const response = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/forward?q=${query}&access_token=${liveToken}&limit=1&country=PH&language=en`,
        );
        const data = await response.json();

        if (data?.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].geometry.coordinates;

          // 🟢 TS GUARD: Confirms refs are active before handling values, clearing build crashers
          if (!markerRef.current || !mapRef.current) return;

          setCoords({ lat, lng });
          markerRef.current.setLngLat([lng, lat]);

          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: 17,
            essential: true,
          });
        }
      } catch (err) {
        console.error("Precision forward geocoding query failed:", err);
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchAddress, lastProgrammaticAddress]);

  return (
    <div className="w-full space-y-1.5">
      <div
        ref={mapContainerRef}
        className="w-full h-56 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-inner"
      />
      <div className="flex justify-between items-center px-1 text-[9px] font-mono text-slate-400 font-bold">
        <span>LAT: {coords.lat.toFixed(5)}</span>
        <span>LNG: {coords.lng.toFixed(5)}</span>
      </div>
    </div>
  );
}
