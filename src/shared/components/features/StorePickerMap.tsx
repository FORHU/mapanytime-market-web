"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface StorePickerMapProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  searchAddress: string;
  currentLat: number;
  currentLng: number;
}

// 🟢 PRO-TIP: Moving constants outside the component prevents unneeded effect triggers
const BAGUIO_BBOX = "120.5300,16.3500,120.6400,16.4500";
const DEFAULT_LNG = 120.596;
const DEFAULT_LAT = 16.4023;

export default function StorePickerMap({
  onLocationSelect,
  searchAddress,
  currentLat,
  currentLng,
}: StorePickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const lastGeocodedAddressRef = useRef<string>("");
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

  // ── 🛠️ HOOK 1: INITIALIZE MAP & MARKER DRAG EVENT ──
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    if (!token) {
      console.error("Mapbox Access Token is missing!");
      return;
    }
    mapboxgl.accessToken = token;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [currentLng || DEFAULT_LNG, currentLat || DEFAULT_LAT],
      zoom: 15,
    });

    markerRef.current = new mapboxgl.Marker({
      draggable: true,
      color: "#059669",
    })
      .setLngLat([currentLng || DEFAULT_LNG, currentLat || DEFAULT_LAT])
      .addTo(mapRef.current);

    markerRef.current.on("dragend", async () => {
      if (!markerRef.current) return;
      const lngLat = markerRef.current.getLngLat();

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${token}&country=PH`,
        );
        const data = await response.json();
        const readableAddress =
          data.features?.[0]?.place_name || `${lngLat.lat}, ${lngLat.lng}`;

        lastGeocodedAddressRef.current = readableAddress;
        onLocationSelect(lngLat.lat, lngLat.lng, readableAddress);
      } catch (err) {
        console.error("Reverse geocoding capture error:", err);
      }
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // 🟢 FIXED: Added exact parameters to satisfy lint requirements safely
  }, [token, currentLat, currentLng, onLocationSelect]);

  // ── 🛠️ HOOK 2: FLY TO SEARCHED ADDRESS LOCATION ──
  useEffect(() => {
    if (
      !mapRef.current ||
      !markerRef.current ||
      !searchAddress.trim() ||
      !token
    )
      return;
    if (searchAddress === lastGeocodedAddressRef.current) return;

    const performSearchLookup = async () => {
      try {
        const query = encodeURIComponent(searchAddress.trim());

        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&country=PH&bbox=${BAGUIO_BBOX}&proximity=${DEFAULT_LNG},${DEFAULT_LAT}&types=address,poi,neighborhood,locality&limit=1`,
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const [lng, lat] = feature.center;

          mapRef.current?.flyTo({ center: [lng, lat], zoom: 16 });
          markerRef.current?.setLngLat([lng, lat]);

          const absoluteAddress = feature.place_name || searchAddress;

          lastGeocodedAddressRef.current = absoluteAddress;
          onLocationSelect(lat, lng, absoluteAddress);
        }
      } catch (error) {
        console.error("Search API mapping error:", error);
      }
    };

    // Optional Debounce: prevents firing rapid fetches on every single keypress
    const delayDebounceFn = setTimeout(() => {
      performSearchLookup();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
    // 🟢 FIXED: Included onLocationSelect tracking hook token here to clear remaining line warning
  }, [searchAddress, token, onLocationSelect]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
      {!token ? (
        <div className="w-full h-48 bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
          <p className="text-xs font-semibold text-rose-500">
            Missing Mapbox Key
          </p>
        </div>
      ) : (
        <div ref={mapContainerRef} className="w-full h-48 bg-slate-100" />
      )}
      <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-[9px] font-mono text-white px-2 py-0.5 rounded-md pointer-events-none">
        Mapbox Precision Pinning
      </div>
    </div>
  );
}
