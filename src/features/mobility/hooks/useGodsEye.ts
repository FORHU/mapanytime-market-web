"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { acquireSocket, releaseSocket } from "@/shared/lib/socket";
import {
  LiveVehicle,
  VehicleTrail,
  ViewportBounds,
} from "../contracts/mobility.contract";
import {
  fetchLiveVehicles,
  fetchVehicleTrail,
  fetchVehicleTypes,
} from "../api/mobility.client";

interface VehicleMovedPayload extends LiveVehicle {}
interface VehicleRemovedPayload {
  id: string;
  lat: number;
  lng: number;
}

export function useGodsEye(initialBounds?: ViewportBounds) {
  const [bounds, setBounds] = useState<ViewportBounds | undefined>(
    initialBounds,
  );
  const [liveVehicles, setLiveVehicles] = useState<Map<string, LiveVehicle>>(
    new Map(),
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null,
  );
  const [showTrail, setShowTrail] = useState<boolean>(true);

  // Fetch vehicle types for markers and metadata
  const { data: vehicleTypes = [] } = useQuery({
    queryKey: ["mobility", "vehicle-types"],
    queryFn: ({ signal }) => fetchVehicleTypes(signal),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch initial live vehicles in viewport
  const { data: initialVehicles, isLoading: isLoadingInitial } = useQuery({
    queryKey: ["mobility", "live-vehicles", bounds],
    queryFn: ({ signal }) => (bounds ? fetchLiveVehicles(bounds, signal) : []),
    enabled: Boolean(bounds),
    staleTime: 10 * 1000,
  });

  // Seed state from query response
  useEffect(() => {
    if (!initialVehicles) return;
    setLiveVehicles((prev) => {
      const next = new Map(prev);
      for (const v of initialVehicles) {
        next.set(v.id, v);
      }
      return next;
    });
  }, [initialVehicles]);

  // Connect to Socket.IO real-time stream
  useEffect(() => {
    const socket = acquireSocket();

    const handleVehicleMoved = (data: VehicleMovedPayload) => {
      setLiveVehicles((prev) => {
        const next = new Map(prev);
        next.set(data.id, data);
        return next;
      });
    };

    const handleVehicleRemoved = (data: VehicleRemovedPayload) => {
      setLiveVehicles((prev) => {
        if (!prev.has(data.id)) return prev;
        const next = new Map(prev);
        next.delete(data.id);
        return next;
      });
    };

    socket.on("vehicle:moved", handleVehicleMoved);
    socket.on("vehicle:removed", handleVehicleRemoved);

    return () => {
      socket.off("vehicle:moved", handleVehicleMoved);
      socket.off("vehicle:removed", handleVehicleRemoved);
      releaseSocket();
    };
  }, []);

  // Fetch selected vehicle trail (24h history)
  const { data: trailData, isLoading: isLoadingTrail } = useQuery({
    queryKey: ["mobility", "vehicle-trail", selectedVehicleId],
    queryFn: ({ signal }) =>
      selectedVehicleId
        ? fetchVehicleTrail(selectedVehicleId, { limit: 500 }, signal)
        : null,
    enabled: Boolean(selectedVehicleId && showTrail),
    staleTime: 30 * 1000,
  });

  const vehiclesList = Array.from(liveVehicles.values());
  const selectedVehicle = selectedVehicleId
    ? liveVehicles.get(selectedVehicleId) || null
    : null;

  return {
    vehicles: vehiclesList,
    vehicleTypes,
    selectedVehicle,
    selectedVehicleId,
    trail: trailData?.points || [],
    trailMetadata: trailData,
    isLoadingInitial,
    isLoadingTrail,
    showTrail,
    setShowTrail,
    setSelectedVehicleId,
    updateBounds: setBounds,
  };
}
