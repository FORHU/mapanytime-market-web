import React, { ButtonHTMLAttributes } from "react";
import { RefreshCw } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export function Button({
  children,
  isLoading,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`w-full flex items-center justify-center gap-2 py-3 px-6 text-xs font-bold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none text-white ${className}`}
      style={{ backgroundColor: "var(--brand-core)" }}
      {...props}
    >
      {isLoading ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
}
