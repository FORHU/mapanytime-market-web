"use client";

import React from "react";
import { LiveVehicle, VehicleTrail } from "../contracts/mobility.contract";
import {
  X,
  Navigation,
  Gauge,
  Clock,
  User,
  Shield,
  MapPin,
  Route,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface VehicleInspectorProps {
  vehicle: LiveVehicle | null;
  trailData?: VehicleTrail | null;
  showTrail: boolean;
  isLoadingTrail: boolean;
  onToggleTrail: () => void;
  onClose: () => void;
}

export function VehicleInspector({
  vehicle,
  trailData,
  showTrail,
  isLoadingTrail,
  onToggleTrail,
  onClose,
}: VehicleInspectorProps) {
  if (!vehicle) return null;

  const isMoving = vehicle.status === "moving";
  const speed = vehicle.speed != null ? Math.round(vehicle.speed) : 0;
  const accuracy =
    vehicle.accuracy != null ? Math.round(vehicle.accuracy) : null;
  const driverName = trailData?.driver
    ? [trailData.driver.firstName, trailData.driver.lastName]
        .filter(Boolean)
        .join(" ")
    : null;

  return (
    <div className="absolute top-4 right-4 z-20 w-80 sm:w-96 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 p-5 shadow-2xl text-white transition-all animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-700/60">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                isMoving ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <h3 className="text-lg font-bold tracking-tight text-white font-mono">
              {vehicle.plateNumber}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-semibold uppercase">
              {vehicle.typeCode}
            </span>
          </div>
          {trailData?.operator?.name && (
            <p className="text-xs text-slate-400 mt-0.5">
              {trailData.operator.name}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          aria-label="Close vehicle details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 my-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/40">
          <Gauge className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              Speed
            </span>
            <span className="text-base font-bold text-white font-mono">
              {speed}{" "}
              <span className="text-xs font-normal text-slate-400">km/h</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/40">
          <Navigation
            className="w-5 h-5 text-cyan-400 flex-shrink-0"
            style={{
              transform: `rotate(${vehicle.heading ?? 0}deg)`,
              transition: "transform 0.3s ease",
            }}
          />
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              Heading
            </span>
            <span className="text-base font-bold text-white font-mono">
              {vehicle.heading != null
                ? `${Math.round(vehicle.heading)}°`
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Detail Rows */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
          <span className="text-slate-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Driver
          </span>
          <span className="font-medium text-slate-200">
            {driverName || "Unassigned"}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            Accuracy
          </span>
          <span className="font-medium text-slate-200">
            {accuracy != null ? `±${accuracy} m` : "Unknown"}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Last Fix
          </span>
          <span className="font-medium text-slate-200">
            {formatDistanceToNow(vehicle.ts, { addSuffix: true })}
          </span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            Coordinates
          </span>
          <span className="font-mono text-slate-300">
            {vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Trail Section */}
      <div className="mt-4 pt-3 border-t border-slate-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Route className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold">Route History (24h)</span>
            {trailData?.totalPoints != null && (
              <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-1.5 py-0.2 rounded font-mono">
                {trailData.totalPoints} pts
              </span>
            )}
          </div>
          <button
            onClick={onToggleTrail}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
              showTrail
                ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {isLoadingTrail
              ? "Loading..."
              : showTrail
                ? "Hide Trail"
                : "Show Trail"}
          </button>
        </div>
      </div>
    </div>
  );
}
