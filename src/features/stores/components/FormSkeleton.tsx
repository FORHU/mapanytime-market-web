import React from "react";

export function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <div className="h-3 w-20 bg-[var(--border-strong)] rounded opacity-40" />
          <div className="h-10 w-full bg-[var(--background-secondary)] rounded-xl" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <div className="h-3 w-24 bg-[var(--border-strong)] rounded opacity-40" />
          <div className="h-24 w-full bg-[var(--background-secondary)] rounded-xl" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-16 bg-[var(--border-strong)] rounded opacity-40" />
          <div className="h-10 w-full bg-[var(--background-secondary)] rounded-xl" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-16 bg-[var(--border-strong)] rounded opacity-40" />
          <div className="h-10 w-full bg-[var(--background-secondary)] rounded-xl" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <div className="h-3 w-12 bg-[var(--border-strong)] rounded opacity-40" />
          <div className="h-10 w-full bg-[var(--background-secondary)] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
