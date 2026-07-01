"use client";

import React from "react";
import { X } from "lucide-react";

interface SnackbarProps {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
  onClose: () => void;
}

export const Snackbar: React.FC<SnackbarProps> = ({
  open,
  message,
  severity,
  onClose,
}) => {
  if (!open) return null;

  const severityStyles = {
    success: "bg-emerald-600 text-white",
    error: "bg-rose-600 text-white",
    info: "bg-blue-600 text-white",
    warning: "bg-amber-500 text-black",
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-in">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg font-semibold text-sm tracking-wide ${severityStyles[severity]}`}
      >
        <span>{message}</span>
        <button
          onClick={onClose}
          className="hover:bg-black/10 p-1 rounded-md transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
