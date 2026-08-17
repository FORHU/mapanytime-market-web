"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const navButtonClass =
    "flex items-center justify-center gap-1 h-7 px-3 rounded-xl border text-xs font-bold transition-colors disabled:opacity-40 disabled:pointer-events-none text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--background-tertiary)] mb-2";

  return (
    <div className="flex items-end justify-end gap-2">
      <div className="text-xs text-[var(--text-secondary)] mb-3">
        Page {page} of {totalPages}
      </div>
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || isLoading}
        className={navButtonClass}
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      <span
        aria-current="page"
        className="flex items-center justify-center h-7 min-w-11 px-3 rounded-xl text-xs font-bold bg-[var(--brand-core)] text-white shadow-sm mb-2"
      >
        {page}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || isLoading}
        className={navButtonClass}
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
