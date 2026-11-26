"use client";

import { GodsEyeMap } from "@/features/mobility/components/GodsEyeMap";

export default function AdminFleetMapPage() {
  return (
    <div className="relative w-full h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      <GodsEyeMap />
    </div>
  );
}
